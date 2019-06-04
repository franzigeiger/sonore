import {
  AnnotationKind,
  AnnotationKinds,
  createAnnotationKinds,
} from "@/common/data-definitions/annotations/kind/annotation-kinds";

export class SelectionMode {
  private readonly mSelectableSvgClasses: string[];
  private readonly mDisplayName: string;
  private readonly mIcon: string;
  private readonly mValidAnnotationKinds: AnnotationKind[];
  
  constructor(selectableSvgClasses: string[], displayName: string, icon: string,
              validAnnotationKinds: AnnotationKind[]) {
    this.mSelectableSvgClasses = selectableSvgClasses;
    this.mDisplayName = displayName;
    this.mIcon = icon;
    this.mValidAnnotationKinds = validAnnotationKinds;
  }
  
  public get selectableSvgClasses(): string[] {
    return this.mSelectableSvgClasses;
  }
  
  public get displayName(): string {
    return this.mDisplayName;
  }
  
  public get icon(): string {
    return this.mIcon;
  }
  
  public get validAnnotationKinds(): AnnotationKind[] {
    return this.mValidAnnotationKinds;
  }
}


const noneSelectionMode = new SelectionMode([], "Keine", "stop", []);
const noteSelectionMode = new SelectionMode(["note"], "Noten", "music",
  createAnnotationKinds(AnnotationKinds.articulation,
    AnnotationKinds.changeNote,
    AnnotationKinds.dynamic,
    AnnotationKinds.highlight,
    AnnotationKinds.text,
  ),
);
const positionSelectionMode = new SelectionMode(["measure"], "Position", "crosshairs",
  createAnnotationKinds(AnnotationKinds.highlight,
    AnnotationKinds.pace,
    AnnotationKinds.text),
);

const staffSelectionMode = new SelectionMode(["staff"], "Takte", "minus-square",
  createAnnotationKinds(AnnotationKinds.highlight,
    AnnotationKinds.text),
);

const selectionModes: SelectionMode[] = [
  noneSelectionMode,
  positionSelectionMode,
  staffSelectionMode,
  noteSelectionMode,
];

export {noneSelectionMode, noteSelectionMode, positionSelectionMode, staffSelectionMode, selectionModes};
