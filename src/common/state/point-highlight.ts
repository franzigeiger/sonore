import {Logger} from "@/common/logging";
import store from "@/common/state/store";
import {Module, Mutation, VuexModule} from "vuex-module-decorators";

@Module
export default class PointHighlight extends VuexModule {
  private mHighlightId: string = "";
  private log = Logger.getNew(PointHighlight.name);
  
  private resetTimeout?: number;
  
  public get highlightId(): string {
    return this.mHighlightId;
  }
  
  // called from connection service via registered callback in store.ts
  @Mutation
  public setPointHighlight(content: any) {
    this.log.info("Received point Update from remote or this device is dirigent - {}", content);
    this.mHighlightId = content.id;
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
    }
    if (content.id !== "") {
      this.resetTimeout = setTimeout(() => {
        store.commit("setPointHighlight", { id: ""});
      }, 10000);
    }
  }
}

