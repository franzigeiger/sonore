<template>
  <b-button id="button" @click="$emit('click')" :disabled="disabled">
    <i :class="'fas ' + icon"></i>
  </b-button>
</template>

<script lang="ts">
  import {Component, Prop, Vue} from "vue-property-decorator";
  
  @Component({
    components: {},
  })
  export default class FloatingButton extends Vue {
    @Prop() private icon!: string;
    @Prop({default: false}) private disabled!: boolean;
  }
</script>

<style scoped>
  #button {
    position: fixed;
    
    right: 50px;
    bottom: 50px;
    
    width: 80px;
    height: 80px;
    
    border-radius: 40px;
    
    padding: 0;
    font-size: 40pt;
  }
</style>
