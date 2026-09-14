import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans } from "next/font/google";

import "./globals.css";
import { cn } from "@/lib/utils";

/**
 * IBM Plex Sans rather than the original Plus Jakarta Sans. Plex was drawn
 * for dense institutional interfaces, has genuine tabular figures, and
 * keeps 1/l/I distinguishable, which matters when the thing on screen is a
 * policy number or a date of birth.
 */
const fontSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
});

export const metadata: Metadata = {
  title: {
    default: "CarePulse · Patient scheduling for modern practices",
    template: "%s",
  },
  description:
    "Patient booking, automated reminders and a live staff worklist. CarePulse replaces the phone queue and the paper log with one system your practice can actually run on.",
  applicationName: "CarePulse",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#15529B",
  width: "device-width",
  initialScale: 1,
  // NOT maximum-scale=1. Blocking pinch zoom on an application that shows
  // dates of birth and policy numbers to older patients is an
  // accessibility failure, and it is the default people copy without
  // thinking about it.
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={cn("min-h-screen bg-canvas font-sans", fontSans.variable)}>
        {/* Keyboard and screen-reader users should not have to tab through
            the whole header on every page. */}
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
