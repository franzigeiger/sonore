<template>
  <b-navbar toggleable="md" type="dark" :variant="displayMode.variant" :sticky="displayMode.showScoreNavigation">
    
    <b-navbar-nav class="mr-auto shrink hide-overflow">
      <b-nav-item :to="backTarget" v-if="backTarget" class="my-1 my-md-0 mx-1"><i
        class="fas fa-arrow-left"></i>
      </b-nav-item>
      <!--<b-nav-item href="#" v-if="displayMode.showUsers" class="mx-1">-->
        <!--<i class="fas fa-user-friends"></i>-->
      <!--</b-nav-item>-->
      <b-nav-form class="shrink hide-overflow" v-if="piecePart">
        <b-button size="sm" class="shrink hide-overflow my-0 my-sm-0 px-2 mx-1" variant="primary"
                  @click="$emit('edit-part')">
          {{ piecePart }}
        </b-button>
      </b-nav-form>
      <b-nav-form class="shrink hide-overflow" v-if="displayMode.showSearchBar">
        <b-form-input size="sm" class="shrink hide-overflow my-1 my-md-0 mx-1" type="text" placeholder="Suchen..."
                      v-model="searchString"
                      @input="$emit('navbar-search-update', searchString)"/>
      </b-nav-form>
      <b-button class="shrink hide-overflow" v-if="debug" @click="setPiece()">Change live piece</b-button>
    </b-navbar-nav>
    
    <b-navbar-nav class="m-auto shrink hide-overflow">
      <b-navbar-brand v-if="centerText" tag="h1" class="shrink hide-overflow p-0 mx-2 my-1 my-md-0">
        {{ centerText }}
      </b-navbar-brand>
    </b-navbar-nav>
    
    <ScoreNavigation class="shrink" v-if="displayMode.showScoreNavigation"></ScoreNavigation>
    
    <!-- Right aligned nav items -->
    <b-navbar-nav class="ml-auto shrink">
      <b-button v-if="displayMode.showOrchestraModeToggle" @click="toggleOrchestraMode()" size="sm"
                class="shrink hide-overflow my-1 my-md-0 mx-1" :variant="orchestraMode ? 'success' : 'warning'">
        {{ orchestraMode ? "Orchestermodus" : "Privater Modus" }}
      </b-button>
      <b-button v-if="displayMode.showGoToOrchestraMode && livePiece" @click="toScoreViewOrchestra()" size="sm"
                class="shrink hide-overflow my-1 my-md-0 mx-1" variant="success">
        <i class="fas fa-sign-in-alt"></i> Orchester: {{ livePiece.name }}
      </b-button>
      <b-nav-item-dropdown v-if="displayMode.showMenu" right class="my-1 my-md-0 mx-1">
        <!-- Using button-content slot -->
        <template slot="button-content">
          <i class="fas fa-cog"></i>
        </template>
        <b-dropdown-item to="/settings">Einstellungen</b-dropdown-item>
        <b-dropdown-item to="/connection">Verbindungen</b-dropdown-item>
        <b-dropdown-item href="#">Nutzer: {{ currentUserName }}</b-dropdown-item>
        <b-dropdown-item @click="logout">Ausloggen</b-dropdown-item>
      </b-nav-item-dropdown>
    </b-navbar-nav>
  </b-navbar>
  
  <!-- navbar-1.vue -->
</template>

<script lang="ts">
  import {MusicPiece} from "@/common/data-definitions/music-piece";
  import {Logger} from "@/common/logging";
  import {TYPES} from "@/inversify-types";
  import {NavbarMode} from "@/presentation/components/navbar-modes";
  import ScoreNavigation from "@/presentation/components/ScoreNavigation.vue";
  import router from "@/router";
  import {MusicPieceService} from "@/services/music-piece-service";
  import {serviceContainer} from "@/services/service-container";
  import {UserService} from "@/services/user-service";
  import {Toaster} from "@/toaster";
  import {Component, Prop, Vue} from "vue-property-decorator";
  
  @Component({
    components: {ScoreNavigation},
  })
  export default class Navbar extends Vue {
    private searchString: string = "";
    private log = Logger.getNew(Navbar.name);
    private userService = serviceContainer.get<UserService>(TYPES.UserService);
    private pieceService = serviceContainer.get<MusicPieceService>(TYPES.MusicPieceService);
    
    @Prop({default: undefined}) private backTarget?: string;
    @Prop({default: undefined}) private centerText?: string;
    @Prop({default: undefined}) private piecePart?: string;
    @Prop() private displayMode!: NavbarMode;
    
    get orchestraMode(): boolean {
      return this.$store.getters.orchestraMode;
    }
    
    get currentUserName(): string {
      const user = this.userService.getCurrentUser();
      if (!user) {
        this.logout();
      }
      return user ? user.name : "";
    }
    
    private get livePiece(): MusicPiece | null {
      return this.$store.getters.livePiece.getValue();
    }
    
    get debug(): boolean {
      return (window as any).debug;
    }
    
    public toggleOrchestraMode(): void {
      this.$store.commit("toggleOrchestraMode");
    }
    
    private toScoreViewOrchestra(): void {
      if (!this.$store.getters.orchestraMode) {
        this.toggleOrchestraMode();
      }
      this.$router.push("/scoreview");
    }
    
    private logout() {
      this.userService.logoutUser();
      Toaster.logout();
      this.$router.push("/");
    }
    
    // callback for the debug button, changes live state
    private setPiece() {
      const currentLivePiece = this.$store.getters.livePiece.getValue();
      this.$store.commit("updateLivePiece",
        this.pieceService.getAllMusicPieces()
          .filter((piece) => !currentLivePiece || piece.id !== currentLivePiece.id)[0]);
      this.log.info("Simulating live piece change to {}", this.$store.getters.livePiece.getValue()!.name);
    }
  }
</script>

<style scoped>
  .shrink {
    flex-shrink: 1;
    flex-wrap: nowrap;
    flex-flow: nowrap;
  }
  
  .hide-overflow {
    overflow: hidden;
    -ms-text-overflow: ellipsis;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
