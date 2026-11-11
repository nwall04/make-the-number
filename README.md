# Make the Number

A live classroom simulation of *Don Russell: Experiences of a Controller/CFO* (Merchant) for ADM 4345. Teams make Don's real decisions on their phones, watch four meters move on the projector, find out what Don actually did, then act as ETI's new board. The scores are recalculated at the end on information quality and legal exposure.

## The three screens

| Page | Who uses it | What it does |
| --- | --- | --- |
| `index.html` | Students before class (the link the professor shares) | Explains the game and the meters, shows the case file, and joins a team with the room code |
| `host.html` | Noah's MacBook | Sign in, create a room, step through the game, extend or lock timers, fix a team's answer by hand |
| `screen.html?room=ABCD` | Classroom computer on the projector | Read-only big-screen view. Press **F** for fullscreen |
| `play.html?room=ABCD` | One device per team | Join with a team name, vote, see the team's meters. The case file is a tap away on phones and stays open beside the game on laptops |
| `screen.html?offline=1` | Classroom computer, if the Wi-Fi fails | Projector and host in one. Teams call out choices, the host taps them in. **H** shows or hides controls, arrow keys move steps |
| `slides.html` | The group, before class | Printable deck of every teaching slide and round in class order (browser Print, landscape, save as PDF) |

## One-time setup (about 20 minutes)

### 1. Supabase (new project, separate from Mo + Mileage)
1. In the Supabase dashboard, choose **New project** (for example `make-the-number`). The free tier is enough.
2. Open **SQL Editor**, paste all of `supabase/schema.sql`, and run it.
3. **Authentication > Users > Add user > Create new user**: enter your email and a password, and tick *Auto confirm user*. This is the only host login.
4. **Project Settings > API**: copy the Project URL and the `anon` public key into `js/config.js`.

### 2. GitHub Pages
1. Create a new public repo (for example `nwall04/make-the-number`) and push this folder to it.
2. **Settings > Pages**: deploy from the `main` branch, root folder.
3. The site is then at `https://nwall04.github.io/make-the-number/`.

## Running the class
1. On the MacBook, open `host.html`, sign in and **Create a new room**. Use a fresh room for the real class.
2. On the classroom computer, open the projector link shown in the host panel. Press F for fullscreen.
3. Teams scan the QR code on the lobby screen.
4. Press **Next** (or the right arrow key) to move through the steps. Teaching slides are steps too, so nothing leaves this screen. Question steps start a 90-second timer (150 seconds for the board round). Use **+30 s** or **Lock now** as needed.
5. The **class clock** in the host panel starts when you leave the lobby and compares you with the minute plan (about 64 of the 75 minutes, leaving time for discussion). The host note under the controls says what to ask on each step.
6. If a phone dies, tap that team's letter in the Answers box on the host panel.

## Testing without Supabase
- `screen.html?offline=1` runs the full game on one machine.
- `test/fake-supabase.js` is a stand-in database used by the local browser test only. It is never loaded by the live pages.

## Editing the content
All case text, choices, meter effects, teaching slides (`SLIDES`), host notes, the minute budget, board fixes and scoring live in `js/content.js`. The run of show is `buildSteps()` in the same file.
