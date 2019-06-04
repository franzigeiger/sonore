<template>
  <div class="spinner">
    <img src="../../../public/svg/clef.svg" class="animated infinite pulse" alt="Laden...">
  </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue} from "vue-property-decorator";
  
  @Component
  export default class Spinner extends Vue {
    @Prop() private sizeClass!: string;
  }
</script>

<style scoped>
  .spinner {
    width: 100%;
    height: 100%;
    text-align: center;
  }
  
  .spinner > img {
    position: relative;
    width: 100%;
    height: 50%;
    top: 25%;
  }

</style>
