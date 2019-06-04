import {Connection} from "@/common/connection/connection";
import {Logger} from "@/common/logging";

declare var cordova: any;
export default class WebsocketServer {
  private wsserver: any = cordova.plugins.wsserver;
  private zeroconfig: any = cordova.plugins.zeroconf;
  private log: Logger = Logger.getNew("webSocketServer");
  private connections: Array<{ uuid: string, address: string }> = [];
  private readonly serverName: string;
  private port: number = 0;
  private parent: Connection;
  
  constructor(parent: Connection) {
    this.zeroconfig.registerAddressFamily = "ipv4"; // or 'ipv6' ('any' by default)
    this.zeroconfig.watchAddressFamily = "ipv4"; // or 'ipv6' ('any' by default)
    const uuidv1 = require("uuid/v1");
    this.serverName = "device" + uuidv1();
    this.parent = parent;
  }
  
  public shutdown() {
    this.stopServer();
    this.unregisterService();
  }
  
  public stopServer() {
    this.wsserver.stop((addr: string, port: number) => {// onStop
      this.log.info("Server stopped on host {} , port {}", addr, port);
    });
  }
  
  public getInterfaces() {
    this.wsserver.getInterfaces((result: any) => {
      for (const sth in result) {
        if (result.hasOwnProperty(sth)) {
          this.log.info("interface", sth);
          const ipv4 = result[sth].ipv4Addresses;
          this.log.info("ipv4: {} ", ipv4);
          this.log.info("ipv6: {} ", result[sth].ipv6Addresses);
        }
      }
    });
  }
  
  public sendMessage(content: any) {
    for (const entry of this.connections) {
      this.log.info("Send message to ", entry.uuid, " with content ", content);
      this.wsserver.send({uuid: entry.uuid}, content);
    }
  }
  
  public sendSingleMessage(content: any, id: string) {
    this.log.info("Send message to ", id, " with content ", content);
    this.connections.filter((item) => item.address === id).forEach((item) => {
        this.wsserver.send({uuid: item.uuid}, content);
    });
    
  }
  
  public getHostName(): string {
    return this.serverName;
  }
  
  public registerService() {
    this.wsserver.getInterfaces((result: any) => {
      this.log.info(result);
      const test = {
        // Publish the correct IP address on the TXT record
        server_ip: (result.wlan0.ipv4Addresses[0]) ? result.wlan0.ipv4Addresses[0] : result.wlan0.ipv6Addresses[0],
      };
      this.log.debug("Register ip adress: ", test.server_ip, ":", this.port);
      this.parent.host = test.server_ip;
      this.zeroconfig.register("_my-service._tcp.", "local.", this.serverName, this.port, test, (data: any) => {
        // Here we have successfully advertised the service
        this.log.debug("Service Advertised - " + data);
      }, (cause: any) => {
        // Failed to advertised
        this.log.info("Failed to advertise Service - " + cause);
      });
    }, (error: any) => {
      this.log.error("GetInterfaces Error - " + error);
    });
    this.log.debug("Service registered with id " + this.serverName + " on port " + this.port);
  }
  
  public init() {
    this.wsserver.stop();
    this.wsserver.start(0, {
      // WebSocket Server handlers
      onFailure: (addr: any, serverPort: number, reason: string) => {
        this.log.error("Stopped listening on address" + addr + ", port " + serverPort + ", reason " + reason);
      },
      onOpen: (conn: any) => {
        /* conn: {
         'uuid' : '8e176b14-a1af-70a7-3e3d-8b341977a16e',
         'remoteAddr' : '192.168.1.10',
         'httpFields' : {...},
         'resource' : '/?param1=value1&param2=value2'
         } */
        this.log.debug("A user connected to server from " + conn.remoteAddr);
        this.parent.addConnection(conn.remoteAddr, "IN");
        this.connections.push({uuid: conn.uuid, address: conn.remoteAddr});
      },
      onMessage: (conn: any, msg: any) => {
        this.log.info("Message received from: " + conn.uuid + ", content: " + msg);
        this.parent.messageReceived(msg);
      },
      onClose: (conn: any, code: any, reason: any, wasClean: any) => {
        this.log.info("A user disconnected on server from ", conn.remoteAddr, code, reason, wasClean);
        this.parent.removeConnection(conn.remoteAddr);
        this.connections = this.connections.filter((entry) => entry.uuid !== conn.uuid);
      },
      // Other options
      // 'origins': ['file://'], // validates the 'Origin' HTTP Header.
      //  'protocols': ['my-protocol-v1', 'my-protocol-v2'], // validates the 'Sec-WebSocket-Protocol' HTTP Header.
      tcpNoDelay: true, // disables Nagle's algorithm.
    }, (addr: any, serverPort: any) => { // onstartSuccessfull
      this.log.info("Listening on address " + addr + ", port " + serverPort);
      this.port = serverPort;
    }, (reason: any) => { // onDidNotStart
      this.log.error("Did not start reason: ", reason);
    });
  }
  
  private unregisterService() {
    this.zeroconfig.unregister("_my-service._tcp.", "local.", this.serverName);
  }
}
