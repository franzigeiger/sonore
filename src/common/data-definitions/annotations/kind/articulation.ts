import {Annotation} from "@/common/data-definitions/annotations/annotation";
import {PlaceKinds} from "@/common/data-definitions/annotations/place/place";
import {PointPlace} from "@/common/data-definitions/annotations/place/point-place";
import {PartAnnotation} from "@/common/data-definitions/annotations/type/part-annotation";
import {PersonalAnnotation} from "@/common/data-definitions/annotations/type/personal-annotation";
import {User} from "@/common/data-definitions/user";

export class Articulation<T extends PersonalAnnotation | PartAnnotation, R extends PointPlace>
  extends Annotation<T, R> {
  public label?: ArticulationLabel;
  
  constructor(owner: User, musicPieceId: number, place?: R, type?: T, label?: ArticulationLabel) {
    super(owner, musicPieceId, place, type);
    this.label = label;
  }
  
  
  public validPlaceKinds(): PlaceKinds[] {
    return [PlaceKinds.pointPlace];
  }
  
  protected childrenValid(): boolean {
    return this.label !== undefined;
  }
}

export enum ArticulationLabel {
  acc = "acc", stacc = "stacc", ten = "ten", marc = "marc",
}
