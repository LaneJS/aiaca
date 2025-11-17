# How to read your accessibility report

This guide explains what the AACA report shows and how to act on it. It pairs with the dashboard issue list and the FAQ on the marketing site.

## Start with the summary
- **Overall score:** A quick snapshot from 0–100. Scores above 90 are healthy; scores below 70 need attention soon.
- **AI summary:** A short note in the dashboard that highlights patterns, such as repeated missing alt text.
- **Page count:** How many pages were scanned in the run.

## Understand severity levels
- **High:** People may be blocked from using the page (for example, form fields without labels or unreadable contrast). Fix these first.
- **Medium:** The page is usable but frustrating (such as long forms without clear focus order). Plan fixes in your next sprint.
- **Low:** Nice-to-have polish (like consistent heading order). Tackle these after high and medium issues.

## Read individual issues
Each issue in the dashboard shows:
1. **Title and description:** Plain-language explanation and the WCAG area it affects.
2. **Selector or location:** A CSS selector or snippet to help you find it.
3. **Suggested fix:** AI-assisted text or code to copy, plus a short explanation of why it matters.

Tips:
- Use the filter buttons (All, Open, Fixed) to focus on the work in progress.
- Mark items as fixed after you ship the change. Re-run a scan to confirm the status and score update.

## Use the issue type reference
Common categories you will see:
- **Text alternatives:** Missing or vague image alt text.
- **Color and contrast:** Low contrast between text and background.
- **Structure:** Headings or landmarks missing or out of order.
- **Forms:** Labels, required indicators, or error messages that are unclear.

If you are unsure how to prioritize, follow the severity list above or open the FAQ item "What is web accessibility?" on the marketing site for a refresher.

## Share proof of progress
- Export or screenshot the issue list after each batch of fixes.
- Note which issues were auto-fixed by the embed script versus ones you changed in code.
- Keep a short changelog in your project tracker so legal, marketing, or support teams can reference improvements.

## Need help installing the auto-fix script?
Read the guide "How to add the embed script to your site" next. It explains where to place the snippet and how to test it with keyboard navigation.
