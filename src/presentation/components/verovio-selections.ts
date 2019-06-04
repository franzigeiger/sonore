import {Logger} from "@/common/logging";
import store from "@/common/state/store";

export class SelectionHandler {
  
  private log = Logger.getNew(SelectionHandler.name);
  
  private hoveredElements: SVGElement[] = [];
  private chosenElements: SVGElement[] = [];
  private clickedElement: SVGElement | null = null;
  private endSelectionActive: boolean = false;
  private clickedEndElement: SVGElement | null = null;
  
  private readonly showModal: () => void;
  private readonly hideModal: () => void;
  
  constructor(showModal: () => void, hideModal: () => void) {
    this.showModal = showModal;
    this.hideModal = hideModal;
  }
  
  // Getter for Props() ------------------------------------------------------------------------------------------------
  public get pChosenElements(): SVGElement[] {
    return this.chosenElements;
  }
  
  public get pClickedElement(): SVGElement | null {
    return this.clickedElement;
  }
  
  public get pClickedEndElement(): SVGElement | null {
    return this.clickedEndElement;
  }
  
  // Public methods ----------------------------------------------------------------------------------------------------
  public setClickedElement(element: SVGElement) {
    if (element !== null) {
      this.resetPossibilities();
      this.resetHovering();
      addClassToSelector(".svg-output-display #" + element.id, "svg-clicked");
      this.log.info("SVG Element selected!", element.id);
      
      if (!this.endSelectionActive) {
        this.clickedElement = element;
      } else {
        this.clickedEndElement = element;
        this.endSelectionActive = false;
      }
    }
  }
  
  public handleSvgClick(mouseX: number, mouseY: number) {
    const clickedElements = getElementsUnderPointer(mouseX, mouseY);
    
    // check if something interesting was clicked
    if (clickedElements.length > 0) {
      if (!this.endSelectionActive) {
        this.resetAllSelections();
      } else {
        this.resetRangeEndSelection();
      }
      
      this.chosenElements = clickedElements;
      if (this.chosenElements.length === 1) {
        this.setClickedElement(this.chosenElements[0]);
      } else {
        this.showPossibilities();
      }
      
      this.showModal();
    }
  }
  
  public refreshHovering(mouseX: number, mouseY: number) {
    const newElementsHovered = getElementsUnderPointer(mouseX, mouseY);
    this.resetHovering();
    this.hoveredElements = newElementsHovered;
    // add new hovered classes
    for (const hoveredElement of this.hoveredElements) {
      addClassToSelector(".svg-output-display #" + hoveredElement.id, "svg-hovered");
    }
  }
  
  public startRangeEndSelection() {
    this.endSelectionActive = true;
    this.hideModal();
  }
  
  public closeModal() {
    // reset is done by modal closed callback
    this.hideModal();
  }
  
  public modalClosedHandler() {
    if (!this.endSelectionActive) {
      this.resetAllSelections();
      this.log.info("Reset Annotation and Screen Stack");
      store.commit("annotationReset");
    }
  }
  
  public updateHighlight(addHighlightId: string, removeHighlightId: string) {
    if (addHighlightId !== "") {
      addClassToSelector(".svg-output-display #" + addHighlightId, "svg-highlight");
    }
    if (removeHighlightId !== "") {
      removeClassFromSelector(".svg-output-display #" + removeHighlightId, "svg-highlight");
    }
  }
  
  // Private methods ---------------------------------------------------------------------------------------------------
  private resetHovering() {
    // remove all hovered classes
    for (const hoveredElement of this.hoveredElements) {
      removeClassFromSelector(".svg-output-display #" + hoveredElement.id, "svg-hovered");
    }
  }
  
  private resetAllSelections() {
    this.log.info("Reset SelectionHandler");
    this.resetPossibilities();
    this.resetHovering();
    this.resetMainSelection();
    this.resetRangeEndSelection();
    this.endSelectionActive = false;
  }
  
  private resetMainSelection() {
    if (this.clickedElement !== null) {
      removeClassFromSelector(".svg-output-display #" + this.clickedElement.id, "svg-clicked");
    }
    this.clickedElement = null;
  }
  
  private resetRangeEndSelection() {
    if (this.clickedEndElement !== null) {
      removeClassFromSelector(".svg-output-display #" + this.clickedEndElement.id, "svg-clicked");
    }
    this.clickedEndElement = null;
  }
  
  private showPossibilities() {
    addClassToSelector(".svg-output-display", "svg-output-display-grey");
    // fill chosen list items with different colors, css-class is based on numbers 1-8 with modulo
    for (let i = 0; i < this.chosenElements.length; i++) {
      addClassToSelector(".svg-output-display #" + this.chosenElements[i].id,
        "selection" + ((i % 8) + 1));
    }
  }
  
  private resetPossibilities() {
    removeClassFromSelector(".svg-output-display", "svg-output-display-grey");
    for (let i = 0; i < this.chosenElements.length; i++) {
      removeClassFromSelector(".svg-output-display #" + this.chosenElements[i].id,
        "selection" + ((i % 8) + 1));
    }
    this.chosenElements = [];
  }
}


// ---------------------------------------------------------------------------------------------------------------------
// Help functions - not exported
function getElementsUnderPointer(x: number, y: number) {
  const currentSelectionMode = store.getters.selectionMode;
  const clickedElements = new Set();
  document.elementsFromPoint(x, y).forEach((element: Element) => {
    // Bug in Chrome: svg-classes that contain use-elements are not recognized
    let searchElement: HTMLElement = element as HTMLElement;
    while (searchElement.parentElement !== null) {
      for (const mode of currentSelectionMode.selectableSvgClasses) {
        if (searchElement.classList.contains(mode)) {
          clickedElements.add(searchElement);
        }
      }
      searchElement = searchElement.parentElement;
    }
  });
  return Array.from(clickedElements);
}

function addClassToSelector(selector: string, className: string) {
  // use All+forEach, as in other view modes there could be multiple display elements
  document.querySelectorAll(selector).forEach((element) => {
    element.classList.add(className);
  });
}

function removeClassFromSelector(selector: string, className: string) {
  // use All+forEach, as in other view modes there could be multiple display elements
  document.querySelectorAll(selector).forEach((element) => {
    element.classList.remove(className);
  });
}
