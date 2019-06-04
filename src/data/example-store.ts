import {FileService} from "@/common/service/file-service";
import {TYPES} from "@/inversify-types";
import {BaseStore} from "./base-store";
import {Connection} from "@/common/connection/connection";
import {inject, injectable} from "inversify";

@injectable()
export class ExampleStore extends BaseStore {
  
  private doc2: any;
  private olddoc2: any;
  private isSynchronized: boolean = false;
  
  constructor(
    @inject(TYPES.Connection) connection: Connection,
    @inject(TYPES.FileService) fileService: FileService,
  ) {
    super(connection, fileService);
    this.doc2 = this.Automerge.init("two");
    this.olddoc2 = this.doc2;
  }
  
  public callAfterSuperInit(): void {
    this.log.debug("This is for avoiding an empty function");
    // TODO would be better in getAutomergeInitString()
    this.doc = this.Automerge.change(this.doc, "Initialize document", (doc: any) => {
      doc.texts = [];
    });
  }
  
  public addContent(inputText: string): void {
    const oldDoc = this.doc;
    this.doc = this.Automerge.change(this.doc, "Add content to list", (doc: any) => {
      doc.texts.push(inputText);
    });
    const changes = this.Automerge.getChanges(oldDoc, this.doc);
    this.broadcastChange(changes);
    this.log.info(this.doc.texts);
  }
  
  public getName(): string {
    return "ExampleTable";
  }
  
  public addDoc2(inputText: string) {
    if (this.doc2.texts === undefined) {
      this.doc2 = this.Automerge.change(this.doc2, "Initialize document", (doc: any) => {
        doc.texts = [];
      });
    }
    this.doc2 = this.Automerge.change(this.doc2, "Add content to list", (doc: any) => {
      doc.texts.push(inputText);
    });
    for (const char of this.doc2.texts) {
      this.log.info(char);
    }
  }
  
  public testSend(inputText: string) {
    this.log.info("old doc: ", this.olddoc2, ", new doc: ", this.doc2);
    const changes = this.Automerge.getChanges(this.olddoc2, this.doc2);
    this.olddoc2 = this.doc2;
  }
  

  public resolveConflict(doc: any) {
    if (doc._conflicts.texts !== undefined) {
      const conflicts = this.Automerge.getConflicts(doc, "texts");
      for (const change in conflicts.texts) {
        if (conflicts.texts.hasOwnProperty(change)) {
          for (const item of conflicts.texts[change]) {
            this.log.info(item);
            doc = this.Automerge.change(this.doc, "Add content to list", (document: any) => {
              document.texts.push(item);
            });
          }
        }
      }
    }
  }
  
  protected getAutomergeInitString(): string {
    // tslint:disable-next-line
    return '["~#iL",[]]';
  }
}
