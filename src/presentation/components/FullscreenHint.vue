<template>
  <div class="page-wrap d-flex flex-row align-items-center">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-12 text-center">
          <span class="display-1 d-block"><i :class="hintIcon"></i></span>
          <div class="mb-4 lead">{{ hintText }}</div>
          <b-button v-if="btnAction" @click="btnAction">{{ actionText }}</b-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
  
  import {Component, Prop, Vue} from "vue-property-decorator";
  
  @Component({
    components: {},
  })
  export default class FullscreenHint extends Vue {
    @Prop() private hintIcon!: string;
    @Prop() private hintText!: string;
    @Prop() private btnAction!: () => void;
    @Prop() private actionText!: string;
  }

</script>

<style scoped>
  .page-wrap {
    margin-top: 30vh;
  }
</style>
