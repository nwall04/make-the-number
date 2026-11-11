// Make the Number: game content, teaching slides and scoring.
// Everything here comes from the Don Russell case (Merchant), the Don Russell (A) outcome,
// the teaching note, and the Chapter 13 slides (Corporate Governance and Boards of Directors).
// Meters start at BASE and are clamped to 0..MAX.

export const BASE = 10;
export const MAX = 20;
export const QUESTION_SECONDS = 90;
export const BOARD_SECONDS = 150;
export const BOARD_BUDGET = 100;
export const BOARD_POINTS_PER_CATCH = 2;
export const CLASS_MINUTES = 75; // hard cap for the slot

export const METERS = [
  { key: 'earn', label: 'Reported earnings', short: 'Earnings', good: 'high' },
  { key: 'bonus', label: 'Your bonus and career', short: 'Bonus', good: 'high' },
  { key: 'info', label: 'Information quality', short: 'Info quality', good: 'high' },
  { key: 'legal', label: 'Legal exposure', short: 'Legal risk', good: 'low' },
];

export const INTRO = {
  kicker: 'August 1985',
  title: 'You are Don Russell',
  lede: 'Follow Don’s career through two companies and make his five hardest calls. Four meters track the consequences.',
  career: [
    { when: '1973–1985', where: 'Touche & Young', role: 'Auditor, then senior manager', facts: ['CPA, on track for partner', 'Evening MBA in information systems'] },
    { when: '1985–1989', where: 'Cook & Spector', role: 'Corporate controller, then VP and controller', facts: ['$4B consumer products division of Queen’s Industries', '250 staff and “carte blanche” to fix the systems'], rounds: 'Rounds 1–3' },
    { when: '1989–1991', where: 'Eastern Technologies (ETI)', role: 'Chief financial officer', facts: ['Small public cable and satellite company', 'Growing fast on high-yield debt'], rounds: 'Rounds 4–5' },
  ],
  rewarded: 'The company ranks you on reported earnings and your bonus. The simulation tracks all four meters.',
};

export const ROUNDS = [
  {
    id: 'r1',
    role: 'Corporate controller, Cook & Spector',
    brief: 'Profit is $45M ahead of plan and you decide how much of it gets reported.',
    company: 'Cook & Spector',
    year: '1985',
    title: 'The surplus',
    setup:
      'Profit is running $45 million ahead of the $200 million plan. C&S expensed the costs of the Queen’s acquisition aggressively, so the IRS could disallow some deductions, and everyone agrees the accounting system is poor. You can set up reserves and spread them across 34 income statement lines in 600 product lines, where the Queen’s analysts and the auditors will not see them.',
    facts: ['$45M ahead of plan', '$200M profit plan', '34 lines × 600 product lines × 60 divisions'],
    prompt: 'What do you do with the surplus?',
    choices: [
      { id: 'A', label: 'Report the full surplus', detail: 'Show Queen’s the whole $45M beat and book nothing for the tax risk.', why: 'Honest about the beat, but ignores a real tax exposure.', effects: { earn: 3, bonus: 1, info: 1, legal: 1 } },
      { id: 'B', label: 'Build a cookie jar', detail: 'Book a $53M tax reserve plus “unknown liability” reserves, spread so nobody notices.', why: 'Future years look smooth; the owner no longer sees real results.', effects: { earn: 0, bonus: 2, info: -3, legal: 1 } },
      { id: 'C', label: 'Reserve only what you can support', detail: 'Book a documented reserve for the real IRS risk and disclose it to Queen’s.', why: 'A reserve with a basis and a disclosure is accounting, not a game.', effects: { earn: 1, bonus: 1, info: 2, legal: 0 } },
    ],
    don: {
      choice: 'B',
      text: 'Don set up several large reserves, including $53 million for taxes and more for “unknown liabilities,” and spread them across the 34 line items of 600 product lines so that neither the Queen’s analysts nor the auditors would notice. No significant questions were raised.',
      quote: 'It’s better to be safe than sorry. If it turns out that we were overly conservative, it’s no big deal.',
    },
    standard: {
      verdict: 'Falls short',
      expected: 'C',
      points: [
        'A reserve with no supportable basis misstates results. A CPA must not be associated with statements they know are false or misleading (CPA Ontario Code, Rule 205).',
        'Hiding the reserves from the owner and the auditors fails the controller’s fiduciary duty to report fairly.',
        'Expected conduct: book only what you can support, document it and disclose it to Queen’s.',
      ],
    },
    hostQ: 'Read the situation aloud, then the decision. Remind teams the owner is Queen’s, not C&S management.',
    host: 'Ask: is a reserve you cannot support “conservative” or is it manipulation? The teaching slide that follows gives it a name.',
  },
  {
    id: 'r2',
    role: 'Corporate controller, Cook & Spector',
    brief: 'Results are below forecast and top management wants 8% earnings growth anyway.',
    company: 'Cook & Spector',
    year: '1986',
    title: 'The 8% request',
    setup:
      'Sales and profits come in below forecast. Top management tells you they want to use some of the reserves: report an 8% increase in earnings and spend significantly more on new product development. C&S has reported 33 consecutive years of rising quarterly earnings, and the reserves you built last year are sitting there.',
    facts: ['Earnings target: +8%', 'Sales below forecast', '33 years of rising earnings'],
    prompt: 'Top management is waiting. What do you do?',
    choices: [
      { id: 'A', label: 'Release the reserves', detail: 'Free up enough to hit 8% and fund the product spending.', why: 'The trend line stays perfect; the real decline is invisible to the owner.', effects: { earn: 3, bonus: 3, info: -2, legal: 1 } },
      { id: 'B', label: 'Report the real number', detail: 'Earnings are down. Say so.', why: 'The streak ends and your bosses are unhappy, but Queen’s sees the truth.', effects: { earn: -2, bonus: -3, info: 2, legal: 0 } },
      { id: 'C', label: 'Release, but tell Queen’s', detail: 'Release the reserves and disclose the amount released to the parent company.', why: 'Better than silence, but the published trend is still smoothed.', effects: { earn: 1, bonus: 0, info: 1, legal: 0 } },
    ],
    don: {
      choice: 'A',
      text: 'Don freed up the reserves. His superiors were ecstatic. After a year he was promoted to Vice President and Controller, and after presenting a six-month plan he got a $30,000 bonus on the spot.',
      quote: 'One time the president called me the Monet of the accounting profession.',
    },
    standard: {
      verdict: 'Falls short',
      expected: 'B',
      points: [
        'Releasing reserves to hit a target is earnings management: performance looks better in the short run with no real economic benefit.',
        'Queen’s, the owner, now makes decisions on smoothed numbers that hide a real decline. Rule 205 covers misleading statements to the people who rely on them.',
        'Expected conduct: report the real result, or at minimum disclose the release to the owner.',
      ],
    },
    hostQ: 'Point out that the reserves only exist because of Round 1. Teams that chose C last round have less to release.',
    host: 'Ask: who is harmed here? Queen’s is making decisions on numbers that are not real. Smoothed trends hide operating problems from the people who could fix them.',
  },
  {
    id: 'r3',
    role: 'VP and controller, Cook & Spector',
    brief: 'You discover the whole bonus system runs on a profit number managers can manipulate.',
    company: 'Cook & Spector',
    year: '1988',
    title: 'The bonus machine',
    setup:
      'Another down year, and the president wants another 8%. Against a target of about $200 million there is roughly $40 million in reserves ready to help. Your fact-finding study shows division bonuses of 70% to 100% of base salary ride on operating profit, and the divisions have buried reserves of their own, probably larger than yours. The executive parking lot is full of BMWs.',
    facts: ['Bonuses: 70–100% of salary', '~$40M in reserves vs ~$200M target', 'Your pay: ~$230K on a $130K salary'],
    quote: 'On a monthly basis, one of the most important decisions I make is how much profit to recognize. (Head of the largest operating unit)',
    prompt: 'You now see how the system really works. What do you do?',
    choices: [
      { id: 'A', label: 'Keep the machine running', detail: 'Everyone hits target, everyone gets paid.', why: 'Comfortable for everyone, and every trend line is now fiction.', effects: { earn: 2, bonus: 3, info: -3, legal: 1 } },
      { id: 'B', label: 'Drain the reserves now', detail: 'Strip them out of 600 product P&Ls and fight the divisions.', why: 'Cleaner numbers, but the divisions keep their own reserves and the incentive stays.', effects: { earn: -2, bonus: -2, info: 2, legal: -1 } },
      { id: 'C', label: 'Fix the incentives', detail: 'Propose replacing operating-profit bonuses with cash-flow and shareholder-value measures.', why: 'Attacks the cause. Works only if management agrees.', effects: { earn: 0, bonus: -1, info: 2, legal: 0 } },
      { id: 'D', label: 'Tell the owner', detail: 'Report the practice to Queen’s corporate staff, the people being misled.', why: 'The owner can change the bonus plan; management will not.', effects: { earn: -1, bonus: -3, info: 3, legal: -1 } },
    ],
    don: {
      choice: 'C',
      text: 'Don tried to drain the reserves and found the divisions had buried more of their own. He proposed a cash-flow and shareholder-value system. Top management was completely opposed: why change when the company was doing so well? Don got bored and left for ETI in December 1989. The problem stayed.',
      quote: 'We were getting our bonuses for nothing – actually worse than nothing because we were making bad decisions.',
    },
    standard: {
      verdict: 'Partly meets',
      expected: 'D',
      points: [
        'Proposing better measures is what a strong controller does: act as the conscience of the organization and challenge management constructively.',
        'But when management refused, Don left without escalating to the owner. Queen’s was still being fed numbers he knew were distorted.',
        'Expected conduct: take it to those charged with governance (Queen’s) when management will not act.',
      ],
    },
    hostQ: 'Four options this time. Ask teams to decide what Don could actually change on his own.',
    host: 'Ask: whose job is it to design bonuses that cannot be gamed? Not the controller’s. The next two slides: was Don a good controller, and what a compensation committee is for.',
  },
  {
    id: 'r4',
    role: 'Chief financial officer, ETI',
    brief: 'ETI only shows a profit because of aggressive accounting, and your president refuses to fix it.',
    company: 'Eastern Technologies (ETI)',
    year: 'June 1990',
    title: 'The year-end numbers',
    setup:
      'You are now CFO of ETI, a small public cable and satellite company. President Joe Blevins, a former audit partner, capitalizes virtually all repairs, has deferred $3.5 million of interest on a control centre that has run since mid-1988, and depreciates five-year electronics over 12 years. Of this year’s $10 million in capital additions, $3.5 million is interest and $2 million is repairs and engineering salaries. National Telephone (NTC) is about to buy ETI shares at a premium. You propose an adjustment of nearly $2 million, twice the profit ETI would otherwise report.',
    facts: ['$5.5M of $10M additions should be expenses', '12-year life on 5-year equipment', 'NTC deal pending'],
    quote: 'No! No! No! You don’t understand. We’ve got NTC going to hand us an enormous amount of money. We must report the profits they’re expecting or they’ll back away from us. I’ll talk to the auditors. (Joe Blevins)',
    prompt: 'Joe says no. What do you do?',
    choices: [
      { id: 'A', label: 'Book the adjustment anyway', detail: 'Override the president and record the $2M yourself.', why: 'Right number, wrong process: a CFO cannot post entries over the president, and you are fired before the ink dries.', effects: { earn: -3, bonus: -3, info: 2, legal: -1 } },
      { id: 'B', label: 'Sign, but warn in the MD&A', detail: 'Accept the numbers, disclose the capitalized interest and warn that FY1991 profits will be much lower.', why: 'A footnote does not fix statements you believe are wrong.', effects: { earn: 2, bonus: 1, info: 0, legal: 1 } },
      { id: 'C', label: 'Take it to the board and the auditors', detail: 'Put your analysis in writing to the people charged with governance.', why: 'The governance route: the board and the auditors exist for exactly this.', effects: { earn: -1, bonus: -2, info: 3, legal: -2 } },
      { id: 'D', label: 'Sign and stay quiet', detail: 'Joe knows the market. Trust the plan.', why: 'The number holds, and your name is on it.', effects: { earn: 3, bonus: 2, info: -3, legal: 3 } },
    ],
    don: {
      choice: 'B',
      text: 'Don signed. He wrote into the MD&A that FY1991 would be a restructuring year with much lower profits and disclosed how much interest had been capitalized. The auditors gave an unqualified opinion while telling the board the statements were “pushing the edge on aggressive reporting.” The board was the chairman, the president, the previous CFO and a friend of the chairman.',
      quote: 'I had to leave the room because it was so outrageous.',
    },
    standard: {
      verdict: 'Falls short',
      expected: 'C',
      points: [
        'A warning in the MD&A does not fix financial statements the CFO believes are misstated (Rule 205).',
        'Don let the president’s pressure override his professional judgment. Rule 202 requires integrity, due care and objectivity.',
        'Expected conduct: escalate to the board and the auditors in writing, and refuse to sign statements he believes are misleading.',
      ],
    },
    hostQ: 'Read Joe’s quote in his voice. Ask teams to notice who sits on ETI’s board before they answer.',
    host: 'Ask: where was the board? Where were the auditors? The next two slides: directors’ duties, independence and competence, then audit committees and auditors.',
  },
  {
    id: 'r5',
    role: 'Chief financial officer, ETI',
    brief: 'The loss is real, the report is due to the SEC, and fixing it will likely cost you your job.',
    company: 'Eastern Technologies (ETI)',
    year: 'February 1991',
    title: 'The decision',
    setup:
      'The forecast has fallen from a $2 million loss to a $4 million loss and management will not cut costs. You believe the accounting problem is at least $5.5 million. A correction breaches the debt covenants, threatens the NTC deal and will get you fired for “not being a team player.” Your options are worth several hundred thousand dollars and half can be exercised in two months. You have six children and pay $60,000 a year in alimony. The chairman and the president are strongly against any correcting entry.',
    facts: ['Problem: at least $5.5M', 'Covenants at risk', 'Half your options vest in 2 months'],
    prompt: 'The quarterly report is due to the SEC on the 15th. What do you do?',
    choices: [
      { id: 'A', label: 'Full correction, in writing', detail: 'Book about $5.5M. Send your analysis to the president, the board and the auditors together. Resign if refused.', why: 'The statements are right and the record shows you made them right.', effects: { earn: -4, bonus: -4, info: 4, legal: -4 } },
      { id: 'B', label: 'Force a $1M loss', detail: 'A smaller number that shows you are “stretching” in Joe’s direction.', why: 'The trend turns, but the statements are still short of what you believe.', effects: { earn: -2, bonus: -3, info: 1, legal: -1 } },
      { id: 'C', label: 'Tell the auditors', detail: 'Let the auditors force management to act.', why: 'Same consequences for you, and these auditors have already folded once.', effects: { earn: -1, bonus: -2, info: 1, legal: -1 } },
      { id: 'D', label: 'Wait two months', detail: 'Keep arguing for change and exercise your options first.', why: 'You keep the job and the money, and a legal problem if it ever comes out.', effects: { earn: 2, bonus: 4, info: -3, legal: 4 } },
      { id: 'E', label: 'Go to the SEC', detail: 'Report ETI to the regulator now, before trying the board.', why: 'Stops the misstatement, but skips the internal route the Code expects first.', effects: { earn: -4, bonus: -4, info: 3, legal: -3 } },
    ],
    don: {
      choice: 'B',
      text: 'Don told Joe ETI would report a $1 million loss for the quarter, though he believed it should be $2 million or more. The chairman called, furious: “You’ve just got cold feet. Let’s just work the plan.” Don did not move. Two days later he was fired. He told Joe that without a cheque for a year’s salary he would go to the SEC. Joe wrote the cheque.',
      quote: 'You are going to report this number because I won’t go to jail.',
    },
    standard: {
      verdict: 'Partly meets',
      expected: 'A',
      points: [
        'Forcing a correction took real courage, and it was the right direction.',
        'But $1M was less than his own estimate of $2M or more, so the statements were still misleading.',
        'Taking a year’s salary in exchange for not going to the SEC put personal gain ahead of the public interest (Rules 201 and 202).',
        'Expected conduct: book the full correction, escalate to the board and the auditors, resign if refused, and get advice on reporting. Never accept payment for silence.',
      ],
    },
    hostQ: 'This is the real case decision. Give it the full 90 seconds and add 30 if the room is still arguing.',
    host: 'Ask: was $1M enough? Was taking a year’s salary for silence ethical? CPA Ontario Code: integrity and due care (Rule 202), never associated with misleading statements (Rule 205), and the good reputation of the profession (Rule 201).',
  },
];

export const UNRAVEL = {
  kicker: 'What happened next',
  title: 'Short-term gains, long-term consequences',
  stat: { value: '−50%', label: 'ETI stock the week the auditors resigned' },
  events: [
    { when: '1991–1993', text: 'ETI keeps reporting record earnings for more than two years and the stock keeps rising.' },
    { when: '1994', text: 'The auditors challenge items worth more than half of first-quarter profit. Management replaces each rejected item with a new one. The auditors resign.' },
    { when: '1994', text: 'The stock falls about 50%, recovers 30% of the drop, and two months later ETI agrees to be bought by a long-distance telephone company.' },
    { when: 'Three years on', text: 'After a three-year investigation the SEC charges the chairman with securities fraud and insider trading. The president and the CFO who replaced Don are indicted. First-quarter 1994 earnings had been inflated by 66%.' },
  ],
  line: 'The short-term numbers caught up with ETI. Your score is now recalculated on what lasts: information quality and legal exposure.',
};

export const BOARD = {
  title: 'You are ETI’s new board',
  setup: 'After the scandal, shareholders replaced ETI’s board with you. Fix the six failures from the case that let the numbers go wrong. You have 100 governance points, and not every fix fits.',
  fixes: [
    { id: 'indep', label: 'Independent majority on the board', cost: 25, concept: 'Board independence' },
    { id: 'chair', label: 'Separate the chair and CEO roles', cost: 10, concept: 'Board independence' },
    { id: 'audit', label: 'Independent, financially literate audit committee', cost: 25, concept: 'Audit committee' },
    { id: 'ia', label: 'Internal audit reporting to the audit committee', cost: 20, concept: 'Internal control' },
    { id: 'comp', label: 'Compensation committee ties pay to cash flow and long-term results', cost: 15, concept: 'Compensation committee' },
    { id: 'rotate', label: 'Audit committee hires the auditor; partner rotation', cost: 15, concept: 'Auditor independence' },
    { id: 'hotline', label: 'Whistleblower channel straight to the audit committee', cost: 10, concept: 'SOX 404: whistleblower program' },
    { id: 'sox', label: 'Annual internal control assessment, signed by the CEO and CFO', cost: 20, concept: 'SOX 404: internal control' },
    { id: 'code', label: 'Code of conduct and ethics training', cost: 5, concept: 'SOX 404: tone at the top' },
  ],
  failures: [
    { id: 'f1', text: 'The board was the chairman, the president, the previous CFO and the chairman’s friend. Don: it provided “no control.”', caughtBy: ['indep', 'chair'], concept: 'Board independence' },
    { id: 'f2', text: 'The auditors did not understand satellite technology, were afraid of Joe, and reported to the people they were auditing.', caughtBy: ['audit', 'rotate'], concept: 'Audit committee oversight of the auditor' },
    { id: 'f3', text: 'Repairs, interest and travel were capitalized for years and nobody inside the company tested it.', caughtBy: ['ia', 'sox'], concept: 'Internal control over financial reporting' },
    { id: 'f4', text: 'ETI’s whole focus was EPS, and the people reporting it held large blocks of stock and options.', caughtBy: ['comp'], concept: 'Compensation committee' },
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

// ---------- Teaching slides (Chapter 13) woven into the run of show ----------
// cols: [{ h, tone: 'concept' | 'case' | 'plain', items: [string | { when, text }] }]
// cards: [{ n, h, p, mark: 'ok' | 'warn' }]   line: closing sentence   phone: one line for team devices
export const SLIDES = {
  why: {
    kicker: 'Chapter 13 · Corporate governance',
    title: 'Who controls the people at the top?',
    cols: [
      { h: 'The concept', tone: 'concept', items: [
        'A management control system asks: how does top management make sure employees behave well?',
        'Corporate governance asks the broader question: how do owners make sure top management behaves well?',
        'Governance is the set of mechanisms and processes that ensure a company is directed and managed to create value for its owners while meeting its responsibilities to other stakeholders.',
        'Dispersed shareholders delegate control to a board of directors. The board monitors and approves management decisions, and chooses, dismisses and rewards managers.',
      ] },
      { h: 'Today', tone: 'case', items: [
        'Don Russell was a controller, then a CFO, in two companies whose top managers wanted the numbers to say something specific.',
        'You make his five hardest calls, see what he did, then rebuild the board that failed him.',
        'Hold one question all class: who was controlling the people Don reported to?',
      ] },
    ],
    phone: 'Governance is control of the people at the top. Keep asking: who was watching Don’s bosses?',
    host: 'Three minutes. Governance = control of top management; the MCS looks down, governance looks at the top. Explain the plan: five decisions, a twist, then they fix the board.',
    minutes: 3,
  },
  em: {
    kicker: 'Chapter 13 · Earnings management',
    title: 'What Don just did has a name',
    cols: [
      { h: 'The definition', tone: 'concept', items: [
        'Earnings management: actions taken to make performance look better than it otherwise would in the short run, where those doing it know the actions have no real economic benefit and may be costly in the long run.',
        'Forms: accounting policy choices, accounting judgments such as reserves, timing of sales, expenses and write-offs, and moving items above or below the line that gets measured.',
        'It is one form of gameplaying. Managers also play games with balance sheets, sales and quality measures.',
      ] },
      { h: 'Why anyone does it', tone: 'plain', items: [
        'Short run: bonuses, promotions, a smoother stock price and easier borrowing.',
        'The market cannot see how much was reserved or capitalized, so the benefit is real while it lasts.',
      ] },
      { h: 'What it costs', tone: 'case', items: [
        'A reputation for low-quality earnings once it is found.',
        'Every trend line is smoothed, so managers cannot spot problems early. Don: “If people have reserves, they don’t have to face the problems.”',
        'A gameplaying culture, and the first step down a slippery slope to fraud.',
      ] },
    ],
    phone: 'Earnings management: making performance look better in the short run with no real economic benefit. Watch the Info quality meter.',
    host: 'Two minutes. Ask: was the $53M tax reserve a judgment or a game? A judgment has a basis and is disclosed. Point at the Info quality meter: that is the intelligence system Merchant means.',
    minutes: 2,
  },
  controller: {
    kicker: 'Chapter 13 · The controller',
    title: 'Was Don a good controller at C&S?',
    lede: 'Sathe’s eight attributes of a strong controller: one who serves management and protects fair reporting.',
    cards: [
      { n: 1, h: 'Energy and initiative', p: 'A doer who takes initiative.', mark: 'ok' },
      { n: 2, h: 'Integrity and professional commitment', p: 'The conscience of the organization.', mark: 'warn' },
      { n: 3, h: 'Accounting knowledge', p: 'Unquestioned technical ability.', mark: 'ok' },
      { n: 4, h: 'Analytical skills', p: 'Spots trends before they become reality.', mark: 'ok' },
      { n: 5, h: 'Business judgment', p: 'Understands the entire business.', mark: 'ok' },
      { n: 6, h: 'Judges what matters to management', p: 'Thinks the way general managers think, and recommends.', mark: 'warn' },
      { n: 7, h: 'Interpersonal skills', p: 'Part of the management team.', mark: 'ok' },
      { n: 8, h: 'Challenges management constructively', p: 'Knows when to pick fights and when to give in.', mark: 'warn' },
    ],
    line: 'Strengths: new systems, 250 staff cut to 110, $4M a year saved, trusted by the team. Weaknesses: little fiduciary duty to Queen’s, distorted the trend data, and left without fixing it.',
    phone: 'Sathe’s strong controller serves management and protects fair reporting. Don delivered the first and lost the second.',
    host: 'Two minutes. Show of hands: good controller or not? The teaching note says students rate him high on 1, 3, 5 and 7 and question 2, 6 and 8. Source: Sathe, Controllership Involvement in Management (1982).',
    minutes: 2,
  },
  comp: {
    kicker: 'Chapter 13 · Compensation committees',
    title: 'Who designs a bonus that cannot be gamed?',
    cols: [
      { h: 'The committee', tone: 'concept', items: [
        'A board committee with a fiduciary duty to keep executive pay fair and appropriate, not excessive: enough to attract, retain and motivate, given the company’s economics and comparable firms.',
        'It approves equity and compensation policies that should motivate superior long-term performance.',
        'It relies on HR for support and often on outside consultants for data the company lacks.',
      ] },
      { h: 'At Cook & Spector', tone: 'case', items: [
        'Division bonuses of 70% to 100% of base salary rode on operating profit, a number the divisions could set themselves.',
        '“There was no linkage between bonuses and a strategic plan, just a link to an accounting number.”',
        'Don proposed cash-flow and shareholder-value measures. Management was completely opposed.',
        'Caution: cash flow can be gamed too (pay bills early or late) and accruals carry real information. The fix is measure design plus oversight, not a new number alone.',
      ] },
    ],
    phone: 'A compensation committee of the board, not the controller, owns the bonus plan. C&S tied 70–100% bonuses to a number managers could set.',
    host: 'Two minutes. Ask: who at C&S could have changed the bonus plan? Not Don. Link to results controls: congruence and controllability.',
    minutes: 2,
  },
  board: {
    kicker: 'Chapter 13 · Boards of directors',
    title: 'Where was ETI’s board?',
    cols: [
      { h: 'What a board owes', tone: 'concept', items: [
        'Duty of care: make, or delegate, decisions in an informed way.',
        'Duty of loyalty: advance the corporation’s interests over personal ones.',
        'Duty of good faith: be faithful to the corporation and its shareholders.',
        'Duty not to waste: never deliberately dissipate shareholder value.',
        'Independence: directors who are not management and have no interlocking ties, accountable to shareholders.',
        'Competence: the board selects and evaluates the CEO and approves strategy and pay policy, so it must understand the business.',
      ] },
      { h: 'ETI’s board', tone: 'case', items: [
        'The chairman. The president. The previous CFO. A friend of the chairman whose company ETI had bought.',
        'Zero independent directors. Two of the four were the people proposing the accounting.',
        'Don’s verdict: it provided “no control.”',
        'Care: uninformed. Loyalty: the chairman later sold stock on inflated earnings. Independence: none. Competence: nobody could test a 12-year equipment life.',
      ] },
    ],
    phone: 'Four duties: care, loyalty, good faith, not to waste. Plus independence and competence. ETI’s board had none of it.',
    host: 'Two minutes. Grade ETI’s board duty by duty. Interlocking directorates: a director who depends on the CEO is not independent even if the org chart says so.',
    minutes: 2,
  },
  audit: {
    kicker: 'Chapter 13 · Audit committees',
    title: 'The missing committee',
    cols: [
      { h: 'Audit committees', tone: 'concept', items: [
        'Independent oversight of financial reporting, internal controls and the external auditor.',
        'Lets the board focus intensively and inexpensively on reporting without involving the whole board.',
        'In public companies: financially literate outside (independent) directors only.',
        'It hires, pays and can fire the auditor, and it is where a CFO with a concern goes.',
      ] },
      { h: 'ETI’s auditors', tone: 'case', items: [
        'Did not understand satellite communications: few retirements yet, so nobody could test the 12-year lives.',
        'Afraid of Joe Blevins, a former audit partner who would call the partner into his office and “literally shriek.”',
        'Did not want to put a client out of business.',
        'Result: an unqualified opinion, plus a quiet warning to a board that was management.',
      ] },
    ],
    line: 'Don, after ETI: “Auditors provide no safety net.” With no audit committee, they reported to the people they were auditing.',
    phone: 'An audit committee of independent, financially literate directors hires the auditor and hears concerns. ETI had none.',
    host: 'Two minutes. Ask: whom did the auditors report to at ETI? Management. That is the structural failure an audit committee fixes. An auditor the CEO can shout at is not independent in fact.',
    minutes: 2,
  },
  sox: {
    kicker: 'Chapter 13 · Sarbanes-Oxley',
    title: 'The law written for companies like ETI',
    cols: [
      { h: 'SOX, 2002', tone: 'concept', items: [
        'Passed after Enron and WorldCom; interest rose again after the 2008 crisis and option backdating.',
        'Goal: improve the transparency, timeliness and quality of financial reporting by SEC registrants.',
        'Key provisions: regulation of external auditors, independent boards and audit committees, stiffer penalties for fraud.',
        'Canada followed: NI 52-109 (CEO and CFO certification) and NI 52-110 (audit committees).',
      ] },
      { h: 'Section 404', tone: 'concept', items: [
        'Management and the external auditor must evaluate internal control over financial reporting and give written opinions.',
        'Scope: policies and procedures, audit committee effectiveness, integrity and ethics programs, whistleblower programs, tone at the top.',
        'Good controls used to be good practice. SOX made them a legal requirement, and the most expensive part of the Act.',
      ] },
      { h: 'Would it have saved ETI?', tone: 'case', items: [
        'ETI’s scheme ran from 1990 to 1994, a decade before SOX.',
        'Some argue the frauds that caused the Act would have happened anyway. Your board round tests that.',
        'Every fix in the toolkit maps to a provision. Notice which ones are cheap.',
      ] },
    ],
    phone: 'SOX 404: management and auditors must test internal controls, audit committees, ethics programs, whistleblower channels and tone at the top. Your toolkit is next.',
    host: 'Three minutes. Say that every fix in the next round maps to a SOX provision or a Chapter 13 concept. Then start the board round.',
    minutes: 3,
  },
  don: {
    kicker: 'The epilogue',
    title: 'Short-term pain, long-term career',
    cols: [
      { h: 'Don', tone: 'concept', items: [
        { when: '1973', text: 'Joins Touche & Young. Senior manager by 1983.' },
        { when: '1985', text: 'Corporate controller at Cook & Spector; VP and controller a year later.' },
        { when: '1989', text: 'CFO of ETI.' },
        { when: 'Feb 1991', text: 'Forces a $1M loss. Fired two days later with a year’s salary.' },
        { when: '1991', text: 'About six months unemployed.' },
        { when: 'Later', text: 'Division controller at a Fortune 500 company, recognized as a top performer, then an officer at corporate headquarters.' },
      ] },
      { h: 'ETI', tone: 'case', items: [
        { when: '1991–93', text: 'Record earnings. Rising stock.' },
        { when: '1994', text: 'Auditors resign. Stock falls 50%. Sold to a long-distance telephone company two months later.' },
        { when: 'Three years on', text: 'After a three-year SEC investigation, the chairman is charged with securities fraud and insider trading. The president and the CFO who replaced Don are indicted.' },
      ] },
    ],
    line: 'The people who stayed and “worked the plan” were the ones indicted. Don’s name is not in the SEC release.',
    phone: 'Don lost the job and the options. The people who kept making the number were charged.',
    host: 'Two minutes. Don says on the video that leaving cost him money. Ask: was the year’s salary for silence extortion? The teaching note says some students think so.',
    minutes: 2,
  },
};

// Reference sheet teams can open on their phones at any time.
export const CASE_FILE = [
  { title: 'People', items: [
    'Don Russell: CPA. Senior manager at Touche & Young, evening MBA. Corporate controller at Cook & Spector 1985–1989 (VP and Controller from 1986). CFO of ETI from December 1989.',
    'Joe Blevins: ETI president. Former Touche & Young audit partner, joined ETI in 1987. Explosive personality; believes EPS is all analysts care about.',
    'ETI chairman: strongly opposed to any correcting entry.',
    'ETI board: the chairman, the president, the previous CFO and the chairman’s friend. Don: it provided “no control.”',
    'Queen’s Industries: British parent that acquired Cook & Spector in 1984.',
    'NTC (National Telephone Corporation): offered to buy new ETI shares at a premium and make ETI a partner in satellite telephones.',
  ] },
  { title: 'Cook & Spector, 1985–1989', items: [
    '$4 billion consumer products division of Queen’s, with 60 divisions and over 600 product lines.',
    '33 consecutive years of rising quarterly earnings.',
    '1985: profit ran $45M ahead of a $200M plan. Don set up reserves, including $53M for taxes, spread across 34 income statement lines in 600 product lines.',
    'Don cut the controller’s staff from 250 to 110, saving over $4M a year, and rebuilt the accounting systems.',
    '1986 and 1988: management wanted 8% earnings growth each year. Reserves were released to deliver it.',
    'Division bonuses: 70% to 100% of base salary, tied to operating profit. Roughly $40M of reserves sat ready against a $200M target. Divisions had buried reserves of their own.',
    'Don’s pay: about $130,000 salary and $230,000 in total.',
    'Don proposed cash-flow and shareholder-value measures. Top management refused, and he left in December 1989.',
  ] },
  { title: 'Eastern Technologies (ETI), 1989–1991', items: [
    'Public cable TV and satellite broadcasting company in Stamford, Connecticut. IPO in 1984 at $11. FY1988 (June year end) revenue $30M, profit just over $1M.',
    '1989 revenue $81M, almost three times 1988, but profit just under $1M after a large fourth-quarter loss.',
    'Debt to equity of 6 to 1 after a $25M high-yield bond. Two acquisitions run as autonomous divisions.',
    'Aggressive accounting: virtually all repairs capitalized; $3.5M of interest capitalized on a control centre running since mid-1988; 12-year depreciation on equipment that lasts about 5 years; travel pushed into goodwill (40 years); a $0.5M gain booked as profit.',
    'Of $10M in FY1990 capital additions, $3.5M was interest and $2M was repairs and engineering salaries.',
    'Year-end 1990: Don proposed an adjustment of nearly $2M. Joe refused. Auditors gave an unqualified opinion while telling the board the statements were “pushing the edge on aggressive reporting.” Don wrote a warning into the MD&A.',
    'FY1991 budget: a $2M loss. By January 1991 the forecast was a $4M loss.',
  ] },
  { title: 'Don’s position, February 1991', items: [
    'He believes the problem is at least $5.5M.',
    'A correction would breach debt covenants, put the NTC deal at risk and cost him his job.',
    'His stock options are worth several hundred thousand dollars, and half can be exercised in two months.',
    'He has six children and pays $60,000 a year in alimony.',
    'The quarterly report is due to the SEC on the 15th.',
  ] },
  { title: 'Key terms', items: [
    'Earnings management: actions that make performance look better in the short run with no real economic benefit (Merchant).',
    'Reserves (“cookie jar”): amounts set aside in good years and released later to smooth earnings.',
    'Capitalizing: recording a cost as an asset instead of an expense, which raises current profit.',
    'Debt covenants: conditions in a loan agreement. Breaching them can let lenders demand repayment.',
    'MD&A: management’s discussion and analysis in the annual report.',
    'Audit committee: independent, financially literate directors who oversee reporting, controls and the auditor.',
    'SOX 404: management and the auditor must test and report on internal control over financial reporting.',
  ] },
];

// ---------- Steps: the linear script the host walks through ----------
export const BOARD_ROUND = ROUNDS.length; // index used for board answers

// Minute budget per step kind (a round is about 5 minutes).
const MIN = { lobby: 3, intro: 3, question: 2, tally: 0.5, effects: 0.5, don: 1.5, standings: 0.5, unravel: 2, board: 3, boardfail: 0.5, final: 2, quote: 1, summary: 3 };

export function buildSteps() {
  const s = [];
  const slide = (id) => s.push({ kind: 'slide', slide: id, label: `Slide: ${SLIDES[id].title}`, minutes: SLIDES[id].minutes });
  const round = (i) => {
    const r = ROUNDS[i];
    s.push({ kind: 'question', round: i, label: `R${i + 1} ${r.title}: teams vote`, minutes: i === 4 ? 3 : MIN.question });
    s.push({ kind: 'tally', round: i, label: `R${i + 1} How the room voted`, minutes: MIN.tally });
    s.push({ kind: 'effects', round: i, label: `R${i + 1} Consequences`, minutes: MIN.effects });
    s.push({ kind: 'don', round: i, label: `R${i + 1} What Don did`, minutes: MIN.don });
    s.push({ kind: 'standings', round: i, label: `Standings after R${i + 1}`, minutes: MIN.standings });
  };
  s.push({ kind: 'lobby', label: 'Lobby: teams join', minutes: MIN.lobby });
  slide('why');
  s.push({ kind: 'intro', label: 'You are Don Russell', minutes: MIN.intro });
  round(0);
  slide('em');
  round(1);
  round(2);
  slide('controller');
  slide('comp');
  round(3);
  slide('board');
  slide('audit');
  round(4);
  s.push({ kind: 'unravel', label: 'What happened next', minutes: MIN.unravel });
  slide('sox');
  s.push({ kind: 'board', round: BOARD_ROUND, label: 'R6 You are the board: teams pick fixes', minutes: MIN.board });
  BOARD.failures.forEach((f, i) => s.push({ kind: 'boardfail', idx: i, label: `Board check ${i + 1}: ${f.concept}`, minutes: MIN.boardfail }));
  s.push({ kind: 'final', label: 'Final standings (recalculated)', minutes: MIN.final });
  slide('don');
  s.push({ kind: 'quote', label: 'Don in his own words', minutes: MIN.quote });
  s.push({ kind: 'summary', label: 'Summary and final podium', minutes: MIN.summary });
  let t = 0;
  s.forEach((st) => { st.planAt = t; t += st.minutes; });
  return s;
}
export const STEPS = buildSteps();
export const PLANNED_MINUTES = STEPS.reduce((a, s) => a + s.minutes, 0);

// What the host should say or ask on each step.
export function hostNote(i) {
  const s = STEPS[i]; if (!s) return '';
  const R = s.round !== undefined && s.round !== null ? ROUNDS[s.round] : null;
  switch (s.kind) {
    case 'lobby': return 'Teams scan the QR code: one device per group, group number as the team name. Start when most are in; latecomers can join at any step.';
    case 'slide': return SLIDES[s.slide].host;
    case 'intro': return 'Walk the timeline left to right. Explain the four meters, and that the standings only count the first two. That is the trap.';
    case 'question': return `${QUESTION_SECONDS} seconds on the clock. ${R.hostQ}`;
    case 'tally': return 'Ask one team on the biggest bar to defend it in one sentence. Ask a lone dissenter why.';
    case 'effects': return 'Walk one row: earnings and bonus go up, information goes down. Ask: who is harmed when information quality drops?';
    case 'don': return R.host;
    case 'standings': return 'Point at the leader: they managed earnings hardest. Say “yet” and move on.';
    case 'unravel': return 'Read the halt banner, then the timeline. Reveal: scores are now recalculated on information quality and legal exposure.';
    case 'board': return `${BOARD_SECONDS} seconds. Teams argue trade-offs. Ask one team why they skipped the audit committee.`;
    case 'boardfail': { const f = BOARD.failures[s.idx]; return `Concept: ${f.concept}. Caught by ${f.caughtBy.map((id) => BOARD.fixes.find((x) => x.id === id).label).join(' or ')}. Ask a team that missed it what they bought instead.`; }
    case 'final': return 'Compare with the short-term board: the Move column shows who rose. Ask the team that fell furthest what they would change.';
    case 'quote': return 'Read it aloud. Note he says it is not about ethics: you cannot run a business on numbers nobody believes.';
    case 'summary': return 'Three takeaways, then open the floor. Keep about five minutes for discussion and questions.';
    default: return '';
  }
}

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
