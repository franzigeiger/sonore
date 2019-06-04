<template>
  <div class="d-flex flex-wrap p-2">
    <b-button v-for="c of highlightColors" variant="dark"
              @click="$emit('annotationSetHighlight', c)"
              :key="c" class="flex-fill m-1" :class="c">
      {{ c }}
    </b-button>
  </div>
</template>

<script lang="ts">
  import {HighlightColor} from "@/common/data-definitions/annotations/kind/highlight";
  import {Component, Prop, Vue} from "vue-property-decorator";
  
  @Component
  export default class DynamicAnnotation extends Vue {
    private highlightColors = HighlightColor;
    
  }
</script>

<style scoped>
  
  .orange {
    background-color: orange;
  }
  
  .green {
    background-color: green;
  }
  
  .blue {
    background-color: blue;
  }
  
  .purple {
    background-color: purple;
  }
  
  .red {
    background-color: red;
  }

</style>
