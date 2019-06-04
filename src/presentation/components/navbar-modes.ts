export class NavbarMode {
  public variant: string;
  
  constructor(variant: string) {
    this.variant = variant;
  }
  
  get showMenu(): boolean {
    return true;
  }
  
  get showUsers(): boolean {
    return false;
  }
  
  get showSearchBar(): boolean {
    return true;
  }
  
  get showGoToOrchestraMode(): boolean {
    return true;
  }
  
  get showOrchestraModeToggle(): boolean {
    return false;
  }
  
  get showScoreNavigation(): boolean {
    return false;
  }
}

// use anonymous classes here for the sake of simplicity
/* tslint:disable:max-classes-per-file */

const pieceListNavbarMode = new NavbarMode("primary");

const scoreViewNavbarMode = new class extends NavbarMode {
  constructor() {
    super("secondary");
  }
  
  get showMenu() {
    return false;
  }
  
  get showUsers() {
    return true;
  }
  
  get showSearchBar(): boolean {
    return false;
  }
  
  get showGoToOrchestraMode(): boolean {
    return false;
  }
  
  get showOrchestraModeToggle(): boolean {
    return true;
  }
  
  get showScoreNavigation(): boolean {
    return true;
  }
}();

const settingsNavbarMode = new NavbarMode("secondary");

export {pieceListNavbarMode, scoreViewNavbarMode, settingsNavbarMode};
