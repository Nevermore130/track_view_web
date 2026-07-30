import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { TrackViewer } from "./track-viewer";
import "./globals.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Missing #root application mount point");
}

createRoot(root).render(
  <StrictMode>
    <TrackViewer />
  </StrictMode>,
);
