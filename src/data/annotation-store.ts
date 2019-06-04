import {Annotation} from "@/common/data-definitions/annotations/annotation";
import {Articulation} from "@/common/data-definitions/annotations/kind/articulation";
import {ChangeNote} from "@/common/data-definitions/annotations/kind/change-note";
import {Dynamic} from "@/common/data-definitions/annotations/kind/dynamic";
import {Highlight} from "@/common/data-definitions/annotations/kind/highlight";
import {Pace} from "@/common/data-definitions/annotations/kind/pace";
import {Text} from "@/common/data-definitions/annotations/kind/text";
import {DynamicLabel} from "@/common/data-definitions/annotations/label/dynamic-labels";
import {PaceLabel} from "@/common/data-definitions/annotations/label/pace-labels";
import {Place} from "@/common/data-definitions/annotations/place/place";
import {PointPlace} from "@/common/data-definitions/annotations/place/point-place";
import {RangePlace} from "@/common/data-definitions/annotations/place/range-place";
import {Location} from "@/common/data-definitions/annotations/place/location";
import {AnnotationType} from "@/common/data-definitions/annotations/type/annotation-type";
import {OrchestraAnnotation} from "@/common/data-definitions/annotations/type/orchestra-annotation";
import {PartAnnotation} from "@/common/data-definitions/annotations/type/part-annotation";
import {PersonalAnnotation} from "@/common/data-definitions/annotations/type/personal-annotation";
import {RegisterAnnotation} from "@/common/data-definitions/annotations/type/register-annotation";
import {Note} from "@/common/data-definitions/note";
import {Part} from "@/common/data-definitions/part";
import {FullScorePart} from "@/common/data-definitions/parts/full-score-part";
import {SinglePart} from "@/common/data-definitions/parts/single-part";
import {BaseStore} from "@/data/base-store";
import {RegisterStore} from "@/data/register-store";
import {UserStore} from "@/data/user-store";
import {TYPES} from "@/inversify-types";
import {serviceContainer} from "@/services/service-container";
import {injectable} from "inversify";


@injectable()
export class AnnotationStore extends BaseStore {
  private undefined = "undefined";
  
  public callAfterSuperInit(): void {
    this.log.debug("This is for avoiding an empty function");
  }
  
  public getAllAnnotations(): Array<Annotation<AnnotationType, Place>> {
    const annotations: Array<Annotation<AnnotationType, Place>> = [];
    for (const annotation of this.doc.annotation) {
      const newAnnotation = this.getAnnotationObject(annotation);
      if (newAnnotation) {
        newAnnotation.guid = annotation.guid;
        annotations.push(newAnnotation);
      }
    }
    return annotations;
  }
  
  public addAnnotation(annotation: Annotation<AnnotationType, Place>) {
    const newAnnotationObject = this.getAnnotationJson(annotation);
    const oldDoc = this.doc;
    this.doc = this.Automerge.change(this.doc, "Add new annoation with guid: " + annotation.guid, (currentdoc: any) => {
      currentdoc.annotation.push(newAnnotationObject);
    });
    const changes = this.Automerge.getChanges(oldDoc, this.doc);
    this.broadcastChange(changes);
  }
  
  
  public getName(): string {
    return "annotationTable";
  }
  
  public resolveConflict(document: any): void {
    if (document._conflicts.annotation !== undefined) {
      const conflicts = this.Automerge.getConflicts(document, "annotation");
      const localAnnotations = this.getAllAnnotations();
      for (const change in conflicts.annotation) {
        if (conflicts.annotation.hasOwnProperty(change)) {
          for (const item of conflicts.annotation[change]) {
            this.log.info("Found conflict for item {}", item);
            if (localAnnotations.find((wa) => wa.guid === item.guid) !== undefined) {
              const newAnnotation = this.getAnnotationObject(item);
              if (newAnnotation !== undefined) {
                document = this.Automerge.change(document, "Add content to list", (doc: any) => {
                  doc.annotation.push(this.getAnnotationJson(newAnnotation));
                });
              } else {
               this.log.error("Could not resolve annotation conflict.");
              }
            }
          }
        }
      }
    }
  }
  
  private getAnnotationJson(annotation: Annotation<AnnotationType, Place>)  {
    const newAnnotationObject = {guid: annotation.guid, ownerGuid: annotation.owner.guid,
      musicPieceId: annotation.musicPieceId};
    this.addTypeToAnnotationObject(newAnnotationObject, annotation.type);
    this.addPlaceToAnnotationObject(newAnnotationObject, annotation.place);
    switch (true) {
      case annotation instanceof Articulation:
        this.addArticulationAttriubtesToAnnotationObject(newAnnotationObject,
          annotation as Articulation<AnnotationType, PointPlace>);
        break;
      case annotation instanceof ChangeNote:
        this.addChangeNoteAttributesToAnnotationObject(newAnnotationObject,
          annotation as ChangeNote<AnnotationType, PointPlace>);
        break;
      case annotation instanceof Dynamic:
        this.addDynamicAttributesToAnnotationObject(newAnnotationObject,
          annotation as Dynamic<AnnotationType, Place>);
        break;
      case annotation instanceof Highlight:
        this.addHighlightsAttributesToAnnotationObject(newAnnotationObject,
          annotation as Highlight<AnnotationType, Place>);
        break;
      case annotation instanceof Pace:
        this.addPacesAttributesToAnnotationObject(newAnnotationObject,
          annotation as Pace<AnnotationType, Place>);
        break;
      case annotation instanceof Text:
        this.addTextAttributesToAnnotationObject(newAnnotationObject,
          annotation as Text<AnnotationType, PointPlace>);
        break;
    }
    return newAnnotationObject;
  }
  
  private getAnnotationObject(annotatnionJson: any): Annotation<AnnotationType, Place> | undefined {
    let newAnnotation;
    switch (annotatnionJson.annotationType) {
      case "Articulation":
        newAnnotation = this.objectToArticulation(annotatnionJson);
        break;
      case "ChangeNote":
        newAnnotation = this.objectToChangeNote(annotatnionJson);
        break;
      case "Dynamic":
        newAnnotation = this.objectToDynamic(annotatnionJson);
        break;
      case "Highlight":
        newAnnotation = this.objectToHighlight(annotatnionJson);
        break;
      case "Pace":
        newAnnotation = this.objectToPace(annotatnionJson);
        break;
      case "Text":
        newAnnotation = this.objectToText(annotatnionJson);
        break;
    }
    return newAnnotation;
  }
  
  private addArticulationAttriubtesToAnnotationObject(annotationObject: any,
                                                      articulation: Articulation<AnnotationType, PointPlace>) {
    annotationObject.annotationType = "Articulation";
    annotationObject.label = articulation.label;
  }
  
  private objectToArticulation(object: any): Articulation<AnnotationType, PointPlace> | undefined {
    const annotationType = this.objectToType(object.type);
    const pointPlace = this.objectToPlace(object.place);
    const owner = serviceContainer.get<UserStore>(TYPES.UserStore).getUserForGuid(object.ownerGuid);
    if (!owner || !annotationType || !pointPlace || !(pointPlace instanceof PointPlace)) {
      return undefined;
    }
    return new Articulation(owner, object.musicPieceId, pointPlace, annotationType, object.label);
  }
  
  private addChangeNoteAttributesToAnnotationObject(annotationObject: any,
                                                    changeNote: ChangeNote<AnnotationType, PointPlace>) {
    annotationObject.annotationType = "ChangeNote";
    let note: any = {id: this.undefined};
    if (changeNote.note) {
      note = this.convertNoteIntoStorableFormat(changeNote.note);
    }
    annotationObject.note = note;
    annotationObject.originalNote = this.convertNoteIntoStorableFormat(changeNote.originalNote);
  }
  
  private objectToChangeNote(object: any): ChangeNote<AnnotationType, PointPlace> | undefined {
    const annotationType = this.objectToType(object.type);
    const pointPlace = this.objectToPlace(object.place);
    const owner = serviceContainer.get<UserStore>(TYPES.UserStore).getUserForGuid(object.ownerGuid);
    if (!owner || !annotationType || !pointPlace || !(pointPlace instanceof PointPlace)) {
      return undefined;
    }
    if (object.note.id === this.undefined) {
      return new ChangeNote(owner, object.musicPieceId, this.reconvertNote(object.originalNote),
        pointPlace, annotationType);
    } else {
      return new ChangeNote(owner, object.musicPieceId, this.reconvertNote(object.originalNote),
        pointPlace, annotationType, this.reconvertNote(object.note));
    }
  }
  
  private addDynamicAttributesToAnnotationObject(annotationObject: any, dynamic: Dynamic<AnnotationType, Place>) {
    annotationObject.annotationType = "Dynamic";
    if (dynamic.label) {
      annotationObject.dynamicLabel = {label: dynamic.label.label, placeKind: dynamic.label.placeKind};
    } else {
      annotationObject.dynamicLabel = {label: this.undefined};
    }
  }
  
  private objectToDynamic(object: any): Dynamic<AnnotationType, Place> | undefined {
    const annotationType = this.objectToType(object.type);
    const pointPlace = this.objectToPlace(object.place);
    const owner = serviceContainer.get<UserStore>(TYPES.UserStore).getUserForGuid(object.ownerGuid);
    if (!owner || !annotationType || !pointPlace) {
      return undefined;
    }
    if (object.dynamicLabel.label === this.undefined) {
      return new Dynamic(owner, object.musicPieceId, pointPlace, annotationType);
    }
    return new Dynamic(owner, object.musicPieceId, pointPlace, annotationType,
      new DynamicLabel(object.dynamicLabel.label, object.dynamicLabel.placeKind));
  }
  
  private addHighlightsAttributesToAnnotationObject(annotationObject: any,
                                                    highlight: Highlight<AnnotationType, Place>) {
    annotationObject.annotationType = "Highlight";
    if (highlight.color) {
      annotationObject.color = highlight.color;
    } else {
      annotationObject.color = this.undefined;
    }
  }
  
  private objectToHighlight(object: any): Highlight<AnnotationType, Place> | undefined {
    const annotationType = this.objectToType(object.type);
    const pointPlace = this.objectToPlace(object.place);
    const owner = serviceContainer.get<UserStore>(TYPES.UserStore).getUserForGuid(object.ownerGuid);
    if (!owner || !annotationType || !pointPlace) {
      return undefined;
    }
    if (object.color === this.undefined) { // color was undefined (but should not happen)
      return new Highlight(owner, object.musicPieceId, pointPlace, annotationType);
    } else {
      return new Highlight(owner, object.musicPieceId, pointPlace, annotationType, object.color);
    }
  }
  
  private addPacesAttributesToAnnotationObject(annotationObject: any, pace: Pace<OrchestraAnnotation, Place>) {
    annotationObject.annotationType = "Pace";
    if (pace.label) {
      annotationObject.label = {label: pace.label.label, placeKind: pace.label.placeKind};
    } else {
      annotationObject.label = {label: this.undefined};
    }
  }
  
  private objectToPace(object: any): Pace<OrchestraAnnotation, Place> | undefined {
    const annotationType = this.objectToType(object.type);
    const pointPlace = this.objectToPlace(object.place);
    const owner = serviceContainer.get<UserStore>(TYPES.UserStore).getUserForGuid(object.ownerGuid);
    if (!owner || !annotationType || !pointPlace) {
      return undefined;
    }
    if (object.label.label === this.undefined) { // label was undefined (but should not happen)
      return new Pace(owner, object.musicPieceId, pointPlace, annotationType);
    } else {
      return new Pace(owner, object.musicPieceId, pointPlace, annotationType,
        new PaceLabel(object.label.label, object.label.placeKind));
    }
  }
  
  private addTextAttributesToAnnotationObject(annotationObject: any, text: Text<AnnotationType, PointPlace>) {
    annotationObject.annotationType = "Text";
    annotationObject.text = text.text;
  }
  
  private objectToText(object: any): Text<AnnotationType, PointPlace> | undefined {
    const annotationType = this.objectToType(object.type);
    const pointPlace = this.objectToPlace(object.place);
    const owner = serviceContainer.get<UserStore>(TYPES.UserStore).getUserForGuid(object.ownerGuid);
    if (!owner || !annotationType || !pointPlace || !(pointPlace instanceof PointPlace)) {
      return undefined;
    }
    const textAnnotation = new Text(owner, object.musicPieceId, pointPlace, annotationType);
    textAnnotation.text = object.text;
    return textAnnotation;
  }
  
  private addTypeToAnnotationObject(annotationObject: any, type?: AnnotationType) {
    switch (true) {
      case type === undefined: // should never happen
        annotationObject.type = {type: this.undefined};
        break;
      case type instanceof PersonalAnnotation:
        annotationObject.type = {type: "personal"};
        break;
      case type instanceof PartAnnotation:
        annotationObject.type = {
          type: "part", parts: this.convertPartsIntoSaveAbleFormat((type as PartAnnotation).parts),
        };
        break;
      case type instanceof RegisterAnnotation:
        annotationObject.type = {
          type: "register", displayName: (type as RegisterAnnotation).displayName,
          registerGuid: (type as RegisterAnnotation).register.guid,
        };
        break;
      case type instanceof OrchestraAnnotation:
        annotationObject.type = {type: "orchestra"};
        break;
    }
  }
  
  private objectToType(typeObject: any): AnnotationType | undefined {
    switch (typeObject.type) {
      case this.undefined:
        return undefined;
      case "personal":
        return new PersonalAnnotation();
      case "part":
        const parts: Part[] = this.reconvertPartsIntoReadableFormat(typeObject.parts);
        return new PartAnnotation(...parts);
      case "register":
        const register = serviceContainer.get<RegisterStore>(TYPES.RegisterStore)
          .getRegisterByGuid(typeObject.registerGuid);
        if (!register) {
          return undefined;
        } else {
          return new RegisterAnnotation(register);
        }
      case "orchestra":
        return new OrchestraAnnotation();
    }
  }
  
  private addPlaceToAnnotationObject(annotationObject: any, place?: Place) {
    switch (true) {
      case place === undefined: // should never happen
        annotationObject.place = {type: this.undefined};
        break;
      case place instanceof PointPlace:
        annotationObject.place = {type: "point", pointId: (place as PointPlace).point.elementId};
        break;
      case place instanceof RangePlace:
        annotationObject.place = {
          type: "range",
          pointStartId: (place as RangePlace).start.elementId,
          pointEndId: (place as RangePlace).end.elementId,
        };
        break;
    }
  }
  
  private objectToPlace(placeObject: any): Place | undefined {
    switch (placeObject.type) {
      case this.undefined:
        return undefined;
      case "point":
        return new PointPlace(new Location(placeObject.pointId));
      case "range":
        return new RangePlace(new Location(placeObject.pointStartId), new Location(placeObject.pointEndId));
    }
  }
  
  private convertNoteIntoStorableFormat(note: Note): object {
    const convertedNote: any = {fraction: note.fraction, id: note.id, octave: note.octave, pitch: note.pitch};
    if (note.accid) {
      convertedNote.accid = note.accid;
    } else {
      convertedNote.accid = -1;
    }
    return convertedNote;
  }
  
  private reconvertNote(noteObject: any): Note {
    if (noteObject.accid) {
      return new Note(noteObject.fraction, noteObject.id, noteObject.octave, noteObject.pitch, noteObject.accid);
    }
    return new Note(noteObject.fraction, noteObject.id, noteObject.octave, noteObject.pitch);
  }
  
  private convertPartsIntoSaveAbleFormat(parts: Part[]): object[] {
    const convertedParts = [];
    for (const part of parts) {
      if (part instanceof SinglePart) {
        convertedParts.push({instrument: part.instrument, name: part.name});
      } else if (part instanceof FullScorePart) {
        convertedParts.push({instrument: -1, name: part.name});
      }
    }
    return convertedParts;
  }
  
  private reconvertPartsIntoReadableFormat(partObjects: any[]): Part[] {
    const parts: Part[] = [];
    for (const partObject of partObjects) {
      if (partObject.instrument !== -1) {
        parts.push(new SinglePart(partObject.instrument, partObject.name));
      } else {
        parts.push(new FullScorePart(partObject.name));
      }
    }
    return parts;
  }
  
  protected getAutomergeInitString(): string {
    // tslint:disable-next-line
    return '["~#iL",[["~#iM",["ops",["^0",[["^1",["action","makeList","obj","3661b6eb-92e2-4e55-95d7-64f6817bdf81"]],["^1",["action","link","obj","00000000-0000-0000-0000-000000000000","key","annotation","value","3661b6eb-92e2-4e55-95d7-64f6817bdf81"]]]],"actor","08b18aa3-778b-4f21-8c29-ada5ac34e512","seq",1,"deps",["^1",[]],"message","First init of annotation tables"]]]]';
  }
}
