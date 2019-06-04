export class MusicPiece {
  public id: number;
  public name: string;
  public xmlPath: string;
  public composer: string;
  public genre: string;
  
  constructor(id: number, name: string, xmlPath: string, composer: string, genre: string) {
    this.id = id;
    this.name = name;
    this.xmlPath = xmlPath;
    this.composer = composer;
    this.genre = genre;
  }
}
