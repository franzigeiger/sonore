import {Label} from "@/common/data-definitions/annotations/label/label";
import {PlaceKinds} from "@/common/data-definitions/annotations/place/place";

export class DynamicLabel extends Label {
  constructor(label: string, placeKind: PlaceKinds) {
    super(label, placeKind);
  }
}

export const dynamicLabels: DynamicLabel[] = [
  new DynamicLabel("ppp", PlaceKinds.pointPlace),
  new DynamicLabel("pp", PlaceKinds.pointPlace),
  new DynamicLabel("p", PlaceKinds.pointPlace),
  new DynamicLabel("mp", PlaceKinds.pointPlace),
  new DynamicLabel("mf", PlaceKinds.pointPlace),
  new DynamicLabel("f", PlaceKinds.pointPlace),
  new DynamicLabel("ff", PlaceKinds.pointPlace),
  new DynamicLabel("fff", PlaceKinds.pointPlace),
  new DynamicLabel("fp", PlaceKinds.pointPlace),
  new DynamicLabel("cresc", PlaceKinds.rangePlace),
  new DynamicLabel("decresc", PlaceKinds.rangePlace),
];
