<template>
  <div class="p-2">
    <b-row align-v="center">
      <b-col>
        <b-form-text>
          Neue Tonhöhe
        </b-form-text>
        <b-form-input class="note-input" type="text" :state="noteValid"
                      :value="noteOutput" disabled></b-form-input>
        <b-form-invalid-feedback>
          Note unverändert
        </b-form-invalid-feedback>
        <b-form-valid-feedback>
          ursprünglich: {{ orgNoteOutput }}
        </b-form-valid-feedback>
      </b-col>
      <b-col cols="auto" class="p-0">
        Ton
        <b-button-group vertical>
          <b-button @click="higher()" :disabled="!note.canChangeHigher()" variant="dark">
            <i class="fas fa-angle-up"></i>
          </b-button>
          <b-button @click="lower()" :disabled="!note.canChangeLower()" variant="dark">
            <i class="fas fa-angle-down"></i>
          </b-button>
        </b-button-group>
      </b-col>
      <b-col cols="auto">
        Okt.
        <b-button-group vertical>
          <b-button @click="higherOctave()" :disabled="!note.canChangeHigherOctave()" variant="dark">
            <i class="fas fa-angle-double-up"></i>
          </b-button>
          <b-button @click="lowerOctave()" :disabled="!note.canChangeLowerOctave()" variant="dark">
            <i class="fas fa-angle-double-down"></i>
          </b-button>
        </b-button-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-button @click="$emit('annotationChangeNote', note)" :disabled="!noteValid" variant="dark"
                  block class="mt-2">Speichern
        </b-button>
      </b-col>
    </b-row>
  </div>
</template>

<script lang="ts">
  import {ChangeNote} from "@/common/data-definitions/annotations/kind/change-note";
  import {PointPlace} from "@/common/data-definitions/annotations/place/point-place";
  import {PartAnnotation} from "@/common/data-definitions/annotations/type/part-annotation";
  import {PersonalAnnotation} from "@/common/data-definitions/annotations/type/personal-annotation";
  import {Note} from "@/common/data-definitions/note";
  import {Component, Prop, Vue} from "vue-property-decorator";
  
  @Component
  export default class NoteAnnotation extends Vue {
    @Prop() private noteAnnotation!: ChangeNote<PersonalAnnotation | PartAnnotation, PointPlace>;
    
    private noteOutput: string = "";
    private note: Note = new Note(this.noteAnnotation.originalNote.fraction, this.noteAnnotation.originalNote.id,
      this.noteAnnotation.originalNote.octave, this.noteAnnotation.originalNote.pitch,
      this.noteAnnotation.originalNote.accid);
    private orgNoteOutput: string = "";
    private noteValid: boolean = false;
    
    private mounted() {
      this.update();
    }
    
    private higher() {
      this.note!.changeHigher();
      this.update();
    }
    
    private lower() {
      this.note!.changeLower();
      this.update();
    }
    
    private higherOctave() {
      this.note!.changeHigherOctave();
      this.update();
    }
    
    private lowerOctave() {
      this.note!.changeLowerOctave();
      this.update();
    }
    
    
    private update() {
      this.noteOutput = this.note!.displayName;
      this.orgNoteOutput = this.noteAnnotation.originalNote.displayName;
      if (this.note !== undefined) {
        this.noteValid = this.noteAnnotation.originalNote.isDifferent(this.note);
      }
    }
  }
</script>

<style scoped>
  
  .note-input {
    width: 160px;
    font-size: 16pt;
    font-weight: bold;
  }
</style>
