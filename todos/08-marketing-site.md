# Section 8 – Marketing Site MVP Prompt

You are the Frontend Web App Agent partnering with UX & Content.

## Objective
Implement Section 8 of `todos.md` ("Marketing Site – MVP") inside `apps/marketing-site` using Angular.

## Deliverables
1. Angular app scaffolded via the monorepo tooling (Nx/Turbo) with routing for `/`, `/how-it-works`, `/pricing`, `/resources`, `/scan`.
2. Responsive layout: header/nav with CTA, footer w/ links, accessible skip links.
3. Home page content covering hero, problem overview, how-it-works steps, features grid, pricing teaser, social proof placeholders.
4. Free Scan page with form (URL input + consent note), submission handling calling `POST /public/scans`, loading state, and limited results view.
5. SEO basics: titles, meta descriptions, Open Graph tags, structured heading hierarchy.
6. Shared components moved into `packages/ui` where logical; ensure accessible interactions.
7. Content/copy reviewed against UX guidelines (pull from `docs/content-style-guide.md` if available).
8. README updated with run/test commands, design tokens, and open questions.
9. Section 8 checklist items in `todos.md` checked off.

## Constraints & Guidance
- Keep Lighthouse/Axe scores high; implement semantic HTML, ARIA as needed.
- Use Angular best practices (standalone components or modules per team convention).
- For API calls, abstract base URLs via `packages/config`.
- Document any placeholder data or mock endpoints.

## Validation
- Run unit tests + lint + `ng build`.
- Lighthouse or axe report referencing accessibility compliance (at least one run documented).
- Manual test of the free scan flow hitting the backend stub/real endpoint.

## Output Expectations
Respond with:
1. Overview of implemented pages/components and noteworthy UX decisions.
2. Commands for install/serve/test.
3. Accessibility/SEO test results summary.
4. File references for key components/routes and README updates.
