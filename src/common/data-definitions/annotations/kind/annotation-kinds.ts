export enum AnnotationKinds {
  articulation,
  changeNote,
  dynamic,
  highlight,
  pace,
  text,
}

export class AnnotationKind {
  public readonly kind: AnnotationKinds;
  
  constructor(kind: AnnotationKinds) {
    this.kind = kind;
  }
  
  public get displayName() {
    switch (this.kind) {
      case AnnotationKinds.articulation:
        return "Artikulation";
      case AnnotationKinds.changeNote:
        return "Note ändern";
      case AnnotationKinds.dynamic:
        return "Dynamik";
      case AnnotationKinds.highlight:
        return "Markieren/Hervorheben";
      case AnnotationKinds.pace:
        return "Tempo";
      case AnnotationKinds.text:
        return "Notiz";
    }
  }
}

export function createAnnotationKinds(...annotationKinds: AnnotationKinds[]): AnnotationKind[] {
  const r: AnnotationKind[] = [];
  for (const ak of annotationKinds) {
    r.push(new AnnotationKind(ak));
  }
  return r;
}
