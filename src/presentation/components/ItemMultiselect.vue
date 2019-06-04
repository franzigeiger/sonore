<template>
  <div id="item-selection" class="d-flex flex-row-reverse justify-content-around">
    <div class="item-selection-column flex-grow-1 d-flex flex-column">
      <p>Verfügbar</p>
      <b-list-group class="item-list">
        <b-list-group-item v-for="item in filtered()" :key="displayName(item)"
                           @click="select(item)">{{ displayName(item) }}
        </b-list-group-item>
      </b-list-group>
    </div>
    <div class="item-selection-column flex-grow-1 d-flex flex-column">
      <p>Ausgewählt</p>
      <b-list-group class="item-list">
        <b-list-group-item v-for="(item, index) in selected" :key="displayName(item)"
                           @click="deselect(index)">{{ displayName(item) }}
        </b-list-group-item>
      </b-list-group>
    </div>
  </div>
</template>

<script lang="ts">
  import {Register} from "@/common/data-definitions/register";
  import {Component, Prop, Vue} from "vue-property-decorator";
  import Scrollbar from "@/presentation/settings/scrollbar";
  
  @Component({
    components: {},
  })
  export default class ItemMultiselect<T> extends Vue {
    @Prop() private all!: T[];
    @Prop() private selected!: T[];
    @Prop() private displayName!: (obj: T) => string;
    
    private scrollOps = Scrollbar.scrollOps;
    
    private filtered(): T[] {
      if (this.all.length === 0 ||  this.all[0] instanceof Register) {
        return this.all.filter(
          (item: any) => !this.selected.find((selecteItem: any) => selecteItem.guid === item.guid));
      } else {
        return this.all.filter(
          (item: any) => !this.selected.find((selecteItem: any) => selecteItem.name === item.name));
      }
    }
    
    private select(item: T): void {
      this.selected.push(item);
      this.$emit("updated", this.selected);
    }
    
    private deselect(index: number): void {
      this.selected.splice(index, 1);
      this.$emit("updated", this.selected);
    }
  }
</script>

<style scoped>
  p {
    text-align: center;
    margin-bottom: 5px;
  }
  
  .flex-scroll {
  }
  
  .item-list {
    padding: 5px;
    flex-grow: 1;
    background-color: #eeeeee;
    border-radius: 3px;
    margin: 2px;
  }
  
  .list-group-item {
    margin: 2px 0;
    padding: 5px 10px;
    border-radius: 0.25rem;
  }
  
  #item-selection {
    padding: 13px 3px 3px 3px;
  }
  
  .item-selection-column {
    margin-right: 10px;
  }
</style>
