import {Register} from "@/common/data-definitions/register";
import {User} from "@/common/data-definitions/user";
import {Logger} from "@/common/logging";
import {RegisterStore} from "@/data/register-store";
import {TYPES} from "@/inversify-types";
import {inject, injectable} from "inversify";

@injectable()
export class RegisterService {
  private registerStore: RegisterStore;
  private log = Logger.getNew(RegisterService.name);
  
  constructor(
    @inject(TYPES.RegisterStore) registerStore: RegisterStore,
  ) {
    this.registerStore = registerStore;
  }
  
  public getAllRegisters(): Register[] {
    return this.registerStore.getAllRegisters();
  }
  
  public addRegister(register: Register) {
    this.registerStore.addRegister(register);
    this.log.info("Added new register: " + register.name);
  }
  
  public updateRegister(register: Register) {
    this.registerStore.updateRegister(register);
  }
  
  public getRegistersForUserAsPrincipal(user: User): Register[] {
    if (user.isDirigent) {
      return this.getAllRegisters();
    } else {
      return this.getAllRegisters().filter((register) => {
        return register.principal === user;
      });
    }
  }
  
  public registerRegisterChangedCallback(callback: () => void) {
    this.registerStore.registerCallback(callback);
  }
  
  public unregisterRegisterChangedCallback() {
    this.registerStore.unRegisterCallback();
  }
}
