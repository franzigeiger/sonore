import * as log from "loglevel";

type Level = "trace" | "debug" | "info" | "warn" | "error" | "silent";

/**
 * works as wrapper around the logging library
 */
export class Logger {
  public static getNew(name?: string): Logger {
    return new Logger(name);
  }
  
  private logger!: log.Logger;
  private disabled: boolean = false;
  private name: string;
  
  private constructor(name?: string) {
    this.name = name === undefined ? "sonore" : name;
    this.logger = log.getLogger(this.name);
    this.setLevel("info");
  }
  
  public log(...msg: any): void {
    this.info(...msg);
  }
  
  public info(...msg: any): void {
    this.internalLog(this.logger.info, ...msg);
  }
  
  public debug(...msg: any): void {
    this.internalLog(this.logger.debug, ...msg);
  }
  
  public error(...msg: any): void {
    this.internalLog(this.logger.error, ...msg);
  }
  
  public trace(...msg: any): void {
    this.internalLog(this.logger.trace, ...msg);
  }
  
  public warn(...msg: any): void {
    this.internalLog(this.logger.warn, ...msg);
  }
  
  public setLevel(level: Level): void {
    this.logger.setLevel(level);
  }
  
  /**
   * Disables logging until restore() is called
   */
  public disable(): void {
    this.disabled = true;
  }
  
  public restore(): void {
    this.disabled = false;
  }
  
  private internalLog(fn: (msg: string) => void, ...msg: any): void {
    if (this.disabled) {
      return;
    }
    
    msg = msg.reverse();
    
    let output = this.name + ": ";
    while (msg.length > 0) {
      let tmp: string;
      
      if (typeof msg[msg.length - 1] === "string") {
        tmp = msg.pop() as string;
        while (tmp.includes("{}") && msg.length > 0) {
          tmp = tmp.replace("{}", JSON.stringify(msg.pop()));
        }
      } else {
        tmp = JSON.stringify(msg.pop());
      }
      
      output = output + tmp;
    }
    
    fn(output);
  }
}
