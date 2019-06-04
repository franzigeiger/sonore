export enum PitchName {
  A = "a", B = "b", C = "c", D = "d", E = "e", F = "f", G = "g",
}

export enum AccidentalName {
  s, f, x, ff, n,
}

/**
 * Used for Annotations that represent a changed note.
 */
export class Note {
  
  public static getNewFromMeiAttributes(id: string, attributeMap: NamedNodeMap) {
    return new Note(Number(attributeMap.getNamedItem("dur")!.value),
      id, Number(attributeMap.getNamedItem("oct")!.value),
      attributeMap.getNamedItem("pname")!.value as PitchName);
  }
  
  private static fractionNameHelper: { [index: number]: string } = {
    1: "Ganze",
    2: "Halbe",
    4: "4tel",
    8: "8el",
    16: "16tel",
    32: "32stel",
    64: "64stel",
    128: "128stel",
    256: "256stel",
    512: "512tel",
    1024: "1024stel",
    2048: "2048stel",
  };
  
  private static pitchOrderHelper = [
    PitchName.C,
    PitchName.D,
    PitchName.E,
    PitchName.F,
    PitchName.G,
    PitchName.A,
    PitchName.B,
  ];
  
  public accid?: AccidentalName;
  public fraction: number;
  public id: string; // same as old id
  public octave: number; // 0..9
  public pitch: PitchName;
  
  constructor(fraction: number, id: string, octave: number, pitch: PitchName, accid?: AccidentalName) {
    this.accid = accid;
    this.fraction = fraction;
    this.id = id;
    this.octave = octave;
    this.pitch = pitch;
  }
  
  public get displayName() {
    let duration: string;
    if (Object.keys(Note.fractionNameHelper).includes(String(this.fraction))) {
      duration = Note.fractionNameHelper[this.fraction];
    } else {
      duration = "invalid duration: " + this.fraction;
    }
    
    let octaveAppendix: string;
    let letter: string;
    if (this.octave >= 4) {
      // small letter
      letter = this.pitch.toLowerCase();
      octaveAppendix = "'".repeat(this.octave - 3);
    } else if (this.octave === 3) {
      letter = this.pitch.toLowerCase();
      octaveAppendix = "";
    } else if (this.octave === 2) {
      letter = this.pitch.toUpperCase();
      octaveAppendix = "";
    } else if (this.octave === 1) {
      letter = this.pitch.toUpperCase();
      octaveAppendix = "'";
    } else if (this.octave === 0) {
      letter = this.pitch.toUpperCase();
      octaveAppendix = "''";
    } else {
      letter = "invalid Octave: ";
      octaveAppendix = String(this.octave);
    }
    return duration + " | " + letter + octaveAppendix;
  }
  
  public canChangeHigher(): boolean {
    return !(this.pitch === PitchName.B && this.octave === 9);
  }
  
  public canChangeLower(): boolean {
    return !(this.pitch === PitchName.C && this.octave === 0);
  }
  
  public canChangeHigherOctave(): boolean {
    return !(this.octave === 9);
  }
  
  public canChangeLowerOctave(): boolean {
    return !(this.octave === 0);
  }
  
  public changeHigher() {
    if (this.canChangeHigher()) {
      let index = Note.pitchOrderHelper.indexOf(this.pitch);
      // check if octave needs to be changed
      if (index === Note.pitchOrderHelper.length - 1) {
        this.octave++;
        index = 0;
      } else {
        index++;
      }
      this.pitch = Note.pitchOrderHelper[index];
    }
  }
  
  public changeLower() {
    if (this.canChangeLower()) {
      let index = Note.pitchOrderHelper.indexOf(this.pitch);
      // check if octave needs to be changed
      if (index === 0) {
        this.octave--;
        index = Note.pitchOrderHelper.length - 1;
      } else {
        index--;
      }
      this.pitch = Note.pitchOrderHelper[index];
    }
  }
  
  public changeHigherOctave() {
    if (this.canChangeHigherOctave()) {
      this.octave++;
    }
  }
  
  public changeLowerOctave() {
    if (this.canChangeLowerOctave()) {
      this.octave--;
    }
  }
  
  public isDifferent(n: Note): boolean {
    return this.octave !== n.octave || this.pitch !== n.pitch;
  }
}

