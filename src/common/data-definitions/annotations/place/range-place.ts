import {Location} from "@/common/data-definitions/annotations/place/location";
import {Place} from "@/common/data-definitions/annotations/place/place";

export class RangePlace extends Place {
  public static getRangePlaceWithId(elementId: string, elementIdEnd: string) {
    return new RangePlace(new Location(elementId), new Location(elementIdEnd));
  }
  
  public start: Location;
  public end: Location;
  
  constructor(start: Location, end: Location) {
    super();
    this.start = start;
    this.end = end;
  }
}
