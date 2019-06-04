import {MusicPiece} from "@/common/data-definitions/music-piece";
import {Part} from "@/common/data-definitions/part";
import {XmlUtil} from "@/common/xml-util";
import {MusicPieceService} from "@/services/music-piece-service";
import {PartService} from "@/services/part-service";
import {UserService} from "@/services/user-service";
import {TYPES} from "@/inversify-types";
import {inject, injectable} from "inversify";
import {Logger} from "@/common/logging";

@injectable()
export class RenderingService {
  
  private static getVerovioOption(screenSetting: ScreenSetting) {
    return {
      // Use full screen size for displaying
      pageHeight: Math.floor(screenSetting.height * 100 / screenSetting.zoomLevel),
      pageWidth: Math.floor(screenSetting.width * 100 / screenSetting.zoomLevel),
      pageMarginTop: Math.floor(35 * 100 / screenSetting.zoomLevel),
      scale: screenSetting.zoomLevel,
      noFooter: true,
      adjustPageHeight: false, // false is default, true is often used by examples but we want false
    };
  }
  
  private log = Logger.getNew(RenderingService.name);
  private readonly vrvToolkit: any;
  private musicPieceService: MusicPieceService;
  
  
  constructor(
    @inject(TYPES.MusicPieceService) musicPieceService: MusicPieceService,
    @inject(TYPES.UserService) userService: UserService,
  ) {
    this.musicPieceService = musicPieceService;
    // @ts-ignore
    this.vrvToolkit = vrvToolkit;
    if (this.vrvToolkit === null) {
      // noinspection JSPotentiallyInvalidConstructorUsage
      this.vrvToolkit = new (require("verovio-dev") as any).toolkit();
      this.log.info("Verovio WITHOUT WebAssembly-Support loaded. Verovio Version: " + this.vrvToolkit.getVersion());
    }
  }
  
  public getSvg(page: number): string {
    return this.vrvToolkit.renderToSVG(page, {});
  }
  
  public getPageOfId(elementId: string) {
    return this.vrvToolkit.getPageWithElement(elementId);
  }
  
  // returns Promise of page count
  public async initPiece(screenSetting: ScreenSetting, musicPiece: MusicPiece, part: Part): Promise<number> {
    const tStartXml = performance.now();
    const meiXml: string = XmlUtil.serializeDocumentToString(
      await this.musicPieceService.getXmlForMusicPiece(musicPiece, part));
    const tFinishedXml = performance.now();
    
    const tStartVrv = performance.now();
    this.vrvToolkit.setOptions(RenderingService.getVerovioOption(screenSetting));
    this.vrvToolkit.loadData(meiXml);
    const pageCount = this.vrvToolkit.getPageCount();
    const tFinishedVrv = performance.now();
    this.log.info("Time to get Mei-XML: " + (tFinishedXml - tStartXml) +
                  "ms | Time to do layout: " + (tFinishedVrv - tStartVrv) + "ms");
    return Number(pageCount);
  }
}


export interface ScreenSetting {
  width: number;
  height: number;
  zoomLevel: number;
}
