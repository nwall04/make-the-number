// Make the Number: game content and scoring.
// Everything here comes from the Don Russell case (Merchant) and its teaching note.
// Meters start at BASE and are clamped to 0..MAX.

export const BASE = 10;
export const MAX = 20;
export const QUESTION_SECONDS = 90;
export const BOARD_SECONDS = 150;
export const BOARD_BUDGET = 100;
export const BOARD_POINTS_PER_CATCH = 2;

export const METERS = [
  { key: 'earn', label: 'Reported earnings', short: 'Earnings', good: 'high' },
  { key: 'bonus', label: 'Your bonus and career', short: 'Bonus', good: 'high' },
  { key: 'info', label: 'Information quality', short: 'Info quality', good: 'high' },
  { key: 'legal', label: 'Legal exposure', short: 'Legal risk', good: 'low' },
];

export const INTRO = {
  kicker: 'Chicago, 1985',
  title: 'You are Don Russell',
  body: [
    'CPA. Twelve years at Touche & Young, on track for partner. Evening MBA in information systems.',
    'Cook & Spector, a $4 billion consumer products division of Queen’s Industries, offers you the corporate controller job: 250 people and “carte blanche.”',
    'Your team will make Don’s real decisions. Four meters track the consequences.',
  ],
  rewarded: 'The company ranks you on reported earnings and your bonus. The simulation tracks all four meters.',
};

export const ROUNDS = [
  {
    id: 'r1',
    company: 'Cook & Spector',
    year: '1985',
    title: 'The surplus',
    setup:
      'Profit is running $45 million ahead of the $200 million plan. C&S expensed its acquisition costs aggressively, and everyone knows the accounting system is poor.',
    facts: ['$45M ahead of plan', '$200M profit plan', '600 product lines, 60 divisions'],
    prompt: 'What do you do with the surplus?',
    choices: [
      { id: 'A', label: 'Report the full surplus', detail: 'Show Queen’s the real $45M beat.', effects: { earn: 3, bonus: 1, info: 2, legal: 0 } },
      { id: 'B', label: 'Build a cookie jar', detail: 'Book a $53M tax reserve plus “unknown liability” reserves, spread across 600 product lines so nobody notices.', effects: { earn: 0, bonus: 2, info: -3, legal: 1 } },
      { id: 'C', label: 'Reserve only what you can support', detail: 'Book a documented reserve for the real IRS risk and disclose it to Queen’s.', effects: { earn: 1, bonus: 1, info: 1, legal: 0 } },
    ],
    don: {
      choice: 'B',
      text: 'Don built the reserves and spread them across 34 income statement lines in 600 product lines, in a way that would not attract the attention of Queen’s analysts or the auditors. No one asked significant questions.',
      quote: 'It’s better to be safe than sorry. If it turns out that we were overly conservative, it’s no big deal.',
    },
    host: 'Ask: is a reserve you cannot support “conservative” or is it manipulation? Introduce earnings management: actions that make performance look better in the short run with no real economic benefit.',
  },
  {
    id: 'r2',
    company: 'Cook & Spector',
    year: '1986',
    title: 'The 8% request',
    setup:
      'Sales and profits come in below forecast. Top management wants to report an 8% increase in earnings and to sharply increase spending on new product development. You still have the reserves.',
    facts: ['Earnings target: +8%', 'Sales below forecast', 'Reserves available'],
    prompt: 'Top management is waiting. What do you do?',
    choices: [
      { id: 'A', label: 'Release the reserves', detail: 'Free up enough to hit 8% and fund the product spending.', effects: { earn: 3, bonus: 3, info: -2, legal: 1 } },
      { id: 'B', label: 'Report the real number', detail: 'Earnings are down. Say so.', effects: { earn: -2, bonus: -3, info: 2, legal: 0 } },
      { id: 'C', label: 'Release, but tell Queen’s', detail: 'Release the reserves and disclose the amount released to the parent company.', effects: { earn: 1, bonus: 0, info: 1, legal: 0 } },
    ],
    don: {
      choice: 'A',
      text: 'Don released the reserves. A year later he was promoted to Vice President and Controller, and after presenting one six-month plan he received a $30,000 bonus on the spot.',
      quote: 'One time the president called me the Monet of the accounting profession.',
    },
    host: 'Ask: who is harmed here? Queen’s (the owner) is making decisions on numbers that are not real. Link to gamesmanship and why smoothed trends hide operating problems.',
  },
  {
    id: 'r3',
    company: 'Cook & Spector',
    year: '1988',
    title: 'The bonus machine',
    setup:
      'Another down year, and the president wants another 8%. The target is about $200 million and there is roughly $40 million in reserves ready to help. Division bonuses of 70% to 100% of base salary ride on operating profit, and the divisions have their own buried reserves.',
    facts: ['Bonuses: 70–100% of salary', '~$40M in reserves', 'Your pay: ~$230K on a $130K salary'],
    quote: 'On a monthly basis, one of the most important decisions I make is how much profit to recognize. (Head of the largest operating unit)',
    prompt: 'You now see how the system really works. What do you do?',
    choices: [
      { id: 'A', label: 'Keep the machine running', detail: 'Everyone hits target, everyone gets paid.', effects: { earn: 2, bonus: 3, info: -3, legal: 1 } },
      { id: 'B', label: 'Drain the reserves now', detail: 'Strip them out of 600 product P&Ls and fight the divisions.', effects: { earn: -2, bonus: -2, info: 2, legal: -1 } },
      { id: 'C', label: 'Fix the incentives', detail: 'Propose replacing operating-profit bonuses with cash-flow and shareholder-value measures.', effects: { earn: 0, bonus: -1, info: 2, legal: 0 } },
      { id: 'D', label: 'Tell the owner', detail: 'Report the practice to Queen’s corporate staff.', effects: { earn: -1, bonus: -3, info: 3, legal: -1 } },
    ],
    don: {
      choice: 'C',
      text: 'Don proposed a cash-flow and shareholder-value system. Top management was completely opposed: why change when the company was doing so well? Don got bored and left for ETI in 1989.',
      quote: 'We were getting our bonuses for nothing – actually worse than nothing because we were making bad decisions.',
    },
    host: 'Ask: whose job is it to design bonuses that cannot be gamed? Introduce the compensation committee and congruent results measures.',
  },
  {
    id: 'r4',
    company: 'Eastern Technologies (ETI)',
    year: '1990',
    title: 'The year-end numbers',
    setup:
      'You are now CFO of ETI, a public satellite broadcaster. President Joe Blevins, a former audit partner, capitalizes virtually all repairs, $3.5 million of interest on a control centre running since mid-1988, and depreciates five-year electronics over 12 years. Of $10 million in capital additions, about $5.5 million should have been expensed. National Telephone (NTC) is about to buy ETI shares at a premium.',
    facts: ['$5.5M of $10M should be expenses', '12-year life on 5-year equipment', 'NTC deal pending'],
    quote: 'No! No! No! You don’t understand. We must report the profits they’re expecting or they’ll back away from us. I’ll talk to the auditors. (Joe Blevins)',
    prompt: 'You want a $2M adjustment. Joe says no. What do you do?',
    choices: [
      { id: 'A', label: 'Book the adjustment anyway', detail: 'Override the president and record the $2M.', effects: { earn: -3, bonus: -3, info: 3, legal: -2 } },
      { id: 'B', label: 'Sign, but warn in the MD&A', detail: 'Accept the numbers, disclose the capitalized interest and warn that FY1991 profits will be much lower.', effects: { earn: 2, bonus: 1, info: 0, legal: 1 } },
      { id: 'C', label: 'Take it to the board and auditors', detail: 'Present your analysis to the people charged with governance.', effects: { earn: -1, bonus: -2, info: 2, legal: -1 } },
      { id: 'D', label: 'Sign and stay quiet', detail: 'Joe knows the market. Trust the plan.', effects: { earn: 3, bonus: 2, info: -3, legal: 3 } },
    ],
    don: {
      choice: 'B',
      text: 'Don signed and wrote a warning into the MD&A. The auditors gave an unqualified opinion while telling the board the statements were “pushing the edge on aggressive reporting.” The board was the chairman, the president, the previous CFO and a friend of the chairman.',
      quote: 'I had to leave the room because it was so outrageous.',
    },
    host: 'Ask: where was the board? Where were the auditors? Introduce board independence and competence, and auditor independence.',
  },
  {
    id: 'r5',
    company: 'Eastern Technologies (ETI)',
    year: 'February 1991',
    title: 'The decision',
    setup:
      'The forecast is now a $4 million loss and the real problem is at least $5.5 million. A correction breaches debt covenants and threatens the NTC deal. Your options are worth several hundred thousand dollars, and half vest in two months. You have six children and pay $60,000 a year in alimony. The chairman says: “Let’s just work the plan.”',
    facts: ['Problem: ≥ $5.5M', 'Covenants at risk', 'Options vest in 2 months'],
    prompt: 'The quarterly report is due to the SEC on the 15th. What do you do?',
    choices: [
      { id: 'A', label: 'Full correction, in writing', detail: 'Book about $5.5M. Send your analysis to the president, the board and the auditors together. Resign if refused.', effects: { earn: -4, bonus: -4, info: 4, legal: -4 } },
      { id: 'B', label: 'Force a $1M loss', detail: 'A smaller number that shows you are “stretching” in Joe’s direction.', effects: { earn: -2, bonus: -3, info: 1, legal: -1 } },
      { id: 'C', label: 'Tell the auditors', detail: 'Let the auditors force management to act.', effects: { earn: -1, bonus: -2, info: 1, legal: -1 } },
      { id: 'D', label: 'Wait two months', detail: 'Keep arguing for change and exercise your options first.', effects: { earn: 2, bonus: 4, info: -3, legal: 4 } },
      { id: 'E', label: 'Go to the SEC', detail: 'Report ETI to the regulator now.', effects: { earn: -4, bonus: -4, info: 3, legal: -3 } },
    ],
    don: {
      choice: 'B',
      text: 'Don forced ETI to report a $1 million loss, though he believed it should be $2 million or more. Two days later he was fired. He told Joe that without a check for a year’s salary he would go to the SEC. Joe wrote the check.',
      quote: 'You are going to report this number because I won’t go to jail.',
    },
    host: 'Ask: was $1M enough? Was taking a year’s salary for silence ethical? Bring in the CPA Code: integrity and due care (Rule 202) and never being associated with misleading statements (Rule 205).',
  },
];

export const UNRAVEL = {
  kicker: 'What happened next',
  events: [
    { when: '1991–1993', text: 'ETI keeps reporting record earnings and the stock keeps rising.' },
    { when: '1994', text: 'The auditors resign after challenging items worth more than half of first-quarter profit. Management kept replacing rejected items with new ones.' },
    { when: '1994', text: 'The stock falls about 50%.' },
    { when: 'Later', text: 'The SEC charges the chairman with securities fraud and insider trading. The president and CFO are also indicted. First-quarter 1994 earnings had been inflated by 66%.' },
  ],
  line: 'The scheme always unravels. Your score is now recalculated on what actually mattered: information quality and legal exposure.',
};

export const BOARD = {
  title: 'You are ETI’s new board',
  setup: 'After the scandal, shareholders replaced ETI\u2019s board with you. Your job is to fix the six failures from the case that let the numbers go wrong. You have 100 points, and not every fix fits.',
  fixes: [
    { id: 'indep', label: 'Independent majority on the board', cost: 25 },
    { id: 'chair', label: 'Separate the chair and CEO roles', cost: 10 },
    { id: 'audit', label: 'Independent, financially literate audit committee', cost: 25 },
    { id: 'ia', label: 'Internal audit reporting to the audit committee', cost: 20 },
    { id: 'comp', label: 'Compensation committee ties pay to cash flow and long-term results', cost: 15 },
    { id: 'rotate', label: 'Audit committee hires the auditor; partner rotation', cost: 15 },
    { id: 'hotline', label: 'Whistleblower channel straight to the audit committee', cost: 10 },
    { id: 'sox', label: 'Annual internal control assessment (SOX 404 style)', cost: 20 },
    { id: 'code', label: 'Code of conduct and ethics training', cost: 5 },
  ],
  failures: [
    { id: 'f1', text: 'The board was the chairman, the president, the previous CFO and the chairman’s friend.', caughtBy: ['indep', 'chair'], concept: 'Board independence' },
    { id: 'f2', text: 'The auditors did not understand satellite technology and were intimidated by Joe.', caughtBy: ['audit', 'rotate'], concept: 'Audit committee oversight of the auditor' },
    { id: 'f3', text: 'Repairs, interest and travel were capitalized for years without challenge.', caughtBy: ['ia', 'sox'], concept: 'Internal control over financial reporting' },
    { id: 'f4', text: 'Executives were rewarded on EPS and held stock options, so everyone needed the number.', caughtBy: ['comp'], concept: 'Compensation committee' },
    { id: 'f5', text: 'Don had nowhere safe to take his concerns, and he was fired for raising them.', caughtBy: ['hotline', 'audit'], concept: 'Whistleblower programs' },
    { id: 'f6', text: 'The president shrieked at the auditors. The tone at the top was “make the number.”', caughtBy: ['indep', 'code'], concept: 'Tone at the top' },
  ],
};

export const CLOSING_QUOTE = {
  text: 'I came to realize that if you allow the numbers to be manipulated, the company’s whole management control system disintegrates. It has nothing to do with ethics. It’s just that you can’t conduct a business that way.',
  who: 'Don Russell',
};

export const TAKEAWAYS = [
  'Earnings management wins in the short run and destroys the information the whole management control system depends on.',
  'Governance only works when the board, the audit committee and the auditors are independent, competent and willing to challenge management.',
  'A CPA’s duty runs to the public: never be associated with numbers you know are misleading (CPA Ontario Code, Rule 205).',
];

// Reference sheet teams can open on their phones at any time.
export const CASE_FILE = [
  { title: 'People', items: [
    'Don Russell: CPA. Senior manager at Touche & Young, evening MBA. Corporate controller at Cook & Spector 1985–1989 (VP and Controller from 1986). CFO of ETI from December 1989.',
    'Joe Blevins: ETI president. Former Touche & Young audit partner with an explosive personality.',
    'ETI chairman: strongly opposed to any correcting entry.',
    'ETI board: the chairman, the president, the previous CFO and the chairman’s friend. Don: it provided “no control.”',
    'Queen’s Industries: British parent that acquired Cook & Spector in 1984.',
    'NTC (National Telephone Corporation): offered to buy new ETI shares at a premium and make ETI a partner in satellite telephones.',
  ] },
  { title: 'Cook & Spector, 1985–1989', items: [
    '$4 billion consumer products division of Queen’s, with 60 divisions and over 600 product lines.',
    '33 consecutive years of rising quarterly earnings.',
    '1985: profit ran $45M ahead of a $200M plan. Don set up reserves, including $53M for taxes, spread across 600 product lines.',
    'Don cut the controller’s staff from 250 to 110, saving over $4M a year.',
    '1986 and 1988: management wanted 8% earnings growth each year. Reserves were released to deliver it.',
    'Division bonuses: 70% to 100% of base salary, tied to operating profit. Roughly $40M of reserves sat ready against a $200M target.',
    'Don’s pay: about $130,000 salary and $230,000 in total.',
    'Don proposed cash-flow and shareholder-value measures. Top management refused, and he left in 1989.',
  ] },
  { title: 'Eastern Technologies (ETI), 1989–1991', items: [
    'Public communications company in Stamford, Connecticut. IPO in 1984 at $11. FY1988 revenue $30M, profit just over $1M.',
    '1989 revenue $81M, almost three times 1988, but profit just under $1M.',
    'Debt to equity of 6 to 1 after a $25M high-yield bond.',
    'Aggressive accounting: virtually all repairs capitalized; $3.5M of interest capitalized; 12-year depreciation on equipment that lasts about 5 years; travel and other costs pushed into goodwill (40 years); a $0.5M gain booked as profit.',
    'Of $10M in FY1990 capital additions, $3.5M was interest and $2M should have been expensed.',
    'Auditors gave an unqualified opinion while telling the board the statements were “pushing the edge on aggressive reporting.”',
    'FY1991 budget: a $2M loss. By January 1991 the forecast was a $4M loss.',
  ] },
  { title: 'Don’s position, February 1991', items: [
    'He believes the problem is at least $5.5M.',
    'A correction would breach debt covenants, put the NTC deal at risk and likely cost him his job.',
    'His stock options are worth several hundred thousand dollars, and half can be exercised in two months.',
    'He has six children and pays $60,000 a year in alimony.',
    'The quarterly report is due to the SEC on the 15th.',
  ] },
  { title: 'Key terms', items: [
    'Earnings management: actions that make performance look better in the short run with no real economic benefit.',
    'Reserves (“cookie jar”): amounts set aside in good years and released later to smooth earnings.',
    'Capitalizing: recording a cost as an asset instead of an expense, which raises current profit.',
    'Debt covenants: conditions in a loan agreement. Breaching them can let lenders demand repayment.',
    'MD&A: management’s discussion and analysis in the annual report.',
  ] },
];

// ---------- Steps: the linear script the host walks through ----------
export const BOARD_ROUND = ROUNDS.length; // index used for board answers

export function buildSteps() {
  const s = [{ kind: 'lobby', label: 'Lobby: teams join' }, { kind: 'intro', label: 'You are Don Russell' }];
  ROUNDS.forEach((r, i) => {
    s.push({ kind: 'question', round: i, label: `R${i + 1} ${r.title}: teams vote` });
    s.push({ kind: 'tally', round: i, label: `R${i + 1} How the room voted` });
    s.push({ kind: 'effects', round: i, label: `R${i + 1} Consequences` });
    s.push({ kind: 'don', round: i, label: `R${i + 1} What Don did` });
    s.push({ kind: 'standings', round: i, label: `Standings after R${i + 1}` });
  });
  s.push({ kind: 'unravel', label: 'What happened next' });
  s.push({ kind: 'board', round: BOARD_ROUND, label: 'R6 You are the board: teams pick fixes' });
  BOARD.failures.forEach((f, i) => s.push({ kind: 'boardfail', idx: i, label: `Board check ${i + 1}: ${f.concept}` }));
  s.push({ kind: 'final', label: 'Final standings (recalculated)' });
  s.push({ kind: 'quote', label: 'Don in his own words' });
  s.push({ kind: 'summary', label: 'Summary and final podium' });
  return s;
}
export const STEPS = buildSteps();

// ---------- Scoring ----------
const clamp = (v) => Math.max(0, Math.min(MAX, v));

// answers: { [teamId]: { [round]: choice } }, choice is a letter for rounds, an array of fix ids for the board
export function teamMeters(teamAnswers, uptoRound) {
  const m = { earn: BASE, bonus: BASE, info: BASE, legal: BASE };
  for (let i = 0; i <= Math.min(uptoRound, ROUNDS.length - 1); i++) {
    const pick = teamAnswers && teamAnswers[i];
    const ch = ROUNDS[i].choices.find((c) => c.id === pick);
    if (!ch) continue;
    for (const k in ch.effects) m[k] = clamp(m[k] + ch.effects[k]);
  }
  return m;
}

export function validBoard(picks) {
  if (!Array.isArray(picks)) return [];
  const ids = new Set(BOARD.fixes.map((f) => f.id));
  const out = []; let spent = 0;
  for (const p of picks) {
    const f = BOARD.fixes.find((x) => x.id === p);
    if (!f || !ids.has(p) || out.includes(p)) continue;
    if (spent + f.cost > BOARD_BUDGET) continue;
    out.push(p); spent += f.cost;
  }
  return out;
}

export function boardCatches(picks) {
  const v = validBoard(picks);
  return BOARD.failures.filter((f) => f.caughtBy.some((id) => v.includes(id))).map((f) => f.id);
}

export function shortTermScore(m) { return m.earn + m.bonus; }
export function finalScore(m, catches) { return m.info + (MAX - m.legal) + catches * BOARD_POINTS_PER_CATCH; }

// teams: [{id, name}], answers map as above
export function standings(teams, answers, uptoRound, mode) {
  const rows = teams.map((t) => {
    const a = answers[t.id] || {};
    const m = teamMeters(a, uptoRound);
    const catches = boardCatches(a[BOARD_ROUND]).length;
    const score = mode === 'final' ? finalScore(m, catches) : shortTermScore(m);
    return { id: t.id, name: t.name, meters: m, catches, score };
  });
  rows.sort((x, y) => y.score - x.score || x.name.localeCompare(y.name));
  return rows;
}

export function tally(teams, answers, round) {
  const counts = {};
  ROUNDS[round].choices.forEach((c) => (counts[c.id] = []));
  teams.forEach((t) => {
    const p = answers[t.id] && answers[t.id][round];
    if (counts[p]) counts[p].push(t.name);
  });
  return counts;
}
