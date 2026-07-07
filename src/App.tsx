import { useEffect, useRef, useState } from "react";
import type { PIDData, LiveReading } from "./types";
import { fetchPID, fetchReadings } from "./api/mockApi";
import Diagram, { type HoverItem } from "./components/Diagram";

export default function App() {
  const [data, setData] = useState<PIDData | null>(null);
  const [readings, setReadings] = useState<Record<string, LiveReading>>({});
  const [hover, setHover] = useState<{ item: HoverItem; x: number; y: number } | null>(null);
  const controls = useRef<{ zoomIn: () => void; zoomOut: () => void; reset: () => void }>();

  // 1) pobierz topologię diagramu z (symulowanego) API
  useEffect(() => {
    fetchPID().then(setData);
  }, []);

  // 2) odpytuj odczyty "na żywo" co 1,5 s
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      const list = await fetchReadings();
      if (!alive) return;
      setReadings(Object.fromEntries(list.map((r) => [r.tag, r])));
    };
    tick();
    const id = setInterval(tick, 1500);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const onHover = (item: HoverItem | null, e?: React.MouseEvent) => {
    if (!item || !e) return setHover(null);
    setHover({ item, x: e.clientX, y: e.clientY });
  };

  if (!data) return <div className="loading">Ładowanie diagramu z API…</div>;

  const alarms = Object.values(readings).filter((r) => r.status !== "OK");

  return (
    <div className="app">
      <header className="titlebar">
        <div>
          <span className="eyebrow">{data.meta.drawing} · REV {data.meta.rev}</span>
          <h1>{data.meta.title}</h1>
        </div>
        <div className="toolbar">
          <button onClick={() => controls.current?.zoomIn()} title="Przybliż">+</button>
          <button onClick={() => controls.current?.zoomOut()} title="Oddal">−</button>
          <button onClick={() => controls.current?.reset()} title="Wyśrodkuj">⤢</button>
        </div>
      </header>

      <div className="canvas">
        <Diagram
          data={data}
          readings={readings}
          onHover={onHover}
          onControls={(c) => (controls.current = c)}
        />

        {/* Legenda */}
        <div className="legend">
          <div><span className="ln process" /> Rurociąg procesowy</div>
          <div><span className="ln signal" /> Linia sygnałowa</div>
          <div className="hint">Kółko myszy = zoom · przeciągnij = przesuń</div>
        </div>

        {/* Panel statusu odczytów */}
        <div className="status">
          <div className="status-head">
            Odczyty na żywo
            <span className={alarms.length ? "dot alarm" : "dot ok"} />
          </div>
          {Object.values(readings).map((r) => (
            <div key={r.tag} className="row">
              <span className="tag">{r.tag}</span>
              <span className="val">{r.value} {r.unit}</span>
              <span className={`badge ${r.status.toLowerCase()}`}>{r.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip przy najechaniu */}
      {hover && (
        <div className="tooltip" style={{ left: hover.x + 14, top: hover.y + 14 }}>
          {hover.item.kind === "equipment" ? (
            <>
              <div className="tt-tag">{hover.item.data.id}</div>
              <div className="tt-name">{hover.item.data.label}</div>
              <div className="tt-line">Medium: {hover.item.data.service}</div>
              <div className="tt-line">Typ: {hover.item.data.kind}</div>
            </>
          ) : (
            <>
              <div className="tt-tag">{hover.item.data.id}</div>
              <div className="tt-name">{hover.item.data.variable}</div>
              <div className="tt-line">Podłączony do: {hover.item.data.attachedTo}</div>
              {readings[hover.item.data.id] && (
                <div className="tt-line">
                  Odczyt: {readings[hover.item.data.id].value}{" "}
                  {readings[hover.item.data.id].unit} ·{" "}
                  {readings[hover.item.data.id].status}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
