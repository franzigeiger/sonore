import {AnnotationType} from "@/common/data-definitions/annotations/type/annotation-type";
import {Register} from "../../register";

export class RegisterAnnotation extends AnnotationType {
  public register: Register;
  public displayName: string;
  
  constructor(register: Register) {
    super();
    this.register = register;
    this.displayName = "für das Register: " + this.register.name;
  }
}
