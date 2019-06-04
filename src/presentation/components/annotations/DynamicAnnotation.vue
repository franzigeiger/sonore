<template>
  <div class="dynamic-selection d-flex flex-wrap p-2">
    <b-button v-for="d of dynamicLabels" variant="light"
              @click="$emit('annotationSetDynamic', d)"
              :key="d.label" class="flex-fill m-1">
      <img :src="'svg/dynamics/' + d.label + '.svg'" :alt="d.label" />
    </b-button>
  </div>
</template>

<script lang="ts">
  import {DynamicLabel, dynamicLabels} from "@/common/data-definitions/annotations/label/dynamic-labels";
  import {Component, Prop, Vue} from "vue-property-decorator";
  
  @Component
  export default class DynamicAnnotation extends Vue {
    private dynamicLabels: DynamicLabel[] = dynamicLabels;
  }
</script>

<style scoped>
  .dynamic-selection img {
    height: 20px;
  }
  
</style>
