import {Connection} from "@/common/connection/connection";
import {Logger} from "@/common/logging";
import {FileService} from "@/common/service/file-service";
import {TYPES} from "@/inversify-types";
import {inject, injectable} from "inversify";

@injectable()
export abstract class BaseStore {
  public Automerge: any = require("automerge") as any;
  protected doc: any;
  protected log: Logger;
  private initialized: boolean = false;
  private connection: Connection;
  private fileService: FileService;
  private readonly fileName: string;
  private reRenderMethod: () => void;
  
  private initializedCallback: () => void = this.emptyFn;
  
  constructor(
    @inject(TYPES.Connection) connection: Connection,
    @inject(TYPES.FileService) fileService: FileService,
  ) {
    this.fileService = fileService;
    this.log = Logger.getNew(this.getName());
    this.log.setLevel("warn");
    this.reRenderMethod = this.emptyFn;
    
    // load automerge file which contains the data
    this.fileName = this.getName() + ".txt";
    this.fileService.existsFile(this.fileName, false,
      (fileEntry: FileEntry) => this.fileExistsInit(fileEntry),
      () => this.fileInit());
    
    this.connection = connection;
    // register for normal updates
    this.connection.registerReceiver(this.getName(), (result: any) => this.addChange(result));
    // register for initial updates
    this.connection.registerReceiver("Initial_" + this.getName(), (content) => this.mergeNetworkState(content));
    // register to possibly deliver doc's full state.
    this.connection.registerDataGetter("Initial_" + this.getName(), () => this.getData());
  }
  
  public onInitialized(finishedCallback: () => void) {
    if (this.initialized) {
      finishedCallback();
    } else {
      this.initializedCallback = finishedCallback;
    }
  }
  
  public abstract getName(): string;
  
  public abstract callAfterSuperInit(): void;
  
  public abstract resolveConflict(document: any): void;
  
  public registerCallback(method: () => void) {
    this.reRenderMethod = method;
  }
  
  public unRegisterCallback() {
    this.reRenderMethod = this.emptyFn;
  }
  
  public broadcastChange(changes: any) {
    this.saveCurrentAutomergeDoc();
    this.connection.sendMessage(this.getName(), changes);
  }
  
  public saveCurrentAutomergeDoc() {
    const automergeString = this.Automerge.save(this.doc);
    this.fileService.existsFile(this.fileName, false,
      (fileEntry: FileEntry) => {
        this.fileService.writeFile(fileEntry, automergeString, "txt");
      },
      () => {
        this.log.error(this.fileName + " has to exist");
      });
  }
  
  protected abstract getAutomergeInitString(): string;
  
  private emptyFn() {
    this.log.debug("The empty function from the base store was called. This should not happen");
  }
  
  private afterInit() {
    this.callAfterSuperInit();
    this.initialized = true;
    this.initializedCallback();
  }
  
  private addChange(changes: any) {
    const newDoc = this.Automerge.applyChanges(this.doc, changes);
    if (newDoc._conflicts !== undefined) {
      this.resolveConflict(newDoc);
    }
    this.doc = newDoc;
    this.saveCurrentAutomergeDoc();
    this.reRenderMethod();
  }
  
  private fileExistsInit(fileEntry: FileEntry) {
    // TODO: remove the remove-option before production
    const remove = false; // this.fileName === "annotationTable.txt";
    if (remove) {
      fileEntry.remove(() => {
          this.log.info(this.fileName + " was deleted");
        },
        () => {
          this.log.info(this.fileName + " could not be deleted");
        });
    } else {
      this.fileService.readFile(fileEntry, (data: string) => {
        this.doc = this.Automerge.load(data);
        this.afterInit();
      });
    }
  }
  
  private fileInit() {
    const automergeString = this.getAutomergeInitString();
    this.doc = this.Automerge.load(automergeString);
    // Save after callback, as displaying is more important
    this.fileService.createFile(this.fileName, false, (fileEntry) => {
      this.fileService.writeFile(fileEntry, automergeString, "txt");
      this.afterInit();
    });
  }
  
  private mergeNetworkState(content: any) {
    // const changes = this.Automerge.getChanges(this.oldDoc, this.doc);
    
    this.log.info("Merge remote file, with following content: ", content);
    const waDoc1 = this.Automerge.applyChanges(this.Automerge.init(), content);
    this.doc = this.Automerge.merge(waDoc1, this.doc);
    
    if (this.doc._conflicts !== undefined) {
      this.resolveConflict(this.doc);
    }
    
    // this.doc = this.Automerge.applyChanges(this.oldDoc, changes);
    this.log.info("Remote file merged, new file: ", this.doc);
    this.saveCurrentAutomergeDoc();
    this.reRenderMethod();
  }
  
  private getData(): string {
    return this.Automerge.getChanges(this.Automerge.init(), this.doc);
  }
}
