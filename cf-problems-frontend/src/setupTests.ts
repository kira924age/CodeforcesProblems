import "@testing-library/jest-dom/vitest";

import { configure } from "@testing-library/react";

configure({ reactStrictMode: true });

// jsdom has no layout engine or ResizeObserver. Size-dependent charts supply
// explicit dimensions in their tests; UI controls only need the observer API.
globalThis.ResizeObserver = class implements ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
