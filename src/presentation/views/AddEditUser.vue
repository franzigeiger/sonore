<template>
  <div class="container" id="add-edit-user">
    <div class="top py-3">
      <label class="h4 font-weight-normal">Bitte Nutzernamen eingeben:</label>
      <b-form-input type="text" :state="nameAccepted()" :value="name"
                    @keyup="name = $event.target.value" placeholder="Nutzername"></b-form-input>
      <label class="h4 font-weight-normal py-3">Bitte Instrumente auswählen:</label>
    </div>
    <vue-scroll :ops="scrollOps">
      <b-list-group>
        <b-list-group-item v-for="instrument in instrumentList" :key="instrument.midiNumber"
                           :active="isSelected(instrument)"
                           @click="flipInstrumentSelection(instrument)" class="m-1 p-1">{{ instrument.name }}
        </b-list-group-item>
      </b-list-group>
    </vue-scroll>
    <div class="bottom py-3">
      <b-form-checkbox v-model="isDirigent" class="h4 font-weight-normal">Dirigent</b-form-checkbox>
      <b-button variant="primary" :disabled="!isSavePossible()" block @click="save()">Nutzer erstellen</b-button>
    </div>
  </div>
</template>
<script lang="ts">
  import router from "@/router";
  import {serviceContainer} from "@/services/service-container";
  import {Toaster} from "@/toaster";
  import {Component, Vue} from "vue-property-decorator";
  import {Instrument} from "@/common/data-definitions/instrument";
  import {InstrumentService} from "@/services/instrument-service";
  import {TYPES} from "@/inversify-types";
  import Scrollbar from "@/presentation/settings/scrollbar";
  import {UserService} from "@/services/user-service";
  import {User} from "@/common/data-definitions/user";
  
  
  @Component
  export default class AddEditUser extends Vue {
    private instrumentService: InstrumentService = serviceContainer.get<InstrumentService>(TYPES.InstrumentService);
    private instrumentList: Instrument[] = this.instrumentService.getAllInstruments();
    private selectedInstruments: Instrument[] = [];
    
    private userService: UserService = serviceContainer.get<UserService>(TYPES.UserService);
    private name: string = "";
    private isDirigent: boolean = false;
    
    private scrollOps = Scrollbar.scrollOps;
    
    private flipInstrumentSelection(instrument: Instrument) {
      if (this.selectedInstruments.includes(instrument)) {
        this.selectedInstruments.splice(this.selectedInstruments.indexOf(instrument), 1);
      } else {
        this.selectedInstruments.push(instrument);
      }
    }
    
    private isSelected(instrument: Instrument) {
      return this.selectedInstruments.includes(instrument);
    }
    
    private nameAccepted(): boolean {
      return this.userService.nameStillFree(this.name) && this.name !== "";
    }
    
    private isSavePossible(): boolean {
      return this.name !== "" && (this.isDirigent || this.selectedInstruments.length > 0);
    }
    
    private save() {
      const user: User = new User(this.selectedInstruments, this.isDirigent, this.name);
      this.userService.addUser(user);
      this.$store.commit("setCurrentUser", user);
      Toaster.addUserSaveComplete(user.name);
      this.$router.push("/piecelist");
    }
  }
</script>
<style>
  #add-edit-user {
    margin: auto;
    text-align: center;
    max-width: 500px;
    height: calc(100vh - 325px);
  }

  .top {
    height: 175px;
  }

  .bottom {
    height: 150px;
  }
</style>
