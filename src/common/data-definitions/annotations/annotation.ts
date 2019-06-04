import {Place, PlaceKinds} from "@/common/data-definitions/annotations/place/place";
import {AnnotationType} from "@/common/data-definitions/annotations/type/annotation-type";
import {User} from "@/common/data-definitions/user";
import {newGuid} from "@/common/util";

export abstract class Annotation<T extends AnnotationType, R extends Place> {
  public owner: User;
  public musicPieceId: number;
  public place?: R;
  public type?: T;
  public guid: string = newGuid();
  
  protected constructor(owner: User, musicPieceId: number, place?: R, type?: T) {
    this.owner = owner;
    this.musicPieceId = musicPieceId;
    this.place = place;
    this.type = type;
  }
  
  public isComplete(): boolean {
    return this.place !== undefined && this.type !== undefined && this.childrenValid();
  }
  
  public abstract validPlaceKinds(): PlaceKinds[];
  
  protected abstract childrenValid(): boolean;
  
}

