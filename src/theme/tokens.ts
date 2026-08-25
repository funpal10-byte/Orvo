// Design tokens sourced from the ORVO Co. "Original Voice Audit" design handoff.
// Do not introduce new colors/spacing without updating the handoff doc first.

export const color = {
  canvas: '#08090A',
  surface: '#12140F',
  surfaceAlt: '#0D0F0B',
  gold: '#C9A94A',
  goldBright: '#F0D98A',
  goldText: '#E3C46B',
  goldLine: 'rgba(240,217,138,0.16)',
  goldLineStrong: 'rgba(240,217,138,0.3)',
  cream: '#F4F0E2',
  bodyText: 'rgba(244,240,226,0.7)',
  mutedText: 'rgba(244,240,226,0.42)',
  legalText: 'rgba(244,240,226,0.32)',
  positive: '#9BC08A',
  attention: '#E08A5A',
  gradientPrimary: ['#8A6512', '#E9CE7C', '#C79A2A'] as const,
  gradientPrimaryLocations: [0, 0.55, 1] as const,
  gradientBar: ['#8A6512', '#E9CE7C'] as const,
} as const;

export const spacing = {
  xxs: 4,
  xs: 6,
  sm: 8,
  ms: 10,
  md: 14,
  lg: 16,
  ml: 18,
  xl: 22,
  xxl: 26,
  xxxl: 30,
  screenTop: 64,
} as const;

export const radius = {
  none: 0,
  pill: 999,
  circle: 9999,
} as const;

export const fontFamily = {
  displaySemibold: 'Outfit_600SemiBold',
  displayMedium: 'Outfit_500Medium',
  body: 'Manrope_400Regular',
  bodyMedium: 'Manrope_500Medium',
  mono: 'JetBrainsMono_400Regular',
  monoMedium: 'JetBrainsMono_500Medium',
} as const;

export const fontSize = {
  ring: 46,
  h1: 34,
  question: 26,
  h2: 25,
  h3: 24,
  header: 21,
  gapTitle: 16,
  body: 15.5,
  field: 15,
  home: 14.5,
  note: 14,
  dimLabel: 13.5,
  dimValue: 12,
  rank: 12,
  scoreLabel: 11.5,
  delta: 11,
  gapMeta: 10.5,
  ringLabel: 9.5,
  tab: 10,
  fieldLabel: 10,
  eyebrow: 10.5,
  section: 10.5,
} as const;

export const hitSlop = { top: 8, bottom: 8, left: 8, right: 8 };
export const minTouch = 44;
