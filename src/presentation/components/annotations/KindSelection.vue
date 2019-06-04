<template>
  <b-list-group flush>
    <b-list-group-item variant="dark" v-for="kind in validKinds"
                       @click="$emit('annotationSetKind', kind)"
                       :key="kind.displayName" href="#">
      {{ kind.displayName }}
    </b-list-group-item>
    <b-list-group-item variant="dark">
      <b-button v-if="showPointLive" @click="$emit('pointLive')" variant="primary" block>
        <i class="fab fa-slideshare"></i> Hinweisen
      </b-button>
    </b-list-group-item>
  </b-list-group>
</template>

<script lang="ts">
  
  import {AnnotationKind} from "@/common/data-definitions/annotations/kind/annotation-kinds";
  import {TYPES} from "@/inversify-types";
  import {AnnotationService} from "@/services/annotation-service";
  import {serviceContainer} from "@/services/service-container";
  import {Component, Prop, Vue} from "vue-property-decorator";
  
  @Component
  export default class KindSelection extends Vue {
    private annotationService: AnnotationService = serviceContainer.get<AnnotationService>(TYPES.AnnotationService);
    private showPointLive: boolean = this.annotationService.isAllowedToPointLive();
    
    get validKinds(): AnnotationKind[] {
      return this.annotationService.getValidAnnotationKinds();
    }
    
  }
</script>

<style scoped>

</style>
