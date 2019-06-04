import {Instrument} from "@/common/data-definitions/instrument";
import {Part} from "@/common/data-definitions/part";
import {SinglePart} from "@/common/data-definitions/parts/single-part";
import {injectable} from "inversify";

@injectable ()
export class PartStore {
  private parts: SinglePart[] = [
    {instrument: 0, name: "Klavier"},
    {instrument: 1, name: "Schlagzeug"},
    {instrument: 6, name: "Cembalo"},
    {instrument: 27, name: "E-Gitarre"},
    {instrument: 34, name: "E-Bass"},
    {instrument: 40, name: "Solo Violine"},
    {instrument: 40, name: "1. Violine"},
    {instrument: 40, name: "2. Violine"},
    {instrument: 41, name: "Viola"},
    {instrument: 42, name: "Violoncello"},
    {instrument: 43, name: "Kontrabass"},
    {instrument: 52, name: "1. Gesang"},
    {instrument: 52, name: "2. Gesang"},
    {instrument: 52, name: "3. Gesang"},
    {instrument: 57, name: "Posaune"},
    {instrument: 65, name: "Altsaxophon"},
  ];
  
  public getAllParts(): SinglePart[] {
    return this.parts;
  }
  
  public getPartsForInstrument(instrument: Instrument): SinglePart[] {
    return this.parts.filter((part) => part.instrument === instrument.midiNumber);
  }
}
