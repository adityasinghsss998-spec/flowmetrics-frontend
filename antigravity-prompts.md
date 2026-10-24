# Antigravity prompts: frontend redesign

Before you start:
- Save `DESIGN-BRIEF.md` in the root of the frontend repo.
- Put your reference screenshots (the VISTA.IO template) in a `design-references/` folder in the same repo.
- Open the frontend repo as the workspace. Prompt 1 also needs the github-service repo in the workspace.

Run the prompts in order, each in its own conversation. Read the plan Antigravity posts before you let it edit anything. The order matters: the app is redesigned first (Prompt 2), so the landing page screenshots in Prompt 3 show the finished product.

---

## Prompt 1: repository connection bug

```
Investigate and fix a repository connection bug. Start with evidence, not a fix.

Symptom: when I try to connect the GitHub repository adityasinghsss998-spec/flowmetrics from the dashboard, the app says it is "already connected", but that repository does not appear in the repository list for the Acme organization. The dashboard shows exactly 5 repositories. On 2026-10-15 a read-only query showed the repositories table has a row for adityasinghsss998-spec/flowmetrics (id 2, owner_id 1, org_id 1) and one for adityasinghsss998-spec/Learning-Management-System-Frontend (id 3, owner_id 1, org_id 1). Neither is on the dashboard.

Workspace: the github-service (backend) and the frontend repo.

Check these hypotheses in order:
1. The list endpoint or the frontend caps results at 5 (a LIMIT, a page size, or a slice) with no pagination.
2. The list query filters differently from the duplicate check. For example the list filters by organization, owner, or a status or deleted flag, while the duplicate check only looks at github_repo_id across everything.
3. Disconnect or delete only removes the webhook or hides the repository in the UI and leaves the database row, so reconnecting hits the unique github_repo_id check.
4. A stale cache (Redis, or frontend state) is serving an old repository list.

Do this:
1. Find the connect endpoint, the duplicate check, the list endpoint and the disconnect or delete endpoint. In your answer, quote the relevant lines with file name and line number.
2. Say which hypothesis is true and show the evidence from the code. If you need database output, do not guess. Give me the exact read-only SELECT and wait for me to paste the result.
3. Propose the smallest fix and show me the plan and the diff before you apply anything.
4. Never delete or modify database rows yourself. If stale rows need repair, give me the SQL and explain what it does.
5. Add a test that reproduces the bug (connect, list, disconnect, reconnect) and passes after the fix.
6. Do not touch any other service.

Finish with: root cause, files changed, and the exact steps I can follow to verify manually.
```

---

## Prompt 2: design foundation, login, app shell and dashboard

```
Use the impeccable and emil-design-eng skills, and use context7 for library documentation and 21st.dev if needed wherever according to you. Read DESIGN-BRIEF.md in the repo root completely before doing anything, and look at the screenshots in design-references/. Then inspect the codebase to find the framework, the styling approach, the component library, and where the login page, the app shell, the dashboard and the landing page live.

Task: build the design foundation and redesign everything inside the signed-in app plus the login page. Do not redesign the landing page yet. It only has to keep building and working.

Post a short plan first: the files you will change, and anything in the brief that conflicts with the existing code. Then continue unless something is risky.

Foundation
- Replace the color, font, radius and spacing tokens with the dark tokens in the brief. Remove the old purple and gradient tokens and any CSS that is no longer used.
- Fix the font loading bug. Right now all text renders in the browser default serif. Load IBM Plex Mono and IBM Plex Sans properly and confirm in the browser that they are applied.
- Replace Lucide icons. Prefer plain text. Where an icon is really needed, use one other icon set at a single weight.

Login page
- Remove the distorted grid background, the gradient headline, the icon feature list, and the invented "2.4M+ Deployments Tracked" line.
- Use a plain, left-aligned layout: one short sentence about the product, the GitHub button, the email form (underline-only inputs), and links to Terms of Service and Privacy Policy. Real copy only.

App shell
- Remove the red Offline badge in the top bar and in the sidebar. Remove only the visual badge and leave the realtime connection code alone.
- Remove the Webhook Events quota card.
- Remove the sparkle icon and the uppercase "WORKSPACE" label above the page title.
- Simplify the sidebar: text navigation, with the active item shown by font weight and a quiet background. No dot indicator.

Dashboard
- Replace the grid of identical repository cards with a table: repository name (mono font), default branch, last deployment (relative time), status. The delete action goes in a row menu with a confirmation dialog.
- Show relative times such as "57 days ago". Never show raw hour counts.
- Add skeleton loaders that match the table and any charts, plus real empty and error states.
- "Connect repository" is a plain primary button in the page header, in the accent color with dark text.

Restyle every other signed-in page you find (settings, repository detail, charts) with the same tokens. List them in your plan.

Definition of done
- No item from the "Never do" list remains in the app or the login page. List each one you checked.
- Screenshots at 1440, 768 and 390 px wide of login and dashboard (loaded, loading and empty) are attached.
- No changes to API calls, routes, authentication or state.
```

---

## Prompt 3: landing page

```
Use the impeccable and emil-design-eng skills, and use context7 for library documentation. Read DESIGN-BRIEF.md in the repo root completely before doing anything, especially the Motion section, and look at the screenshots in design-references/. The design tokens, fonts and the redesigned app already exist. Reuse them.

Task: redesign the landing page, including the Terms of Service and Privacy Policy pages.

Post a short plan first. In it, name the scroll or animation library the landing page already uses and say how you will build each motion with it. Do not add a second library. Then continue unless something is risky.

Build, following "Landing page structure" and "Motion" in the brief:
1. The navigation pill with the attached primary button.
2. The hero: the headline that writes itself character by character, then the subtitle, buttons and the dashboard screenshot as described.
3. The product panels scene: four real screenshots that start tilted and staggered, then straighten into a clean two by two grid as the visitor scrolls, while the flat background slab rises more slowly behind them. Captions under each panel in the mono font. These are screenshots, not icon-and-paragraph cards.
4. The four metrics definition list, the plain "how it works" list, the closing line and the footer.
5. The Terms of Service and Privacy Policy pages, written from what the app really does, with a draft comment at the top of each file.
6. Remove the old 3D glass layer stack, the "01 / LAYER" labels, the ghost "FLOW METRICS" text, the Pricing link, the "FREE PLAN" pill and the gradient call-to-action card.

Screenshots: capture them with Playwright from the running, redesigned app, and save them under public/. Use the data that exists. If a screen looks empty, tell me what data is missing instead of inventing numbers.

Definition of done
- Report the largest contentful paint and the layout shift for the landing page, on a throttled run. LCP must be under 2.5 seconds. If the typing reveal pushes it over, shorten the reveal and say so.
- Scroll through the panel scene and attach screenshots at the start, 25, 50, 75 and 100 percent of the scene. Attach one more with reduced motion turned on.
- Check the page at 1440, 768 and 390 px wide. Confirm the scene still straightens smoothly on the narrow width.
- No item from the "Never do" list remains. List each one you checked.
- No changes to API calls, routes, authentication or state.
```

---

## Prompt 4: Playwright tests

```
Set up Playwright end-to-end tests in the frontend repo and use them to check the redesign.

1. Install and configure Playwright (npm init playwright@latest, then install the browsers). Use the dev server's real port from this repo's config. Keep test credentials in a .env.test file that is gitignored. Never commit credentials.
2. Write these tests:
   - Landing page loads with no console errors, has no "Pricing" link, and has links to Terms of Service and Privacy Policy.
   - The hero headline text is present in the page HTML as one readable string, even while the typing animation runs.
   - With reduced motion turned on, the four product panels have no rotation and the headline is fully visible right away.
   - Login page renders both the GitHub button and the email form.
   - Visiting the dashboard while signed out redirects to the login page.
   - Signed in with the test account: the dashboard shows the repository table, and the text "Offline" and "Webhook Events" do not appear anywhere.
   - Copy check: on the landing, login and dashboard pages, the visible text contains no em dash character and no emoji.
   - Layout check at widths 1440, 768 and 390: no horizontal scrolling.
   - Measure the landing page largest contentful paint and fail the test if it is over 2.5 seconds.
3. Save screenshots of each page at the three widths to a screenshots/ folder.
4. Run the whole suite, fix any real failures you find in the app, and report what you changed.

Add a short "Testing" section to the README with the commands to run the suite.
```
