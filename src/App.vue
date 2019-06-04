<template>
  <div id="app" class="fillscreen">
    <spinner v-if="!loaded" sizeClass="fullscreen"></spinner>
    <router-view v-else/>
  </div>
</template>

<script lang="ts">
  import {MusicPiece} from "@/common/data-definitions/music-piece";
  import {User} from "@/common/data-definitions/user";
  import {Logger} from "@/common/logging";
  import {RegisterStore} from "@/data/register-store";
  import {UserStore} from "@/data/user-store";
  import {UserService} from "@/services/user-service";
  import {Toaster} from "@/toaster";
  import {Component, Vue} from "vue-property-decorator";
  import {Connection} from "./common/connection/connection";
  import store from "./common/state/store";
  import Spinner from "./presentation/components/Spinner.vue";
  import {RenderingService} from "@/services/rendering-service";
  import {serviceContainer} from "@/services/service-container";
  import {TYPES} from "@/inversify-types";

  // this allows to display the "change live piece" button
  // enter `window.debug = true` in the browser console
  (window as any).debug = false;
  
  @Component({
    components: {
      Spinner,
    },
  })
  export default class App extends Vue {
    private loaded: boolean = false;
    private userStoreLoaded: boolean = false;
    private registerStoreLoaded: boolean = false;
    private triedLoginUser: boolean = false;
    private log = Logger.getNew("app");
    private userService?: UserService;
    
    private mounted() {
      // timeout to make sure Vue triggers a re-render to show spinner
      setTimeout(() => {
        this.initServices();
        this.log.info("All Services loaded. Sonore is Ready!");
      }, 100);
      
      this.$store.getters.livePiece.subscribe((piece: MusicPiece) => {
        if (piece && !this.$store.getters.orchestraMode) {
          Toaster.pieceChanged(piece);
        }
      });
    }
    
    private initServices() {
      const connection = serviceContainer.get<Connection>(TYPES.Connection);
      serviceContainer.get<RenderingService>(TYPES.RenderingService);
      const userStore = serviceContainer.get<UserStore>(TYPES.UserStore);
      userStore.onInitialized(this.setUserStoreLoadedTrue);
      const registerStore = serviceContainer.get<RegisterStore>(TYPES.RegisterStore);
      registerStore.onInitialized(this.setRegisterStoreLoadedTrue);
  
      // initialize stores and start synchronization
      serviceContainer.get(TYPES.ExampleStore);
      serviceContainer.get(TYPES.UserStore);
      serviceContainer.get(TYPES.MusicPieceStore);
      serviceContainer.get(TYPES.PartStore);
      serviceContainer.get(TYPES.RegisterStore);
  
      connection.onLoadFinished();
      this.log.info("Synchronization triggered");
      connection.registerReceiver("LIVE", (content) => {
        store.commit("setLiveStateFromRemote", content);
      });
      connection.registerReceiver("POINT-HIGHLIGHT", (content) => {
        store.commit("setPointHighlight", content);
      });
      
      this.userService = serviceContainer.get<UserService>(TYPES.UserService);
      if (!this.triedLoginUser && this.userStoreLoaded && this.registerStoreLoaded) {
        this.userService.getUserFromBrowser(this.savedUserNotFound, this.handleSavedUser);
      }
    }
  
    private setUserStoreLoadedTrue() {
      this.userStoreLoaded = true;
      if (this.userStoreLoaded && this.registerStoreLoaded && this.userService !== undefined) {
        this.triedLoginUser = true;
        this.userService.getUserFromBrowser(this.savedUserNotFound, this.handleSavedUser);
        this.loaded = true;
      }
    }
    
    private setRegisterStoreLoadedTrue() {
      this.registerStoreLoaded = true;
      if (this.userStoreLoaded && this.registerStoreLoaded && this.userService !== undefined) {
        this.triedLoginUser = true;
        this.userService.getUserFromBrowser(this.savedUserNotFound, this.handleSavedUser);
        this.loaded = true;
      }
    }
  
    private savedUserNotFound(savedUserName: string): void {
      Toaster.startupRestoreUserFailed(savedUserName);
      this.$router.push("/");
    }
    
    private handleSavedUser(savedUser: User | undefined) {
      if (savedUser === undefined || !this.userService) {
        // always go back to login screen
        this.log.info("No User was logged in - Go to login screen");
        this.$router.push("/");
      } else {
        // success - use user which is already logged in
        this.userService.setCurrentUser(savedUser);
        Toaster.startupRestoredUser(savedUser.name);
        // if route is login then go to piecelist
        if (this.$route.path === "/") {
          this.$router.push("/piecelist");
        }
      }
    }
  }
</script>

<style lang="less">
  html, body, .fillscreen {
    width: 100%;
    height: 100%;
    margin: 0;
    overflow: hidden;
  }
  
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
  }
</style>
