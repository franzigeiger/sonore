<template>
  <b-card bg-variant="secondary" no-body
          border-variant="dark">
    <b-card-header class="d-flex align-items-center bg-dark text-white">
      <b-button @click="goBack" v-if="screenStack.length > 1">
        <i class="fas fa-arrow-left"></i>
      </b-button>
      <p class="flex-sm-grow-1 px-3 py-1 text-center m-0 dragIt">{{ titles[currentScreen] }}</p>
      <b-button @click="close" variant="danger">
        <i class="fas fa-times"></i>
      </b-button>
    </b-card-header>
    
    <ClickSelection :chooseSvgElements="chooseSvgPayload"
                    :scoreDisplayData="scoreDisplayData"
                    v-if="currentScreen === 'click-selection'"
                    v-on:annotationSetClick="appliedSelectionEmit"></ClickSelection>
    <KindSelection v-if="currentScreen === 'kind-selection'"
                   v-on:annotationSetKind="setAnnotationKind"
                   v-on:pointLive="sendPointLive"></KindSelection>
    <TypeSelection v-if="currentScreen === 'type-selection'"
                   v-on:annotationSetType="setAnnotationType"></TypeSelection>
    <ArticulationAnnotation v-if="currentScreen === 'articulation-annotation'"
                            v-on:annotationSetArticulation="setAnnotationArticulation"></ArticulationAnnotation>
    <NoteAnnotation v-if="currentScreen === 'change-note-annotation'"
                    :noteAnnotation="annotation"
                    v-on:annotationChangeNote="setAnnotationChangeNote"></NoteAnnotation>
    <DynamicAnnotation v-if="currentScreen === 'dynamic-annotation'"
                       v-on:annotationSetDynamic="setAnnotationDynamic"></DynamicAnnotation>
    <HighlightAnnotation v-if="currentScreen === 'highlight-annotation'"
                         v-on:annotationSetHighlight="setAnnotationHighlight"></HighlightAnnotation>
    <PaceAnnotation v-if="currentScreen === 'pace-annotation'"
                    v-on:annotationSetPace="setAnnotationPace"></PaceAnnotation>
    <TextAnnotation v-if="currentScreen === 'text-annotation'"
                    v-on:annotationSetText="setAnnotationText"></TextAnnotation>
    <RangeSelection v-if="currentScreen === 'range-selection'"
                    v-on:annotationSetPlace="setAnnotationPlace"></RangeSelection>
    <RangeEndSelection v-if="currentScreen === 'select-range-end'"
                       v-on:selectEndStart="$emit('selectEndStart')"></RangeEndSelection>
  </b-card>

</template>

<script lang="ts">
  import {Connection} from "@/common/connection/connection";
  import {Dynamic} from "@/common/data-definitions//annotations/kind/dynamic";
  import {Highlight, HighlightColor} from "@/common/data-definitions//annotations/kind/highlight";
  import {Pace} from "@/common/data-definitions//annotations/kind/pace";
  import {Text} from "@/common/data-definitions//annotations/kind/text";
  import {Place, PlaceKinds} from "@/common/data-definitions//annotations/place/place";
  import {PointPlace} from "@/common/data-definitions//annotations/place/point-place";
  import {Note} from "@/common/data-definitions//note";
  import {Annotation} from "@/common/data-definitions/annotations/annotation";
  import {AnnotationKind, AnnotationKinds} from "@/common/data-definitions/annotations/kind/annotation-kinds";
  import {Articulation, ArticulationLabel} from "@/common/data-definitions/annotations/kind/articulation";
  import {ChangeNote} from "@/common/data-definitions/annotations/kind/change-note";
  import {DynamicLabel} from "@/common/data-definitions/annotations/label/dynamic-labels";
  import {PaceLabel} from "@/common/data-definitions/annotations/label/pace-labels";
  import {RangePlace} from "@/common/data-definitions/annotations/place/range-place";
  import {AnnotationType} from "@/common/data-definitions/annotations/type/annotation-type";
  import {OrchestraAnnotation} from "@/common/data-definitions/annotations/type/orchestra-annotation";
  import {PartAnnotation} from "@/common/data-definitions/annotations/type/part-annotation";
  import {PersonalAnnotation} from "@/common/data-definitions/annotations/type/personal-annotation";
  import {Logger} from "@/common/logging";
  import {TYPES} from "@/inversify-types";
  import {AnnotationScreens} from "@/presentation/components/annotations/annotation-screens";
  import ArticulationAnnotation from "@/presentation/components/annotations/ArticulationAnnotation.vue";
  import ClickSelection from "@/presentation/components/annotations/ClickSelection.vue";
  import DynamicAnnotation from "@/presentation/components/annotations/DynamicAnnotation.vue";
  import HighlightAnnotation from "@/presentation/components/annotations/HighlightAnnotation.vue";
  import KindSelection from "@/presentation/components/annotations/KindSelection.vue";
  import NoteAnnotation from "@/presentation/components/annotations/NoteAnnotation.vue";
  import PaceAnnotation from "@/presentation/components/annotations/PaceAnnotation.vue";
  import RangeEndSelection from "@/presentation/components/annotations/RangeEndSelection.vue";
  import RangeSelection from "@/presentation/components/annotations/RangeSelection.vue";
  import TextAnnotation from "@/presentation/components/annotations/TextAnnotation.vue";
  import TypeSelection from "@/presentation/components/annotations/TypeSelection.vue";
  import {AnnotationService} from "@/services/annotation-service";
  import {MusicPieceService} from "@/services/music-piece-service";
  import {ScoreDisplayData, ValidScoreDisplayData} from "@/presentation/components/score-display-data";
  import {serviceContainer} from "@/services/service-container";
  import {UserService} from "@/services/user-service";
  import {Toaster} from "@/toaster";
  import {Component, Prop, Vue} from "vue-property-decorator";
  
  @Component({
    components: {
      RangeEndSelection,
      RangeSelection,
      ArticulationAnnotation,
      NoteAnnotation,
      PaceAnnotation,
      HighlightAnnotation, DynamicAnnotation, TextAnnotation, KindSelection, TypeSelection, ClickSelection,
    },
  })
  export default class AnnotationDialog extends Vue {
    @Prop() private scoreDisplayData!: ValidScoreDisplayData;
    @Prop() private chooseSvgPayload!: SVGElement[];
    @Prop() private clickedSvgPayload!: SVGElement;
    @Prop() private clickedEndSvgPayload!: SVGElement;
    private musicPieceService: MusicPieceService = serviceContainer.get<MusicPieceService>(TYPES.MusicPieceService);
    private annotationService: AnnotationService = serviceContainer.get<AnnotationService>(TYPES.AnnotationService);
    private connection: Connection = serviceContainer.get<Connection>(TYPES.Connection);
    private log = Logger.getNew(AnnotationDialog.name);
    
    private get annotation(): Annotation<AnnotationType, Place> | undefined {
      return this.$store.getters.annotation;
    }
    
    private set annotation(annotation: Annotation<AnnotationType, Place> | undefined) {
      this.$store.commit("setAnnotation", annotation);
    }
    
    private titles = {
      "click-selection": "Bitte Ziel auswählen",
      "kind-selection": "Welche Art soll die Anmerkung haben?",
      "type-selection": "Für wen ist die Anmerkung bestimmt?",
      "range-selection": "Für welchen Bereich soll die Anmerkung gelten?",
      
      "select-range-end": "Ende des Bereichs auswählen",
      
      "articulation-annotation": "Artikulation angeben",
      "change-note-annotation": "Note ändern",
      "dynamic-annotation": "Dynamik angeben",
      "highlight-annotation": "Farbe auswählen",
      "pace-annotation": "Tempo auswählen",
      "text-annotation": "Anmerkungstext",
    };
    
    
    private get screenStack(): AnnotationScreens[] {
      return this.$store.getters.annotationScreenStack;
    }
    
    private get currentScreen(): AnnotationScreens {
      return this.screenStack[this.screenStack.length - 1];
    }
    
    private set currentScreen(screen: AnnotationScreens) {
      this.$store.commit("annotationScreenAdd", screen);
    }
    
    private get initScreen() {
      return this.chooseSvgPayload.length > 1 ?
             AnnotationScreens.clickSelection :
             AnnotationScreens.kindSelection;
    }
    
    private goBack() {
      this.$store.commit("annotationScreenGoBack");
    }
    
    private close() {
      this.$emit("cancelSelection");
    }
    
    private appliedSelectionEmit(element: Element) {
      this.$emit("applySelection", element);
      if (this.screenStack.length === 1) { // First Selection
        this.currentScreen = AnnotationScreens.kindSelection;
      } else { // After Range Selection
        // use element instead of clickedSvgPayload, because Prop will not updated that fast...
        this.annotation!.place = RangePlace.getRangePlaceWithId(
          this.clickedSvgPayload.id, element.id);
        this.doAnnotationType();
      }
    }
    
    private async setAnnotationKind(annotationKind: AnnotationKind) {
      const userService = serviceContainer.get<UserService>(TYPES.UserService);
      const currentUser = userService.getCurrentUser()!;
      if (annotationKind.kind === AnnotationKinds.articulation) {
        this.annotation = new Articulation(currentUser, this.scoreDisplayData.musicPiece.id);
        this.currentScreen = AnnotationScreens.articulationAnnotation;
      } else if (annotationKind.kind === AnnotationKinds.changeNote) {
        const attributeMap = await this.musicPieceService.getMeiAttributesFromIds(
          [this.clickedSvgPayload.id], this.scoreDisplayData.musicPiece, this.scoreDisplayData.part);
        const originalNote = Note.getNewFromMeiAttributes(this.clickedSvgPayload.id, attributeMap[0]);
        this.annotation = new ChangeNote(currentUser, this.scoreDisplayData.musicPiece.id, originalNote);
        this.currentScreen = AnnotationScreens.changeNoteAnnotation;
      } else if (annotationKind.kind === AnnotationKinds.dynamic) {
        this.annotation = new Dynamic(currentUser, this.scoreDisplayData.musicPiece.id);
        this.currentScreen = AnnotationScreens.dynamicAnnotation;
      } else if (annotationKind.kind === AnnotationKinds.highlight) {
        this.annotation = new Highlight(currentUser, this.scoreDisplayData.musicPiece.id);
        this.currentScreen = AnnotationScreens.highlightAnnotation;
      } else if (annotationKind.kind === AnnotationKinds.pace) {
        this.annotation = new Pace(currentUser, this.scoreDisplayData.musicPiece.id);
        this.currentScreen = AnnotationScreens.paceAnnotation;
      } else if (annotationKind.kind === AnnotationKinds.text) {
        this.annotation = new Text(currentUser, this.scoreDisplayData.musicPiece.id);
        this.currentScreen = AnnotationScreens.textAnnotation;
      }
    }
    
    private setAnnotationArticulation(a: ArticulationLabel) {
      (this.annotation! as Articulation<PersonalAnnotation | PartAnnotation, PointPlace>).label = a;
      this.doAnnotationPlace();
    }
    
    private setAnnotationChangeNote(n: Note) {
      (this.annotation! as ChangeNote<PersonalAnnotation | PartAnnotation, PointPlace>).note = n;
      this.doAnnotationPlace();
    }
    
    private setAnnotationDynamic(d: DynamicLabel) {
      (this.annotation! as Dynamic<AnnotationType, Place>).label = d;
      this.doAnnotationPlace();
    }
    
    private setAnnotationHighlight(c: HighlightColor) {
      (this.annotation! as Highlight<AnnotationType, Place>).color = c;
      this.doAnnotationPlace();
    }
    
    private setAnnotationPace(p: PaceLabel) {
      (this.annotation! as Pace<OrchestraAnnotation, Place>).label = p;
      this.doAnnotationPlace();
    }
    
    private setAnnotationText(t: string) {
      (this.annotation! as Text<AnnotationType, PointPlace>).text = t;
      this.doAnnotationPlace();
    }
    
    private doAnnotationPlace() {
      if (this.annotation!.validPlaceKinds().length === 1) {
        this.setAnnotationPlace(this.annotation!.validPlaceKinds()[0]);
      } else {
        this.currentScreen = AnnotationScreens.rangeSelection;
      }
    }
    
    private setAnnotationPlace(pk: PlaceKinds) {
      if (pk === PlaceKinds.pointPlace) {
        this.annotation!.place = PointPlace.getPointPlaceWithId(this.clickedSvgPayload.id);
        this.doAnnotationType();
      } else if (pk === PlaceKinds.rangePlace) {
        this.currentScreen = AnnotationScreens.selectRangeEnd;
      }
    }
    
    private doAnnotationType() {
      if (this.annotationService.getValidAnnotationTypes().length === 1) {
        this.setAnnotationType(this.annotationService.getValidAnnotationTypes()[0]);
      } else {
        this.currentScreen = AnnotationScreens.typeSelection;
      }
    }
    
    private setAnnotationType(type: AnnotationType) {
      this.annotation!.type = type;
      this.createAndSaveAnnotation();
    }
    
    private createAndSaveAnnotation() {
      if (this.annotation && this.annotation.isComplete()) {
        this.annotationService.addAnnotation(this.annotation);
        // Annotation creation successful - close dialog
        Toaster.annotationCreated();
        this.$emit("rerender");
        this.close();
      } else {
        Toaster.annotationFailed();
        this.log.error("Annotation wasn't created, because it's not complete - Object: {}", this.annotation);
      }
    }
    
    private async sendPointLive() {
      const content = {id: this.clickedSvgPayload.id};
      this.connection.sendMessage("POINT-HIGHLIGHT", content);
      this.$store.commit("setPointHighlight", content);
      this.log.info("Live-Point Meldung zu {} gesendet.",
        await this.musicPieceService.getMeiAttributesFromIds(
          [this.clickedSvgPayload.id], this.scoreDisplayData.musicPiece, this.scoreDisplayData.part));
      this.close();
    }
    
    private mounted() {
      if (this.screenStack.length === 0) {
        this.currentScreen = this.initScreen;
      } else {
        if (this.clickedEndSvgPayload) {
          this.annotation!.place = RangePlace.getRangePlaceWithId(
            this.clickedSvgPayload.id, this.clickedEndSvgPayload.id);
          this.doAnnotationType();
        } else {
          this.currentScreen = AnnotationScreens.clickSelection;
        }
      }
      
    }
  }
</script>

<style scoped>
  .dragIt {
    cursor: move;
  }
</style>
