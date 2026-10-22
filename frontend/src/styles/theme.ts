/**
 * SteelCraft Dark Theme System - Theme Constants
 */

export const colors = {
  // Accents
  accentBlue: '#86C9FF',
  accentCoral: '#FF928F',
  accentYellow: '#FBFF8F',
  
  // Dark Backgrounds
  darkCanvas: '#5C7080',
  darkSurface: '#AA9898',
  darkSurfaceHover: '#988787',
  
  // Text
  textLight: '#F8FAFC',
  textMuted: '#E2E8F0',
  textDark: '#1E293B',
  
  // Border
  borderDark: 'rgba(255, 255, 255, 0.18)',
} as const;

export const typography = {
  fontFamily: {
    hurmeNo2: "'hurme_no2-webfont', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    hurme: "'Hurme Geometric Sans', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  fontSize: {
    caption: '12px',
    bodySm: '14px',
    body: '16px',
    subheading: '20px',
    headingSm: '24px',
    heading: '32px',
    display: '44px',
  },
  fontWeight: {
    regular: 400,
    semibold: 600,
    bold: 700,
  },
} as const;

export const componentPresets = {
  button: {
    primary: {
      bg: colors.accentBlue,
      text: colors.textDark,
      fontWeight: 600,
      borderRadius: '200px',
    },
    secondary: {
      bg: colors.accentCoral,
      text: colors.textDark,
      fontWeight: 600,
      borderRadius: '200px',
    },
  },
  card: {
    standard: {
      bg: colors.darkSurface,
      border: `1px solid ${colors.borderDark}`,
      borderRadius: '8px',
      padding: '24px',
    },
  },
} as const;