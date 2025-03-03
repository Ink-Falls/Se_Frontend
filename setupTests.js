import { vi } from "vitest";

// Mock static asset imports globally
vi.mock("/src/assets/ARALKADEMYLOGO.png", () => ({ default: "mocked-logo" }));
vi.mock("/src/assets/ARALKADEMYICON.png", () => ({ default: "mocked-icon" }));
vi.mock("/src/assets/NSTPLOGO.png", () => ({ default: "mocked-nstp-logo" }));
