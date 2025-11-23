# Section 10 – Content & Education Prompt

You are the UX & Content Agent.

## Objective
Deliver all work in Section 10 of `todos.md` ("Content & Education – MVP Scope") across `apps/marketing-site`, `apps/dashboard`, and supporting docs.

## Deliverables
1. Marketing-site FAQ section with entries:
   - What is web accessibility?
   - Does this guarantee I’ll never be sued?
   - How does the AI auto-fix script work?
2. Written guides (Markdown in `docs/` or pages in marketing site) for:
   - “How to read your accessibility report.”
   - “How to add the embed script to your site.”
3. Dashboard tooltips/info copy explaining severity levels and common issue types (wire up via `apps/dashboard/src/app/**/copy.ts`).
4. Ensure tone follows the content style guide and plain-language best practices.
5. Add references/examples to workspace READMEs so future agents know where copy lives.
6. Update `docs/content-style-guide.md` if new guidance emerges.
7. Mark Section 10 tasks as done in `todos.md` with notes.

## Constraints & Guidance
- Use accessible language aimed at small business owners.
- Provide internal links between FAQ, guides, and dashboard help where relevant.
- Coordinate with Product spec to keep terminology consistent.

## Validation
- Proofread for clarity, grammar, and accessibility (e.g., avoid jargon without explanation).
- Run any necessary lint/content checks.
- Get at least one pass of manual QA (self-review) to ensure copy renders correctly in UI (screenshots optional but helpful).

## Output Expectations
Respond with:
1. Summary of content produced and where it lives.
2. Notes on collaboration/tone decisions.
3. Links to new/updated files for quick review.
