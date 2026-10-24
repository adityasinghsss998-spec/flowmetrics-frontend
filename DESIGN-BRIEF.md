# FlowMetrics frontend design brief

Save this file in the root of the frontend repo. Every Antigravity prompt tells the agent to read it first. The owner's reference screenshots live in `design-references/`.

## The product

FlowMetrics connects to a team's GitHub repositories and reports DORA metrics (deployment frequency, lead time for changes, change failure rate, time to restore service), cycle time, open pull requests and contributor activity. It sends alert emails when something looks wrong and a weekly summary email. It is free. People sign in with GitHub or email, belong to an organization, and connect repositories.

## Goal

The current interface looks generated: purple gradients, bordered boxes inside boxes, glass panels, glowing buttons, invented statistics. Redesign the presentation so it looks like a small team designed it by hand. Calm and dense where data lives, plain where words live, and a landing page whose scroll motion does the talking.

## Scope

Presentation only. Do not change API calls, data fetching, state management, routing, authentication or business logic.

Framework: Next.js. Follow the conventions already in the repo (App Router or Pages Router, whichever it uses). Use the framework's built-in font loading and image handling. Find the scroll or animation library the landing page already uses and keep using it. Do not add a second one.

## Reference

The owner likes the Wix template "Tech Company (Dark)" (the VISTA.IO demo). The screenshots are in `design-references/`. Study it for feel. Do not copy its text, images, icons, code or exact layout.

Take from it:
- a near-black page with off-white text and one hot accent color
- a monospaced typeface for headlines, navigation and buttons
- a huge left-aligned headline that writes itself on load
- flat, solid panels with no shadows and no borders
- panels that start tilted and staggered, then straighten as you scroll, while a background layer drifts upward
- a dark navigation pill with the primary button attached to it
- plain underlined footer links and underline-only form inputs
- generous empty space

Leave out, because each one is on the "Never do" list below:
- the drifting particle or point-cloud hero background
- the thin colored vertical stripe beside the paragraph
- outline icons inside rounded squares
- the soft gradient fade at the bottom of the hero
- the placeholder filler text and the "Powered by" footer line

## Direction

Dark, flat, one accent.

Colors. Define them once as theme tokens and use nothing outside them:

- bg (page): #0B0C0A
- surface (nav pill, inputs, table header): #151714
- surface-raised (app panels, menus): #1E211C
- line (1px rules and borders): #2D302A
- text: #ECEEE6
- text-muted: #A0A498
- accent (primary buttons, links, focus ring): #FF5C3A
- on-accent (text on accent buttons): #0B0C0A. Never white text on the accent, it fails contrast.
- status, for data only: good #7DB892, caution #D9A441, poor #E0675B, unknown #8C9087

Rules for color:
- One accent. Status colors appear only on data that has a status, always next to a text label, and never on buttons or links.
- No other hues. No gradients at all: every surface is a flat color.
- Text contrast of at least 4.5 to 1 against its background.

Typography, self-hosted through the framework's font loading:

- IBM Plex Mono for the wordmark, headings, navigation, buttons, labels, numbers, repository names and code. Use tabular figures for numbers.
- IBM Plex Sans for paragraphs, form help text and table cell text, where long reading matters.
- The hero headline may be uppercase. Everything else is sentence case. No small uppercase letter-spaced labels.
- Scale: hero headline clamp(2.5rem, 6vw, 5.5rem), line height 1.05; section titles 2rem to 3rem; body 16px with line height 1.6; text lines under 65 characters.

Known bug: the whole app currently renders in the browser's default serif font, which means the intended font is not loading. Fix it as part of the work and confirm in the browser.

Shape: radius 4px at most. 1px lines. No box shadows (the focus ring is the only exception). Spacing scale: 4, 8, 12, 16, 24, 32, 48, 72, 120.

## Motion

Motion is the main feature of the landing page, so it must be exact. The owner liked the reference because of it. It is described from the owner's notes on the reference, so tune the numbers by eye in the browser.

General rules:
- Animate transform and opacity only. Never animate width, height, top, left or margins.
- Scroll-linked motion maps directly to scroll position (linear). Time-based motion uses ease-out and finishes in under 200 ms for UI, longer only for the hero text.
- Nothing loops. Nothing moves on hover except a color change. No animated arrows.
- Only two things use text reveal: the hero headline and each section title. All other text is static.
- Everything honors prefers-reduced-motion (see the end of this section).

### 1. Hero headline writes itself

- On first load the hero headline appears character by character, left to right, like it is being typed. About 24 ms between characters. The whole headline finishes in about one second. No blinking cursor.
- The full text must be in the page HTML from the start (readable by search engines and screen readers). Give the headline an accessible label and mark the individual animated letters as hidden from assistive technology.
- Start the reveal as soon as the fonts are ready so it never restarts or flashes.
- After the headline finishes, the subtitle and buttons fade in over 200 ms, and the real dashboard screenshot rises 8px while fading in. That is the whole hero sequence.
- Section titles use the same typing reveal, faster (about 16 ms per character), once, when 30 percent of the title is visible.

### 2. Tilted panels straighten as you scroll

This is the main scene, directly below the hero.

- Four flat panels, each a real screenshot of the running app: the DORA metrics overview, the cycle time trend, the contributors table, the open pull requests list. Not feature cards. No icons, no title and paragraph blocks. Each panel has one short caption in the mono font beneath it.
- Start state, when the section enters the bottom of the screen: the panels are tilted and staggered, loose, not on a grid. For example rotations of about -6, +5, +7 and -5 degrees, and vertical offsets of about 0, +64, -32 and +96 px, so the panels sit at different heights.
- As the visitor scrolls through the section, every panel rotates to 0 degrees and slides to its place in a clean two-column, two-row grid with equal panel sizes and a 24px gap. The end state must be perfectly aligned.
- The motion finishes when the section is about halfway through the viewport. After that the panels stay straight.
- Each panel has a slightly different start angle and offset, but all of them finish at the same moment, so the section feels like it is settling into order.

### 3. Background slab rises

- Behind the panels sits one flat slab in the surface color, as wide as the section. As the visitor scrolls, the slab drifts upward more slowly than the panels, about 25 percent of the section height over the whole scene. Panels overlap its edge, which gives depth.
- It is a flat color. No gradient, no dots, no glow, no blur.

### 4. Navigation

- A dark pill (surface color) holds the links, and the primary button sits flush against its right end. On scroll the pill stays fixed at the top. No shrinking, no blur, no transparency effects.

### Performance and accessibility

- Use the repo's existing scroll library or the browser's scroll-driven animation support. Update transforms from one place per frame. No scroll event handlers that touch layout.
- Screenshots use the framework's image component with fixed width and height, modern formats, and lazy loading below the first screen. The hero image is prioritized.
- The landing page reaches largest contentful paint under 2.5 seconds on a mid-range laptop, with no layout shift. Measure it and report the number. The typing reveal must not push this over the limit. If it does, shorten the reveal.
- With prefers-reduced-motion on: the headline shows immediately, the panels are already straight in their final grid, and the slab does not move.
- On screens under 768px wide: use smaller start angles (2 degrees at most), one column, and keep the same straighten-on-scroll effect. Check that it stays smooth.
- If a device cannot hold 60 frames per second on the scene, simplify the scene. Do not ship a stuttering effect.

## Never do (these make a site look generated)

Color and surfaces:
- harsh or neon gradients, gradient text, any background gradient
- a purple and black palette
- rainbow or multi-hue coloring
- pure white page background
- radial glow orbs, particle fields, point clouds
- liquid glass or frosted glass, blur effects
- drop shadows, glowing buttons

Layout:
- rows of identical feature cards
- bento grids
- boxes nested inside boxes
- a colored stripe on one edge of a card or paragraph
- dot grids or grid-line backgrounds
- every section centered
- giant ghost watermark text, big faint numerals

Decoration:
- Lucide icons used as decoration, icons inside rounded squares
- sparkle icons
- emojis
- terminal window mockups
- animated arrows
- hover animations other than a color change and visible focus states
- checkmark bullet lists

Typography:
- Inter, Geist, Space Grotesk

Content:
- fake testimonials
- invented statistics (the login page claims "2.4M+ Deployments Tracked", which is false and must go)
- sample numbers presented as real
- placeholder or filler text of any kind
- pricing tiers or a Pricing link (everything is free)
- copy built on the pattern "it's not X, it's Y"
- em dashes anywhere in user-facing text

## Always do

- Show the real product. Use real screenshots of the running app, captured with Playwright after the app redesign is finished, and saved in the public folder. If a screen needs data to look realistic, use the data that exists and tell the owner what is missing. Do not invent numbers.
- Loading states: skeleton loaders that match the final layout for every list, table and chart that loads data. Also real empty states and error states.
- Terms of Service and Privacy Policy pages, linked from the footer and from the sign-up screen. Write them in plain language from what the app really does: GitHub sign-in, storing repository metadata and pull request, commit and deployment data from GitHub, sending alert and digest emails. Put a code comment at the top of each page saying it is a draft that must be reviewed before public launch.
- Relative times ("57 days ago"), never raw hour counts ("1384 hours ago").
- Accessibility: visible focus states, text contrast of at least 4.5 to 1, keyboard reachable controls.
- Motion follows Emil Kowalski's rule: animate only when it earns its place.

## Layout principles

- Prefer rows, tables, definition lists and hairline rules over cards.
- Left-aligned text, a 12-column grid, content width around 1120px.
- Vary section layouts down the page. No two consecutive sections with the same structure.
- Data first: numbers in the mono font, aligned, with units and the period they cover.
- Form inputs are underline-only or flat on the surface color, with a visible focus ring in the accent.

## Removals

- The Pricing link and any "free plan" pill or badge. Say "Free to use" once, in plain text, where it helps.
- The red Offline badge in the top bar and in the sidebar. Remove only the visual badge and leave the realtime connection code alone.
- The Webhook Events quota card in the sidebar.
- The sparkle icon and the "Workspace" eyebrow above the dashboard title.
- The 3D glass layer stack on the landing page and its "01 / LAYER" labels, and the giant ghost "FLOW METRICS" text. The scroll scene is replaced by the tilted panels described above.

## Landing page structure

Do not describe features the product does not have. Read the codebase and the analytics API to confirm every claim. If unsure, leave it out.

1. Header: the navigation pill with the text wordmark "flowmetrics" in the mono font, links for Features, How it works and Log in, and the primary button "Continue with GitHub" attached to the pill.
2. Hero: a headline about seeing how fast and how safely a team ships, one sentence naming the four DORA metrics, the primary button, a quiet text link to the next section, and the words "Free to use". Below it, a real screenshot of the dashboard. Motion as described above.
3. Product panels: the tilted-to-straight scene with four real screenshots and one-line captions.
4. The four metrics: a definition list with hairline rules. Each row has the metric name in mono, a plain explanation in sans, and which GitHub data FlowMetrics uses for it.
5. How it works: three short steps in a plain numbered list (connect a repository, read the metrics, get alerts and a weekly summary). Text only, small numerals in the mono font, no big faint numbers.
6. Alerts and weekly summary: real screenshots of the alert email and the weekly summary email if the owner provides them. Otherwise leave this section out.
7. Closing line with one button. No gradient card, no glow.
8. Footer: Terms of Service, Privacy Policy, an accessibility statement, a link to the GitHub repository, and a real contact address supplied by the owner. If there is no address, leave it out.

## Stack and tools

### Context7 (documentation MCP)

Before writing code that uses a library (Next.js, the motion library, a table or dialog library), look up the current documentation with Context7 instead of relying on memory. Add "use context7" to the request. This makes the code correct. It does not decide taste, so the rules in this brief still win.

### 21st.dev (component library MCP)

Allowed only as a source of behavior and structure, under these conditions:

- Use it for accessible building blocks that are hard to make well: dialogs, dropdown menus, comboboxes, tables, tabs, toasts, a command palette.
- Strip its styling and rebuild it with the tokens in this brief. Remove gradients, glows, shadows, blur, glass, animated borders, spotlight and shimmer effects, and any decorative icon set.
- Do not use its hero sections, feature grids, bento layouts, pricing blocks, testimonial blocks, animated backgrounds or marketing templates.
- Every component taken from it must pass the "Never do" list before it is committed. If it needs more than light restyling, write a plain component instead.
- Prefer fewer dependencies. If something can be done with plain HTML and CSS, do that.

### 3D

The scroll scene above is flat panels moved with transforms. Do not add Three.js, React Three Fiber or any 3D scene. If the owner later asks for one, it must show the real product, be lazy-loaded, have a static fallback, and respect reduced motion.

## Quality bar

Before any change is called done, check it against this brief in a real browser at 1440, 768 and 390 px wide, and list each "Never do" item you verified. For the landing page, also scroll through the panel scene and capture screenshots at the start, 25, 50, 75 and 100 percent of the scene, plus one with reduced motion on. Passing the list is the minimum. The result should read as designed by a person with taste: a restrained palette, a strong typographic hierarchy, generous and consistent spacing, real content, and nothing that exists only to look impressive. If something feels generic, replace it. Do not add more effects to compensate for it.
