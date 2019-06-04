<template>
  <transition name="login-transition"
              enter-active-class="animated zoomIn">
    <div class="container" id="login">
      <div class="top py-3">
        <img class="mb-3 logo" src="svg/clef.svg" alt="">
        <h1 class="h4 font-weight-normal">Bitte Benutzer auswählen</h1>
      </div>
      <vue-scroll :ops="scrollOps">
        <b-list-group>
          <b-list-group-item v-for="user in userList" :key="user.id" :active="isSelectedUser(user)"
                             @click="setSelectedUser(user)" class="m-1 p-1">{{ user.name }}
          </b-list-group-item>
        </b-list-group>
      </vue-scroll>
      <div class="bottom checkbox py-3">
        <!--<b-form-checkbox v-model="rememberUser" class="h4 font-weight-normal">Nutzer speichern</b-form-checkbox>-->
        <b-button variant="primary" block :disabled="!isLoginPossible()" @click="login()">Einloggen</b-button>
        <b-button class="mt-1" variant="secondary" block to="/user" id="registerButton">Neuen Account erstellen
        </b-button>
        <p class="mt-4 text-muted">&copy; 2018</p>
      </div>
    </div>
  </transition>
</template>
<script lang="ts">
  import {User} from "@/common/data-definitions/user";
  import {Logger} from "@/common/logging";
  import {TYPES} from "@/inversify-types";
  import {serviceContainer} from "@/services/service-container";
  import {UserService} from "@/services/user-service";
  import {Toaster} from "@/toaster";
  import {Component, Vue, Watch} from "vue-property-decorator";
  import Scrollbar from "../settings/scrollbar";
  
  
  
  @Component
  export default class Login extends Vue {
    private log = Logger.getNew("Login View");
    private userService: UserService = serviceContainer.get<UserService>(TYPES.UserService);
    private userList = this.userService.getAllUsers();
    private selectedUser: User | null = null;
    private rememberUser: boolean = true;
    private scrollOps = Scrollbar.scrollOps;
    
    private isLoginPossible(): boolean {
      return this.selectedUser !== null;
    }
  
    private setSelectedUser(user: User) {
      this.selectedUser = user;
    }
  
    private isSelectedUser(user: User): boolean {
      if (this.selectedUser !== null) {
        return this.selectedUser.guid === user.guid;
      }
      return false;
    }
    
    private login() {
      /* User Values:
      this.selectedUserId +
      this.rememberUser +
      */
      if (this.selectedUser !== null) {
        this.userService.setCurrentUser(this.selectedUser);
        Toaster.loginSetCurrentUser(this.selectedUser.name);
        this.$router.push("/piecelist");
      } else {
        // should never happen, since the ui blocks it
      }
    }
  
    private registerUser() {
      this.$router.push("/user");
    }
  
    private reload() {
      this.userList = this.userService.getAllUsers();
    }
    
    private mounted() {
      this.userService.registerUserChangedCallback(this.reload);
      document.addEventListener("backbutton", this.onBackKeyDown, false);
    }
    
    private beforeDestroy() {
      this.userService.unregisterUserChangedCallback();
      document.removeEventListener("backbutton", this.onBackKeyDown);
    }
    
    private onBackKeyDown() {
      if ("app" in navigator && (navigator as any).app) {
        (navigator as any).app.exitApp();
      } else if ("device" in navigator && (navigator as any).device) {
        (navigator as any).device.exitApp();
      } else {
        window.close();
      }
    }
  }
</script>
<style>
  #login {
    margin: auto;
    text-align: center;
    max-width: 500px;
    height: calc(100vh - 375px);
  }
  
  .top {
    height: 175px;
  }
  
  .logo {
    width: 100px;
    height: 100px;
  }
  
  .bottom {
    height: 200px;
  }
</style>
