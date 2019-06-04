import {injectable} from "inversify";
import {Instrument} from "@/common/data-definitions/instrument";

@injectable()
export class InstrumentStore {
  private instruments: Instrument[] = [
    // TODO update with real instruments + midi numbers
    {midiNumber: 0, name: "Klavier", iconPath: ""},
    {midiNumber: 1, name: "Schlagzeug", iconPath: ""},
    {midiNumber: 6, name: "Cembalo", iconPath: ""},
    {midiNumber: 27, name: "E-Gitarre", iconPath: ""},
    {midiNumber: 34, name: "E-Bass", iconPath: ""},
    {midiNumber: 40, name: "Violine", iconPath: ""},
    {midiNumber: 41, name: "Viola", iconPath: ""},
    {midiNumber: 42, name: "Violoncello", iconPath: ""},
    {midiNumber: 43, name: "Kontrabass", iconPath: ""},
    {midiNumber: 52, name: "Gesang", iconPath: ""},
    {midiNumber: 57, name: "Posaune", iconPath: ""},
    {midiNumber: 65, name: "Altsaxophon", iconPath: ""},
  ];
  
  public getAllInstruments(): Instrument[] {
    return this.instruments;
  }
}
