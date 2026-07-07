// Model danych P&ID zwracany przez (symulowane) API

export type EquipmentKind =
  | "tank"
  | "pump"
  | "exchanger"
  | "vessel"
  | "valve";

export type InstrumentKind = "FT" | "PT" | "TT" | "LT" | "FIC" | "PIC";

export interface Equipment {
  id: string;          // tag, np. "P-101"
  kind: EquipmentKind;
  label: string;       // nazwa opisowa
  x: number;           // pozycja we współrzędnych diagramu
  y: number;
  service: string;     // medium / opis procesowy
}

export interface Instrument {
  id: string;          // np. "FT-101"
  kind: InstrumentKind;
  x: number;
  y: number;
  attachedTo: string;  // id aparatu/linii
  variable: string;    // mierzona zmienna
  unit: string;
}

// Linia rurociągu lub sygnału. points = łamana we współrzędnych diagramu.
export interface Line {
  id: string;
  from: string;
  to: string;
  points: [number, number][];
  type: "process" | "signal"; // process = rurociąg, signal = linia sygnałowa
  spec?: string;              // np. '4"-CS-1001'
}

// Odczyty "na żywo" — osobny endpoint, odświeżany cyklicznie
export interface LiveReading {
  tag: string;
  value: number;
  unit: string;
  status: "OK" | "WARN" | "ALARM";
}

export interface PIDData {
  meta: { title: string; drawing: string; rev: string };
  equipment: Equipment[];
  instruments: Instrument[];
  lines: Line[];
}
