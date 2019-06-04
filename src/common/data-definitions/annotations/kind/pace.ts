import {Annotation} from "@/common/data-definitions/annotations/annotation";
import {PaceLabel} from "@/common/data-definitions/annotations/label/pace-labels";
import {Place, PlaceKinds} from "@/common/data-definitions/annotations/place/place";
import {PointPlace} from "@/common/data-definitions/annotations/place/point-place";
import {RangePlace} from "@/common/data-definitions/annotations/place/range-place";
import {OrchestraAnnotation} from "@/common/data-definitions/annotations/type/orchestra-annotation";
import {User} from "@/common/data-definitions/user";

export class Pace<T extends OrchestraAnnotation, R extends Place> extends Annotation<T, R> {
  public label?: PaceLabel;
  
  constructor(owner: User, musicPieceId: number, place?: R, type?: T, label?: PaceLabel) {
    super(owner, musicPieceId, place, type);
    this.label = label;
  }
  
  public validPlaceKinds(): PlaceKinds[] {
    if (this.label) {
      return [this.label.placeKind];
    }
    return [PlaceKinds.pointPlace, PlaceKinds.rangePlace];
  }
  
  protected childrenValid(): boolean {
    return this.label !== undefined && (
      this.place instanceof PointPlace && this.label.placeKind === PlaceKinds.pointPlace ||
      this.place instanceof RangePlace && this.label.placeKind === PlaceKinds.rangePlace);
  }
}
