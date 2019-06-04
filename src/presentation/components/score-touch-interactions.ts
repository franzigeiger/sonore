class TouchState {
  private pos: [number, number] = [0, 0];
  private scale: number = 1;
  private lastPos: [number, number] = [0, 0];
  private lastScale: number = 1;
  private el: HTMLElement;
  
  constructor(el: HTMLElement) {
    this.el = el;
  }
  
  get isZoomed(): boolean {
    return this.scale !== 1;
  }
  
  get maxPos(): [number, number] {
    return [Math.ceil((this.scale - 1) * this.el.clientWidth / 2),
            Math.ceil((this.scale - 1) * this.el.clientHeight / 2)];
  }
  
  public reset() {
    this.pos = [0, 0];
    this.lastPos = [0, 0];
    this.scale = 1;
    this.lastScale = 1;
  }
  
  public setPanDelta(deltaX: number, deltaY: number) {
    this.pos[0] = this.lastPos[0] + deltaX;
    this.pos[1] = this.lastPos[1] + deltaY;
    
    // check min and max values
    const maxPos = this.maxPos;
    if (this.pos[0] > maxPos[0]) {
      this.pos[0] = maxPos[0];
    }
    if (this.pos[0] < -maxPos[0]) {
      this.pos[0] = -maxPos[0];
    }
    if (this.pos[1] > maxPos[1]) {
      this.pos[1] = maxPos[1];
    }
    if (this.pos[1] < -maxPos[1]) {
      this.pos[1] = -maxPos[1];
    }
  }
  
  public setPinchScale(eventScale: number) {
    this.scale = Math.max(1, Math.min(this.lastScale * (eventScale), 3));
  }
  
  public setCssTransformToElement() {
    this.el.style.transform = "translate3d(" + this.pos[0] + "px," + this.pos[1] + "px, 0) " +
                              "scale3d(" + this.scale + ", " + this.scale + ", 1)";
  }
  
  public setPanned() {
    const maxPos = this.maxPos;
    this.lastPos[0] = this.pos[0] < maxPos[0] ? this.pos[0] : maxPos[0];
    this.lastPos[1] = this.pos[1] < maxPos[1] ? this.pos[1] : maxPos[1];
  }
  
  public setPinched() {
    this.lastScale = this.scale;
  }
}


export function hammerIt(el: HTMLElement,
                         onSwipeLeft: () => void, onSwipeRight: () => void) {
  
  const touchState: TouchState = new TouchState(el);
  
  const mc = new Hammer(el);
  mc.get("pinch").set({
    enable: true,
  });
  
  mc.on("doubletap ", () => {
    touchState.reset();
    touchState.setCssTransformToElement();
  });
  
  mc.on("swipe", (ev) => {
    if (!touchState.isZoomed) {
      if (ev.direction === 2) {
        onSwipeLeft();
      }
      if (ev.direction === 4) {
        onSwipeRight();
      }
    }
  });
  
  mc.on("pan pinch panend pinchend", (ev) => {
    // pan - handle always
    touchState.setPanDelta(ev.deltaX, ev.deltaY);
    if (ev.type === "pinch") {
      touchState.setPinchScale(ev.scale);
    }
    if (ev.type === "pinchend") {
      touchState.setPinched();
    }
    if (ev.type === "panend") {
      touchState.setPanned();
    }
    touchState.setCssTransformToElement();
  });
}
