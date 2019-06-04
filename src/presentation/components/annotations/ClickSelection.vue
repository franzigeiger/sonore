<template>
  <b-list-group flush>
    <b-list-group-item variant="dark" v-for="(svgNameMapping, index) in idsToPrintNames"
                       @click="$emit('annotationSetClick', svgNameMapping.svgElement)"
                       :key="svgNameMapping.xmlIdToPrintName.id" :class="'selection' + ((index % 8) +1) + '-btn'"
                       href="#">
      {{ svgNameMapping.xmlIdToPrintName.displayName }}
    </b-list-group-item>
  </b-list-group>
</template>

<script lang="ts">
  import {printMeiElements, XmlIdToPrintName} from "@/presentation/components/print-mei-elements";
  import {SelectionMode} from "@/common/data-definitions/selection-mode";
  import {ValidScoreDisplayData} from "@/presentation/components/score-display-data";
  import {Component, Prop, Vue} from "vue-property-decorator";
  
  @Component
  export default class ClickSelection extends Vue {
    @Prop() private scoreDisplayData!: ValidScoreDisplayData;
    @Prop() private chooseSvgElements!: SVGElement[];
    
    private idsToPrintNames: SvgNameMapping[] = [];
    
    private async getIdsToPrintNames(): Promise<SvgNameMapping[]> {
      const printNames = await printMeiElements(this.chooseSvgElements.map((e) => e.id),
        this.scoreDisplayData.musicPiece, this.scoreDisplayData.part);
      return this.chooseSvgElements.map((svgElement: SVGElement, index: number) => {
        return {svgElement, xmlIdToPrintName: printNames[index]} as SvgNameMapping;
      });
    }
    
    private get selectionMode(): SelectionMode {
      return this.$store.getters.selectionMode;
    }
    
    private async mounted() {
      this.idsToPrintNames = await this.getIdsToPrintNames();
    }
  }
  
  interface SvgNameMapping {
    svgElement: SVGElement;
    xmlIdToPrintName: XmlIdToPrintName;
  }
</script>

<style scoped>

</style>
