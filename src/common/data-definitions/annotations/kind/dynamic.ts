import {Annotation} from "@/common/data-definitions/annotations/annotation";
import {DynamicLabel} from "@/common/data-definitions/annotations/label/dynamic-labels";
import {Place, PlaceKinds} from "@/common/data-definitions/annotations/place/place";
import {PointPlace} from "@/common/data-definitions/annotations/place/point-place";
import {RangePlace} from "@/common/data-definitions/annotations/place/range-place";
import {AnnotationType} from "@/common/data-definitions/annotations/type/annotation-type";
import {User} from "@/common/data-definitions/user";

export class Dynamic<T extends AnnotationType, R extends Place> extends Annotation<T, R> {
  public label?: DynamicLabel;
  
  constructor(owner: User, musicPieceId: number, place?: R, type?: T, label?: DynamicLabel) {
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

