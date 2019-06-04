import {Connection} from "@/common/connection/connection";
import {FullScorePart} from "@/common/data-definitions/parts/full-score-part";
import {SinglePart} from "@/common/data-definitions/parts/single-part";
import {Instrument} from "@/common/data-definitions/instrument";
import {FileService} from "@/common/service/file-service";
import store from "@/common/state/store";
import {BaseStore} from "@/data/base-store";
import {TYPES} from "@/inversify-types";
import {inject, injectable} from "inversify";
import {MusicPiece} from "@/common/data-definitions/music-piece";
import {Part} from "@/common/data-definitions/part";
import {User} from "@/common/data-definitions/user";

@injectable()
export class UserStore extends BaseStore {
  
  constructor(
    @inject(TYPES.Connection) connection: Connection,
    @inject(TYPES.FileService) fileService: FileService,
  ) {
    super(connection, fileService);
  }
  
  public callAfterSuperInit() {
    this.log.debug("This is for avoiding an empty function");
  }
  
  public getAllUsers(): User[] {
    const userList = [];
    for (const user of Object.values(this.doc.user) as User[]) {
      const userParts = this.getPartsFromDoc(user.parts);
      userList.push(new User(user.instruments, user.isDirigent, user.name, userParts, user.guid));
    }
    return userList;
  }
  
  public addUser(newUser: User) {
    const oldDoc = this.doc;
    this.doc = this.Automerge.change(this.doc, "Add new user with guid: " + newUser.guid, (currentdoc: any) => {
      currentdoc.user[newUser.guid] = {
        instruments: newUser.instruments, isDirigent: newUser.isDirigent,
        name: newUser.name, parts: {}, guid: newUser.guid,
      };
      newUser.parts.forEach((value, key) =>
        currentdoc.user[newUser.guid].parts[key + ""] = {
          musicPieceId: key, partName: value.name, partInstrument: this.getInstrumentOfPart(value),
        });
    });
    const changes = this.Automerge.getChanges(oldDoc, this.doc);
    this.broadcastChange(changes);
  }
  
  public getUserForName(name: string): User | undefined {
    // this.log.info("start getUserForName");
    for (const user of Object.values(this.doc.user) as User[]) {
      if (user.name === name) {
        const userParts = this.getPartsFromDoc(user.parts);
        return new User(user.instruments, user.isDirigent, user.name, userParts, user.guid);
      }
    }
    return undefined;
  }
  
  public getUserForGuid(guid: string): User | undefined {
    if (this.doc.user[guid] === undefined) {
      return undefined;
    } else {
      const user = this.doc.user[guid];
      const userParts = this.getPartsFromDoc(user.parts);
      return new User(user.instruments, user.isDirigent, user.name, userParts, user.guid);
    }
  }
  
  public getName(): string {
    return "userTable";
  }
  
  public assignUserPartToUser(user: User, musicPiece: MusicPiece, part: Part) {
    const oldDoc = this.doc;
    if (!(user.guid in this.doc.user)) {
      return;
    } else {
      this.doc = this.Automerge.change(this.doc, "Add part to user with guid: " + user.guid, (currentdoc: any) => {
        currentdoc.user[user.guid].parts[musicPiece.id + ""] = {
          musicPieceId: musicPiece.id, partName: part.name, partInstrument: this.getInstrumentOfPart(part),
        };
      });
    }
    this.log.debug("count docParts AFTER " + Object.values(this.doc.user[user.guid].parts).length);
    user.parts.set(musicPiece.id, part);
    const changes = this.Automerge.getChanges(oldDoc, this.doc);
    this.broadcastChange(changes);
  }
  
  /**
   * It's hard to reduce the complexity in this method. Since we do not know how the object
   * looks we have to check after every deeper step if the values exist
   *
   * @param document
   */
  public resolveConflict(document: any): void {
    if (document._conflicts.user !== undefined) {
      const conflicts = this.Automerge.getConflicts(document, "user");
      for (const change in conflicts.user) {
        if (conflicts.user.hasOwnProperty(change)) {
          for (const item of Object.values(conflicts.user[change]) as User[]) {
            this.log.info("Found conflict for item {}", item);
            if (document.user[item.guid] !== undefined) {
              // do update
              const newInst: Instrument[] = [];
              item.instruments.forEach((elem: Instrument) =>
                newInst.push(new Instrument(elem.midiNumber, elem.name, elem.iconPath)));
              document = this.Automerge.change(document, "Add conflicted content to list", (doc: any) => {
                doc.user[item.guid] = {
                  instruments: newInst, isDirigent: item.isDirigent, name: item.name,
                  guid: item.guid,
                };
                const partsObj = item.parts as any;
                for (const pieceId of Object.keys(partsObj)) {
                  doc.user[item.guid].parts[pieceId + ""] = {
                    musicPieceId: pieceId,
                    partName: partsObj[pieceId].name,
                    partInstrument: this.getInstrumentOfPart(partsObj[pieceId] as Part),
                  };
                }
              });
            }
          }
        }
      }
    }
  }
  
  private getPartsFromDoc(docParts: any): Map<number, Part> {
    const partsMap = new Map<number, Part>();
    if (docParts === undefined) {
      return new Map();
    }
    this.log.debug("count docParts " + Object.values(docParts).length);
    for (const part of Object.values(docParts) as any[]) {
      if (part.partInstrument === -1) {
        partsMap.set(part.musicPieceId, new FullScorePart(part.partName));
      } else {
        partsMap.set(part.musicPieceId, new SinglePart(part.partInstrument, part.partName));
      }
    }
    return partsMap;
  }
  
  private getInstrumentOfPart(part: Part): number {
    let instrument = -1; // full-score-part
    if (part instanceof SinglePart) {
      instrument = (part as SinglePart).instrument;
    }
    return instrument;
  }
  
  protected getAutomergeInitString(): string {
    // tslint:disable-next-line
    return '["~#iL",[["~#iM",["ops",["^0",[["^1",["action","makeMap","obj","cd96bebe-1cd0-4188-a581-d3ba6cb330b5"]],["^1",["action","link","obj","00000000-0000-0000-0000-000000000000","key","user","value","cd96bebe-1cd0-4188-a581-d3ba6cb330b5"]],["^1",["action","makeMap","obj","074cff70-a540-47ca-bc11-2bbf79b0f1aa"]],["^1",["action","makeList","obj","39f2cd28-7fb0-465f-b477-7393fcc13c46"]],["^1",["action","link","obj","074cff70-a540-47ca-bc11-2bbf79b0f1aa","key","instruments","value","39f2cd28-7fb0-465f-b477-7393fcc13c46"]],["^1",["action","set","obj","074cff70-a540-47ca-bc11-2bbf79b0f1aa","key","isDirigent","value",false]],["^1",["action","set","obj","074cff70-a540-47ca-bc11-2bbf79b0f1aa","key","name","value","Hans"]],["^1",["action","makeMap","obj","c1238bbc-ac59-47f1-bf85-6af4a8990fe0"]],["^1",["action","link","obj","074cff70-a540-47ca-bc11-2bbf79b0f1aa","key","parts","value","c1238bbc-ac59-47f1-bf85-6af4a8990fe0"]],["^1",["action","set","obj","074cff70-a540-47ca-bc11-2bbf79b0f1aa","key","guid","value","bdd0e5aa-abfe-4d6e-8932-ea6c2f8633de"]],["^1",["action","link","obj","cd96bebe-1cd0-4188-a581-d3ba6cb330b5","key","bdd0e5aa-abfe-4d6e-8932-ea6c2f8633de","value","074cff70-a540-47ca-bc11-2bbf79b0f1aa"]],["^1",["action","makeMap","obj","b84aa6b7-7cc7-4d20-95be-a6c93686f3b8"]],["^1",["action","makeList","obj","6074e175-8bc8-44c3-9637-02fdb74b7b30"]],["^1",["action","link","obj","b84aa6b7-7cc7-4d20-95be-a6c93686f3b8","key","instruments","value","6074e175-8bc8-44c3-9637-02fdb74b7b30"]],["^1",["action","set","obj","b84aa6b7-7cc7-4d20-95be-a6c93686f3b8","key","isDirigent","value",true]],["^1",["action","set","obj","b84aa6b7-7cc7-4d20-95be-a6c93686f3b8","key","name","value","Peter"]],["^1",["action","makeMap","obj","baf069ad-4fc7-4ccb-b65b-dc3273fc3edf"]],["^1",["action","link","obj","b84aa6b7-7cc7-4d20-95be-a6c93686f3b8","key","parts","value","baf069ad-4fc7-4ccb-b65b-dc3273fc3edf"]],["^1",["action","set","obj","b84aa6b7-7cc7-4d20-95be-a6c93686f3b8","key","guid","value","9e2b1dcc-4df7-43aa-b2ec-4724713c43ce"]],["^1",["action","link","obj","cd96bebe-1cd0-4188-a581-d3ba6cb330b5","key","9e2b1dcc-4df7-43aa-b2ec-4724713c43ce","value","b84aa6b7-7cc7-4d20-95be-a6c93686f3b8"]]]],"actor","a39fb7e2-0fd0-4bd5-8289-a72e31c77e39","seq",1,"deps",["^1",[]],"message","First init of user tables"]]]]';
  }
  
}
