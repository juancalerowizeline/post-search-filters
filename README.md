# Post Search Filters

Interactive prototype of a **Advanced Search + AI Summary** results page.
The filters in the left panel show/hide the headlines in the results list.

Design source: Figma → `Post-Search-Filters (WIP)`, node `385:133901`.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## What works

- **Media Types / Date Range** (radios) and **Source, Company, Industries, Region, Subject, Language** (checkboxes) filter the list when you click **Apply filters**. Within a group values are OR'd, across groups AND'd.
- **Reset filters** and **Apply filters** are disabled until a filter is changed; Reset clears everything back to the default (Last 6 months) and disables both again.
- The 🚫 button on each option **excludes** that value (checkbox shows a dash, chip gets the neutral "excluded" style).
- Counts next to each option are faceted (they reflect the other active filters).
- **Volume by date** chart reacts to the filters (months outside the date range are dimmed).
- Applied-filter chips are removable; "Hide/Show filters" toggles the panel; "Reset filters" restores the default.
- Header search opens the expanded search panel (recent/saved searches, selected filters). Typing there has no functionality yet; Related Searches still filter the list.
- Sort (Relevance / Newest / Oldest), detailed/compact view, Export dropdown (pick a filter element → CSV with its values, counts and selection).
- Responsive desktop layout; under 860px the nav auto-collapses and the filter panel becomes a slide-over.

## Deploy to GitHub Pages

Pages is served from the `/docs` folder. Before every push run:

```bash
npm run build:pages   # builds into docs/ (base './', works under any repo path)
```

and commit `docs/` together with the source changes.
