# Handoff: Artist link-in-bio site + content admin (Dave Devine)

## Album page (production app)

`/album` is available from **The Album** in the header. In `/admin` → **The Album**, edit
the title, cover and text, add/reorder/remove singles, album platform links, YouTube videos and
gallery photos, then click **Save album**. Singles can have optional listening links.
Photos support uploads or URLs, with captions used as image descriptions. YouTube watch,
share, Shorts, live and embed URLs become responsive iframe players. Empty sections are hidden.
Album changes persist in SQLite and are included in Export JSON and Reset content.
The optional cover appears below the title as a square up to 420 px wide, matching the About
photo. Upload an image or paste its URL; use Remove cover to hide it. Singles appear below
About the album.

When deploying this feature, run `npm run db:deploy` and `npx prisma generate` before
`npm run build`, then restart the app. The migration adds a separate Album table and preserves
existing site content. The remaining documentation below describes the original design reference.

## Overview
A single-artist "link in bio" website (Linktree-style) with a full-bleed dark video background, a
centered content column, a second **About** page, and a built-in **admin drawer** that edits every
piece of content live (text, links, burger-menu items, media uploads, tour dates) and records
per-link click counts. All content is persisted client-side in `localStorage` under the key
`dd_artist_site_v2` and can be exported as JSON from the drawer.

Language of the UI: **English**. Motion: moderate (slow background drift, small fade-ups, hover
transitions).

## About the Design Files
The files in this bundle are **design references created in HTML** — prototypes that show the
intended look and behavior. They are not production code to copy directly.

The task is to **recreate these designs in the target codebase's existing environment** (React,
Vue, Svelte, SwiftUI, native, etc.) using its established patterns, component library, routing and
state solutions. If no environment exists yet, choose the most appropriate framework and implement
the designs there. In particular:

- The prototype keeps all content in `localStorage`; a real build should replace this with an API /
  CMS and real authentication for the admin surface (see "State Management").
- Uploads use `URL.createObjectURL` (session-only blobs); a real build needs real file storage.
- Styling in the prototype is inline for streaming reasons; use the codebase's normal styling layer.

## Fidelity
**High fidelity.** Colors, typography, spacing, sizes, transitions and copy are final and should be
recreated closely. Exact values are listed below and in the source file.

## Screens / Views

### Global shell

**Background visual layer** (fixed, `z-index` below content, `position: fixed; inset: 0`)
Layer stack, bottom → top:
1. Base fill `#e7e2d8`.
2. Striped placeholder: `repeating-linear-gradient(112deg, #e9e4da 0 16px, #e3ded3 16px 32px)`.
3. `<video>` — mounted **only when a video URL exists** (`autoplay muted loop playsinline`,
   `object-fit: cover`, `inset: 0`, 100% × 100%). Important: never render `src` with an unresolved
   template value — the browser will fetch it verbatim.
4. Still-image fallback: `background-image: url(...)`, `background-size: cover`,
   `animation: drift 34s ease-in-out infinite` (keyframes: `scale(1.05)` → `scale(1.1)
   translate3d(-1.2%, -0.8%, 0)` → `scale(1.05)`).
5. Paper scrim: `rgba(242,239,233, <overlay>)`, overlay default **0.62**, admin range 0–0.9 step 0.05.
6. Vertical gradient: `linear-gradient(180deg, rgba(242,239,233,.7) 0%, rgba(242,239,233,.25) 42%,
   rgba(242,239,233,.8) 100%)`.

Layout modes (admin → Visual → "Visual placement"):
- `background` (default): visual is `position: fixed; inset: 0`, content column `max-width: 620px;
  margin: 0 auto`.
- `left` (split): visual becomes `position: relative; flex: 1 1 clamp(280px,44%,660px);
  min-height: clamp(260px,44vh,100vh)`, column `max-width: 640px; margin: 0`.

**Fixed header** (`position: fixed; top:0; left:0; right:0; z-index: 45`)
- Height **56px**, padding `0 clamp(12px,3vw,26px)`, background `rgba(242,239,233,.84)`,
  `backdrop-filter: blur(12px)`, bottom border `1px solid rgba(23,21,15,.14)`.
- Left: burger button 40 × 40, three 1px `#17150f` bars, 4px gap.
- Center: artist name, `Instrument Serif`, `clamp(15px,4.5vw,21px)`, single line with ellipsis.
  Hidden at top of page (`opacity: 0; translateY(6px)`), fades/slides in when scrolled
  (`opacity: 1; translateY(0)`, `transition: opacity .3s ease, transform .3s ease`).
- Right: nav "Links" / "About" — plain text buttons, 10px, `letter-spacing: .18em`, uppercase;
  active `#17150f` with a 1px burgundy bottom rule, inactive `rgba(23,21,15,.62)`, hover `#17150f`.
  Min hit height 40px.

**Burger sheet** (open state, `position: fixed; top: 56px; left/right: 0; z-index: 44`)
- `rgba(250,248,244,.97)`, `backdrop-filter: blur(12px)`, bottom hairline, padding
  `10px clamp(12px,3vw,26px) 18px`, `animation: rise .25s ease both`.
- Items are **admin-managed** (label + URL): right-aligned rows, full width, min-height 46px,
  `Instrument Serif` `clamp(20px,5.5vw,26px)`, bottom hairline `rgba(23,21,15,.12)`,
  trailing `↗` at 12px `rgba(23,21,15,.68)`; hover → accent color. Clicks are tracked.
- Bottom "Close" text button, 10px uppercase, `rgba(23,21,15,.6)`.

**Content column**
`flex: 1 1 340px; max-width: var(--colmax); width: 100%; position: relative; z-index: 2;`
`padding: clamp(86px,11vw,124px) clamp(18px,5vw,56px) clamp(72px,10vw,96px);`
`display: flex; flex-direction: column; gap: clamp(26px,4vh,42px); justify-content: center;
min-height: 100vh;`
Inherited glow so ink type survives a dark video behind it:
`text-shadow: 0 0 22px rgba(255,255,255,.7), 0 0 4px rgba(255,255,255,.85)`
(disabled with `text-shadow: none` on header nav, admin drawer content and placeholder captions).

**Back-to-top button** — appears when `scrollY > 260` (and the admin drawer is closed):
`position: fixed; right:16px; bottom:16px; z-index: 60`, 46 × 46, `#17150f` fill, `#f7f5f0` glyph `↑`
15px, hover fill = accent, `animation: rise .3s ease both`. Smooth-scrolls to top.

### Screen 1 — Links (default)

1. **Header block** (`animation: rise .55s ease both`, `gap: clamp(14px,2vh,20px)`)
   - `<h1>` artist name — `Instrument Serif` 400, `font-size: var(--h1)`:
     `clamp(46px,13vw,92px)` at top of page, shrinks to `clamp(34px,9vw,58px)` when scrolled,
     `transition: font-size .35s ease`; `line-height: .96; letter-spacing: -.025em;
     text-wrap: balance`.
   - 1px rule `rgba(23,21,15,.16)`.
   - Bio paragraph — `max-width: 42ch`, `clamp(12.5px,3.4vw,13.5px)`, `line-height: 1.85`,
     `rgba(23,21,15,.72)`, `text-wrap: pretty`.

2. **Featured release card** (anchor, opens in new tab, click-tracked as id `release`)
   - `display: flex; align-items: center; gap: clamp(13px,3.5vw,18px); padding: clamp(12px,3vw,16px)`
   - `border: 1px solid var(--accent)`, `border-left: 4px solid var(--accent)`,
     `background: rgba(255,255,255,.5)`, `backdrop-filter: blur(3px)`, text `#17150f`.
   - Hover: `background: var(--accent)`, text `#fbf9f5` (`transition: background .25s ease,
     color .25s ease`).
   - Cover thumb: `flex: 0 0 clamp(54px,15vw,66px)`, `aspect-ratio: 1`, striped placeholder
     `repeating-linear-gradient(45deg, rgba(23,21,15,.14) 0 6px, rgba(23,21,15,.05) 6px 12px)`,
     caption "COVER" 8px, replaced by uploaded cover image (`cover` background).
   - Kicker: 10px, `letter-spacing: .2em`, uppercase, **accent** color. Default copy
     "New single · out now".
   - Title: `Instrument Serif` `clamp(19px,5.2vw,25px)`. Default "Slow Static".
   - Trailing `↗` 13px accent.

3. **Link list** — container `border-top: 1px solid rgba(23,21,15,.16)`, rows:
   - `min-height: 56px; padding: 14px clamp(4px,2vw,10px); border-bottom: 1px solid
     rgba(23,21,15,.16); background: transparent; gap: clamp(10px,3vw,16px)`
   - Hover: `background: rgba(23,21,15,.05)`, `padding-left: clamp(10px,3vw,18px)`
     (`transition: background .2s ease, padding-left .2s ease`).
   - Index `01…` — 22px wide, 10px, `rgba(23,21,15,.68)`.
   - Label — `Instrument Serif` `clamp(19px,5vw,24px)`, `letter-spacing: -.01em`.
   - Tag — 10px uppercase `letter-spacing: .16em`, `rgba(23,21,15,.72)`, right aligned.
   - Trailing `↗` 12px `rgba(23,21,15,.68)`. Every row is click-tracked by its id.

4. **Live dates** (toggleable) — section label "Live dates" 10.5px uppercase
   `letter-spacing: .2em`, `rgba(23,21,15,.72)`. Rows: wrap-flex, `padding: 13px 0`,
   `border-top: 1px solid rgba(23,21,15,.14)`, `gap: 6px 14px`:
   date (62px, 10.5px, **accent**), city (`Instrument Serif` `clamp(16px,4.4vw,19px)`),
   venue (10.5px, `rgba(23,21,15,.72)`), "Tickets" link (10px uppercase, 1px underline
   `rgba(23,21,15,.35)`, min-height 32px, click-tracked).

5. **Footer** — `padding-top: 6px; border-top: 1px solid rgba(23,21,15,.16)`, 10.5px uppercase
   `letter-spacing: .16em`, `rgba(23,21,15,.72)`: footer line
   ("© 2026 Divine Dynasty Records") + contact link ("Booking & Collaboration" →
   `mailto:booking@davedevine.com`). **No admin affordance is shown anywhere on the site.**

### Screen 2 — About

Same shell; column content (`gap: clamp(20px,3vh,30px)`, `animation: rise .45s ease both`):
- **Square press photo** — `width: 100%; aspect-ratio: 1; max-width: 420px`,
  `border: 1px solid rgba(23,21,15,.18)`, striped placeholder
  `repeating-linear-gradient(112deg, rgba(23,21,15,.08) 0 12px, rgba(23,21,15,.03) 12px 24px)`,
  uploaded photo fills it (`background-size: cover`). Empty state caption bottom-left:
  "press photo / 1600 × 1600 px", 10px uppercase `letter-spacing: .18em`, `rgba(23,21,15,.72)`.
- **Headline** `<h2>` — `Instrument Serif` `clamp(30px,8vw,52px)`, `line-height: 1.02`,
  `letter-spacing: -.02em`. Then a 1px rule.
- **Paragraphs** — one per line of the admin `aboutText` field; `max-width: 56ch`,
  `clamp(13px,3.5vw,14.5px)`, `line-height: 1.9`, `rgba(23,21,15,.82)`.
- **Compact link list** — same link data, denser rows: min-height 48px, `padding: 11px …`,
  label 11.5px uppercase `letter-spacing: .14em`, tag 10px, trailing `↗`; same hover.

### Screen 3 — Admin drawer (opened only via the direct link `#admin`)

`position: fixed; top/right/bottom: 0; z-index: 50; width: min(430px, 100%)`,
background `#faf8f4`, `border-left: 1px solid rgba(23,21,15,.16)`,
`box-shadow: -24px 0 60px rgba(23,21,15,.14)`, `animation: rise .28s ease both`.
Header: title "Site admin" (`Instrument Serif` 19px), save state caption ("Local draft" /
"Saved <time>") 10px uppercase, close ✕ button 38 × 38. Tab row: 5 tabs, active = `#17150f` fill /
`#f7f5f0` text, inactive = transparent with `rgba(23,21,15,.2)` border, 10px uppercase,
min-height 36px. Body scrolls (`overflow-y: auto`, padding `clamp(14px,4vw,20px)`, `gap: 18px`).
Inputs: `background: #fff`, `border: 1px solid rgba(23,21,15,.18)`, `padding: 11px 12px`,
12.5px, focus border `#17150f`. Field captions 10px uppercase `letter-spacing: .16em`,
`rgba(23,21,15,.72)`.

Tabs:
- **Content** — artist name, line above the name, bio; "Featured release" group (label, title, URL,
  cover upload); "About page" group (headline, text — one paragraph per line, press-photo upload);
  footer line, contact label, contact URL.
- **Links** — "Burger menu" section: rows of label + URL + delete, plus "+ menu item"; then
  "Link list": "+ add link" and per-link cards (label, URL, tag, move ↑ / ↓, delete ✕; controls
  34 × 34).
- **Visual** — visual placement (Full background / Split · left); "No media yet" hint block when
  neither video nor image is set (`border-left: 3px solid accent`, `#fff`, 10.5px);
  background video URL + video upload; still-image upload; avatar upload; paper-scrim range
  (0–0.9, label shows %); accent swatches (38 × 38, active ring `#17150f`); display typeface
  (Instrument / Syne / Grotesk).
- **Tour** — "+ add date", "Hide/Show tour block" toggle, per-date cards (date, city, venue,
  ticket URL, delete).
- **Stats** — two cards (Total clicks; Top link), per-link bars (`height: 5px`, track
  `rgba(23,21,15,.1)`, fill accent, width = count / max), "Reset counters".
- Sticky bottom row: "Export JSON" (downloads the whole content object) and "Reset content"
  (restores defaults).

## Interactions & Behavior
- **Routing**: two client-side pages (`links`, `about`) via header nav; switching resets scroll to
  top **and** resets the scrolled header state (otherwise the shrunken H1 / centered name stick).
- **Scroll**: passive `scroll` listener; threshold **260px** toggles: header name visible, H1
  shrunk, back-to-top button visible. Use a state-updater form so the comparison never reads stale
  state.
- **Admin entry**: `#admin` in the URL opens the drawer on load. No visible button.
- **Burger**: toggles the sheet; selecting a page or "Close" closes it.
- **Click tracking**: every outbound link (featured release, list links, burger items, ticket links)
  increments a counter keyed by its id; surfaced in the Stats tab; navigation is not blocked.
- **Live editing**: every admin field writes on change and the site behind the drawer updates
  immediately (single source of truth, no separate preview).
- **Uploads**: `URL.createObjectURL` blobs (video, still image, avatar, cover, press photo) — they
  do not survive a reload; replace with real uploads.
- **Transitions**: 0.2–0.35s ease; `rise` fade-up 12px for entering blocks; background drift 34s.
- **Responsive**: fully fluid — `clamp()` type/padding, wrapping flex rows, drawer at
  `min(430px,100%)`, hit targets ≥ 40–44px. Verified with zero horizontal overflow at 390px wide.

## State Management
Content object (persisted; prototype key `localStorage['dd_artist_site_v2']`):
`name, kicker, bio, releaseKicker, releaseTitle, releaseUrl, coverUrl, footer, contactLabel,
contactUrl, aboutTitle, aboutText, aboutPhoto, videoUrl, bgUrl, avatarUrl, overlay, accent, font,
layout ('background' | 'left'), showTour, links[{id,label,url,tag}], menu[{id,label,url}],
dates[{id,date,city,venue,url}], clicks{<id>: number}`.

Ephemeral UI state: `page ('links'|'about')`, `scrolled`, `menuOpen`, `adminOpen`, `tab`, save label.

Production notes: replace persistence with an API (content document + click events), gate the admin
route behind auth, store uploads in object storage, and consider server-side rendering for SEO/OG
tags (artist name, release title, cover image).

## Design Tokens
Colors
- Paper background `#f2efe9`; drawer paper `#faf8f4`; input white `#fff`; visual base `#e7e2d8`
- Ink `#17150f`; ink on dark `#f7f5f0` / `#fbf9f5`
- Ink alphas: `.82` (About body), `.72` (body + small labels — minimum for small type),
  `.68` (meta), `.62` (inactive nav), `.16`/`.14`/`.12` (rules), `.05` (hover fill)
- Accent (default) burgundy `#6d1420`; palette `#6d1420`, `#8a2e46`, `#2f4a3c`, `#3a5b7a`, `#6b6357`
- Scrim `rgba(242,239,233, .62)` default

Typography
- Display: **Instrument Serif** 400 — H1 `clamp(46px,13vw,92px)` / scrolled `clamp(34px,9vw,58px)`,
  H2 `clamp(30px,8vw,52px)`, link labels `clamp(19px,5vw,24px)`, header name `clamp(15px,4.5vw,21px)`
- UI/body: **JetBrains Mono** 400/500 — body 12.5–14.5px, labels 10–11.5px uppercase with
  `letter-spacing: .14–.22em`
- Alternate display faces offered in admin: Syne 600–800, Space Grotesk 500/700
- Small-label floor: **10px** at `rgba(23,21,15,.72)` (≈6.5:1 contrast)

Spacing / geometry
- Column gap `clamp(26px,4vh,42px)`; block gaps 6/8/10/13/14/18px
- Column padding `clamp(86px,11vw,124px) clamp(18px,5vw,56px) clamp(72px,10vw,96px)`
- Header 56px; radius **0** everywhere except the 50% avatar; borders 1px hairlines, 3–4px accent rules
- Shadows: only the drawer (`-24px 0 60px rgba(23,21,15,.14)`)
- z-index: content 2, burger sheet 44, header 45, drawer 50, back-to-top 60

Motion
- `rise` (fade + 12–16px up) .25–.55s ease; hover .2–.25s ease; H1 resize .35s ease; drift 34s

## Assets
No real assets are included — everything is a placeholder:
- Background video loop (1920 × 1080 mp4/webm) — striped placeholder + admin upload/URL
- Still-image fallback, avatar, release cover art, About press photo (1600 × 1600) — striped
  placeholders + admin uploads
- Fonts from Google Fonts: Instrument Serif, JetBrains Mono, Syne, Space Grotesk
- No icon set; the only glyphs are text characters `↗ ↑ ✕ ↓ ≡` (burger drawn as three 1px bars)

## Files
- `Artist Site.dc.html` — the current, delivered design (light "gallery" direction, burgundy accent,
  both pages, header + burger, admin drawer). Template markup first, logic class in the trailing
  script block; all styling inline.
- `Artist Site Dark.dc.html` — earlier dark-theme variant of the same structure, kept for reference.
- `support.js` — runtime that renders these prototype files in the browser. It is **not** part of the
  design; do not port it.

Open both files directly in a browser to inspect states; append `#admin` to the URL to open the
admin drawer.
