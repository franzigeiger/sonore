import {PlaceKinds} from "@/common/data-definitions/annotations/place/place";


export abstract class Label {
  public label: string;
  public placeKind: PlaceKinds;
  
  protected constructor(label: string, placeKind: PlaceKinds) {
    this.label = label;
    this.placeKind = placeKind;
  }
}
