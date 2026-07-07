import { useRef } from "react";
import type { PIDData, LiveReading, Equipment, Instrument } from "../types";
import { useZoom } from "../hooks/useZoom";
import { EquipmentSymbol, InstrumentSymbol } from "./symbols";

export type HoverItem =
  | { kind: "equipment"; data: Equipment }
  | { kind: "instrument"; data: Instrument };

interface Props {
  data: PIDData;
  readings: Record<string, LiveReading>;
  onHover: (item: HoverItem | null, e?: React.MouseEvent) => void;
  onControls: (c: { zoomIn: () => void; zoomOut: () => void; reset: () => void }) => void;
}

const STATUS_COLOR: Record<LiveReading["status"], string> = {
  OK: "#38e1c6",
  WARN: "#f5b942",
  ALARM: "#ff5d5d",
};

export default function Diagram({ data, readings, onHover, onControls }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const hoveredRef = useRef<string | null>(null);
  const { transform, zoomIn, zoomOut, reset } = useZoom(svgRef);

  // przekazujemy sterowanie zoomem do paska narzędzi w App
  onControls({ zoomIn, zoomOut, reset });

  const isActive = (id: string) => hoveredRef.current === id;

  return (
    <svg
      ref={svgRef}
      className="pid-svg"
      // brak width/height w px → skala wektorowa, ostrość zachowana
      viewBox="0 0 860 380"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <pattern id="grid" width={20} height={20} patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#173049" strokeWidth={0.6} />
        </pattern>
        <marker id="arrow" markerWidth={8} markerHeight={8} refX={6} refY={3}
          orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L6,3 L0,6 Z" fill="#7dd3fc" />
        </marker>
      </defs>

      <rect x={0} y={0} width={860} height={380} fill="url(#grid)" />

      <g transform={transform.toString()}>
        {/* Linie: najpierw rurociągi, potem sygnały */}
        {data.lines.map((l) => (
          <polyline
            key={l.id}
            points={l.points.map((p) => p.join(",")).join(" ")}
            fill="none"
            stroke={l.type === "process" ? "#7dd3fc" : "#8aa0b6"}
            strokeWidth={l.type === "process" ? 2.4 : 1.2}
            strokeDasharray={l.type === "signal" ? "5 4" : undefined}
            markerEnd={l.type === "process" ? "url(#arrow)" : undefined}
          />
        ))}

        {/* Aparaty */}
        {data.equipment.map((eq) => (
          <g
            key={eq.id}
            transform={`translate(${eq.x},${eq.y})`}
            style={{ cursor: "pointer" }}
            onMouseEnter={(e) => {
              hoveredRef.current = eq.id;
              onHover({ kind: "equipment", data: eq }, e);
            }}
            onMouseMove={(e) => onHover({ kind: "equipment", data: eq }, e)}
            onMouseLeave={() => {
              hoveredRef.current = null;
              onHover(null);
            }}
          >
            <EquipmentSymbol eq={eq} active={isActive(eq.id)} />
            <text y={54} textAnchor="middle" fontSize={11} fontFamily="monospace"
              fill="#e2e8f0" fontWeight={600}>
              {eq.id}
            </text>
          </g>
        ))}

        {/* Przyrządy + odczyt na żywo */}
        {data.instruments.map((inst) => {
          const r = readings[inst.id];
          return (
            <g
              key={inst.id}
              transform={`translate(${inst.x},${inst.y})`}
              style={{ cursor: "pointer" }}
              onMouseEnter={(e) => {
                hoveredRef.current = inst.id;
                onHover({ kind: "instrument", data: inst }, e);
              }}
              onMouseMove={(e) => onHover({ kind: "instrument", data: inst }, e)}
              onMouseLeave={() => {
                hoveredRef.current = null;
                onHover(null);
              }}
            >
              <InstrumentSymbol inst={inst} active={isActive(inst.id)} />
              {r && (
                <text x={22} y={4} fontSize={10} fontFamily="monospace"
                  fill={STATUS_COLOR[r.status]}>
                  {r.value} {r.unit}
                </text>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}
