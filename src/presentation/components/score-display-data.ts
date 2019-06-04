import {MusicPiece} from "@/common/data-definitions/music-piece";
import {Part} from "@/common/data-definitions/part";
import {MeasureId} from "@/common/svg-util";

export interface ScoreDisplayData {
  musicPiece: MusicPiece | null;
  part: Part | null;
  location: MeasureId;
}

export interface ValidScoreDisplayData {
  musicPiece: MusicPiece;
  part: Part;
  location: MeasureId;
}
