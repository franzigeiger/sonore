import {Annotation} from "@/common/data-definitions/annotations/annotation";
import {PlaceKinds} from "@/common/data-definitions/annotations/place/place";
import {PointPlace} from "@/common/data-definitions/annotations/place/point-place";
import {AnnotationType} from "@/common/data-definitions/annotations/type/annotation-type";
import {PartAnnotation} from "@/common/data-definitions/annotations/type/part-annotation";
import {PersonalAnnotation} from "@/common/data-definitions/annotations/type/personal-annotation";
import {Note} from "@/common/data-definitions/note";
import {User} from "@/common/data-definitions/user";

export class ChangeNote<T extends PersonalAnnotation | PartAnnotation, R extends PointPlace> extends Annotation<T, R> {
  public note?: Note;
  public originalNote: Note;
  
  constructor(owner: User, musicPieceId: number, originalNote: Note, place?: R, type?: T, note?: Note) {
    super(owner, musicPieceId, place, type);
    this.originalNote = originalNote;
    this.note = note;
  }
  
  public validPlaceKinds(): PlaceKinds[] {
    return [PlaceKinds.pointPlace];
  }
  
  protected childrenValid(): boolean {
    if (this.note) {
      return this.originalNote.isDifferent(this.note);
    } else {
      return false;
    }
  }
}
