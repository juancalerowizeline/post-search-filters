# Factiva – Post Search Filters

Interactive prototype of the **DJ+ Search Builder + Smart Summary** results page (Factiva, DJ Platform theme).
The filters in the left panel show/hide the headlines in the results list.

Design source: Figma → `Post-Search-Filters (WIP)`, node `385:133901`.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## What works

- **Media Types / Date Range** (radios) and **Source, Company, Industries, Region, Subject, Language** (checkboxes) filter the list live. Within a group values are OR'd, across groups AND'd.
- The 🚫 button on each option **excludes** that value (checkbox shows a dash, chip gets the neutral "excluded" style).
- Counts next to each option are faceted (they reflect the other active filters).
- **Volume by date** chart reacts to the filters (months outside the date range are dimmed).
- Applied-filter chips are removable; "Hide filters" collapses the panel; "Clear all", "Reset filters".
- Header search box filters by keyword; Related Searches fill it.
- Sort (Relevance / Newest / Oldest), detailed/compact view, Export (CSV of the current results).
- Responsive desktop layout; under 860px the nav auto-collapses and the filter panel becomes a slide-over.

## Deploy to GitHub Pages

1. Create the repo on GitHub and push `main`.
2. Settings → Pages → Source: **GitHub Actions**.
3. `.github/workflows/deploy.yml` builds and publishes on every push to `main`.

The Vite `base` is `./`, so it works under any repo name without extra config.
