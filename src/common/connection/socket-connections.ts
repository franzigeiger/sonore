import {Connection} from "@/common/connection/connection";
import {Logger} from "@/common/logging";

declare var cordova: any;
export default class SocketConnections {
  
  private webSockets: Map<string, WebSocket> = new Map();
  private zeroconfig: any = cordova.plugins.zeroconf;
  private log: Logger = Logger.getNew("webSocketClient");
  private parent: Connection;
  private hostName: string;
  
  constructor(hostName: string, parent: Connection) {
    this.zeroconfig.registerAddressFamily = "ipv4"; // or 'ipv6' ('any' by default)
    this.zeroconfig.watchAddressFamily = "ipv4"; // or 'ipv6' ('any' by default)
    this.hostName = hostName;
    this.parent = parent;
  }
  
  public shutdown() {
    this.webSockets.forEach((socket, id) => {
      socket.close();
      this.log.info("Closed socket connection ", id);
    });
    this.zeroconfig.unwatch("_my-service._tcp.", "local.",
      (result: any) => {this.log.info("unwatch services succesful " + result); },
      (result: any) => {this.log.error("Unwatch error: " + result); });
    
  }
  
  public init() {
    this.startWatchServices();
  }
  
  public sendMessage(content: any) {
    this.log.info("Send message: ", content);
    this.webSockets.forEach((socket) => socket.send(content));
  }
  
  public sendSingleMessage(content: any, id: string) {
    this.log.info("Send message: ", content);
    if (this.webSockets.has(id)) {
      this.webSockets.get(id)!.send(content);
    }
  }
  
  public disconnectClient(id: string) {
    if (this.webSockets.has(id)) {
      this.webSockets.get(id)!.close();
    }
  }
  
  // when this watch service registers a new service, it creates a connection to its websocket server
  private startWatchServices() {
    this.zeroconfig.watch("_my-service._tcp.", "local.", (result: any) => {
      /* service : {
       'domain' : 'local.',
       'type' : '_http._tcp.',
       'name': 'Becvert\'s iPad',
       'port' : 80,
       'hostname' : 'ipad-of-becvert.local',
       'ipv4Addresses' : [ '192.168.1.125' ],
       'ipv6Addresses' : [ '2001:0:5ef5:79fb:10cb:1dbf:3f57:feb0' ],
       'txtRecord' : {
           'foo' : 'bar'
       } */
      const action = result.action;
      const service = result.service;
      if (action === "added") {
        this.log.debug("Service added, nothing to do");
      } else if (action === "resolved") {
        this.log.debug("service resolved ", service.name);
        if (this.hostName !== service.name &&
            this.webSockets.get(service.name) === undefined &&
            !this.parent.hasConnection(service.ipv4Addresses[0])) {
          this.log.info(("A NOT me SERVICE REGISTERED!!! "
                         + "Start to establish a websocket(client) connection to the new device"));
          this.createSocketConnection(service.name, service.ipv4Addresses[0], service.port,
            (success, msg) => {
              if (!success) {
                // TODO handle connection problems
                this.log.error("Problems appeared: " + msg);
              }
            });
        } else {
          this.log.debug("Service registered but we do not connect as client.");
        }
      } else {
        this.log.debug("service removed: ", service);
      }
    }, (result: any) => {
      this.log.error("Problems with socket client: " + result);
      
    });
    this.log.debug("Service watch activated");
  }
  
  private createSocketConnection(name: string, host: string, port: number,
                                 responseFunc: (success: boolean, message: string) => void) {
    const ws = new WebSocket("ws://" + host + ":" + port);
    ws.onopen = () => {
      this.log.info("Connection established");
      this.parent.addConnection(host, "OUT");
      responseFunc(true, "Connection established");
    };
    
    ws.onmessage = (event) => {
      this.log.info("Message received: ", event.data);
      this.parent.messageReceived(event.data);
    };
    
    ws.onerror = () => {
      this.log.error("Problem on establishing client connection!");
      this.webSockets.delete(name);
      this.parent.removeConnection(host);
      responseFunc(false, "Connection establishment didn't work");
    };
    
    ws.onclose = (event) => {
      this.log.error("Connection closed ", event.code);
      this.webSockets.delete(name);
      this.parent.removeConnection(host);
    };
    
    this.webSockets.set(host, ws);
  }
  
  
}
