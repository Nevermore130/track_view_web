import { lazy, Suspense } from "react";
import type { PublicPage } from "./public-site-routes";

const PublicSite = lazy(async () => {
  const module = await import("./public-site");
  return { default: module.PublicSite };
});

export const PublicSiteEntry = ({ page }: { page: PublicPage }) => (
  <Suspense fallback={null}>
    <PublicSite page={page} />
  </Suspense>
);
