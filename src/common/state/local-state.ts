import {MusicPiece} from "@/common/data-definitions/music-piece";
import {User} from "@/common/data-definitions/user";
import {Connection} from "@/common/connection/connection";
import {TYPES} from "@/inversify-types";
import {serviceContainer} from "@/services/service-container";
import {Module, Mutation, VuexModule} from "vuex-module-decorators";

@Module
export default class LocalState extends VuexModule {
  
  public mCurrentUser: User | null = null;
  public mLocalMusicPiece: MusicPiece | null = null;
  
  public get localMusicPiece(): MusicPiece | null {
    return this.mLocalMusicPiece;
  }
  
  public get currentUser(): User | null {
    return this.mCurrentUser;
  }
  
  @Mutation
  public setCurrentUser(user: User | null): void {
    this.mCurrentUser = user;
    if (this.mCurrentUser != null) {
      serviceContainer.get<Connection>(TYPES.Connection).setCurrentUser(this.mCurrentUser);
    }
  }
  
  @Mutation
  public setLocalMusicPiece(localMusicPiece: MusicPiece): void {
    this.mLocalMusicPiece = localMusicPiece;
  }
}
