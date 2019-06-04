import {MusicPiece} from "@/common/data-definitions/music-piece";
import {Note, PitchName} from "@/common/data-definitions/note";
import {Part} from "@/common/data-definitions/part";
import {TYPES} from "@/inversify-types";
import {MusicPieceService} from "@/services/music-piece-service";
import {serviceContainer} from "@/services/service-container";


export async function printMeiElements(xmlIds: string[], musicPiece: MusicPiece, part: Part)
  : Promise<XmlIdToPrintName[]> {
  const musicPieceService: MusicPieceService = serviceContainer.get<MusicPieceService>(TYPES.MusicPieceService);
  const attributeMaps = await musicPieceService.getMeiAttributesFromIds(xmlIds, musicPiece, part);
  
  return attributeMaps.map((attributeMap: NamedNodeMap, index: number) => {
    if (xmlIds[index].includes("measure")) {
      return {id: xmlIds[index], displayName: "Takt: " + attributeMap.getNamedItem("n")!.value};
      
    } else if (xmlIds[index].includes("staff")) {
      return {id: xmlIds[index], displayName: "Stimme: " + attributeMap.getNamedItem("n")!.value};
      
    } else if (xmlIds[index].includes("note")) {
      const note = Note.getNewFromMeiAttributes(xmlIds[index], attributeMap);
      return {id: xmlIds[index], displayName: note.displayName};
      
    } else {
      return {id: xmlIds[index], displayName: "Ausgabe für " + xmlIds[index] + " nicht implementiert"};
    }
  });
  
}

export interface XmlIdToPrintName {
  id: string;
  displayName: string;
}
