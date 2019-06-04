import {Place} from "@/common/data-definitions/annotations/place/place";
import {Location} from "@/common/data-definitions/annotations/place/location";

export class PointPlace extends Place {
  public static getPointPlaceWithId(elementId: string) {
    return new PointPlace(new Location(elementId));
  }
  
  public point: Location;
  
  constructor(point: Location) {
    super();
    this.point = point;
  }
}
