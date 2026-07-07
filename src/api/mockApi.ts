import type { PIDData, LiveReading } from "../types";

// ─────────────────────────────────────────────────────────────
// SYMULOWANE API
// W realnej aplikacji tu byłoby fetch("/api/pid"). Poniżej zwracamy
// te same dane z opóźnieniem, żeby zasymulować żądanie sieciowe.
// ─────────────────────────────────────────────────────────────

const PID: PIDData = {
  meta: { title: "Instalacja separacji — schemat P&ID", drawing: "PID-001", rev: "B" },
  equipment: [
    { id: "T-101", kind: "tank",      label: "Zbiornik zasilający",  x: 80,  y: 200, service: "Surowiec / ropa" },
    { id: "P-101", kind: "pump",      label: "Pompa wirowa",         x: 280, y: 260, service: "Tłoczenie surowca" },
    { id: "FV-101", kind: "valve",    label: "Zawór regulacyjny",    x: 430, y: 200, service: "Regulacja przepływu" },
    { id: "E-101", kind: "exchanger", label: "Wymiennik ciepła",     x: 580, y: 200, service: "Podgrzew wstępny" },
    { id: "V-101", kind: "vessel",    label: "Separator",            x: 760, y: 190, service: "Rozdział faz" },
  ],
  instruments: [
    { id: "LT-101", kind: "LT", x: 80,  y: 120, attachedTo: "T-101",  variable: "Poziom",    unit: "%"   },
    { id: "FT-101", kind: "FT", x: 355, y: 130, attachedTo: "P-101",  variable: "Przepływ",  unit: "m³/h" },
    { id: "FIC-101", kind: "FIC", x: 430, y: 90, attachedTo: "FV-101", variable: "Regulacja przepływu", unit: "%" },
    { id: "TT-101", kind: "TT", x: 580, y: 120, attachedTo: "E-101",  variable: "Temperatura", unit: "°C" },
    { id: "PT-101", kind: "PT", x: 760, y: 110, attachedTo: "V-101",  variable: "Ciśnienie",  unit: "bar" },
  ],
  lines: [
    // Rurociągi procesowe (grube, ciągłe)
    { id: "L1", from: "T-101", to: "P-101",  type: "process", spec: '6"-CS-1001',
      points: [[140, 220], [280, 220], [280, 245]] },
    { id: "L2", from: "P-101", to: "FV-101", type: "process", spec: '4"-CS-1002',
      points: [[315, 260], [430, 260], [430, 235]] },
    { id: "L3", from: "FV-101", to: "E-101", type: "process", spec: '4"-CS-1003',
      points: [[465, 200], [540, 200]] },
    { id: "L4", from: "E-101", to: "V-101",  type: "process", spec: '4"-CS-1004',
      points: [[620, 200], [720, 200]] },
    // Linie sygnałowe (cienkie, przerywane) instrument → element
    { id: "S1", from: "FT-101", to: "FIC-101", type: "signal",
      points: [[355, 148], [355, 90], [412, 90]] },
    { id: "S2", from: "FIC-101", to: "FV-101", type: "signal",
      points: [[430, 108], [430, 165]] },
    { id: "S3", from: "LT-101", to: "T-101", type: "signal",
      points: [[80, 138], [80, 160]] },
    { id: "S4", from: "TT-101", to: "E-101", type: "signal",
      points: [[580, 138], [580, 165]] },
    { id: "S5", from: "PT-101", to: "V-101", type: "signal",
      points: [[760, 128], [760, 150]] },
  ],
};

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** GET /api/pid — topologia diagramu (dane statyczne). */
export async function fetchPID(): Promise<PIDData> {
  await delay(300); // symulacja latencji sieci
  return structuredClone(PID);
}

/** GET /api/readings — odczyty procesowe "na żywo" (zmienne w czasie). */
export async function fetchReadings(): Promise<LiveReading[]> {
  await delay(120);
  const jitter = (base: number, amp: number) => base + (Math.random() - 0.5) * amp;
  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

  const level = clamp(jitter(62, 8), 0, 100);
  const flow = clamp(jitter(48, 6), 0, 100);
  const temp = clamp(jitter(74, 5), 0, 200);
  const press = clamp(jitter(3.2, 0.6), 0, 10);

  const status = (v: number, warn: number, alarm: number): LiveReading["status"] =>
    v >= alarm ? "ALARM" : v >= warn ? "WARN" : "OK";

  return [
    { tag: "LT-101", value: +level.toFixed(1), unit: "%",   status: status(level, 80, 90) },
    { tag: "FT-101", value: +flow.toFixed(1),  unit: "m³/h", status: status(flow, 70, 85) },
    { tag: "FIC-101", value: +flow.toFixed(0), unit: "%",   status: "OK" },
    { tag: "TT-101", value: +temp.toFixed(1),  unit: "°C",  status: status(temp, 85, 95) },
    { tag: "PT-101", value: +press.toFixed(2), unit: "bar", status: status(press, 4, 5) },
  ];
}
