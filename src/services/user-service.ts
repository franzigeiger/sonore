import {MusicPiece} from "@/common/data-definitions/music-piece";
import {Part} from "@/common/data-definitions/part";
import {inject, injectable} from "inversify";
import {TYPES} from "@/inversify-types";
import {UserStore} from "@/data/user-store";
import {User} from "@/common/data-definitions/user";
import {Logger} from "@/common/logging";
import store from "@/common/state/store";

@injectable()
export class UserService {
  private userStore: UserStore;
  private log = Logger.getNew(UserService.name);
  
  constructor(
    @inject(TYPES.UserStore) userStore: UserStore,
  ) {
    this.userStore = userStore;
  }
  
  public getUserFromBrowser(errorCallback: (savedUserName: string) => void,
                            successCallback: (savedUser: User | undefined) => void) {
    // if there is a user saved in browser, but not set in Vue yet
    const savedUserName = window.localStorage.getItem("username");
    if (savedUserName !== null) {
      const user = this.getUserForName(savedUserName);
      if (user === undefined) {
        this.log.error("user found in browser but does not exist in user-store");
        window.localStorage.removeItem("username");
        errorCallback(savedUserName);
      } else {
        successCallback(user);
      }
    } else {
      // no user was saved in browser
      successCallback(undefined);
    }
  }
  
  public getCurrentUser(): User | null {
    return store.getters.currentUser;
  }
  
  public setCurrentUser(user: User) {
    this.log.info("set current user commit requested: " + user.name);
    store.commit("setCurrentUser", user);
    window.localStorage.setItem("username", user.name);
  }
  
  public logoutUser() {
    store.commit("setCurrentUser", null);
    window.localStorage.removeItem("username");
  }
  
  public getAllUsers(): User[] {
    return this.userStore.getAllUsers();
  }
  
  public getUserForName(name: string): User | undefined {
    return this.userStore.getUserForName(name);
  }
  
  public addUser(newUser: User) {
    this.userStore.addUser(newUser);
    this.log.info("Added new currentUser " + newUser.name);
  }
  
  public nameStillFree(name: string): boolean {
    return this.userStore.getUserForName(name) === undefined;
  }
  
  public assignPartToUser(user: User, musicPiece: MusicPiece, part: Part) {
    this.userStore.assignUserPartToUser(user, musicPiece, part);
  }
  
  public registerUserChangedCallback(callback: () => void) {
    this.userStore.registerCallback(callback);
  }
  
  public unregisterUserChangedCallback() {
    this.userStore.unRegisterCallback();
  }
}
