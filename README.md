# Smart Mobility Roma

A Progressive Web Application (PWA) that displays micro-mobility vehicles (scooters and bicycles from sharing operators) and public bus stops with real-time arrival times on an interactive map. The application is focused on Rome, Italy.

## Features

- Real-time positions of shared scooters and bicycles from multiple operators (Dott, Lime, Bird) via the GBFS protocol
- Bus stop locations with real-time and scheduled arrival times
- Filter vehicles by minimum battery charge and minimum riding range
- Mark preferred bus stops and find the nearest stops to your current position
- GPS tracking with optional auto-follow mode
- Light and dark map themes
- Fully offline-capable as a PWA (installable on mobile)
- Available in 7 languages: English, Italian, French, German, Spanish, Japanese, Chinese

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Angular 21 (standalone components) |
| State Management | NgRx Store + Effects |
| Map Rendering | OpenLayers 10 with ol-mapbox-style |
| Map Tiles | OpenFreeMap (Positron / Dark) |
| UI Components | Angular Material 21 |
| Reactive Programming | RxJS 7 |
| Language | TypeScript 5.9 (strict mode) |
| Build System | Angular CLI 21 (`@angular/build:application`) |
| Testing | Vitest |
| i18n | Angular Localize |
| PWA | Angular Service Worker |

---

## Project Structure

```
src/
  app/
    actions/          # NgRx action definitions
    reducers/         # NgRx reducers and root store
    effects/          # NgRx side effects (API calls, GPS)
    services/         # Business logic and HTTP services
    components/       # UI components (each in own folder)
    model/            # TypeScript interfaces and types
    styles/           # SCSS theme files
    app.ts            # Root smart component
    app.config.ts     # Angular DI providers
  locale/             # i18n translation files (messages.*.json)
  main.ts             # Application bootstrap
public/
  manifest.webmanifest   # PWA manifest
  icons/                 # SVG icons for vehicles and operators
```

---

## Architecture

The application follows a unidirectional data flow with NgRx at the center.

```
User Interactions / Timers
        │
        ▼
  NgRx Actions dispatched
        │
        ▼
┌───────────────────────────┐
│       NgRx Effects        │
│  - HTTP calls to APIs     │
│  - GPS geolocation        │
│  - Error handling / retry │
└───────────────────────────┘
        │
        ▼
┌───────────────────────────┐
│       NgRx Reducers       │
│  - settings               │
│  - vehicles               │
│  - maps                   │
│  - buses                  │
└───────────────────────────┘
        │
        ▼
┌───────────────────────────┐
│   Meta-Reducer            │
│   (localStorage sync)     │
└───────────────────────────┘
        │
        ▼
  Components re-render via Signals and Selectors
```

### NgRx Store Slices

**`settings`**
- `minimumCharge` — minimum battery % to show a vehicle (default: 10%)
- `minimumDistance` — minimum estimated range in km (default: 3 km)
- `followGps` — auto-center map on GPS position
- `theme` — `'light'` | `'dark'`

**`vehicles`**
- `vehicles` — vehicles grouped by operator (`Record<SharingOperator, Vehicle[]>`)
- `vehiclesVisible` — per-operator visibility toggle
- `vehiclesError` — per-operator error flag
- `selectedVehicle` — currently tapped vehicle

**`maps`**
- `center` — current map center coordinate
- `zoom` — current zoom level
- `position` — GPS position coordinate
- `accuracy` — GPS accuracy in meters
- `vehicleTypesVisible` — show/hide bicycles and/or scooters
- `zoomToPositionTime` — timestamp that triggers animated zoom to GPS

**`buses`**
- `stop` — currently selected bus stop
- `preferredStops` — user's saved favourite stops
- `nearStops` — nearby stops from last search
- `arrivals` — wait times for the selected stop

### State Persistence

A meta-reducer intercepts every action and saves user preferences to `localStorage` under the key `micro-mobility-data`. On startup, the saved state is rehydrated into the store. Only user settings and preferred stops are persisted; real-time vehicle and arrival data are always re-fetched.

---

## Data Sources

### GBFS — Shared Vehicle Operators

The [General Bikeshare Feed Specification (GBFS)](https://gbfs.org/) is the standard protocol for real-time shared mobility data. The application fetches data from three Rome-based operators:

| Operator | GBFS Feed |
|---|---|
| Dott | `https://gbfs.api.ridedott.com/public/v2/rome/gbfs.json` |
| Bird | `https://mds.bird.co/gbfs/v2/public/rome/gbfs.json` |
| Lime | `https://data.lime.bike/api/partners/v2/gbfs/rome/gbfs.json` |

**Loading flow** (`GeneralBikeShareFeed` service):
1. Fetch the GBFS index file to discover feed URLs.
2. Extract the `free_bike_status` (real-time vehicle availability) and `vehicle_types` (vehicle metadata) URLs from the index.
3. Fetch both feeds in parallel using `forkJoin`.
4. Merge vehicle records with their type information and map them to the internal `Vehicle` model.
5. Data is automatically refreshed every 2 minutes while the app is visible.

**`Vehicle` model:**
```typescript
type Vehicle = {
  id: string;
  operator: SharingOperator;      // 'dott' | 'lime' | 'bird'
  vehicleType: VehicleType;        // 'bicycle' | 'scooter'
  percentageCharge: number;        // 0–100
  estimatedDistance: number;       // estimated range in km
  coordinates: Coordinate;         // OpenLayers map projection
  rentalUri: string | undefined;   // deep link to the operator's app
}
```

### GTFS Rome API — Bus Stops and Arrival Times

Bus data is served by a custom REST API (`https://gtfs-rome.homelinuxserver.org`) backed by GTFS data for Rome's public transport network.

| Endpoint | Purpose |
|---|---|
| `GET /api/gis/stops` | Full GeoJSON of all bus stop locations (used for the map layer) |
| `GET /api/wait-times/{stopId}` | Real-time and scheduled arrival times for a stop |
| `GET /api/gis/nearest-stops?lat={lat}&lon={lon}` | Nearest stops to a coordinate |

**`BusTimesInfo` model:**
```typescript
type BusTimesInfo = {
  routeIdentifier: string;        // bus line number/name
  directionDescription: string;   // destination/direction label
  corrected: boolean;             // true = real-time data, false = scheduled
  minutes: number;                // minutes until arrival
}
```

Arrival time requests use `retry(3)` to handle transient network failures.

---

## Map

The map is rendered by **OpenLayers 10** using **ol-mapbox-style** to apply Mapbox GL style specifications to vector tile layers served by OpenFreeMap.

### Layers (bottom to top)

1. **Background** — vector tile layer with Positron (light) or Dark style, switching based on theme.
2. **Bus stops** — GeoJSON layer, visible at zoom ≥ 16. Stops are styled as bus icons; preferred stops use a star icon. The selected stop is scaled up.
3. **Vehicles** — rendered per-operator with custom SVG icons at high zoom levels (showing a battery charge arc) or small colored circles at lower zoom levels. The selected vehicle is scaled up.
4. **GPS accuracy circle** — semi-transparent circle showing the GPS accuracy radius.
5. **GPS position marker** — blue dot at the current device position.

### Interactions

- **Tap vehicle** → dispatches `selectVehicle`, opens the vehicle detail bottom sheet.
- **Tap bus stop** → dispatches `selectStop`, triggers wait-time loading, opens the arrival times bottom sheet.
- **Pan / zoom** → dispatches `changeMapPosition`, saved to store (and persisted).
- **Follow GPS toggle** → when enabled, the map animates (500 ms) to center on GPS whenever the position updates.

---

## Components

All components are Angular standalone components.

| Component | Description |
|---|---|
| `AppComponent` | Root smart component. Orchestrates GPS polling (2.5 s interval), data reload (2 min interval), and bottom sheet visibility. |
| `IntegratedMapComponent` | Hosts the OpenLayers map instance, manages all map layers and interactions. |
| `VehicleDetailComponent` | Bottom sheet showing operator, vehicle type, charge, range, and a deep link to the rental app. |
| `BusWaitTimeComponent` | Bottom sheet showing real-time/scheduled arrival times for the selected stop. |
| `SettingsComponent` | Bottom sheet with sliders and toggles for user preferences. |
| `PreferredStopsComponent` | Bottom sheet listing the user's saved favourite bus stops. |
| `NearStopsComponent` | Bottom sheet showing the nearest bus stops to the current GPS position. |

---

## Services

| Service | Responsibility |
|---|---|
| `GeneralBikeShareFeed` | Fetches and parses GBFS feeds for all operators. |
| `BusStopTimes` | Fetches arrival times and nearest-stop queries from the GTFS API. |
| `BottomSheetState` | Centralized signal-based service that controls which bottom sheet is open. |
| `ThemeService` | Applies the selected theme by toggling a CSS class and `color-scheme` on the document body. |

---

## PWA Configuration

The app is fully installable as a Progressive Web App.

**Web App Manifest** (`public/manifest.webmanifest`):
- Name: "Smart Mobility Roma"
- Short name: "Smart Mobility"
- Display mode: standalone (no browser chrome)
- Theme / background color: `#fdbc05` (gold)

**Service Worker** (`ngsw-config.json`) — Angular's built-in service worker:
- **App bundle** (prefetch): `index.html`, JS/CSS bundles, manifest, and app icons are pre-cached on install.
- **Assets** (lazy + prefetch update): SVG, images, fonts, and JSON files are cached on first use and updated in the background on subsequent visits.

The service worker is registered only in production builds, with a 30-second stability delay (`registerWhenStable:30000`).

---

## Internationalization

The application is available in 7 locales. Translation files live in `src/locale/messages.{lang}.json`.

| Code | Language |
|---|---|
| `en` | English (source) |
| `it` | Italian |
| `fr` | French |
| `de` | German |
| `es` | Spanish |
| `ja` | Japanese |
| `zh` | Chinese |

Building with `ng build --localize` produces a separate deployment bundle per language.

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npm start
```

Navigate to `http://localhost:4200/`. The app reloads automatically on file changes.

### Build for production

```bash
npm run build
```

Produces optimized, localized bundles in `dist/`. The production build enables the service worker and full PWA support.

### Run tests

```bash
npm test
```

Tests run with [Vitest](https://vitest.dev/).

---

## Key Configuration Files

| File | Purpose |
|---|---|
| `angular.json` | Angular CLI project configuration (builders, locales, budgets) |
| `ngsw-config.json` | Service worker asset caching strategy |
| `public/manifest.webmanifest` | PWA install metadata |
| `src/app/model/model.ts` | All shared TypeScript types and operator constants |
| `src/app/reducers/index.ts` | NgRx root store definition and localStorage meta-reducer |
| `src/app/app.config.ts` | Angular dependency injection providers |
