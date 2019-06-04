<template>
  <b-list-group flush>
    <b-list-group-item variant="dark" v-for="pk in placeKinds" @click="$emit('annotationSetPlace', pk)"
                       :key="pk" href="#">
      {{ getRangeModes(pk) }}
    </b-list-group-item>
  </b-list-group>
</template>

<script lang="ts">
  import {Place, PlaceKinds} from "@/common/data-definitions/annotations/place/place";
  import {PointPlace} from "@/common/data-definitions/annotations/place/point-place";
  import {RangePlace} from "@/common/data-definitions/annotations/place/range-place";
  import {Component, Prop, Vue} from "vue-property-decorator";
  
  @Component
  export default class RangeSelection extends Vue {
    @Prop() public place!: Place;
    private placeKinds = PlaceKinds;
    
    private getRangeModes(pk: PlaceKinds): string {
      if (pk === PlaceKinds.rangePlace) {
        return "\"Bereich bis\" auswählen";
      } else if (pk === PlaceKinds.pointPlace) {
        return "Ausgewählte Stelle";
      } else {
        return "invalid";
      }
    }
    
  }
</script>

<style scoped>


</style>
