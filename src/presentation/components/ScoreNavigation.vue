<template>
  <b-navbar-nav v-if="pageCount === 0">
    <b-nav-item>
      <b-spinner small type="grow"/>
      Lade Menü...
    </b-nav-item>
  </b-navbar-nav>
  <b-navbar-nav v-else>
    <b-nav-item-dropdown text="">
      <template slot="button-content" v-if="viewMode === 'single'">
        <i class="fas fa-file-alt fa-fw"></i> Seite
      </template>
      <template slot="button-content" v-if="viewMode === 'half'">
        <i class="fas fa-clone fa-fw"></i> Halb
      </template>
      <b-dropdown-item @click="viewMode = 'single'" v-bind:class="{ active: viewMode === 'single' }">
        <i class="fas fa-file-alt fa-fw"></i> Seite
      </b-dropdown-item>
      <b-dropdown-item @click="viewMode = 'half'" v-bind:class="{ active: viewMode === 'half' }">
        <i class="fas fa-clone fa-fw"></i> Halb
      </b-dropdown-item>
    </b-nav-item-dropdown>
    
    <b-nav-item-dropdown>
      <template slot="button-content">
        <i :class="'fas fa-fw fa-' + selectionMode.icon"></i> {{ selectionMode.displayName }}
      </template>
      <b-dropdown-item v-for="sm of selectionModes" :key="sm.displayName"
                       @click="selectionMode = sm" v-bind:class="{ active: selectionMode === sm }">
        <i :class="'fas fa-fw fa-' + sm.icon"></i> {{ sm.displayName }}
      </b-dropdown-item>
    </b-nav-item-dropdown>
    <b-nav-item-dropdown>
      <template slot="button-content">
        <i class="fas fa-list-ol fa-fw"></i> {{ pageIndex + 1 }}/{{ pageCount }}
      </template>
      <b-dropdown-item v-for="i in pageCount" :key="i - 1"
                       @click="pageIndex = i - 1" v-bind:class="{ active: i - 1 === pageIndex }">
        {{ i }}
      </b-dropdown-item>
    </b-nav-item-dropdown>
  </b-navbar-nav>


</template>

<script lang="ts">
  import {SelectionMode, selectionModes} from "@/common/data-definitions/selection-mode";
  import {Component, Vue} from "vue-property-decorator";
  
  @Component
  export default class ScoreNavigation extends Vue {
    
    private selectionModes: SelectionMode[] = selectionModes;
    
    get selectionMode(): SelectionMode {
      return this.$store.getters.selectionMode;
    }
    
    set selectionMode(selectionMode: SelectionMode) {
      this.$store.commit("setSelectionMode", selectionMode);
    }
    
    get viewMode(): "single" | "half" {
      return this.$store.getters.viewMode;
    }
    
    set viewMode(mode: "single" | "half") {
      this.$store.commit("setViewMode", mode);
    }
    
    get pageIndex(): number { // zero-based
      return this.$store.getters.pageIndex;
    }
    
    set pageIndex(pageIndex: number) {
      this.$store.commit("setPageIndex", pageIndex);
    }
    
    get pageCount(): "single" | "half" {
      return this.$store.getters.pageCount;
    }
    
    
  }
</script>

<style scoped>

</style>
