export interface AircraftState {
  icao24: string;
  callsign: string | null;
  originCountry: string;
  longitude: number | null;
  latitude: number | null;
  baroAltitude: number | null; // meters
  onGround: boolean;
  velocity: number | null;     // m/s
  trueTrack: number | null;    // degrees (0=N, 90=E)
  verticalRate: number | null; // m/s (positive = climbing)
  squawk: string | null;
}

export interface AviationData {
  timestamp: number;
  totalCount: number;
  inFlightCount: number;
  groundCount: number;
  nearHormuzCount: number;  // aircraft within ~280km of Strait of Hormuz
  aircraft: AircraftState[];
}
