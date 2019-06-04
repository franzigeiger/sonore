import {Connection} from "@/common/connection/connection";
import {SinglePart} from "@/common/data-definitions/parts/single-part";
import {Register, RegisterType} from "@/common/data-definitions/register";
import {FileService} from "@/common/service/file-service";
import {BaseStore} from "@/data/base-store";
import {UserStore} from "@/data/user-store";
import {TYPES} from "@/inversify-types";
import {serviceContainer} from "@/services/service-container";
import {inject, injectable} from "inversify";

@injectable()
export class RegisterStore extends BaseStore {
  
  constructor(
    @inject(TYPES.Connection) connection: Connection,
    @inject(TYPES.FileService) fileService: FileService,
  ) {
    super(connection, fileService);
  }
  
  public callAfterSuperInit(): void {
    this.log.debug("This is for avoiding an empty function");
  }
  
  public getAllRegisters(): Register[] {
    const registerMap = new Map<string, Register>(); // guid -> Register
    const registerGuidToRegisterChildrenGuid = new Map<string, string[]>(); // guid -> [guid, guid, ...]
    
    // create all registers without children of type Register
    for (const register of this.doc.register) {
      let registerChildren: (SinglePart[] | Register[]) = [];
      if (register.type === RegisterType.Part) {
        registerChildren = this.reconvertRegisterChildrenOfTypePartToReadableFormat(register.children);
      } else if (register.type === RegisterType.Register) {
        const childrenGuidRegisterArray = register.children.map((childRegister: Register) => childRegister.guid);
        registerGuidToRegisterChildrenGuid.set(register.guid, childrenGuidRegisterArray);
      }
      const principal: any = serviceContainer.get<UserStore>(TYPES.UserStore).getUserForGuid(register.principal);
      
      registerMap.set(register.guid, new Register(register.name, principal, register.type, registerChildren,
        register.guid));
    }
    // set missing children
    this.setRegisterChildrenTypedRegister(registerGuidToRegisterChildrenGuid, registerMap);
    
    return [...registerMap.values()];
  }
  
  public addRegister(newRegister: Register) {
    const oldDoc = this.doc;
    this.doc = this.Automerge.change(this.doc, "Add new register with guid: " + newRegister.guid, (currentdoc: any) => {
      const convertedChildren = this.convertRegisterChildrenIntoSaveableFormat(newRegister.children, newRegister.type);
      currentdoc.register.push({
        name: newRegister.name, principal: newRegister.principal.guid, type: newRegister.type,
        children: convertedChildren, guid: newRegister.guid,
      });
    });
    const changes = this.Automerge.getChanges(oldDoc, this.doc);
    this.broadcastChange(changes);
  }
  
  public updateRegister(register: Register) {
    const oldDoc = this.doc;
    const possibleRegister = this.doc.register.find((r: any) => r.guid === register.guid);
    if (possibleRegister !== undefined) {
      this.doc = this.Automerge.change(this.doc, "Update register with guid: " + register.guid, (currentdoc: any) => {
        for (const r of currentdoc.register) {
          if (r.guid === register.guid) {
            const convertedChildren = this.convertRegisterChildrenIntoSaveableFormat(register.children, register.type);
            r.name = register.name;
            r.principal = register.principal.guid;
            r.type = register.type;
            r.children = convertedChildren;
            return;
          }
        }
      });
    }
    const changes = this.Automerge.getChanges(oldDoc, this.doc);
    this.broadcastChange(changes);
  }
  
  public getName(): string {
    return "registerTable";
  }
  
  public getRegisterByGuid(guid: string): Register | undefined {
    return this.getAllRegisters().find( (register) => register.guid === guid);
  }
  
  public resolveConflict(document: any): void {
    if (document._conflicts.register !== undefined) {
      const conflicts = this.Automerge.getConflicts(document, "register");
      for (const change in conflicts.register) {
        if (conflicts.register.hasOwnProperty(change)) {
          for (const item of conflicts.register[change]) {
            this.log.info("Found conflict for item {}", item);
            const localChildren = this.reconvertRegisterChildrenOfTypePartToReadableFormat(item.children);
            const jsonChildren = this.convertRegisterChildrenIntoSaveableFormat(localChildren, item.type);
            document = this.Automerge.change(document, "Add content to list", (doc: any) => {
              if (!doc.register.find((register: any) => register.guid === item.guid)) {
                doc.register.push({
                  name: item.name, principal: item.principal, type: item.type,
                  children: jsonChildren, guid: item.guid,
                });
              }
            });
          }
        }
      }
    }
  }
  
  private convertRegisterChildrenIntoSaveableFormat(children: SinglePart[] | Register[],
                                                    registerType: RegisterType): object[] {
    if (children.length === 0) {
      return [];
    }
    const convertedChildren = [];
    if (registerType === RegisterType.Part) {
      for (const part of children as SinglePart[]) {
        convertedChildren.push({instrument: part.instrument, name: part.name});
      }
    } else {
      for (const register of children as Register[]) {
        convertedChildren.push({guid: register.guid});
      }
    }
    
    return convertedChildren;
  }
  
  private reconvertRegisterChildrenOfTypePartToReadableFormat(registerChildren: object[]): SinglePart[] {
    const partArray = [];
    for (const part of registerChildren as SinglePart[]) {
      partArray.push(new SinglePart(part.instrument, part.name));
    }
    return partArray;
  }
  
  private setRegisterChildrenTypedRegister(registerGuidToRegisterChildrenGuid: Map<string, string[]>,
                                           registers: Map<string, Register>) {
    registerGuidToRegisterChildrenGuid.forEach((childrenGuid, guid) => {
      const register = registers.get(guid);
      if (register !== undefined) {
        this.addChildrenToRegister(childrenGuid, registers, register);
      }
    });
  }
  
  private addChildrenToRegister(childrenGuid: string[], registers: Map<string, Register>, register: Register) {
    for (const childGuid of childrenGuid) {
      const child = registers.get(childGuid);
      if (child !== undefined) {
        (register.children as Register[]).push(child);
      }
    }
  }
  
  protected getAutomergeInitString(): string {
    // tslint:disable-next-line
    return '["~#iL",[["~#iM",["ops",["^0",[["^1",["action","makeList","obj","59b9acb9-7492-4e9b-8d6c-f9c4be219e83"]],["^1",["action","link","obj","00000000-0000-0000-0000-000000000000","key","register","value","59b9acb9-7492-4e9b-8d6c-f9c4be219e83"]]]],"actor","d3a2af10-543b-4d69-8b59-0daffd9a0bc1","seq",1,"deps",["^1",[]],"message","First init of register tables"]]]]';
  }
}
