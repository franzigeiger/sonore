import store from "@/common/state/store";
import {BehaviorSubject} from "rxjs";
import {Module, Mutation, VuexModule} from "vuex-module-decorators";

@Module
export default class OrchestraMode extends VuexModule {
  private mOrchestraMode = new BehaviorSubject(false);
  
  @Mutation
  public toggleOrchestraMode(): void {
    this.mOrchestraMode.next(!this.mOrchestraMode.getValue());
  }
  
  @Mutation
  public disableOrchestraMode(): void {
    if (this.mOrchestraMode.getValue()) {
      this.mOrchestraMode.next(false);
    }
  }
  
  public get orchestraMode(): boolean {
    return this.mOrchestraMode.getValue();
  }
  
  public get orchestraModeObservable(): BehaviorSubject<boolean> {
    return this.mOrchestraMode;
  }
}
