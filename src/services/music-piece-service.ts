import {MusicPiece} from "@/common/data-definitions/music-piece";
import {Part} from "@/common/data-definitions/part";
import {FullScorePart} from "@/common/data-definitions/parts/full-score-part";
import {SinglePart} from "@/common/data-definitions/parts/single-part";
import {Logger} from "@/common/logging";
import {fetchLocal} from "@/common/util";
import {XmlUtil} from "@/common/xml-util";
import {MusicPieceStore} from "@/data/music-piece-store";
import {TYPES} from "@/inversify-types";
import {AnnotationService} from "@/services/annotation-service";
import {PartService} from "@/services/part-service";
import {RegisterService} from "@/services/register-service";
import {UserService} from "@/services/user-service";
import {Toaster} from "@/toaster";
import {inject, injectable} from "inversify";

@injectable()
export class MusicPieceService {
  private log: Logger = Logger.getNew(MusicPieceService.name);
  private meiCache: Map<string, XMLDocument>;
  private musicPieceStore: MusicPieceStore;
  private partService: PartService;
  private annotationService: AnnotationService;
  
  constructor(
    @inject(TYPES.MusicPieceStore) musicPieceStore: MusicPieceStore,
    @inject(TYPES.PartService) partService: PartService,
    @inject(TYPES.AnnotationService) annotationService: AnnotationService,
  ) {
    this.musicPieceStore = musicPieceStore;
    this.partService = partService;
    this.meiCache = new Map();
    this.annotationService = annotationService;
    
    for (const piece of this.getAllMusicPieces()) {
      // this is just a prefetch, no timing constraints
      // noinspection JSIgnoredPromiseFromCall
      this.loadMei(piece.xmlPath);
    }
  }
  
  public getAllMusicPieces(): MusicPiece[] {
    return this.musicPieceStore.getAllMusicPieces();
  }
  
  public async getPartsForMusicPiece(musicPiece: MusicPiece): Promise<Part[]> {
    const meiDoc = await this.getMei(musicPiece.xmlPath);
    return Array.from(XmlUtil.getPartsFromXml(meiDoc).keys()).map((partName) =>
      this.partService.getPartByName(partName) || new SinglePart(0, "Stimme nicht im Stück gefunden"));
  }
  
  public async getXmlForMusicPiece(piece: MusicPiece, part: Part): Promise<XMLDocument> {
    let meiDoc = await this.getMei(piece.xmlPath);
    // extract parts
    if (!(part instanceof FullScorePart)) {
      const parts: string[] | undefined = XmlUtil.getPartsFromXml(meiDoc).get(part!.name);
      if (parts) {
        meiDoc = XmlUtil.extractSinglePart(meiDoc, parts!);
      }
    }
    
    // annotate
    const annotationsForPiece = this.annotationService.getAllRevelantAnnotations(piece);
    meiDoc = XmlUtil.annotate(meiDoc, annotationsForPiece);
  
  
    return meiDoc;
  }
  
  public async getMeiAttributesFromIds(ids: string[], musicPiece: MusicPiece, part: Part)
    : Promise<NamedNodeMap[]> {
    const meiDoc = await this.getXmlForMusicPiece(musicPiece, part);
    return ids.map((id) => {
      return XmlUtil.getMeiAttributesOfId(meiDoc, id);
    });
  }
  
  
  private async getMei(xmlPath: string): Promise<XMLDocument> {
    if (this.meiCache.has(xmlPath)) {
      const cachedDoc = this.meiCache.get(xmlPath)!;
      return cachedDoc.cloneNode(true) as XMLDocument;
    } else {
      return await this.loadMei(xmlPath);
    }
  }
  
  private async loadMei(xmlPath: string): Promise<XMLDocument> {
    const fileUri = "pieces/" + xmlPath;
    const tStart = performance.now();
    return fetchLocal(fileUri).then(async (response: Response) => {
      this.log.info("Time to load MEI-Data: " + (performance.now() - tStart) + "ms");
      const mei = await response.text();
      const meiDoc = new DOMParser().parseFromString(mei, "text/xml");
      this.meiCache.set(xmlPath, meiDoc);
      return meiDoc;
    }, (error: TypeError) => {
      Toaster.displayError(error);
      return new XMLDocument();
    });
  }
}
