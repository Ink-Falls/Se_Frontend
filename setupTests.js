import { vi } from "vitest";

// Mock static asset imports globally
vi.mock("/src/assets/images/ARALKADEMYLOGO.png", () => ({ default: "mocked-logo" }));
vi.mock("/src/assets/images/ARALKADEMYICON.png", () => ({ default: "mocked-icon" }));
vi.mock("/src/assets/images/NSTPLOGO.png", () => ({ default: "mocked-nstp-logo" }));
