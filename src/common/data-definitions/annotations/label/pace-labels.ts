import {Label} from "@/common/data-definitions/annotations/label/label";
import {PlaceKinds} from "@/common/data-definitions/annotations/place/place";

export class PaceLabel extends Label {
  constructor(label: string, placeKind: PlaceKinds) {
    super(label, placeKind);
  }
}


export const paceLabels: PaceLabel[] = [
  new PaceLabel("largo", PlaceKinds.pointPlace),
  new PaceLabel("adagio", PlaceKinds.pointPlace),
  new PaceLabel("andante", PlaceKinds.pointPlace),
  new PaceLabel("moderato", PlaceKinds.pointPlace),
  new PaceLabel("allegro", PlaceKinds.pointPlace),
  new PaceLabel("presto", PlaceKinds.pointPlace),
  new PaceLabel("ritardando", PlaceKinds.rangePlace),
  new PaceLabel("accelerando", PlaceKinds.rangePlace),
];
