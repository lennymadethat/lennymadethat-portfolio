// lennymadethat.com — explainer infographic generation (Nano Banana Pro).
// House style adapted from assemblyfloor/assets/gen/gen-images.mjs — same formula,
// portfolio palette (safety orange on white) instead of Assembly Floor blue.
// Reads NANO_BANANA_MCP_TOKEN from vault-secrets/.env.master. Skips existing files.
// Usage: node scripts/gen-images.mjs [only-id ...]
// INSPECT every generated image before shipping — roughly 1 in 6 has a text flaw.
import fs from 'node:fs';
import path from 'node:path';

const ENV = fs.readFileSync('C:/Users/lenny/vault-secrets/.env.master', 'utf8');
const TOKEN = ENV.match(/^NANO_BANANA_MCP_TOKEN=(.+)$/m)?.[1]?.trim();
if (!TOKEN) { console.error('no NANO_BANANA_MCP_TOKEN in .env.master'); process.exit(1); }
const ENDPOINT = 'https://nano-banana-mcp.ianleonard1988.workers.dev/generate';
// The worker sits behind Cloudflare's bot rules — a browser UA is required or it 403s (1010).
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36';

const OUT = path.resolve('img/hiw');
fs.mkdirSync(OUT, { recursive: true });

const STYLE = `STYLE — match this exactly, it is an established house style:
Clean corporate flat-vector infographic on a pure WHITE background. Landscape 16:9.
Palette: safety orange #F04D23 as the dominant accent, deep ink #14181B for headings and body
text, soft warm grey #F2F1EC for panel fills, with sparing status colours: green #2E9E6B
(healthy), amber #E8A020 (warning), red #ED1C24 (fault), purple #8844CC (intelligence).
Typography: a heavy CONDENSED UPPERCASE sans-serif for the main title (like Oswald), a clean
humanist sans for labels and captions. Title sits across the top in bold near-black ink.
Components: white rounded-rectangle cards with a thin light grey border and a soft drop shadow,
each card carrying a small colourful flat-illustration icon on its left and a short bold label.
Thick smooth orange arrows with rounded arrowheads connect the elements, curving naturally.
Numbered step markers are solid orange filled circles with a white numeral inside.
Where people appear, draw friendly semi-realistic diverse illustrated portrait avatars inside
circles, with clean rounded speech bubbles containing short quoted questions.
Where hardware appears, draw crisp realistic product mockups: a laptop and a smartphone showing
an orange-and-white dashboard UI, a desk scanner, a document.
Generous white space. Everything aligned to a clean grid. No clutter, no gradients on the
background, no photographic textures, no drop-shadow overload.
No company logos or brand marks of any kind anywhere.

TEXT ACCURACY IS CRITICAL: render every word of specified text exactly as written, correctly
spelled, fully legible, with no invented, duplicated, garbled or placeholder words. Do not add
any text that is not specified. Prefer fewer, larger, perfectly rendered words over many small ones.`;

const JOBS = [
  {
    id: 'A1', file: 'os-01-map.png',
    prompt: `Create a landscape infographic titled exactly: "ONE MEMORY, MANY WORKERS"
With a smaller subtitle directly underneath in grey, exactly: "Every agent reads and writes the same vault"

Three zones left to right, each with a solid orange numbered circle marker.

Zone 1, headed exactly "WHAT COMES IN" — a vertical stack of five white cards, each with a
distinct small colourful flat icon on the left and a bold short label, exactly:
"Documents" (document icon), "Scans" (desk scanner icon), "Audio" (microphone icon),
"Video" (play icon), "Notes" (notepad icon).
Curved orange arrows sweep from all five cards into zone 2.

Zone 2, headed exactly "THE VAULT" — one large orange hexagonal data-core glyph in the centre
with a small grey caption directly under it, exactly: "one live record of everything".

Zone 3, headed exactly "THE CREW" — six white cards in two columns of three, each with a small
flat icon and a bold label, exactly: "INGESTER", "HARVESTER", "SENTINEL", "RICO", "SCOUT",
"COACH". Thick orange double-headed arrows connect zone 2 to this group, showing that the
agents both read from and write to the vault.

At the far right edge, a crisp realistic smartphone mockup showing an orange-and-white dashboard,
with a small bold label underneath, exactly: "ANY SURFACE".`
  },
  {
    id: 'A2', file: 'os-02-intake.png',
    prompt: `Create a landscape infographic titled exactly: "WHAT HAPPENS WHEN YOU DROP A FILE"
With a smaller subtitle directly underneath in grey, exactly: "One inbox. Nothing arrives unnoticed."

Five white rounded cards in a horizontal row, connected left to right by thick smooth orange
arrows with rounded arrowheads. Each card has a solid orange numbered circle marker at its top
left, a clear flat illustration filling the upper half, a bold navy-ink label, and a small grey
caption beneath. Exactly:

Card 1 — illustration: a hand dropping a document into an open tray. Label exactly "IT LANDS".
Caption exactly "one inbox, any file type".
Card 2 — illustration: a magnifying glass over a folder. Label exactly "IT IS CLASSIFIED".
Caption exactly "routed to the right project".
Card 3 — illustration: a desk scanner with a page emerging, beside a laptop showing an
orange-and-white dashboard. Label exactly "IT IS READ". Caption exactly "even with no text layer".
Card 4 — illustration: a small image thumbnail card. Label exactly "IT GETS A PICTURE".
Caption exactly "page one, rendered".
Card 5 — a solid ORANGE filled card with white text. Illustration: a filing cabinet with a green
check mark. Label exactly "IT IS FILED". Caption exactly "and every surface can see it".

Along the bottom, a full-width pale grey strip containing a small orange lightning icon and the
text exactly: "SCANNED PAPER IS THE HARD CASE — IT GOES TO A VISION MODEL, IN ABOUT 18 SECONDS"`
  },
  {
    id: 'A3', file: 'os-03-engines.png',
    prompt: `Create a landscape infographic titled exactly: "TWO ENGINES, ONE RECORD"
With a smaller subtitle directly underneath in grey, exactly: "Different machines. Identical output."

A symmetrical converging layout.

Upper left, a white card headed exactly "ON THE WORKSTATION" containing a crisp realistic desktop
computer mockup, with three small bullet labels beneath it, exactly: "Runs while the machine is on",
"Subscription brain", "No metered spend".

Upper right, a white card headed exactly "IN THE CLOUD" containing a simple flat cloud icon with a
small clock glyph, with three small bullet labels beneath it, exactly: "Runs on a schedule",
"Works with the PC off", "Same output shape".

Thick smooth orange arrows curve down and inward from both cards, meeting at a single wide
ORANGE filled card at the bottom centre, with white text reading exactly "ONE EVENTS TABLE",
and a smaller white caption underneath, exactly: "every surface reads this, and never needs to
know which engine did the work".

At the bottom right corner, a small white card with a green check icon and text exactly:
"MARGINAL COST: ZERO"`
  },
  /* ── product how-it-works cards (2026-08-29) ──────────────────────────
     Step names and counts are copied from the `how` array in products.js on
     purpose: an infographic that disagrees with the paragraph beside it is
     worse than no infographic. If the copy changes, change these too. ── */
  {
    id: 'P1', file: 'playletter-how.png',
    prompt: `Create a landscape infographic titled exactly: "FROM INBOX TO EARBUDS"
With a smaller subtitle directly underneath in grey, exactly: "One render per edition. Any number of listeners."

Four white rounded cards in a single horizontal row, left to right, each with a solid orange
filled circle marker numbered 1 to 4, a distinct small colourful flat icon, a bold uppercase
heading and one short grey caption line. Thick smooth orange arrows with rounded arrowheads
connect each card to the next.

Card 1, heading exactly "INGEST", envelope icon, caption exactly: "Pulls each new edition, strips the layout and the ads"
Card 2, heading exactly "VOICE", sound-wave icon, caption exactly: "Renders audio once, caches it in private storage"
Card 3, heading exactly "ALIGN", text-cursor icon, caption exactly: "Word-level timings for tap-to-jump read-along"
Card 4, heading exactly "DELIVER", headphones icon, caption exactly: "Routines play like a morning show"

Below the row, centred, a crisp realistic smartphone mockup shown COMPLETE with clear white
margin beneath it — the whole device must sit inside the frame and must NOT be cropped by any
edge. Its screen shows a simple orange-and-white audio player: a play triangle, a progress bar,
and below that six horizontal light-grey ROUNDED BARS standing in for lines of text, with the
third bar filled solid orange to suggest the word being read. Render those lines as plain
abstract grey bars only — absolutely NO letters, NO words and NO lorem ipsum anywhere on the
phone screen.

To the right of the phone, a small white card with a green check icon and text exactly:
"RESUMES ON EVERY DEVICE"`
  },
  {
    id: 'P2', file: 'rico-how.png',
    prompt: `Create a landscape infographic titled exactly: "RAMBLE IN. YOUR VOICE OUT."
With a smaller subtitle directly underneath in grey, exactly: "It drafts. A human still presses send."

Left side, ONE bold uppercase column heading printed a single time at the top of the column,
exactly: "WHAT GOES IN". Directly beneath that single heading, a vertical stack of three small
white cards. Each card contains ONLY a distinct small colourful flat icon and one bold short
label — the cards carry NO heading of their own. The three labels are exactly:
"Typed notes" (notepad icon), "Dictation" (microphone icon), "Voice memo" (smartphone icon).
The words "WHAT GOES IN" must appear EXACTLY ONCE in the entire image.
Curved orange arrows sweep from all three cards into the centre.

Centre, a tall white card headed exactly "RICO" containing a friendly semi-realistic illustrated
portrait avatar inside a circle, and beneath it four short bold labels stacked vertically with
small orange numbered circle markers 1 to 4, exactly:
"LEARN THE VOICE", "ATOMIZE", "DRAFT IN VOICE", "CHECK".
A small grey caption under the card, exactly: "fingerprint built from what was actually published".

A thick orange arrow leads right from the centre card to a white card headed exactly
"DRAFT, NOT SENT", containing a realistic laptop mockup showing an orange-and-white text editor.
The laptop screen itself carries NO readable words — only abstract light-grey rounded bars
standing in for lines of text. Put NO caption or label of any kind INSIDE that card beneath the
laptop. The card's ONLY words are its heading "DRAFT, NOT SENT".
Directly BELOW the card, outside it, one grey caption exactly: "lands in the publishing tool with the send button untouched".

At the bottom centre, one wide ORANGE filled card with white text reading exactly
"ZERO AUTO-PUBLISHES"`
  },
];

const only = process.argv.slice(2);
const jobs = only.length ? JOBS.filter((j) => only.includes(j.id)) : JOBS;

for (const job of jobs) {
  const dest = path.join(OUT, job.file);
  if (fs.existsSync(dest)) { console.log(`skip ${job.id} — ${job.file} exists`); continue; }
  let saved = false;
  for (let attempt = 1; attempt <= 5 && !saved; attempt++) {
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json', 'User-Agent': UA },
        body: JSON.stringify({
          model: 'gemini-3-pro-image-preview',
          aspect_ratio: '16:9',
          prompt: `${job.prompt}\n\n${STYLE}`,
        }),
      });
      const data = await res.json();
      if (!data.image_url) throw new Error(JSON.stringify(data).slice(0, 120));
      const img = await fetch(data.image_url, { headers: { 'User-Agent': UA } });
      const buf = Buffer.from(await img.arrayBuffer());
      fs.writeFileSync(dest, buf);
      console.log(`${job.id} -> ${job.file}  ${buf.length} bytes (attempt ${attempt})`);
      saved = true;
    } catch (err) {
      console.log(`  ${job.id} attempt ${attempt} failed: ${String(err.message).slice(0, 90)}`);
    }
  }
  if (!saved) console.log(`FAILED ${job.id}`);
}
