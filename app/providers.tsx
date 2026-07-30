"use client";

import type { ReactNode } from "react";

import { PaddockNoteProvider } from "@/lib/paddock-note-context";

export function Providers({ children }: { children: ReactNode }) {
  return <PaddockNoteProvider>{children}</PaddockNoteProvider>;
}
