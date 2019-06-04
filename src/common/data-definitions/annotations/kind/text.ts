import {Annotation} from "@/common/data-definitions/annotations/annotation";
import {PlaceKinds} from "@/common/data-definitions/annotations/place/place";
import {PointPlace} from "@/common/data-definitions/annotations/place/point-place";
import {AnnotationType} from "@/common/data-definitions/annotations/type/annotation-type";
import {User} from "@/common/data-definitions/user";

export class Text<T extends AnnotationType, R extends PointPlace> extends Annotation<T, R> {
  public text: string = "";
  
  constructor(owner: User, musicPieceId: number, place?: R, type?: T) {
    super(owner, musicPieceId, place, type);
  }
  
  public validPlaceKinds(): PlaceKinds[] {
    return [PlaceKinds.pointPlace];
  }
  
  protected childrenValid(): boolean {
    return this.text !== "";
  }
}
