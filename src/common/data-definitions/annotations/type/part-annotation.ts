import {AnnotationType} from "@/common/data-definitions/annotations/type/annotation-type";
import {Part} from "../../part";

export class PartAnnotation extends AnnotationType {
  public parts: Part[];
  public displayName: string;
  
  constructor(...parts: Part[]) {
    super();
    // TODO check later, that every saved partAnnotation has parts
    this.parts = parts;
    if (this.parts.length === 0) {
      this.displayName = "für ausgewählte Stimme";
    } else if (this.parts.length === 1) {
      this.displayName = "für Stimme: " + this.parts[0];
    } else {
      this.displayName = "für Stimmen: " + this.parts.map((p) => p.name).join(", ");
    }
  }
  
}
