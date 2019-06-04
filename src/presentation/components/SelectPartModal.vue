<template>
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">
          
          <div class="modal-header py-3">
            <h3>Bitte Stimme für das Stück {{ piece.name }} auswählen</h3>
          </div>
          
          <div class="modal-body py-3">
            <vue-scroll :ops="scrollOps">
              <b-list-group>
                <b-list-group-item v-for="part in availableParts"
                                   :key="part.name"
                                   :active="part === selectedPart"
                                   @click="setSelectedPart(part)"
                                   class="m-1 p-1">{{ part.name }}
                </b-list-group-item>
              </b-list-group>
            </vue-scroll>
          </div>
          
          <div class="modal-footer">
            <b-button class="mt-1" variant="primary" block @click="assignPartToUser()" :disabled="!selectedPart">
              OK
            </b-button>
          </div>
        
        </div>
      </div>
    </div>
  </transition>
</template>
<script lang="ts">
  import {MusicPiece} from "@/common/data-definitions/music-piece";
  import {Part} from "@/common/data-definitions/part";
  import {Logger} from "@/common/logging";
  import Scrollbar from "@/presentation/settings/scrollbar";
  import {Component, Prop, Vue} from "vue-property-decorator";
  
  @Component
  export default class SelectPartModal extends Vue {
    private log = Logger.getNew(SelectPartModal.name);
    
    @Prop()
    private availableParts!: Part[];
    @Prop()
    private piece!: MusicPiece;
    private scrollOps = Scrollbar.scrollOps;
    
    private selectedPart: Part | null = null;
    
    private mounted() {
      this.selectedPart = this.$store.getters.currentUser.parts.get(this.piece.id);
    }
    
    private isSelectedPart(part: Part) {
      return this.selectedPart && this.selectedPart.name === part.name;
    }
    
    private setSelectedPart(part: Part) {
      this.selectedPart = part;
    }
    
    private assignPartToUser() {
      this.$emit("part-selected", this.selectedPart);
    }
  }
</script>
<style>
  
  .modal-body {
    height: 50vh;
  }
  
  .modal-mask {
    position: fixed;
    z-index: 9998;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, .5);
    display: table;
    transition: opacity .3s ease;
  }
  
  .modal-wrapper {
    display: table-cell;
    vertical-align: middle;
  }
  
  .modal-container {
    max-height: 90vh;
    vertical-align: center;
    width: 300px;
    margin: 0 auto;
    padding: 20px 30px;
    background-color: #fff;
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
    transition: all .3s ease;
    font-family: Helvetica, Arial, sans-serif;
  }
  
  .modal-header h3 {
    margin-top: 0;
    color: #42b983;
    height: 20vh;
  }
  
  .modal-footer {
    margin: 20px 0;
    height: 10vh;
  }
  
  .modal-default-button {
    float: right;
  }
  
  /*
   * The following styles are auto-applied to elements with
   * transition="modal" when their visibility is toggled
   * by Vue.js.
   *
   * You can easily play with the modal transition by editing
   * these styles.
   */
  
  .modal-enter {
    opacity: 0;
  }
  
  .modal-leave-active {
    opacity: 0;
  }
  
  .modal-enter .modal-container,
  .modal-leave-active .modal-container {
    -webkit-transform: scale(1.1);
    transform: scale(1.1);
  }
</style>
