import {Annotation} from "@/common/data-definitions/annotations/annotation";
import {Articulation} from "@/common/data-definitions/annotations/kind/articulation";
import {ChangeNote} from "@/common/data-definitions/annotations/kind/change-note";
import {Dynamic} from "@/common/data-definitions/annotations/kind/dynamic";
import {Highlight} from "@/common/data-definitions/annotations/kind/highlight";
import {Pace} from "@/common/data-definitions/annotations/kind/pace";
import {Place} from "@/common/data-definitions/annotations/place/place";
import {PointPlace} from "@/common/data-definitions/annotations/place/point-place";
import {RangePlace} from "@/common/data-definitions/annotations/place/range-place";
import {AnnotationType} from "@/common/data-definitions/annotations/type/annotation-type";
import {OrchestraAnnotation} from "@/common/data-definitions/annotations/type/orchestra-annotation";
import {Logger} from "@/common/logging";
import {Text} from "@/common/data-definitions/annotations/kind/text";
import {newGuid} from "@/common/util";

const log: Logger = Logger.getNew("XmlUtil");
log.setLevel("info");

export class XmlUtil {
  
  public static serializeDocumentToString(meiDoc: XMLDocument): string {
    return new XMLSerializer().serializeToString(meiDoc);
  }
  
  public static getMeiAttributesOfId(meiDoc: XMLDocument, id: string): NamedNodeMap {
    const el = meiDoc.querySelector("[*|id=\"" + id + "\"]");
    return el ? el.attributes : new NamedNodeMap();
  }
  
  public static extractSinglePart(meiDoc: XMLDocument, partIds: string[]): XMLDocument {
    const elementsToRemove: Element[] = [];
    const staffs: HTMLCollectionOf<Element> = meiDoc.getElementsByTagName("staff");
    for (const staff of staffs) {
      if (!partIds.includes(staff.getAttribute("n")!.valueOf())) {
        elementsToRemove.push(staff);
      }
    }
    const staffsDefs = meiDoc.getElementsByTagName("staffDef");
    for (const staff of staffsDefs) {
      if (!partIds.includes(staff.getAttribute("n")!.valueOf())) {
        elementsToRemove.push(staff);
        staff.parentElement!.removeChild(staff);
      }
    }
    const pageBeginnings = meiDoc.getElementsByTagName("pb");
    for (const pb of pageBeginnings) {
      elementsToRemove.push(pb);
    }
    for (const element of elementsToRemove) {
      if (element.parentElement) {
        element.parentElement.removeChild(element);
      } else {
        log.debug("no parent found! " + new XMLSerializer().serializeToString(element));
      }
    }
    return meiDoc;
  }
  
  public static getPartsFromXml(xml: XMLDocument): Map<string, string[]> {
    const map = new Map();
    
    const instrDefs = xml.getElementsByTagName("instrDef");
    for (const instrDef of instrDefs) {
      const part = instrDef.parentElement;
      
      if (part === null) {
        log.warn("Strange 'instrDef'-element: {}" + instrDef.outerHTML);
      } else if (part.tagName === "staffDef") {
        XmlUtil.getPartFromStaffDef(part, map);
      } else if (part.tagName === "staffGrp") {
        XmlUtil.getPartFromStaffGroup(part, map);
      } else {
        log.warn("Strange parent of 'instrDef'-element: {}" + part.outerHTML);
      }
    }
    
    return map;
  }
  
  public static annotate(meiDoc: XMLDocument, allAnnotations: Array<Annotation<AnnotationType, Place>>): XMLDocument {
    log.debug(allAnnotations);
    for (const annotation of allAnnotations) {
      if (annotation instanceof Articulation) {
        meiDoc = this.annotateArticulation(meiDoc, annotation);
      } else if (annotation instanceof ChangeNote) {
        meiDoc = this.annotateChangedNote(meiDoc, annotation);
      } else if (annotation instanceof Dynamic) {
        meiDoc = this.annotateDynamic(meiDoc, annotation);
      } else if (annotation instanceof Highlight) {
        meiDoc = this.annotateHighlight(meiDoc, annotation);
      } else if (annotation instanceof Pace) {
        meiDoc = this.annotatePace(meiDoc, annotation);
      } else if (annotation instanceof Text) {
        meiDoc = this.annotateText(meiDoc, annotation);
      }
    }
    return meiDoc;
  }
  
  private static addNewElementToParentMeasure(meiDoc: Document, elementIdToFind: string, elementTypeToCreate: string,
                                              attributesToCreate: Array<[string, string]>): Document {
    
    const elem = this.getElementByXmlId(meiDoc, elementIdToFind);
    if (!elem) {
      return meiDoc;
    }
    const tuple = this.getParentStaffNAndParentMeasure(meiDoc, elem);
    attributesToCreate.push(["staff", tuple[0]]);
    const measure = tuple[1];
    
    return this.addNewChildToElement(meiDoc, measure, elementTypeToCreate, attributesToCreate);
  }
  
  private static addNewChildToMeasure(meiDoc: Document, elementIdToFind: string,
                                      elementTypeToCreate: string,
                                      attributesToCreate: Array<[string, string]>): Document {
    const measure = this.getElementByXmlId(meiDoc, elementIdToFind);
    if (!measure) {
      return meiDoc;
    }
    attributesToCreate.push(["staff", "1"]);
    return this.addNewChildToElement(meiDoc, measure!, elementTypeToCreate, attributesToCreate);
  }
  
  private static addNewChildToElement(meiDoc: Document, parentElement: Element, elementTypeToCreate: string,
                                      attributesToCreate: Array<[string, string]>): Document {
    const newElement = meiDoc.createElement(elementTypeToCreate);
    for (const attributeTuple of attributesToCreate) {
      if (attributeTuple[0] === "innerHTML") {
        log.debug("new elem before innerHTML insertion {}" + newElement);
        newElement.textContent = attributeTuple[1];
        continue;
      }
      newElement.setAttribute(attributeTuple[0], attributeTuple[1]);
    }
    newElement.setAttribute("xml:id", newGuid());
    
    log.debug("new element {}", newElement);
    parentElement.appendChild(newElement);
    log.debug("parent element {}", parentElement);
    return meiDoc;
  }
  
  private static annotateArticulation(meiDoc: Document, annotation: Articulation<AnnotationType, PointPlace>)
    : Document {
    const note = this.getElementByXmlId(meiDoc, annotation.place!.point.elementId);
    if (!note) {
      return meiDoc;
    }
    note.setAttribute("artic", annotation.label!);
    return meiDoc;
  }
  
  private static annotateChangedNote(meiDoc: Document, annotation: ChangeNote<AnnotationType, PointPlace>): Document {
    const note = this.getElementByXmlId(meiDoc, annotation.note!.id);
    if (!note) {
      return meiDoc;
    }
    note.setAttribute("oct", annotation.note!.octave.toString());
    note.setAttribute("pname", annotation.note!.pitch);
    return meiDoc;
  }
  
  private static annotateDynamic(meiDoc: Document, annotation: Dynamic<AnnotationType, Place>): Document {
    const startId = this.getStartId(annotation);
    
    const attributesToCreate: Array<[string, string]> = [["startid", "#" + startId],
      ["innerHTML", annotation.label!.label.toString()]];
    
    let elementTypeToCreate = "";
    if (annotation.place instanceof PointPlace) {
      elementTypeToCreate = "dynam";
      attributesToCreate.push(["place", "above"]);
    } else { // RangePlace
      elementTypeToCreate = "hairpin";
      attributesToCreate.push(["place", "below"], ["endid", "#" + (annotation.place as RangePlace).end.elementId],
        ["form", annotation.label!.label === "cresc" ? "cres" : "dim"]);
    }
    
    if (startId.includes("note") || startId.includes("staff")) {
      return this.addNewElementToParentMeasure(meiDoc, startId, elementTypeToCreate, attributesToCreate);
    } else if (startId.includes("measure")) {
      return this.addNewChildToMeasure(meiDoc, startId, elementTypeToCreate, attributesToCreate);
    } else {
      log.error("Dynamic Annotation is not avaliable for element with id " + startId);
      return meiDoc;
    }
    
  }
  
  private static annotateHighlight(meiDoc: Document, annotation: Highlight<AnnotationType, Place>): Document {
    // TODO Update for RangePlace if Marci implemented getting all IDs in between
    
    const elementsToColor: Element[] = [];
    const startId = this.getStartId(annotation);
    
    if (startId.includes("note") || startId.includes("staff") || startId.includes("measure")) {
      const elementToColor = this.getElementByXmlId(meiDoc, startId);
      if (!elementToColor) {
        return meiDoc;
      }
      elementsToColor.push(elementToColor);
    } else {
      log.error("Highlight Annotation is not available for element with id " + startId);
      return meiDoc;
    }
    
    if (annotation.place instanceof RangePlace) {
      const elementToColor = this.getElementByXmlId(meiDoc, (annotation.place as RangePlace).end.elementId);
      if (!elementToColor) {
        return meiDoc;
      }
      elementsToColor.push(elementToColor);
    }
    
    const elementsToFindChildren = elementsToColor;
    const tagNamesColorable = ["artic", "beam", "chord", "hairpin", "note", "rest", "staff", "tuplet", "verse"];
    for (const tagName of tagNamesColorable) {
      for (const elem of elementsToFindChildren) {
        for (const child of elem.getElementsByTagName(tagName)) {
          elementsToColor.push(child);
        }
      }
    }
    
    elementsToColor.forEach((e) => e.setAttribute("color", annotation.color!));
    return meiDoc;
  }
  
  private static annotatePace(meiDoc: Document, annotation: Pace<OrchestraAnnotation, Place>): Document {
    const attributesToCreate: Array<[string, string]> = [["place", "above"],
      ["innerHTML", annotation.label!.label.toString()], ["tstamp", "1"], ["midi.bpm", "60"]];
    
    let startId = "";
    if (annotation.place instanceof RangePlace) {
      startId = (annotation.place as RangePlace).start.elementId;
      const endId = (annotation.place as RangePlace).end.elementId;
      attributesToCreate.push(["endid", "#" + endId]);
    } else {
      startId = (annotation.place as PointPlace).point.elementId;
    }
    attributesToCreate.push(["startid", "#" + startId]);
    
    if (!startId.includes("measure")) {
      log.error("Annotating Pace is not supported yet for element with id " + startId);
    }
    const measure = this.getElementByXmlId(meiDoc, startId);
    if (!measure) {
      return meiDoc;
    }
    
    return this.addNewChildToMeasure(meiDoc, startId, "tempo", attributesToCreate);
  }
  
  private static annotateText(meiDoc: Document, annotation: Text<AnnotationType, PointPlace>): Document {
    const placeId = annotation.place!.point.elementId;
    const attributesToCreate: Array<[string, string]> = [["place", "above"], ["startId", "#" + placeId],
      ["innerHTML", annotation.text!], ["tstamp", "1"]];
    
    if (placeId.includes("note") || placeId.includes("staff")) {
      return this.addNewElementToParentMeasure(meiDoc, placeId, "dir", attributesToCreate);
    } else if (placeId.includes("measure")) {
      return this.addNewChildToMeasure(meiDoc, placeId, "dir", attributesToCreate);
    } else {
      log.error("Text annotation not supported for element " + placeId);
      return meiDoc;
    }
  }
  
  private static getStartId(annotation: Annotation<AnnotationType, Place>) {
    if (annotation.place instanceof PointPlace) {
      return (annotation.place as PointPlace).point.elementId;
    } else {
      return (annotation.place as RangePlace).start.elementId;
    }
  }
  
  private static getElementByXmlId(meiDoc: Document, xmlId: string): Element | null {
    return meiDoc.querySelector("[*|id=\"" + xmlId + "\"]");
  }
  
  private static getParentStaffNAndParentMeasure(meiDoc: Document, element: Element): [string, Element] {
    let staff = element;
    while (staff.tagName !== "staff") {
      staff = staff.parentElement!;
    }
    log.debug("found parent staff: " + staff.getAttribute("xml:id")!.valueOf());
    const staffN = staff.getAttribute("n")!.valueOf();
    let measure = staff;
    while (measure.tagName !== "measure") {
      measure = measure.parentElement!;
    }
    return [staffN, measure];
  }
  
  private static getPartFromStaffDef(part: Element, map: Map<string, string[]>) {
    const partNameElements = part.getElementsByTagName("label");
    if (partNameElements.length !== 1) {
      // outer html: includes element called on
      log.warn("Unrecognized part label in: {}", part.outerHTML);
      
    }
    const n = part.getAttribute("n");
    // we know there is only one label, inner html: only nested elements
    map.set(partNameElements[0].innerHTML, n ? [n] : []);
  }
  
  private static getPartFromStaffGroup(part: Element, map: Map<string, string[]>) {
    const partNameElements = part.getElementsByTagName("label");
    if (partNameElements.length !== 1) {
      log.warn("Unrecognized part label in: {}", part.outerHTML);
      
    }
    const ns: string[] = [];
    const staffDefs = part.getElementsByTagName("staffDef");
    for (const staffDef of staffDefs) {
      const n = staffDef.getAttribute("n");
      if (n) {
        ns.push(n);
      }
    }
    map.set(partNameElements[0].innerHTML, ns);
  }
}
