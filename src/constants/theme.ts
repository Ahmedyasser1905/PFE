// ─────────────────────────────────────────────────────────────────────────────
// Theme reverted to OLD visual style (pixel-parity with the legacy project).
// Tokens introduced in NEW (primaryDark, surfaceSecondary, divider, textMuted,
// successLight/warningLight/errorLight/infoLight, bodyMedium/bodyBold,
// shadows.none/xs, spacing.none/xxxl, roundness.none/xs/xxl) are kept as
// ALIASES so the existing component code keeps working without modification.
// ─────────────────────────────────────────────────────────────────────────────
export const theme = {
  colors: {
    // ── Brand (OLD values restored) ─────────────────────────────────────────
    primary: '#2563eb',          // OLD blue
    primaryLight: '#dbeafe',     // OLD blue-100
    primaryDark: '#2563eb',      // alias → primary (OLD had no darker shade)

    // ── UI ──────────────────────────────────────────────────────────────────
    background: '#ffffff',
    surface: '#f8fafc',          // OLD
    surfaceSecondary: '#f8fafc', // alias → surface (OLD had no secondary)

    // ── Text ────────────────────────────────────────────────────────────────
    text: '#0f172a',             // OLD slate-900
    textSecondary: '#64748b',    // OLD slate-500
    muted: '#94a3b8',            // OLD slate-400 (legacy name)
    textMuted: '#94a3b8',        // alias → muted (used by NEW components)
    placeholder: '#94a3b8',      // OLD

    // ── State (OLD values) ──────────────────────────────────────────────────
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#0ea5e9',             // OLD sky-500 (was #3B82F6 in NEW)

    // Light state tints — kept for NEW screens that reference them; not used
    // by OLD-era screens, so they don't affect OLD pixel-parity.
    successLight: '#ecfdf5',
    warningLight: '#fffbeb',
    errorLight: '#fef2f2',
    infoLight: '#eff6ff',

    // ── Borders ─────────────────────────────────────────────────────────────
    border: '#e5e7eb',           // OLD
    divider: '#e5e7eb',          // alias → border (OLD had no divider token)

    // Helpers
    white: '#ffffff',
    black: '#000000',
    transparent: 'transparent',
  },

  spacing: {
    // OLD scale
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    // Aliases (kept for NEW components that reference them)
    none: 0,
    xxxl: 48,
  },

  roundness: {
    // OLD scale
    sm: 8,
    md: 10,
    lg: 12,
    xl: 14,
    xxl: 16,
    full: 9999,
    // Aliases (kept for NEW components that reference them)
    none: 0,
    xs: 4,
  },

  typography: {
    // OLD: fontSize only — no fontWeight / letterSpacing / lineHeight
    h1: { fontSize: 28 },
    h2: { fontSize: 22 },
    h3: { fontSize: 20 },
    h4: { fontSize: 18 },
    body: { fontSize: 14 },
    small: { fontSize: 12 },
    caption: { fontSize: 11 },
    // Aliases (kept for NEW components). OLD body size + weight so that
    // buttons / labels that rely on these still render with emphasis.
    bodyMedium: { fontSize: 14, fontWeight: '500' as const },
    bodyBold: { fontSize: 14, fontWeight: '700' as const },
  },

  shadows: {
    // OLD: no shadowOffset, smaller radii / elevation
    sm: {
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 6,
    },
    // Aliases (kept for NEW components that reference them)
    none: {
      shadowColor: 'transparent',
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    xs: {
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 1,
    },
  },
} as const;
