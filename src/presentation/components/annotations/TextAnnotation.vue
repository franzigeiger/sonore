<template>
  <b-form class="p-2">
    <b-form-input ref="textInput" :value="annotationText"
                  type="text" :state="valid()" @keyup="annotationText = $event.target.value"
                  placeholder="Notiztext eingeben..."></b-form-input>
    <b-button variant="dark" @click="onSubmit()" class="mt-2" block
              :disabled="!valid">Bestätigen
    </b-button>
  </b-form>
</template>

<script lang="ts">
  import {Component, Prop, Vue} from "vue-property-decorator";
  
  @Component
  export default class TextAnnotation extends Vue {
    public $refs!: {
      textInput: HTMLInputElement,
    };
    
    private annotationText: string = "";
    
    private async mounted() {
      await this.$nextTick();
      this.$refs.textInput.focus();
    }
    
    private valid(): boolean {
      return this.annotationText.length > 0;
    }
    
    private onSubmit() {
      this.$emit("annotationSetText", this.annotationText);
    }
  }
</script>

<style scoped>

</style>
