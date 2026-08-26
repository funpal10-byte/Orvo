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
    text: 'Would an independent ranking, award or certification back up how you describe your reputation?',
    options: ['Yes, consistently', 'Partially', 'No', "Don't know"],
  },
  {
    id: 'd4q2',
    dimension: 'Perception',
    text: 'If a customer switched away tomorrow, would they still speak well of you afterward?',
    options: ['Definitely', 'Probably', 'Unlikely', "Don't know"],
  },
  {
    id: 'd4q3',
    dimension: 'Perception',
    text: 'Do people choose you even when a cheaper or more convenient option exists?',
    options: ['Regularly', 'Sometimes', 'Rarely', "Don't know"],
  },
  {
    id: 'd5q1',
    dimension: 'Competitive standing',
    text: 'Where do you rank on visible share of voice against your named competitor set (media, search, social)?',
    options: ['First or second', 'Middle of the set', 'Last', "Don't know"],
  },
  {
    id: 'd5q2',
    dimension: 'Competitive standing',
    text: 'Do you show up in industry conversations — press, panels, forums — as often as your competitors?',
    options: ['More often', 'About the same', 'Less often', "Don't know"],
  },
  {
    id: 'd5q3',
    dimension: 'Competitive standing',
    text: 'When something shifts in your market, are you first to respond or last to notice?',
    options: ['First to respond', 'Middle of the pack', 'Last to notice', "Don't know"],
  },
  {
    id: 'd6q1',
    dimension: 'Internal alignment',
    text: 'Could your leadership team state the brand’s direction the same way, independently of each other?',
    options: ['Yes, consistently', 'Mostly', 'No', "Don't know"],
  },
  {
    id: 'd6q2',
    dimension: 'Internal alignment',
    text: 'When the market shifts, how fast can the organisation actually change course?',
    options: ['Within weeks', 'Within a quarter', 'Rarely at all', "Don't know"],
  },
  {
    id: 'd6q3',
    dimension: 'Internal alignment',
    text: 'Do frontline teams get heard when they flag what customers are telling them?',
    options: ['Yes, and it changes things', 'Heard, rarely acted on', 'Not really', "Don't know"],
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
