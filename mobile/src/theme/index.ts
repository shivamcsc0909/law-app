// NyayaSetu Mobile Design Tokens & Indian Legal Theme

export const Colors = {
  primary: '#0B192C',        // Deep Justice Navy
  primaryLight: '#1E3E62',   // Slate Blue
  accent: '#D4AF37',         // Supreme Gold / Saffron Accent
  accentOrange: '#E65100',   // Legal Alert / Notice Orange
  secondary: '#0052CC',      // Action Blue
  success: '#10B981',        // Bar Verified Green
  warning: '#F59E0B',        // Caution Amber
  danger: '#EF4444',         // Flagged / Emergency Red
  
  background: '#F8FAFC',     // Clean Off-White Background
  surface: '#FFFFFF',        // Card Surface
  surfaceSubtle: '#F1F5F9',  // Subtle Input / Pill Background
  
  textPrimary: '#0F172A',    // High Contrast Dark
  textSecondary: '#475569',  // Medium Gray
  textMuted: '#94A3B8',      // Light Placeholder Gray
  textInverse: '#FFFFFF',    // White Text
  
  border: '#E2E8F0',         // Divider / Border
  borderFocus: '#D4AF37',    // Gold Focus Border
};

export const Typography = {
  fontSizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    display: 28,
  },
  fontWeights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
};
