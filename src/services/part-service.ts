import {MusicPiece} from "@/common/data-definitions/music-piece";
import {Part} from "@/common/data-definitions/part";
import {fullScorePart} from "@/common/data-definitions/parts/full-score-part";
import {SinglePart} from "@/common/data-definitions/parts/single-part";
import {Logger} from "@/common/logging";
import store from "@/common/state/store";
import {PartStore} from "@/data/part-store";
import {TYPES} from "@/inversify-types";
import {UserService} from "@/services/user-service";
import {inject, injectable} from "inversify";


@injectable()
export class PartService {
  private partStore: PartStore;
  private userService: UserService;
  private log = Logger.getNew(PartService.name);
  
  constructor(
    @inject(TYPES.PartStore) partStore: PartStore,
    @inject(TYPES.UserService) userService: UserService,
  ) {
    this.partStore = partStore;
    this.userService = userService;
  }
  
  public getCurrentPart(piece: MusicPiece): Part | null {
    const user = store.getters.currentUser;
    if (user && piece) {
      // explicit "has"-check is needed, because otherwise it will return undefined instead of null
      if (user.parts.has(piece.id)) {
        return user.parts.get(piece.id);
      } else {
        this.log.debug("Current Part is not set yet for user and piece: ", JSON.stringify(user), JSON.stringify(piece));
        if (this.userService.getCurrentUser() !== null && this.userService.getCurrentUser()!.isDirigent) {
          this.log.debug("Auto-Return Part as Full-Score for Dirigent");
          this.setCurrentPart(fullScorePart, piece);
          return fullScorePart;
        } else {
          return null;
        }
      }
    } else {
      this.log.debug("Part info not available, because user and/or piece are missing ",
        JSON.stringify(user), JSON.stringify(piece));
      return null;
    }
  }
  
  public setCurrentPart(part: Part, piece: MusicPiece): void {
    const user = store.getters.currentUser;
    if (user && piece) {
      this.userService.assignPartToUser(user, piece, part);
    } else {
      this.log.error("Could not set Part. Either User or Piece is not defined.");
    }
  }
  
  public getAllParts(): SinglePart[] {
    return this.partStore.getAllParts();
  }
  
  public getPartByName(name: string): Part | null {
    const part = this.getAllParts().filter((p) => p.name === name).pop();
    return part ? part : null;
  }
}
