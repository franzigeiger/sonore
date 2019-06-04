<template>
  <div class="fillscreen">
    <navbar @navbar-search-update="searchString = $event"
            :displayMode="navbarMode"
            centerText="Repertoire"></navbar>
    <div id="piecelist">
      <vue-scroll :ops="scrollOps">
        <b-table :filter="searchString" hover :items="pieceList" :fields="visibleFields" class="m-0">
          <template slot="tags" slot-scope="data">
            <span v-for="tag in data.item.tags" class="badge badge-pill badge-secondary">{{ tag }}</span>
          </template>
          <template slot="show_details" slot-scope="row">
            <b-button @click="showChosenMusicPiece(row.item)">Anzeigen</b-button>
          </template>
        </b-table>
      </vue-scroll>
    </div>
  </div>
</template>
<script lang="ts">
  import {MusicPiece} from "@/common/data-definitions/music-piece";
  import {Logger} from "@/common/logging";
  import {TYPES} from "@/inversify-types";
  import router from "@/router";
  import {MusicPieceService} from "@/services/music-piece-service";
  import {serviceContainer} from "@/services/service-container";
  import {UserService} from "@/services/user-service";
  import {Component, Vue} from "vue-property-decorator";
  import Navbar from "../components/Navbar.vue";
  import Scrollbar from "../settings/scrollbar";
  import {NavbarMode, pieceListNavbarMode} from "@/presentation/components/navbar-modes";
  
  // noinspection JSUnusedGlobalSymbols
  @Component({
    components: {Navbar},
  })
  export default class PieceList extends Vue {
    private navbarMode: NavbarMode = pieceListNavbarMode;
    private musicPieceService: MusicPieceService = serviceContainer.get<MusicPieceService>(TYPES.MusicPieceService);
    private pieceList = this.musicPieceService.getAllMusicPieces();
    private scrollOps = Scrollbar.scrollOps;
    private searchString: string = "";
    private visibleFields = {
      id: {label: "#", sortable: true},
      name: {label: "Titel", sortable: true},
      composer: {label: "Komponist", sortable: true},
      show_details: {label: ""},
    };
    private userService = serviceContainer.get<UserService>(TYPES.UserService);
    
    private showChosenMusicPiece(piece: MusicPiece) {
      const user = this.userService.getCurrentUser();
      if (this.$store.getters.orchestraMode && user && user.isDirigent) {
        // set live piece
        this.$store.commit("updateLivePiece", piece);
      } else {
        this.$store.commit("disableOrchestraMode");
      }
      this.$store.commit("setLocalMusicPiece", piece);
      this.$router.push("/scoreview");
    }
  }
</script>
<style>
  #piecelist {
    height: calc(100% - 56px);
    width: 100vw;
  }
</style>
