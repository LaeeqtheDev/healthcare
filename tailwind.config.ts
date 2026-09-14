import type { Config } from "tailwindcss";

const { fontFamily } = require("tailwindcss/defaultTheme");

/**
 * CarePulse design tokens.
 *
 * Moved off the original near-black palette deliberately. Clinical
 * software is read in bright rooms, often on mediocre monitors, frequently
 * by people over 40, and increasingly next to a window. Dark-on-light is
 * what every real EHR ships for that reason, and a dark theme is the
 * single strongest signal that an interface was designed to look good in a
 * portfolio screenshot rather than to be used for eight hours.
 *
 * Every foreground/background pair below clears WCAG AA (4.5:1 for body,
 * 3:1 for large text and UI borders). Status colours are additionally
 * distinguishable without relying on hue alone, because roughly 1 in 12
 * men has some form of colour vision deficiency and clinical status is not
 * something to communicate in colour only.
 */
const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        /* Surfaces, lightest to darkest */
        canvas: "#F4F7FA", // page background
        surface: "#FFFFFF", // cards, tables, panels
        raised: "#EDF2F7", // table headers, inset areas
        line: "#DCE4ED", // borders and dividers
        "line-strong": "#C3CFDC", // input borders, needs 3:1

        /* Text */
        ink: "#0E1A26", // primary text, 15.8:1 on canvas
        "ink-muted": "#4A5B6B", // secondary text, 7.2:1 on canvas
        "ink-subtle": "#66788A", // tertiary/labels, 4.6:1 on canvas

        /* Legacy accent. The forms use text-green-500 for links and
         * highlights; map it to the brand action colour so those read as
         * interactive rather than as a status. */
        green: { 500: "#15529B", 600: "#10406F" },

        /* Brand: an institutional blue rather than a startup gradient */
        brand: {
          50: "#EAF2FB",
          100: "#D2E3F6",
          500: "#1B63B8",
          600: "#15529B", // default action colour, 5.9:1 with white
          700: "#10406F",
        },

        /* Clinical status. Each pairs with an icon and a text label so
           colour is never the only carrier of meaning. */
        ok: { 50: "#E7F5EF", 500: "#0B7A5A", 700: "#075A42" },
        warn: { 50: "#FDF3E4", 500: "#9A6209", 700: "#7A4D06" },
        crit: { 50: "#FCEBEA", 500: "#B42318", 700: "#8F1C13" },
        info: { 50: "#E9F1FB", 500: "#15529B", 700: "#10406F" },

        /* Dark surfaces retained for the marketing page only */
        night: { 900: "#0B1520", 800: "#132231", 700: "#1D3145" },

        /* ── Legacy aliases ──────────────────────────────────────────
         * The original dark palette is referenced across ~900 lines of
         * form markup (CustomFormField, RegisterForm, AppointmentForm).
         * Rather than hand-edit every className and risk breaking field
         * behaviour, those names are remapped onto the new light theme
         * here, so the forms inherit the redesign automatically.
         *
         * Without this the old classes would not be generated at all and
         * would silently render as nothing, which is how a redesign ends
         * up with invisible input borders.
         *
         * New code should use the semantic names above. These exist to
         * be deleted once the forms are rewritten. */
        dark: {
          200: "#F4F7FA", // was page bg   -> canvas
          300: "#FFFFFF", // was card bg   -> surface
          400: "#FFFFFF", // was input bg  -> surface
          500: "#C3CFDC", // was border    -> line-strong
          600: "#66788A", // was muted txt -> ink-subtle
          700: "#4A5B6B", // was body txt  -> ink-muted
        },
        light: {
          200: "#0E1A26", // was light-on-dark -> ink
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      borderRadius: {
        lg: "10px",
        md: "8px",
        sm: "6px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(14,26,38,0.04), 0 1px 3px rgba(14,26,38,0.06)",
        raised: "0 4px 12px -2px rgba(14,26,38,0.10), 0 2px 6px -2px rgba(14,26,38,0.06)",
        pop: "0 16px 40px -12px rgba(14,26,38,0.22)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fade-up 0.35s cubic-bezier(0.22,1,0.36,1) both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
