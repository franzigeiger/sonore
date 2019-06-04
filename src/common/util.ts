import {Logger} from "@/common/logging";
import {BehaviorSubject} from "rxjs";

const log = Logger.getNew("util");

// taken from https://stackoverflow.com/a/26502275
export function newGuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    // tslint:disable:no-bitwise
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : (r & 0x3 | 0x8);
    // tslint:enable:no-bitwise
    return v.toString(16);
  });
}


export function fetchLocal(url: string): Promise<Response> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      // Search if output was regular index.html, then it's invalid url
      if (xhr.responseText.includes("<!DOCTYPE html>")) {
        reject(new TypeError("Request failed for url \"" + url + "\""));
      } else {
        resolve(new Response(xhr.responseText, {status: xhr.status}));
      }
    };
    xhr.onerror = () => {
      reject(new TypeError("Request failed for url \"" + url + "\""));
    };
    xhr.open("GET", url);
    xhr.send(null);
  });
}

// tslint:disable-next-line:variable-name
export function ifNullOrElse<T, R>(t: T | null | undefined, _then: (t: T) => R, _else: R): R {
  return t ? _then(t) : _else;
}

export function updateIfChanged<T>(observable: BehaviorSubject<T | null>, t: T, eq: (t1: T, t2: T) => boolean) {
  const current = observable.getValue();
  if (!current || !eq(current, t)) {
    observable.next(t);
  }
}
