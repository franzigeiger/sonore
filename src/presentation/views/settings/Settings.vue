<template>
  <div>
    <Navbar centerText="Einstellungen"
            @navbar-search-update="searchString = $event"
            :displayMode="navbarMode"
            backTarget="/piecelist"></Navbar>
    
    <b-list-group id="settings-item-list">
      <b-list-group-item v-for="page in filteredPages()" :key="page.to" :to="page.to">
        {{ page.name }}
      </b-list-group-item>
    </b-list-group>
  </div>
</template>

<script lang="ts">
  import {NavbarMode, settingsNavbarMode} from "@/presentation/components/navbar-modes";
  import {Component, Vue} from "vue-property-decorator";
  import Navbar from "@/presentation/components/Navbar.vue";
  
  @Component({
    components: {
      Navbar,
    },
  })
  export default class Settings extends Vue {
    private navbarMode: NavbarMode = settingsNavbarMode;
    private searchString: string = "";
    private settingsPages = [
      {
        name: "Registerverwaltung",
        to: "/settings/register",
      },
    ];
    
    private filteredPages() {
      return this.settingsPages.filter((page) => {
        return page.name.toLocaleLowerCase().includes(this.searchString.toLocaleLowerCase());
      });
    }
  }
</script>

<style scoped>

</style>
