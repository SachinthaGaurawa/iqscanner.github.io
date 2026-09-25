export type ScanModeId = "smart" | "id" | "passport" | "book" | "ocr";

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
}

const dateTitle = (label: string) => `${label} ${new Date().toLocaleDateString()}`;

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
  },
  passport: {
    id: "passport",
    label: "Passport",
    defaultTitle: () => "Passport",
    instructions: ["Place your passport's photo page inside the frame."],
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
