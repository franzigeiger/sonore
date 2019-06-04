// import {Fraction} from "@/common/data-definitions/annotations/place/fraction";
// Fraction is not used anymore in favour of string-based locations (MEI-ids)
export class Location {
  // public measureIndex: number;
  // public positionInMeasure: Fraction;
  
  public elementId: string;
  
  /* constructor(measureIndex: number, fraction: Fraction) {
    this.measureIndex = measureIndex;
    this.positionInMeasure = fraction;
  } */
  
  constructor(elementId: string) {
    this.elementId = elementId;
  }
}
