import {MusicPiece} from "@/common/data-definitions/music-piece";
import router from "@/router";
import Vue from "vue";
import Toasted from "vue-toasted";

export {Toasted};
export const toasterOptions = {
  iconPack: "fontawesome",
  theme: "bubble",
  position: "top-right",
  duration: 3000,
  router,
} as ToastOptions;
const options = (icon: string, type: ToastType = "default") => {
  return {
    icon,
    type,
    ...toasterOptions,
  };
};

Vue.use(Toasted, toasterOptions);
const toasts = Vue.toasted as ToastRegisterer;

function usageExampleForCaro() {
  Toaster.displayError(new Error("Caro will immer eine Extrawurst!"));
  new Vue().$toasted.info("Diese Nachricht ist nur für Dich, Caro!!", {icon: "heart"});
}

// add toasts in alphabetic order please!!

interface Toaster {
  addUserSaveComplete(username: string): void;
  displayError(error: Error): void;
  loginSetCurrentUser(username: string): void;
  logout(): void;
  pieceChanged(piece: MusicPiece): void;
  settingsRecursiveRegisterError(): void;
  startupRestoredUser(username: string): void;
  startupRestoreUserFailed(username: string): void;
  annotationCreated(): void;
  annotationFailed(): void;
  noInstrumentsFound(): void;
}

toasts.register("addUserSaveComplete",
  (username: string) => "Willkommen " + username,
  options("user-check", "success"));

toasts.register("displayError",
  (error: Error) => "Fehler: " + error.message,
  options("exclamation-circle", "error"));

toasts.register("loginSetCurrentUser",
  (username: string) => "Hi " + username,
  options("user-circle", "info"));

toasts.register("logout",
  "Ausgeloggt!",
  options("user-circle", "info"));

toasts.register("pieceChanged",
  (piece: MusicPiece) => "Der Dirigent hat zu '" + piece.name + "' gewechselt.",
  options("info-circle", "info"));

toasts.register("settingsRecursiveRegisterError",
  "Rekursive Register sind nicht unterstützt.",
  options("exclamation-circle", "error"));

toasts.register("startupRestoredUser",
  (username: string) => "Willkommen zurück " + username,
  options("user-circle", "info"));

toasts.register("startupRestoreUserFailed",
  (username: string) => "Den Nutzer " + username + " gibt es nicht mehr!",
  options("exclamation-circle", "error"));

toasts.register("annotationCreated",
  () => "Die Anmerkung wurde erfolgreich erstellt!",
  options("check-circle", "success"));

toasts.register("annotationFailed",
  () => "Fehler: Die Anmerkung konnte nicht erstellt werden, da Infos fehlen!",
  options("exclamation-circle", "error"));

toasts.register("noInstrumentsFound",
  () => "Keine Stimmen für deine Instrumente gefunden, alle werden angezeigt.",
  options("info-circle", "info"));


export const Toaster: Toaster = (Vue.toasted as any).global;
