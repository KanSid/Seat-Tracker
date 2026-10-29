"use client";

import { useEffect, useMemo, useState } from "react";

type SeatState = "available" | "occupied";
type SeatValue = SeatState | {
  state?: SeatState;
  status?: string;
  updatedAt?: number;
  distanceCm?: number;
  motion?: boolean;
} | null;
type SeatMap = Record<string, SeatValue>;
type FirebaseConfig = { apiKey: string; authDomain: string; databaseURL: string; projectId: string; appId: string };
type DashboardWindow = Window & { __SEAT_FIREBASE_CONFIG__?: FirebaseConfig };

const SEAT_IDS = ["seat-01", "seat-02", "seat-03"];
const seatNumber = (id: string) => id.slice(-2);
const databaseSeatId = (id: string) => {
  const number = Number(seatNumber(id));
  const mappedNumber = number === 1 ? 2 : number === 2 ? 1 : number;
  return `seat${mappedNumber}`;
};
const seatState = (value: SeatValue): SeatState | undefined => {
  const state = typeof value === "string" ? value : value?.state ?? value?.status;
  if (typeof state !== "string") return undefined;
  const normalizedState = state.toLowerCase();
  if (["available", "empty", "free"].includes(normalizedState)) return "available";
  if (["occupied", "in use", "in-use"].includes(normalizedState)) return "occupied";
  return undefined;
};
const seatUpdatedAt = (value: SeatValue) => typeof value === "object" && value ? value.updatedAt : undefined;
const seatReading = (value: SeatValue) => typeof value === "object" && value ? value : undefined;

export default function Home() {
  const [seats, setSeats] = useState<SeatMap>({});
  const [connection, setConnection] = useState("Connecting to Firebase…");
  const [connected, setConnected] = useState(false);
  const [configured, setConfigured] = useState(false);

  useEffect(() => {
    const config: FirebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://seat-dangercobras-default-rtdb.asia-southeast1.firebasedatabase.app",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
    };
    if (Object.values(config).some((value) => !value)) {
      setConnection("Firebase setup needed");
      return;
    }
    setConfigured(true);
    const onData = (event: Event) => setSeats((event as CustomEvent<SeatMap>).detail || {});
    const onConnection = (event: Event) => {
      const detail = (event as CustomEvent<{ connected: boolean; message: string }>).detail;
      setConnected(detail.connected);
      setConnection(detail.message);
    };
    window.addEventListener("seat-data", onData);
    window.addEventListener("seat-connection", onConnection);
    (window as DashboardWindow).__SEAT_FIREBASE_CONFIG__ = config;
    if (!document.getElementById("firebase-client")) {
      const script = document.createElement("script");
      script.id = "firebase-client";
      script.type = "module";
      script.src = "/firebase-client.js";
      document.head.appendChild(script);
    }
    return () => {
      window.removeEventListener("seat-data", onData);
      window.removeEventListener("seat-connection", onConnection);
    };
  }, []);

  const normalized = useMemo(() => SEAT_IDS.map((id) => {
    const reading = seats[databaseSeatId(id)] ?? seats[id] ?? seats[seatNumber(id)];
    return {
      id,
      state: seatState(reading),
      updatedAt: seatUpdatedAt(reading),
      distanceCm: seatReading(reading)?.distanceCm,
      motion: seatReading(reading)?.motion,
    };
  }), [seats]);
  const available = normalized.filter((seat) => seat.state === "available").length;
  const occupied = normalized.filter((seat) => seat.state === "occupied").length;
  const reported = available + occupied;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#top" aria-label="Studyspace home"><span className="brand-mark">S</span><span>studyspace</span></a>
        <div className="nav-caption">WORKSPACE</div>
        <a className="nav-link active" href="#overview"><span className="nav-glyph">▦</span>Overview</a>
        <a className="nav-link" href="#seat-map"><span className="nav-glyph">⌗</span>Seat map</a>
        <div className="sidebar-bottom">
          <div className="connection-card">
            <div className="connection-title"><span className={"status-dot " + (connected ? "online" : "waiting")} />{connected ? "Connected" : configured ? "Connecting" : "Awaiting setup"}</div>
            <p>{connected ? "Seat readings are streaming from Firebase." : "Live seat states will appear when Firebase is connected."}</p>
          </div>
          <div className="sidebar-foot">LIBRARY SEAT TRACKER</div>
        </div>
      </aside>

      <main className="main-content" id="top">
        <header className="topbar"><div className="breadcrumb">Campus Library <span>/</span> <b>Seat overview</b></div><div className="top-right"><div className="connection-pill"><span className={"status-dot " + (connected ? "online" : "waiting")} />{connection}</div><div className="profile-avatar">L</div></div></header>
        <section className="page-heading" id="overview"><div><div className="eyebrow">MAIN FLOOR · STUDY AREA</div><h1>Find your study spot.</h1><p>A live look at the library’s three study seats.</p></div><div className="floor-tag"><span>⌖</span> Main floor</div></section>

        <section className="stats-grid" aria-label="Seat summary">
          <article className="stat-card"><div className="stat-heading">Available seats <span className="stat-symbol green">✓</span></div><div className="stat-value">{reported ? available : "—"}</div><div className="stat-caption">{reported ? "Ready to use" : "Waiting for sensor data"}</div></article>
          <article className="stat-card"><div className="stat-heading">Occupied <span className="stat-symbol coral">●</span></div><div className="stat-value">{reported ? occupied : "—"}</div><div className="stat-caption">{reported ? "Confirmed sensor readings" : "Waiting for sensor data"}</div></article>
          <article className="stat-card"><div className="stat-heading">Total seats <span className="stat-symbol">▦</span></div><div className="stat-value">3</div><div className="stat-caption">On this floor</div></article>
          <article className="stat-card"><div className="stat-heading">Reporting sensors <span className="stat-symbol green">⌁</span></div><div className="stat-value">{reported}<small> / 3</small></div><div className="stat-caption">{reported ? "Seats with a known state" : "No live readings yet"}</div></article>
        </section>

        <div className="content-grid">
          <section className="panel map-panel" id="seat-map">
            <div className="panel-heading"><div><h2>Seat map</h2><p>Tap a seat to see its current reading</p></div><span className="panel-kicker">READING HALL</span></div>
            <div className="floor-plan">
              <div className="room-label">3-SEAT AREA</div>
              <div className="seat-grid">
                {normalized.map((seat) => <div className="seat-wrap" key={seat.id}><button className={"seat-tile " + (seat.state || "unknown")} onClick={() => { const label = seat.state ? (seat.state === "available" ? "Empty" : "Occupied") : "No sensor data yet"; window.alert("Seat " + seatNumber(seat.id) + " · " + label + (seat.distanceCm !== undefined ? " · " + seat.distanceCm + " cm" : "") + (seat.motion !== undefined ? " · Motion " + (seat.motion ? "detected" : "not detected") : "")); }} aria-label={"Seat " + seatNumber(seat.id) + ", " + (seat.state || "unreported")}><span className="seat-chair">▱</span><b>{seatNumber(seat.id)}</b><small>{seat.state === "available" ? "EMPTY" : seat.state === "occupied" ? "OCCUPIED" : "—"}</small>{seat.distanceCm !== undefined || seat.motion !== undefined ? <small className="sensor-detail">{seat.distanceCm !== undefined ? seat.distanceCm + " cm" : "Distance —"} · {seat.motion === undefined ? "Motion —" : seat.motion ? "Motion yes" : "Motion no"}</small> : null}</button></div>)}
              </div>
              <div className="legend"><span><i className="legend-dot unknown-dot" />Unreported</span><span><i className="legend-dot available-dot" />Available</span><span><i className="legend-dot occupied-dot" />Occupied</span></div>
            </div>
          </section>

        </div>
        <footer className="page-footer"><span>Seat states are read live from Firebase Realtime Database.</span><span>{connected ? "Connected" : "Waiting for Firebase connection"}</span></footer>
      </main>
    </div>
  );
}
