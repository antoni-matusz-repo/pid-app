import type { Equipment, Instrument } from "../types";

const STROKE = "#cbd5e1";
const ACTIVE = "#38e1c6";

// Symbol aparatu w stylu ISA. Rysowany względem (0,0), pozycjonowany
// przez transform w komponencie nadrzędnym.
export function EquipmentSymbol({ eq, active }: { eq: Equipment; active: boolean }) {
  const s = active ? ACTIVE : STROKE;
  const sw = active ? 2.4 : 1.8;
  const common = { fill: "none", stroke: s, strokeWidth: sw } as const;

  switch (eq.kind) {
    case "tank":
      return (
        <g>
          <rect x={-30} y={-40} width={60} height={80} rx={8} {...common} fill="#0f2942" />
          <line x1={-30} y1={-20} x2={30} y2={-20} stroke={s} strokeWidth={1} opacity={0.5} />
        </g>
      );
    case "pump":
      return (
        <g>
          <circle r={22} {...common} fill="#0f2942" />
          <path d="M -22 0 L 14 -14 L 14 14 Z" fill={s} opacity={0.85} />
        </g>
      );
    case "exchanger":
      return (
        <g>
          <circle r={24} {...common} fill="#0f2942" />
          <path d="M -24 0 L -8 0 L -4 -12 L 4 12 L 8 0 L 24 0" {...common} />
        </g>
      );
    case "vessel":
      return (
        <g>
          <path
            d="M -22 -35 a22 22 0 0 1 44 0 L 22 35 a22 22 0 0 1 -44 0 Z"
            {...common}
            fill="#0f2942"
          />
        </g>
      );
    case "valve":
      return (
        <g>
          <path d="M -18 -14 L 0 0 L -18 14 Z" fill="#0f2942" stroke={s} strokeWidth={sw} />
          <path d="M 18 -14 L 0 0 L 18 14 Z" fill="#0f2942" stroke={s} strokeWidth={sw} />
          <line x1={0} y1={0} x2={0} y2={-24} stroke={s} strokeWidth={sw} />
          <rect x={-10} y={-32} width={20} height={8} fill={s} />
        </g>
      );
  }
}

// Kółko przyrządu (ISA bubble). Pozioma linia = przyrząd na tablicy;
// tutaj wszystkie polowe, więc pełne kółko z tagiem.
export function InstrumentSymbol({
  inst,
  active,
}: {
  inst: Instrument;
  active: boolean;
}) {
  const s = active ? ACTIVE : STROKE;
  return (
    <g>
      <circle r={16} fill="#0b1f33" stroke={s} strokeWidth={active ? 2.4 : 1.6} />
      <line x1={-16} y1={0} x2={16} y2={0} stroke={s} strokeWidth={0.8} opacity={0.6} />
      <text y={-4} textAnchor="middle" fontSize={8} fill={s} fontFamily="monospace">
        {inst.kind}
      </text>
      <text y={9} textAnchor="middle" fontSize={8} fill={s} fontFamily="monospace">
        {inst.id.split("-")[1]}
      </text>
    </g>
  );
}
