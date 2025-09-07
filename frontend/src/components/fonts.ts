// fonts.ts
// Centralized font registration for @react-pdf/renderer
// Works in both browser and Node (e.g., Next.js SSR).

import { Font } from '@react-pdf/renderer';

// Name your family constant so you can reuse
export const DEVANAGARI_FAMILY = 'NotoSansDevanagari';
export const DEVANAGARI_ENABLED = false; // default toggle; auto-detect may override at runtime

// If you decide NOT to use your Devanagari-specific font, set DEVANAGARI_ENABLED = false
// and just rely on Helvetica + a different currency symbol, e.g. "Rs".
const REGULAR_FONT_PATH = '/fonts/NotoSansDevanagari-Regular.ttf';
const BOLD_FONT_PATH = '/fonts/NotoSansDevanagari-Bold.ttf';

// Simple cache flag to avoid re-registering in HMR loops
let registered = false;
let active = false;

export const DEVANAGARI_ACTIVE = () => active; // runtime check for templates

export async function registerFonts() {
  if (registered) return;
  if (!DEVANAGARI_ENABLED) {
    // explicitly disabled
    registered = true;
    active = false;
    return;
  }

  const isBrowser = typeof window !== 'undefined';

  try {
    if (isBrowser) {
      // Browser: verify font files exist before registering
      const headRegular = await fetch(REGULAR_FONT_PATH, { method: 'HEAD' });
      const headBold = await fetch(BOLD_FONT_PATH, { method: 'HEAD' });
      if (headRegular.ok && headBold.ok) {
        Font.register({
          family: DEVANAGARI_FAMILY,
          fonts: [
            { src: REGULAR_FONT_PATH, fontWeight: 'normal' },
            { src: BOLD_FONT_PATH, fontWeight: 'bold' }
          ]
        });
        active = true;
      } else {
        active = false;
      }
    } else {
      // Server: Use fs path
      // Only do this if you KNOW the fonts exist on disk (e.g. Next.js with /public)
      // If using a serverless environment be sure fonts are packaged.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const path = require('path');
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const fs = require('fs');

      const regularAbs = path.join(process.cwd(), 'public', REGULAR_FONT_PATH.replace(/^\/+/, ''));
      const boldAbs = path.join(process.cwd(), 'public', BOLD_FONT_PATH.replace(/^\/+/, ''));

      if (!fs.existsSync(regularAbs)) {
        console.warn('[fonts] Regular font file missing at', regularAbs);
      } else if (!fs.existsSync(boldAbs)) {
        console.warn('[fonts] Bold font file missing at', boldAbs);
      } else {
        Font.register({
          family: DEVANAGARI_FAMILY,
          fonts: [
            { src: regularAbs, fontWeight: 'normal' },
            { src: boldAbs, fontWeight: 'bold' }
          ]
        });
        active = true;
      }
    }
    registered = true;
  } catch (err) {
    console.warn('Font registration failed; falling back to Helvetica.', err);
    registered = true;
    active = false;
  }
}

// Helper to get symbol based on availability
export const getCurrencySymbol = () => (active ? 'रु' : 'Rs');