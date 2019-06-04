import {MusicPiece} from "@/common/data-definitions/music-piece";
import {Connection} from "@/common/connection/connection";
import {MeasureId} from "@/common/svg-util";
import {updateIfChanged} from "@/common/util";
import {TYPES} from "@/inversify-types";
import {serviceContainer} from "@/services/service-container";
import {Logger} from "@/common/logging";
import {UserService} from "@/services/user-service";
import {BehaviorSubject} from "rxjs";
import {Module, Mutation, VuexModule} from "vuex-module-decorators";

@Module
export default class LiveState extends VuexModule {
  private piece = new BehaviorSubject<MusicPiece | null>(null);
  private locationInPiece = new BehaviorSubject<MeasureId | null>(null);
  private connection = serviceContainer.get<Connection>(TYPES.Connection);
  private log = Logger.getNew("LiveState");
  
  
  public get livePiece(): BehaviorSubject<MusicPiece | null> {
    return this.piece;
  }
  
  public get liveLocation(): BehaviorSubject<MeasureId | null> {
    return this.locationInPiece;
  }
  
  // called from connection service via registered callback in store.ts
  @Mutation
  public setLiveStateFromRemote(content: any) {
    this.log.info("Received live state update from remote", content);
    updateIfChanged(this.piece, content.piece, (p1, p2) => p1.id === p2.id);
    updateIfChanged(this.locationInPiece, content.locationInPiece, (l1, l2) => l1 === l2);
  }
  
  @Mutation
  public updateLivePiece(piece: MusicPiece): void {
    const user = serviceContainer.get<UserService>(TYPES.UserService).getCurrentUser();
    if (user && user.isDirigent) {
      const lastPiece = this.piece.getValue();
      if (!lastPiece || lastPiece.id !== piece.id) {
        this.log.info("Live piece has changed, we send updates!");
        this.piece.next(piece);
        // broadcast changes
        this.connection.sendMessage("LIVE", {piece, locationInPiece: null});
      }
    }
  }
  
  @Mutation
  public updateLiveLocation(measureId: MeasureId) {
    const user = serviceContainer.get<UserService>(TYPES.UserService).getCurrentUser();
    if (user && user.isDirigent) {
      this.log.info("Live location has changed, we send updates!");
      this.locationInPiece.next(measureId);
      this.connection.sendMessage("LIVE", {piece: this.piece.getValue(), locationInPiece: measureId});
    }
  }
}
