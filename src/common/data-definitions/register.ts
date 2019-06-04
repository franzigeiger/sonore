import {SinglePart} from "@/common/data-definitions/parts/single-part";
import {newGuid} from "../util";
import {User} from "./user";

export enum RegisterType {
  Part,
  Register,
}

export class Register {
  public static partRegister(name: string, principal: User, children: SinglePart[]): Register {
    return new Register(name, principal, RegisterType.Part, children);
  }
  
  public static registerRegister(name: string, principal: User, children: Register[]): Register {
    return new Register(name, principal, RegisterType.Register, children);
  }
  
  public readonly guid: string;
  
  public name: string;
  public principal: User;
  
  private iType: RegisterType;
  private iChildren: SinglePart[] | Register[];
  
  constructor(name: string, principal: User, type: RegisterType, children: SinglePart[] | Register[],
              guid: string = newGuid()) {
    this.name = name;
    this.principal = principal;
    this.iChildren = children;
    this.iType = type;
    this.guid = guid;
  }
  
  public get type() {
    return this.iType;
  }
  
  public get children() {
    return this.iChildren;
  }
  
  public set subregisters(registers: Register[]) {
    this.iType = RegisterType.Register;
    this.iChildren = registers;
  }
  
  public set parts(parts: SinglePart[]) {
    this.iType = RegisterType.Part;
    this.iChildren = parts;
  }
}
