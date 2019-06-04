import {Instrument} from "@/common/data-definitions/instrument";
import {Part} from "@/common/data-definitions/part";
import {newGuid} from "@/common/util";

export class User {
  public guid: string;
  public instruments: Instrument[];
  public isDirigent: boolean;
  public name: string;
  /// maps the ids of music pieces to the names of the parts that are played by the user in the respective piece
  public parts: Map<number, Part>;
  
  constructor(instruments: Instrument[], isDirigent: boolean, name: string,
              parts: Map<number, Part> = new Map(),  guid: string = newGuid()) {
    this.guid = guid;
    this.instruments = instruments;
    this.isDirigent = isDirigent;
    this.name = name;
    this.parts = parts;
  }
}
