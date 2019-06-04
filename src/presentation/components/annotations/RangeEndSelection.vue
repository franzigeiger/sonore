<template>
  <b-list-group flush>
    <b-list-group-item variant="dark" @click="$emit('selectEndStart')" href="#">
      Auswählen beginnen...
    </b-list-group-item>
  </b-list-group>
</template>

<script lang="ts">
  import {Component, Prop, Vue} from "vue-property-decorator";
  
  @Component
  export default class RangeSelection extends Vue {
  
  
  }
</script>

<style scoped>


</style>
