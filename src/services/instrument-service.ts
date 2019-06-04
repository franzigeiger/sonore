import {inject, injectable} from "inversify";
import {Instrument} from "@/common/data-definitions/instrument";
import {InstrumentStore} from "@/data/instrument-store";
import {TYPES} from "@/inversify-types";

@injectable()
export class InstrumentService {
  private instrumentStore: InstrumentStore;
  
  constructor(
    @inject(TYPES.InstrumentStore) instrumentStore: InstrumentStore,
  ) {
    this.instrumentStore = instrumentStore;
  }
  
  public getAllInstruments(): Instrument[] {
    return this.instrumentStore.getAllInstruments();
  }
}
