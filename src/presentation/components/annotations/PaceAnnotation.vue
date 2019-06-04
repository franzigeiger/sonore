<template>
  <div class="d-flex flex-wrap p-2">
    <b-button v-for="p of paceLabels" variant="light"
              @click="$emit('annotationSetPace', p)"
              :key="p.label" class="flex-fill m-1 music-font">
      {{ p.label }}
    </b-button>
  </div>
</template>

<script lang="ts">
  import {PaceLabel, paceLabels} from "@/common/data-definitions/annotations/label/pace-labels";
  import {Component, Prop, Vue} from "vue-property-decorator";
  
  @Component
  export default class PaceAnnotation extends Vue {
    private paceLabels: PaceLabel[] = paceLabels;
    
  }
</script>

<style scoped>
  
  .music-font {
    font-family: "Times New Roman", Times, serif;
  }
  
</style>
