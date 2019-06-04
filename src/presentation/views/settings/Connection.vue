<!--suppress JSAnnotator -->
<template>
  <div>
    <Navbar centerText="Verbindungen"
            @navbar-search-update="searchString = $event"
            :displayMode="navbarMode"
            backTarget="/piecelist"></Navbar>
    <div class="p-3">
      <div class="py-3">
        <b-button size="lg" variant="primary" v-on:click="restart">Neustarten</b-button>
      </div>
      <div class="py-3">
        <h3>Verbindungen</h3>
        <b-button id="button" class="mb-3" v-on:click="reload">
          <i class="fas fa-sync-alt"></i>
        </b-button>
        <b-table striped hover :items="connectionList" :fields="fields"></b-table>
      </div>
      <div class="py-3">
        <h3>Test Text senden</h3>
        <input v-model="inputText" class="form-control" placeholder="Text einfügen">
        <div>
          <b-button v-on:click="addText">Text zur Datei hinzufügen</b-button>
          <b-button class="m-3" v-on:click="sendChange">Inhalte teilen</b-button>
        </div>
        <b-list-group>
          <b-list-group-item v-for="item of exampleStore.doc.texts" :key="item" class="m-1 p-1">
            {{item}}
          </b-list-group-item>
        </b-list-group>
      </div>
    </div>
  </div>
</template>


<script lang="ts">
import {NavbarMode, settingsNavbarMode} from "@/presentation/components/navbar-modes";
import Navbar from "@/presentation/components/Navbar.vue";
import {serviceContainer} from "@/services/service-container";
import {Component, Vue} from "vue-property-decorator";
import {Connection} from "../../../common/connection/connection";
import {ExampleStore} from "../../../data/example-store";
import {TYPES} from "../../../inversify-types";

@Component({
  components: {
    Navbar,
  },
})
export default class ConnectionView extends Vue {
  private navbarMode: NavbarMode = settingsNavbarMode;
  private connection: Connection = serviceContainer.get <Connection>(TYPES.Connection);
  private exampleStore: ExampleStore = serviceContainer.get <ExampleStore>(TYPES.ExampleStore);
  private connectionList = [];
  private fields = [
    {key: "key", label: "Device Name"},
    {key: "connection", label: "Richtung"},
    {key: "username", label: "Benutzername"},
    {key: "instruments", label: "Instrumente"},
  ];
  private inputText: string = "";
  
  public restart() {
    this.connection.stopServer();
    this.connection.startServer();
  }
  
  public reload() {
    this.connectionList = this.loadList();
  }
  
  public addText() {
    this.exampleStore.addContent(this.inputText);
    this.inputText = "";
  }
  
  public sendChange() {
   // this.exampleStore.broadcastChange();
  }
  
  public loadList() {
    if (this.connection.connected.size === 0) {
      return [{key: "Keine Verbindung vorhanden", value: Date.now()}];
    }
    const list: any = [];
    this.connection.connected.forEach((value, key) => {
      if (value.user != null) {
        list.push({
          key,
          connection: value.connectionType,
          username: value.user.name,
          instruments: value.user.instruments.map((entry) => entry.name).join(" ,"),
        });
      } else {
        list.push({key, connection: value.connectionType});
      }
      
    });
    return list;
  }
  
  public created() {
    this.connectionList = this.loadList();
  }
  
}
</script>

<style scoped>
</style>
