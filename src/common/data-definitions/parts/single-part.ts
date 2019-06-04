import {Part} from "@/common/data-definitions/part";

export class SinglePart extends Part {
  /// the midi number of the instrument this part belongs to
  public instrument: number;
  
  constructor(instrument: number, name: string) {
    super(name);
    this.instrument = instrument;
  }
}
