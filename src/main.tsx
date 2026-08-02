import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  publicPageForPath,
  publicPageMeta,
} from "./public-site-routes";
import { PublicSite } from "./public-site";
import { TrackViewer } from "./track-viewer";
import "./globals.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Missing #root application mount point");
}

const publicPage = publicPageForPath(window.location.pathname);

if (publicPage) {
  const meta = publicPageMeta[publicPage];
  document.title = meta.title;
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute("content", meta.description);
}

createRoot(root).render(
  <StrictMode>
    {publicPage ? <PublicSite page={publicPage} /> : <TrackViewer />}
  </StrictMode>,
);
