import {Part} from "@/common/data-definitions/part";

export class FullScorePart extends Part {
  constructor(name: string) {
    super(name);
  }
}

export const fullScorePart: FullScorePart = new FullScorePart("Partitur");
