import {ScreenSetting} from "@/services/rendering-service";


export function calcPosition(mouseX: number, mouseY: number, elX: number, elY: number, screenSetting: ScreenSetting) {
  // offset of position where mouse pointed to
  const offset = 20;
  
  let resultX = 0;
  let resultY = 0;
  
  const xRange = screenSetting.width - elX;
  const yRange = screenSetting.height - elY;
  
  // X
  if (mouseX < screenSetting.width / 2) {
    if (mouseX < xRange) {
      resultX = (mouseX + offset) / xRange;
    } else {
      resultX = (mouseX - elX + offset) / xRange;
    }
  } else {
    resultX = (mouseX - elX - offset) / xRange;
  }
  
  // Y
  if (mouseY < screenSetting.height / 2) {
    if (mouseY < yRange) {
      resultY = (mouseY + offset) / yRange;
    } else {
      resultY = (mouseY - elY + offset) / yRange;
    }
  } else {
    resultY = (mouseY - elY - offset) / yRange;
  }
  
  return {x: resultX, y: resultY};
  
}
