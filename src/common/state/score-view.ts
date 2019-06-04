import {noneSelectionMode, SelectionMode} from "@/common/data-definitions/selection-mode";
import {Module, Mutation, VuexModule} from "vuex-module-decorators";

@Module
export default class ScoreView extends VuexModule {
  private mViewMode: "single" | "half" = "single";
  private mSelectionMode: SelectionMode = noneSelectionMode;
  private mPageIndex: number = 0;
  private mPageCount: number = 0;
  
  get viewMode(): "single" | "half" {
    return this.mViewMode;
  }
  
  get selectionMode(): SelectionMode {
    return this.mSelectionMode;
  }
  
  get pageIndex(): number {
    return this.mPageIndex;
  }
  
  get pageCount(): number {
    return this.mPageCount;
  }
  
  @Mutation
  public setViewMode(mode: "single" | "half"): void {
    this.mViewMode = mode;
  }
  
  @Mutation
  public setSelectionMode(mode: SelectionMode): void {
    this.mSelectionMode = mode;
  }
  
  @Mutation
  public setPageIndex(pageIndex: number): void {
    this.mPageIndex = pageIndex;
  }
  
  @Mutation
  public setPageCount(pageCount: number): void {
    this.mPageCount = pageCount;
  }
}
