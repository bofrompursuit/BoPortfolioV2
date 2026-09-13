import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import FeaturedShowcase from "./FeaturedShowcase";

export function mountShowcase(element) {
  createRoot(element).render(
    <StrictMode>
      <FeaturedShowcase />
    </StrictMode>
  );
}
