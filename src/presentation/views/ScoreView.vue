<template>
  <div>
    <transition name="navbar-transition"
                enter-active-class="animated fadeIn fast-animation"
                leave-active-class="animated fadeOut fast-animation">
      <Navbar v-if="!isNavbarHidden" id="score-view-navbar"
              :displayMode="navbarMode"
              :centerText="pieceName"
              :piecePart="partName"
              @edit-part="startPartSelection"
              backTarget="/piecelist"></Navbar>
    </transition>
    <SelectPartModal v-if="(scoreDisplayData.musicPiece && !scoreDisplayData.part) || reselect"
                     :availableParts="partsOfPiece"
                     :piece="scoreDisplayData.musicPiece"
                     @part-selected="partChanged">
    </SelectPartModal>
    <!-- if not orchestra mode, there is always a piece selected, so error message only for orchestra mode -->
    <FullscreenHint v-if="!scoreDisplayData.musicPiece" hintText="Der Dirigent hat noch noch kein Stück ausgewählt!"
                    hintIcon="fab fa-slideshare" :btnAction="backToPieceList" actionText="Zurück zur Stückauswahl">
    </FullscreenHint>
    <FullscreenHint v-else-if="!scoreDisplayData.part" hintText="Es wurde noch keine Stimme ausgewählt!"
                    hintIcon="fas fa-hand-pointer" :btnAction="startPartSelection" actionText="Stimme auswählen">
    </FullscreenHint>
    <div @click="clickScore" v-else>
      <Verovio ref="score" :scoreDisplayData="scoreDisplayData"></Verovio>
    </div>
  </div>
</template>
<script lang="ts">
  import {Instrument} from "@/common/data-definitions/instrument";
  import {MusicPiece} from "@/common/data-definitions/music-piece";
  import {Part} from "@/common/data-definitions/part";
  import {fullScorePart} from "@/common/data-definitions/parts/full-score-part";
  import {SinglePart} from "@/common/data-definitions/parts/single-part";
  import {noneSelectionMode, SelectionMode} from "@/common/data-definitions/selection-mode";
  import {Logger} from "@/common/logging";
  import {MeasureId} from "@/common/svg-util";
  import {TYPES} from "@/inversify-types";
  import FullscreenHint from "@/presentation/components/FullscreenHint.vue";
  import {NavbarMode, scoreViewNavbarMode} from "@/presentation/components/navbar-modes";
  import Navbar from "@/presentation/components/Navbar.vue";
  import {ScoreDisplayData} from "@/presentation/components/score-display-data";
  import SelectPartModal from "@/presentation/components/SelectPartModal.vue";
  import Verovio from "@/presentation/components/Verovio.vue";
  import {MusicPieceService} from "@/services/music-piece-service";
  import {PartService} from "@/services/part-service";
  import {serviceContainer} from "@/services/service-container";
  import {UserService} from "@/services/user-service";
  import {Toaster} from "@/toaster";
  import {Subscription} from "rxjs";
  import {Component, Vue} from "vue-property-decorator";
  
  // noinspection JSUnusedGlobalSymbols
  @Component({
    components: {
      FullscreenHint,
      Verovio,
      Navbar,
      SelectPartModal,
    },
  })
  export default class ScoreView extends Vue {
    public $refs!: {
      score: Verovio,
    };
    
    private log = Logger.getNew(ScoreView.name);
    private partService: PartService = serviceContainer.get<PartService>(TYPES.PartService);
    private userService: UserService = serviceContainer.get<UserService>(TYPES.UserService);
    private musicPieceService: MusicPieceService = serviceContainer.get<MusicPieceService>(TYPES.MusicPieceService);
    private navbarMode: NavbarMode = scoreViewNavbarMode;
    
    private isNavbarHidden: boolean = false;
    
    private partsOfPiece: Part[] = [];
    private reselect = false;
    
    private get partName(): string {
      return this.scoreDisplayData.part ? this.scoreDisplayData.part.name : "noch keine Stimme gewählt";
    }
    
    private get pieceName(): string {
      return this.scoreDisplayData.musicPiece ? this.scoreDisplayData.musicPiece.name : "kein Stück gewählt";
    }
    
    private scoreDisplayData: ScoreDisplayData = {
      musicPiece: null,
      part: null,
      location: null,
    };
    
    private orchestraModeRx?: Subscription;
    private liveLocationRx?: Subscription;
    private livePieceRx?: Subscription;
    
    private mounted() {
      // live updates
      this.orchestraModeRx = this.$store.getters.orchestraModeObservable.subscribe((orchestraMode: boolean) => {
        this.log.info("OrchestraMode changed to: {}", orchestraMode);

        if (orchestraMode) {
          const user = this.userService.getCurrentUser();
          if (user && user.isDirigent) {
            this.$store.commit("updateLivePiece", this.$store.getters.localMusicPiece);
            this.updateDisplayedMusicPiece(this.$store.getters.localMusicPiece);
          } else if (this.$store.getters.livePiece) {
            this.updateDisplayedMusicPiece(this.$store.getters.livePiece.getValue());
            this.updateDisplayedLocation(this.$store.getters.liveLocation.getValue());
          } else {
            this.backToPieceList();
          }
        } else if (this.$store.getters.localMusicPiece) {
          this.updateDisplayedMusicPiece(this.$store.getters.localMusicPiece);
        } else {
          this.backToPieceList();
        }
      });
      
      this.liveLocationRx = this.$store.getters.liveLocation.subscribe((location: MeasureId) => {
        this.log.info("LiveLocation changed to: {}", location);
        // update only if orchestra mode
        if (this.$store.getters.orchestraMode) {
          const user = this.userService.getCurrentUser();
          if (user && !user.isDirigent) {
            this.updateDisplayedLocation(location);
          }
        }
      });
      
      this.livePieceRx = this.$store.getters.livePiece.subscribe((piece: MusicPiece) => {
        this.log.info("LivePiece changed to: {}", piece);
        // update only if orchestra mode
        if (this.$store.getters.orchestraMode) {
          this.log.info("Noticed Piece change to {}", piece.name);
          Vue.set(this.scoreDisplayData, "location", 0);
          this.updateDisplayedMusicPiece(piece);
          this.updateDisplayedLocation(this.$store.getters.liveLocation.getValue());
        }
      });
    }
    
    get selectionMode(): SelectionMode {
      return this.$store.getters.selectionMode;
    }
    
    
    private partChanged(part: Part): void {
      this.partService.setCurrentPart(part, this.scoreDisplayData.musicPiece!);
      this.updateDisplayedPart(part);
      this.reselect = false;
    }
    
    private updateDisplayedMusicPiece(musicPiece: MusicPiece) {
      this.log.info("Set musicPiece to: {}", musicPiece);
      Vue.set(this.scoreDisplayData, "musicPiece", musicPiece);
      if (musicPiece) {
        this.setPartsOfPiece(musicPiece).then();
        this.updateDisplayedPart(this.partService.getCurrentPart(musicPiece));
      }
    }
    
    private updateDisplayedPart(part: Part | null): void {
      this.log.info("Set part to: {}", part);
      Vue.set(this.scoreDisplayData, "part", part);
    }
    
    private updateDisplayedLocation(place: MeasureId) {
      // planned semantic: Show largest page with first measure of location on it (with possibly half if half paged)
      Vue.set(this.scoreDisplayData, "location", place);
    }
    
    private async setPartsOfPiece(piece: MusicPiece) {
      this.partsOfPiece = await this.musicPieceService.getPartsForMusicPiece(piece);
      if (!this.userService.getCurrentUser()!.isDirigent) {
        this.partsOfPiece = this.partsOfPiece.filter((p: Part) =>
          this.userService.getCurrentUser()!.instruments
            .map((i: Instrument) => i.midiNumber)
            .includes((p as SinglePart).instrument));
      }
      if (this.userService.getCurrentUser()!.isDirigent) {
        this.partsOfPiece.unshift(fullScorePart);
      }
      if (this.partsOfPiece.length < 1) {
        Toaster.noInstrumentsFound();
        this.partsOfPiece = await this.musicPieceService.getPartsForMusicPiece(piece);
      }
      this.log.info("parts for {} set to {}", piece.name, this.partsOfPiece);
    }
    
    private clickScore() {
      if (this.isNavbarHidden) {
        this.isNavbarHidden = false;
      } else if (this.selectionMode === noneSelectionMode) {
        this.isNavbarHidden = true;
      }
    }
    
    private backToPieceList() {
      this.$router.push("/piecelist");
    }
    
    private startPartSelection() {
      this.reselect = true;
    }
    
    private beforeDestroy() {
      this.log.info("Destroying ScoreView - unsubscribe");
      if (this.orchestraModeRx) {
        this.orchestraModeRx.unsubscribe();
      }
      if (this.liveLocationRx) {
        this.liveLocationRx.unsubscribe();
      }
      if (this.livePieceRx) {
        this.livePieceRx.unsubscribe();
      }
    }
  }

</script>

<style>
  #score-container {
    z-index: 5;
    width: 100vw;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
  }
  
  .fast-animation {
    animation-duration: 500ms;
  }
</style>
