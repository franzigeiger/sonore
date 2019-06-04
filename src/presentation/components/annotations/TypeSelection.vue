<template>
  <div>
    <b-list-group flush>
      <b-list-group-item variant="dark" v-for="type of validTypes"
                         @click="$emit('annotationSetType', type)"
                         :key="type.displayName" href="#">
        {{ type.displayName }}
      </b-list-group-item>
    </b-list-group>
  </div>
</template>

<script lang="ts">
import {AnnotationType} from "@/common/data-definitions/annotations/type/annotation-type";
import {TYPES} from "@/inversify-types";
import {AnnotationService} from "@/services/annotation-service";
import {serviceContainer} from "@/services/service-container";
import {Component, Prop, Vue} from "vue-property-decorator";

@Component
export default class TypeSelection extends Vue {
  private annotationService: AnnotationService = serviceContainer.get<AnnotationService>(TYPES.AnnotationService);
  
  get validTypes(): AnnotationType[] {
    return this.annotationService.getValidAnnotationTypes();
  }
  
  
}
</script>

<style scoped>

</style>
