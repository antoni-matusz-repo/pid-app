import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

/**
 * Podpina zachowanie d3.zoom pod element <svg> i zwraca aktualną
 * transformację (do zastosowania na warstwie <g>) oraz sterowanie
 * przyciskami (zoom in/out/reset). Zoom jest wektorowy — skalujemy
 * układ współrzędnych SVG, więc nic nie traci ostrości.
 */
export function useZoom(svgRef: React.RefObject<SVGSVGElement>) {
  const [transform, setTransform] = useState(d3.zoomIdentity);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown>>();

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.4, 6]) // min/max przybliżenie
      .on("zoom", (event) => setTransform(event.transform));

    svg.call(zoom);
    zoomRef.current = zoom;

    return () => {
      svg.on(".zoom", null);
    };
  }, [svgRef]);

  const scaleBy = (k: number) => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current).transition().duration(200).call(zoomRef.current.scaleBy, k);
  };

  const reset = () => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(300)
      .call(zoomRef.current.transform, d3.zoomIdentity);
  };

  return {
    transform,
    zoomIn: () => scaleBy(1.3),
    zoomOut: () => scaleBy(1 / 1.3),
    reset,
  };
}
