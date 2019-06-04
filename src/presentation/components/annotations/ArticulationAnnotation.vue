<template>
  <div class="articulation-selection d-flex flex-wrap p-2">
    <b-button v-for="a of articulationLabels" variant="light"
              @click="$emit('annotationSetArticulation', a)"
              :key="a" class="flex-fill m-1">
      <img :src="'svg/articulations/' + a + '.svg'" :alt="a"></img>
    </b-button>
  </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue} from "vue-property-decorator";
  import {ArticulationLabel} from "@/common/data-definitions/annotations/kind/articulation";
  
  @Component
  export default class ArticulationAnnotation extends Vue {
    private articulationLabels = ArticulationLabel;
    
  }
</script>

<style scoped>
  
  .articulation-selection img {
    height: 60px;
    margin: 0 -15px -10px;
  }
  
</style>
