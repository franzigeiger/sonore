import SocketConnections from "@/common/connection/socket-connections";
import WebsocketServer from "@/common/connection/webserver";
import {User} from "@/common/data-definitions/user";
import {Logger} from "@/common/logging";
import {injectable} from "inversify";
import {Vue} from "vue-property-decorator";

export interface ReceiverCallback {
  callback: (result: any) => void;
  id: string;
  wasCalled: boolean;
}

export interface GetDataCallback {
  // the method gets the sendable contents from the registered stores
  callback: () => any;
  id: string;
}

export interface Message {
  id: string;
  content: string;
}

export interface UserConnection {
  connectionType: string;
  user: User | null;
}

@injectable()
export class Connection {
  public static userInfo: string = "USER_INFO";
  private static synchronizeId: string = "SYNCHRONIZE_REQUEST";
  
  // list of connected devices, device id + connection direction
  public connected: Map<string, UserConnection>;
  public host: string = "";
  
  public currentUser: User | undefined;
  private server: WebsocketServer | undefined;
  private clients: SocketConnections | undefined;
  private receiver: ReceiverCallback[] = [];
  private fetchRegister: GetDataCallback[] = [];
  private useWebserverPlugin: boolean;
  // this is set, when all stores are loaded and registered, so we can start the synchronization process
  private allLoaded: boolean = false;
  
  private log = Logger.getNew(Connection.name);
  
  constructor() {
    this.log.info("Initialize connection");
    this.connected = new Map();
    const isCordova = window.cordova !== undefined;
    this.useWebserverPlugin = (isCordova && window.cordova.platformId !== "browser");
    
    if (!this.useWebserverPlugin) {
      Vue.toasted.info("The websocket server plugin only works with android or IOS!");
    } else {
      // this is the trigger message to send all current files to the device with the given id
      this.registerReceiver(Connection.synchronizeId, (result: any) => {this.sendAllDocuments(result); });
      this.registerReceiver(Connection.userInfo, (result: any) => this.handleUserChange(result));
      this.registerDataGetter(Connection.userInfo, () => this.getUserData());
      this.startServer();
    }
  }
  
  public messageReceived(content: any): void {
    const typedContent: Message = JSON.parse(content);
    let messageProcessed: boolean = false;
    for (const callback of this.receiver) {
      if (callback.id === typedContent.id) {
        callback.wasCalled = true;
        callback.callback(typedContent.content);
        messageProcessed = true;
      }
    }
    if ( !messageProcessed) {
      this.log.info("Message not processed: ", content);
    }
  }
  
  public startServer() {
    if (this.useWebserverPlugin) {
      this.log.info("Start server");
      this.server = new WebsocketServer(this);
      this.server.init();
      this.log.info("Start client connections");
      this.clients = new SocketConnections(this.server.getHostName(), this);
      this.clients.init();
      this.registerService();
    }
  }
  
  public stopServer() {
    if (this.server !== undefined && this.clients !== undefined) {
      this.server.shutdown();
      this.clients.shutdown();
      this.connected.clear();
    }
  }
  
  public synchronize() {
    setTimeout(() => {
      if (this.server !== undefined && this.clients !== undefined) {
        if (this.connected.size > 0 && this.allLoaded) {
          const entry = Array.from(this.connected.entries())[0];
          const sendable: string = JSON.stringify({id: Connection.synchronizeId, content: this.host});
          if (entry[1].connectionType === "IN") {
            // send synchronization request to on node with own device id
            this.server.sendSingleMessage(sendable, entry[0]);
          } else {
            this.clients.sendSingleMessage(sendable, entry[0]);
          }
        } else {
          this.log.info("No synchronization, either no connection or not yet loaded, try again in 1 second.");
        }
      }
    }, 1000);
  }
  
  public onLoadFinished() {
    this.allLoaded = true;
  }
  
  public sendMessage(docId: string, changes: any) {
    if (this.server !== undefined && this.clients !== undefined) {
      const sendable: string = JSON.stringify({id: docId, content: changes});
      
      this.server.sendMessage(sendable);
      this.clients.sendMessage(sendable);
      this.log.info("Message send of document ", docId);
    }
  }
  
  public sendAllDocuments(deviceId: any) {
    if (this.server !== undefined && this.clients !== undefined) {
      if (this.connected.get(deviceId) != null && this.connected.get(deviceId)!.connectionType === "IN") {
        for (const item of this.fetchRegister) {
          const sendable: string = JSON.stringify({id: item.id, content: item.callback()});
          this.server.sendSingleMessage(sendable, deviceId);
        }
      } else {
        for (const item of this.fetchRegister) {
          const sendable: string = JSON.stringify({id: item.id, content: item.callback()});
          this.clients.sendSingleMessage(sendable, deviceId);
        }
      }
    }
  }
  
  public registerReceiver(name: string, callbackLocal: (result: any) => void) {
    this.receiver.push({id: name, callback: callbackLocal, wasCalled: false});
  }
  
  public registerDataGetter(name: string, getDataLocal: () => any) {
    this.fetchRegister.push({id: name, callback: getDataLocal});
  }
  
  public registerService() {
    if (this.server !== undefined) {
      this.server.registerService();
    }
  }
  
  public addConnection(id: string, type: string) {
    // I think it might be more useful in case of a double connection rather disconnect the client connection.
    if (this.server !== undefined && this.clients !== undefined) {
      // @ts-ignore
      if (this.connected.get(id) !== undefined && this.connected.get(id).connectionType !== type ) {
        this.clients.disconnectClient(id);
        this.log.info("Purpose disconnect from device: ", id);
      } else {
        if (this.connected.size === 0 ) {
          this.synchronize();
        }
        this.connected.set(id, {connectionType: type, user: null});
      }
    }
  }
  
  public removeConnection(id: string) {
    this.connected.delete(id);
  }
  
  public hasConnection(id: string): boolean {
    return this.connected.has(id);
  }
  
  public setCurrentUser(user: User) {
    this.currentUser = user;
    this.sendMessage("USER_INFO", {host: this.host, user: this.currentUser});
  }
  
  public handleUserChange(content: any) {
    if (this.connected.get(content.host)) {
      const userChanged: UserConnection = {
        connectionType: this.connected.get(content.host)!.connectionType,
        user: content.user,
      };
      this.connected.set(content.host, userChanged);
    } else {
      this.log.error("Could not update oser of device on host: ", content.host);
    }
    
  }
  
  private getUserData() {
    return {host: this.host, user: this.currentUser};
  }
}
