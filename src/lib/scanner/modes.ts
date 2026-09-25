export type ScanModeId = "smart" | "id" | "passport" | "book" | "ocr" | "batch";

export interface ScanMode {
  id: ScanModeId;
  label: string;
  defaultTitle: () => string;
  /** Instruction shown over the camera, indexed by how many pages are captured so far. */
  instructions: string[];
  /** When set, the flow auto-advances back to the camera until this many pages are captured. */
  targetPages?: number;
  /** Forces OCR on (hides the toggle) and jumps straight to the text editor after saving. */
  autoOcr?: boolean;
  /** Expected width/height ratio of the document (biases detection + draws an alignment guide). */
  aspect?: number;
  /** Continuous capture: skip the per-page review screen and keep shooting until "Done". */
  continuous?: boolean;
}

const dateTitle = (label: string) => `${label} ${new Date().toLocaleDateString()}`;

// ID-1 card (85.6 x 53.98mm) => width/height.
const ID_CARD_ASPECT = 85.6 / 53.98;
// ICAO TD3 passport bio-data page (125 x 88mm) => width/height.
const PASSPORT_ASPECT = 88 / 125;

export const SCAN_MODES: Record<ScanModeId, ScanMode> = {
  smart: {
    id: "smart",
    label: "Smart Scan",
    defaultTitle: () => dateTitle("Scan"),
    instructions: ["Line the document up inside the frame."],
  },
  id: {
    id: "id",
    label: "ID Card",
    defaultTitle: () => "ID Card",
    instructions: ["Scan the FRONT of your ID card.", "Now scan the BACK of your ID card."],
    targetPages: 2,
    aspect: ID_CARD_ASPECT,
  },
  passport: {
    id: "passport",
    label: "Passport",
    defaultTitle: () => "Passport",
    instructions: ["Place your passport's photo page inside the frame."],
    aspect: PASSPORT_ASPECT,
  },
  book: {
    id: "book",
    label: "Book",
    defaultTitle: () => dateTitle("Book scan"),
    instructions: ["Scan the LEFT page.", "Now scan the RIGHT page."],
    targetPages: 2,
  },
  ocr: {
    id: "ocr",
    label: "Text Scan",
    defaultTitle: () => dateTitle("Text scan"),
    instructions: ["Line the document up inside the frame."],
    autoOcr: true,
  },
  batch: {
    id: "batch",
    label: "Batch Scan",
    defaultTitle: () => dateTitle("Batch scan"),
    instructions: ["Capture keeps going after each page — tap Done when you're finished."],
    continuous: true,
  },
};

export function getScanMode(param: string | null): ScanMode {
  if (param && Object.hasOwn(SCAN_MODES, param)) {
    return SCAN_MODES[param as ScanModeId];
  }
  return SCAN_MODES.smart;
}

export function instructionFor(mode: ScanMode, pagesCaptured: number): string {
  const index = Math.min(pagesCaptured, mode.instructions.length - 1);
  return mode.instructions[index];
}
