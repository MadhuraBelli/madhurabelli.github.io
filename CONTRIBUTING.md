# Contributing

Thanks for contributing to this portfolio project.

## Ground rules

- Keep the site static-first (HTML/CSS/vanilla JS).
- Prefer small, focused pull requests.
- Keep copy concise and technically clear.

## Adding a new project

1. **Create a project page**
   - Add a new HTML file under `projects/`.
   - Reuse existing section/panel styles from `style.css`.

2. **Add it to the homepage**
   - In `index.html`, add a new project card in the `Projects` section.
   - Link to your new page using a relative URL (for example, `projects/my-project.html`).

3. **Include minimum content**
   - Problem statement
   - Approach/architecture
   - Outcomes or learnings
   - Next steps (optional)

4. **If data-backed, add/update dataset files**
   - Put sample data in `data/`.
   - Keep JSON clean, consistent, and documented in your PR.

## Adding a new case study

Case studies should be narrative and technically explicit.

Recommended outline:
- **Context**: what domain/system this models.
- **System mapping**: components and boundaries.
- **Signals/metrics**: what is observed and why.
- **Failure modes**: likely incidents and mitigations.
- **Open questions**: what to test next.

## Validation checklist before opening a PR

- Run locally with:
  ```bash
  python3 -m http.server 8000
  ```
- Verify:
  - `http://localhost:8000/` loads.
  - New project/case study links work.
  - Any charts/assets render correctly.
- Ensure text and links are typo-free.
