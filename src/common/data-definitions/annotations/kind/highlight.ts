import {Annotation} from "@/common/data-definitions/annotations/annotation";
import {Place, PlaceKinds} from "@/common/data-definitions/annotations/place/place";
import {AnnotationType} from "@/common/data-definitions/annotations/type/annotation-type";
import {User} from "@/common/data-definitions/user";

export class Highlight<T extends AnnotationType, R extends Place> extends Annotation<T, R> {
  public color?: HighlightColor;
  
  constructor(owner: User, musicPieceId: number, place?: R, type?: T, color?: HighlightColor) {
    super(owner, musicPieceId, place, type);
    this.color = color;
  }
  
  public validPlaceKinds(): PlaceKinds[] {
    return [PlaceKinds.pointPlace, PlaceKinds.rangePlace];
  }
  
  protected childrenValid(): boolean {
    return this.color !== undefined;
  }
}

export enum HighlightColor {
  orange = "orange", green = "green", blue = "blue", purple = "purple", red = "red",
}
