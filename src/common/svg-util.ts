export function getFirstAndLastMeasure(svg: string): MeasuresIds {
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svg, "image/svg+xml");

  const measures = svgDoc.querySelectorAll(".measure");
  if (measures.length > 0) {
    const firstMeasure = measures[0];
    const lastMeasure = measures[measures.length - 1];
    return { startId: firstMeasure.id, endId: lastMeasure.id};
  } else {
    return {} as MeasuresIds;
  }
  
}

export type MeasureId = string | null;

export interface MeasuresIds {
  startId: MeasureId;
  endId: MeasureId;
}
