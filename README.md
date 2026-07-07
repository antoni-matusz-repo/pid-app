# Interaktywny P&ID — React + D3.js + TypeScript

Mała, wektorowa (SVG) wizualizacja schematu Piping & Instrumentation Diagram.
Zoom/pan przez D3, tooltipy po najechaniu, symulowane API z odczytami „na żywo".

## Wymagania
- Node.js 18+ (sprawdź: `node -v`)

## Uruchomienie
```bash
npm install      # instalacja zależności (raz)
npm run dev      # tryb deweloperski → otwórz http://localhost:5173
```

Build produkcyjny (opcjonalnie):
```bash
npm run build    # tworzy folder dist/
npm run preview  # podgląd builda
```

## Co jest w środku
- **Wektory (SVG)** — cały diagram to `<svg>` z `viewBox`, więc zoom nie traci ostrości.
- **Zoom / pan** — `d3.zoom` (kółko myszy lub przyciski `+ − ⤢` na pasku narzędzi).
- **Hover** — najedź na aparat lub przyrząd → tooltip z tagiem, opisem i odczytem.
- **Symulowane API** (`src/api/mockApi.ts`):
  - `fetchPID()` — topologia diagramu (aparaty, przyrządy, linie),
  - `fetchReadings()` — odczyty procesowe zmienne w czasie, odpytywane co 1,5 s.
- **Panel statusu** — lista odczytów z sygnalizacją OK / WARN / ALARM.

## Struktura
```
src/
  api/mockApi.ts        # symulowane endpointy API
  components/
    Diagram.tsx         # główny <svg> + warstwa zoomu D3
    symbols.tsx         # symbole ISA (pompa, zawór, zbiornik, przyrząd…)
  hooks/useZoom.ts      # opakowanie d3.zoom
  types.ts              # model danych P&ID
  App.tsx               # ładowanie danych, pasek narzędzi, tooltip, panel
```

## Podmiana na prawdziwe API
W `App.tsx` wystarczy zamienić `fetchPID` / `fetchReadings` na `fetch("/api/…")`
zwracające ten sam kształt danych (patrz `src/types.ts`).
