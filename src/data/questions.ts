export type Question = {
  id: string;
  dimension: string;
  text: string;
  options: string[];
};

// Full 18-question bank. Dimensions 1-3 are final-intent copy from the design
// handoff; dimensions 4-6 are placeholder question sets in the same pattern —
// per the handoff's "Open questions for ORVO Co.", the real bank + per-option
// scoring weights are owned by ORVO Co. and must be swapped in server-side.
export const QUESTIONS: Question[] = [
  {
    id: 'd1q1',
    dimension: 'Distinctiveness',
    text: 'Without your logo, could a customer name the brand from your last campaign?',
    options: ['Confidently', 'Probably', 'Unlikely', "Don't know"],
  },
  {
    id: 'd1q2',
    dimension: 'Distinctiveness',
    text: 'Do you have visual or verbal assets that competitors could not credibly reuse?',
    options: ['Several', 'One or two', 'None we could name', "Don't know"],
  },
  {
    id: 'd1q3',
    dimension: 'Distinctiveness',
    text: 'When you last briefed a new agency or hire, could they describe the brand in one line?',
    options: ['Yes, consistently', 'With prompting', 'No', "Don't know"],
  },
  {
    id: 'd2q1',
    dimension: 'Consistency',
    text: 'Do your website, sales deck and job posts tell the same story?',
    options: ['One story', 'Mostly aligned', 'Three stories', "Don't know"],
  },
  {
    id: 'd2q2',
    dimension: 'Consistency',
    text: 'Has your positioning changed in the last year without every touchpoint being updated?',
    options: ['No, all updated', 'Mostly updated', 'Yes, drift exists', "Don't know"],
  },
  {
    id: 'd2q3',
    dimension: 'Consistency',
    text: 'Do regional or partner teams use brand assets you did not approve?',
    options: ['Never', 'Rarely', 'Regularly', "Don't know"],
  },
  {
    id: 'd3q1',
    dimension: 'Search & answer visibility',
    text: 'When buyers ask an AI assistant about your category, are you cited?',
    options: ['Regularly', 'Occasionally', 'Never checked', 'No'],
  },
  {
    id: 'd3q2',
    dimension: 'Search & answer visibility',
    text: 'Do your commercial pages answer the questions buyers actually search?',
    options: ['Yes, most pages', 'Some pages', 'Few or none', "Don't know"],
  },
  {
    id: 'd3q3',
    dimension: 'Search & answer visibility',
    text: 'Do you track share of search against your named competitors?',
    options: ['Tracked quarterly', 'Tracked occasionally', 'Never tracked', "Don't know"],
  },
  {
    id: 'd4q1',
    dimension: 'Perception',
    text: 'Would a customer describe you as different from competitors, or just trusted?',
    options: ['Different', 'Trusted, not different', 'Neither', "Don't know"],
  },
  {
    id: 'd4q2',
    dimension: 'Perception',
    text: 'Do you run structured research on how buyers perceive the brand?',
    options: ['Annually or more', 'Ad hoc', 'Never', "Don't know"],
  },
  {
    id: 'd4q3',
    dimension: 'Perception',
    text: 'Has a prospect ever repeated your positioning back to you unprompted?',
    options: ['Often', 'Occasionally', 'Never', "Don't know"],
  },
  {
    id: 'd5q1',
    dimension: 'Competitive standing',
    text: 'Where do you rank on share of search inside your named competitor set?',
    options: ['First or second', 'Middle of the set', 'Last', "Don't know"],
  },
  {
    id: 'd5q2',
    dimension: 'Competitive standing',
    text: 'Do you win competitive deals on brand strength, or only on price and relationships?',
    options: ['On brand strength', 'Mixed', 'Price and relationships only', "Don't know"],
  },
  {
    id: 'd5q3',
    dimension: 'Competitive standing',
    text: 'Can you name what a prospect hears about you from a competitor’s sales team?',
    options: ['Yes, specifically', 'Roughly', 'No idea', "Don't know"],
  },
  {
    id: 'd6q1',
    dimension: 'Internal alignment',
    text: 'Could your leadership team state the positioning the same way, independently?',
    options: ['Yes, consistently', 'Mostly', 'No', "Don't know"],
  },
  {
    id: 'd6q2',
    dimension: 'Internal alignment',
    text: 'Do new hires get a working brand and messaging guide in onboarding?',
    options: ['Yes, and it is used', 'Exists, rarely used', 'No guide exists', "Don't know"],
  },
  {
    id: 'd6q3',
    dimension: 'Internal alignment',
    text: 'When sales and marketing disagree on messaging, is there a resolution process?',
    options: ['Yes, and it works', 'Informally', 'No process', "Don't know"],
  },
];

export const DIMENSIONS = [
  'Distinctiveness',
  'Consistency',
  'Search & answer visibility',
  'Perception',
  'Competitive standing',
  'Internal alignment',
] as const;

export type DimensionKey = (typeof DIMENSIONS)[number];
