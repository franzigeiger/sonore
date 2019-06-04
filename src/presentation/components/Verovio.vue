<template>
  <div id="score-container">
    <b-progress :value="pageIndex" :max="pageCount-1"></b-progress>
    <spinner v-if="!loaded" sizeClass="fullscreen"></spinner>
    <div id="score-output" @click="svgOnClick" @mouseover="svgOnHover">
      <div v-if="loaded" v-for="(item, index) in svgData" class="svg-output-display" v-html="item"
           :class="{'outside': pageIndex !== index, 'top': pageIndex + 0.5 === index, 'bottom': pageIndex - 0.5 === index }">
      </div>
      
      <div v-if="loaded" v-for="(item, index) in svgData" class="svg-output-transparent" v-html="item"
           :class="{'outside': pageIndex !== index, 'top': pageIndex + 0.5 === index, 'bottom': pageIndex - 0.5 === index }">
      </div>
    </div>
    <modal name="annotations" draggable=".dragIt" :width="350" height="auto" :reset="true"
           @opened="openedAnnotationDialog" @closed="closedAnnotationDialog"
           :pivotX="pivotAnnotationDialog.x" :pivotY="pivotAnnotationDialog.y">
      <AnnotationDialog :chooseSvgPayload="selectionHandler.pChosenElements"
                        :clickedSvgPayload="selectionHandler.pClickedElement"
                        :clickedEndSvgPayload="selectionHandler.pClickedEndElement"
                        :scoreDisplayData="validScoreDisplayData"
                        id="annotationDialog"
                        v-on:rerender="reload()"
                        v-on:applySelection="applySelection"
                        v-on:cancelSelection="selectionHandler.closeModal()"
                        v-on:selectEndStart="selectionHandler.startRangeEndSelection()">
      </AnnotationDialog>
    </modal>
    <transition
      name="prev-page-transition"
      leave-active-class="animated zoomOutRight">
      <div class="action-overlay action-left" v-if="action === 'prevPage'">
        <i class="fas fa-arrow-left"></i>
      </div>
    </transition>
    <transition
      name="next-page-transition"
      leave-active-class="animated zoomOutLeft">
      <div class="action-overlay action-right" v-if="action === 'nextPage'">
        <i class="fas fa-arrow-right"></i>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
  import {Logger} from "@/common/logging";
  import {getFirstAndLastMeasure} from "@/common/svg-util";
  import {TYPES} from "@/inversify-types";
  import AnnotationDialog from "@/presentation/components/AnnotationDialog.vue";
  import {calcPosition} from "@/presentation/components/annotations/dialog-positioning";
  import {hammerIt} from "@/presentation/components/score-touch-interactions";
  import Spinner from "@/presentation/components/Spinner.vue";
  import {SelectionHandler} from "@/presentation/components/verovio-selections";
  import {AnnotationService} from "@/services/annotation-service";
  import {UserService} from "@/services/user-service";
  import {Component, Prop, Vue, Watch} from "vue-property-decorator";
  import {RenderingService, ScreenSetting} from "@/services/rendering-service";
  import {ScoreDisplayData, ValidScoreDisplayData} from "@/presentation/components/score-display-data";
  import {serviceContainer} from "@/services/service-container";
  
  @Component({
    components: {Spinner, AnnotationDialog},
  })
  
  export default class Verovio extends Vue {
    
    @Prop() private scoreDisplayData!: ScoreDisplayData;
    
    get highlightId(): string {
      return this.$store.getters.highlightId;
    }
    
    // if half, there are two outputs shown if the musician wants to change the current page
    // there are either the current full page or...
    // the top half of the page and bottom half of current page
    get viewMode(): "single" | "half" {
      return this.$store.getters.viewMode;
    }
    
    get selectionMode(): SelectionMode {
      return this.$store.getters.selectionMode;
    }
    
    get pageIndex(): number { // zero-based
      return this.$store.getters.pageIndex;
    }
    
    set pageIndex(pageIndex: number) {
      this.$store.commit("setPageIndex", pageIndex);
    }
    
    get pageCount(): number {
      return this.$store.getters.pageCount;
    }
    
    set pageCount(pageCount: number) {
      this.$store.commit("setPageCount", pageCount);
    }
    
    // Is valid, because Verovio component is only shown when musicPiece & part
    get validScoreDisplayData(): ValidScoreDisplayData {
      if (!this.scoreDisplayData.musicPiece || !this.scoreDisplayData.part) {
        this.log.error("There are missing data-attributes (musicPiece or Part) to display score correctly: {}",
          this.scoreDisplayData);
      }
      return Object.assign({}, this.scoreDisplayData) as ValidScoreDisplayData;
    }
    
    private renderingService: RenderingService = serviceContainer.get<RenderingService>(TYPES.RenderingService);
    private userService: UserService = serviceContainer.get<UserService>(TYPES.UserService);
    private annotationService: AnnotationService = serviceContainer.get<AnnotationService>(TYPES.AnnotationService);
    private svgData: string[] = [];
    private log = Logger.getNew(Verovio.name);
    private screenSetting?: ScreenSetting;
    private loaded = false;
    private action: string = "none"; // enum does not work in vue-template
    private preloadPendingTimeout?: number;
    private pivotAnnotationDialog = {x: 0, y: 0}; // values range [0, 1.0]
    private mousePosition = {x: 0, y: 0}; // pixel values
    private selectionHandler = new SelectionHandler(this.openAnnotationModal, this.closeAnnotationModal);
    
    public nextPage() {
      if (this.pageIndex >= this.pageCount - 1) {
        return;
      }
      this.setAction("nextPage");
      this.setPage(this.viewMode === "half" ? this.pageIndex + 0.5 : this.pageIndex + 1);
    }
    
    public prevPage() {
      if (this.pageIndex <= 0) {
        return;
      }
      this.setAction("prevPage");
      this.setPage(this.viewMode === "half" ? this.pageIndex - 0.5 : this.pageIndex - 1);
    }
    
    public firstPage() {
      this.setPage(0);
    }
    
    public lastPage() {
      this.setPage(this.pageCount - 1);
    }
    
    @Watch("selectionMode")
    public onSelectionModeChanged() {
      this.selectionHandler.closeModal();
    }
    
    @Watch("highlightId")
    public onHighlightIdChanged(newHighlightId: string, oldHighlightId: string) {
      this.selectionHandler.updateHighlight(newHighlightId, oldHighlightId);
    }
    
    @Watch("validScoreDisplayData", {deep: true})
    public onScoreDisplayDataUpdated(newScoreDisplayData: ValidScoreDisplayData,
                                     oldScoreDisplayData: ValidScoreDisplayData) {
      this.log.info("Change detected - update score {}", newScoreDisplayData);
      this.updateScore(false, newScoreDisplayData, oldScoreDisplayData);
    }
    
    // with no given 2nd parameter, the view will always be re-rendered (for example for annotations)
    public updateScore(stayAtPage: boolean,
                       newScoreDisplayData: ValidScoreDisplayData, oldScoreDisplayData?: ValidScoreDisplayData) {
      this.screenSetting = {
        width: window.innerWidth,
        height: window.innerHeight,
        zoomLevel: 30, // TODO this should be a user specific setting
      };
      setTimeout(async () => {
        if (newScoreDisplayData) {
          if (!oldScoreDisplayData
              || newScoreDisplayData.musicPiece.id !== oldScoreDisplayData.musicPiece.id
              || newScoreDisplayData.part !== oldScoreDisplayData.part) {
            this.pageCount = await this.renderingService.initPiece(
              this.screenSetting!, newScoreDisplayData.musicPiece!, newScoreDisplayData.part!);
            this.svgData = new Array(this.pageCount);
            this.log.info("Loaded Piece {}, {} pages", newScoreDisplayData.musicPiece!.name, this.pageCount);
          }
          if (newScoreDisplayData.location) {
            const page = this.renderingService.getPageOfId(newScoreDisplayData.location);
            this.setPage(page - 1, true);
            this.log.debug("Changed to measure {} on page {}", newScoreDisplayData.location, page);
          } else {
            this.setPage(stayAtPage ? this.pageIndex : 0, true);
            this.log.debug("No measure info, going to p 0");
          }
        }
      }, 100);
    }
    
    @Watch("viewMode")
    private onViewModeChanged(val: "single" | "half", oldVal: "single" | "half") {
      // adjust page indices to prevent .5 in single mode
      if (oldVal === "half" && val === "single") {
        this.pageIndex -= this.pageIndex % 1;
      }
    }
    
    private setAction(action: string) {
      this.action = action;
    }
    
    private selectAction(e: KeyboardEvent) {
      switch (e.key) {
        case "ArrowUp":
          this.firstPage();
          break;
        case "ArrowDown":
          this.lastPage();
          break;
        case "ArrowLeft":
          this.prevPage();
          break;
        case "ArrowRight":
          this.nextPage();
          break;
        default:
          break;
      }
    }
    
    private getSvg(pageIndex: number): string {
      // pages in verovio are 1-based, so +1 for page
      const tStart = performance.now();
      const svgData = this.renderingService.getSvg(pageIndex + 1);
      const tFinished = performance.now();
      this.log.info("SVG Output Time: " + (tFinished - tStart) + "ms");
      return svgData;
    }
    
    private setPage(pageIndex: number, forceReload?: boolean) {
      if (this.preloadPendingTimeout) {
        clearTimeout(this.preloadPendingTimeout);
      }
      if (this.pageIndex !== pageIndex) {
        this.pageIndex = pageIndex;
      } else if (forceReload) {
        this.onPageIndexChange(pageIndex);
      }
    }
    
    // pageIndex are integer-values in full-page mode and integer or .5 values in half-page mode
    @Watch("pageIndex")
    private async onPageIndexChange(newPageIndex: number) {
      const pageIndexInteger = Math.ceil(newPageIndex);
      // delay to force showing of arrows
      await this.$nextTick();
      this.action = "none";
      if (!this.svgData[pageIndexInteger]) {
        Vue.set(this.svgData, pageIndexInteger, this.getSvg(pageIndexInteger));
      }
      this.preloadPendingTimeout = setTimeout(() => {
        if (pageIndexInteger - 1 >= 0 && !this.svgData[pageIndexInteger - 1]) {
          Vue.set(this.svgData, pageIndexInteger - 1, this.getSvg(pageIndexInteger - 1));
        }
        if (pageIndexInteger + 1 <= this.pageCount - 1 && !this.svgData[pageIndexInteger + 1]) {
          Vue.set(this.svgData, pageIndexInteger + 1, this.getSvg(pageIndexInteger + 1));
        }
      }, 1000);
      
      const user = this.userService.getCurrentUser();
      if (this.$store.getters.orchestraMode && user && user.isDirigent) {
        const measure = getFirstAndLastMeasure(this.svgData[pageIndexInteger]);
        this.$store.commit("updateLiveLocation", measure.startId);
      }
      
      this.loaded = true;
    }
    
    private svgOnClick(e: MouseEvent) {
      this.mousePosition.x = e.clientX;
      this.mousePosition.y = e.clientY;
      this.selectionHandler.handleSvgClick(e.clientX, e.clientY);
    }
    
    private svgOnHover(e: MouseEvent) {
      this.selectionHandler.refreshHovering(e.clientX, e.clientY);
    }
    
    private applySelection(e: SVGElement) {
      this.selectionHandler.setClickedElement(e);
    }
    
    // repositioning Modal
    private openedAnnotationDialog() {
      const el = document.querySelector("div[data-modal=annotations] .v--modal") as HTMLElement;
      this.pivotAnnotationDialog = calcPosition(this.mousePosition.x, this.mousePosition.y,
        el.clientWidth, el.clientHeight, this.screenSetting!);
    }
    
    private closedAnnotationDialog() {
      this.selectionHandler.modalClosedHandler();
    }
    
    private closeAnnotationModal() {
      this.$modal.hide("annotations");
    }
    
    private openAnnotationModal() {
      // show Modal
      this.$modal.show("annotations");
    }
    
    private created() {
      window.addEventListener("keyup", this.selectAction);
    }
    
    // for new rendering after creation of annotations
    private reload() {
      this.updateScore(true, this.validScoreDisplayData);
    }
    
    private mounted() {
      // Add touch interactions (swipe, zoom, pan) to score-output
      hammerIt(document.getElementById("score-output")!, this.nextPage, this.prevPage);
      this.updateScore(false, this.validScoreDisplayData);
      this.annotationService.registerAnnotationChangedCallback(this.reload);
    }
    
    private beforeDestroy() {
      window.removeEventListener("keyup", this.selectAction);
      this.annotationService.unregisterAnnotationChangedCallback();
    }
    
  }
</script>

<style>
  .outside {
    left: 100vw;
  }
  
  .top {
    left: 0;
    top: 0;
    height: calc(50% - 10px);
  }
  
  .bottom {
    left: 0;
    top: calc(50% + 10px);
    height: calc(50% - 10px);
    width: 100%; /* TODO */
  }
  
  .bottom > svg {
    top: calc(-100% - 20px);
    position: absolute;
  }
  
  .progress {
    border-radius: 0;
    height: 4px;
    width: 100%;
  }
  
  #score-output {
    width: 100%;
    height: calc(100% - 4px); /* 4px because of progressbar */
    background-color: slategrey;
    position: relative
  }
  
  #score-output > div {
    position: absolute;
    overflow: hidden;
  }
  
  #score-output > .svg-output-display {
    background-color: white;
  }
  
  /* for displaying arrows - next/prev page */
  .action-overlay {
    color: #007bff;
    top: 42vh;
    position: fixed;
    font-size: 16vh;
    line-height: 16vh;
    z-index: 20;
  }
  
  .action-right {
    right: 40px;
  }
  
  .action-left {
    left: 40px;
  }
  
  /* position is set with javascript - to select notes etc. */
  .annotation-overlay {
    position: fixed;
    z-index: 15;
  }
  
  .svg-output-transparent svg * {
    stroke-width: 1000;
    stroke: transparent;
    fill: transparent;
    pointer-events: visible;
  }
  
  .svg-output-display svg * {
    pointer-events: none;
  }
  
  /* Selectors for all highlighting things of svg */
  
  .svg-highlight, .svg-highlight * {
    fill: red;
    stroke: red;
  }
  
  .svg-output-display-grey {
    fill: slategrey;
    stroke: slategrey;
  }
  
  .svg-hovered, .svg-hovered * {
    fill: red;
    stroke: red;
  }
  
  .svg-clicked, .svg-clicked * {
    fill: #007bff;
    stroke: #007bff;
  }
  
  .selection1, .selection1 *, .selection1-btn {
    fill: seagreen;
    stroke: seagreen;
    background-color: seagreen;
    color: white;
  }
  
  .selection2, .selection2 *, .selection2-btn {
    fill: darkorange;
    stroke: darkorange;
    background-color: darkorange;
  }
  
  .selection3, .selection3 *, .selection3-btn {
    fill: Navy;
    stroke: Navy;
    background-color: Navy;
    color: white;
  }
  
  .selection4, .selection4 *, .selection4-btn {
    fill: fuchsia;
    stroke: fuchsia;
    background-color: fuchsia;
  }
  
  .selection5, .selection5 *, .selection5-btn {
    fill: chartreuse;
    stroke: chartreuse;
    background-color: chartreuse;
  }
  
  .selection6, .selection6 *, .selection6-btn {
    fill: indigo;
    stroke: indigo;
    background-color: indigo;
    color: white;
  }
  
  .selection7, .selection7 *, .selection7-btn {
    fill: darkturquoise;
    stroke: darkturquoise;
    background-color: darkturquoise;
  }
  
  .selection8, .selection8 *, .selection8-btn {
    fill: saddlebrown;
    stroke: saddlebrown;
    background-color: saddlebrown;
    color: white;
  }

</style>
