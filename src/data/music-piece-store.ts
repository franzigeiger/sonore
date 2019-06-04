import {MusicPiece} from "@/common/data-definitions/music-piece";
import {fetchLocal} from "@/common/util";
import {Toaster} from "@/toaster";
import {injectable} from "inversify";

@injectable()
export class MusicPieceStore {
  private static parseList(json: any): MusicPiece[] {
    interface Piece {
      id: number;
      name: string;
      composer: string;
      genre: string;
    }
    
    const pieces = new Map<string, Piece>(Object.entries(json));
    const pieceList: MusicPiece[] = [];
    pieces.forEach((piece, key) => {
      pieceList.push(new MusicPiece(piece.id, piece.name, key, piece.composer, piece.genre));
    });
    return pieceList;
  }
  
  private musicPieces: MusicPiece[] = [];
  
  constructor() {
    fetchLocal("pieces/pieces.json").then(async (response: Response) => {
      // add the pieces to the existing array in case the reference to the array is already exposed somewhere
      this.musicPieces.push(...MusicPieceStore.parseList(await response.json()));
    }, (err) => Toaster.displayError(err));
  }
  
  public getAllMusicPieces(): MusicPiece[] {
    return this.musicPieces;
  }
}
