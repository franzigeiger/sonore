export class Instrument {
  public iconPath: string;
  public midiNumber: number;
  public name: string;
  
  constructor(midiNumber: number, name: string, iconPath: string) {
    this.midiNumber = midiNumber;
    this.name = name;
    this.iconPath = iconPath;
  }
}
