# Madhura Belli Portfolio

A static portfolio website showcasing selected software and systems-thinking projects, including **The Body as a Distributed System** case study and dashboard prototype.

## Purpose

This repo is the source for a personal portfolio that:
- Highlights projects and technical interests.
- Hosts a narrative case study that frames human physiology as a distributed system.
- Serves a lightweight, client-side dashboard backed by a local JSON sample dataset.

## Local development

### Prerequisites
- Python 3.x (for simple static file serving)

### Run locally
1. From the repository root, start a local server:
   ```bash
   python3 -m http.server 8000
   ```
2. Open the site:
   - Portfolio home: `http://localhost:8000/`
   - Project page: `http://localhost:8000/projects/body-distributed-system.html`

## How to update the dataset

The dashboard reads data from `data/bio_signals_sample.json`.

### Expected shape
Each entry should follow this schema:

```json
{
  "date": "YYYY-MM-DD",
  "strain": 0,
  "sleepHours": 0,
  "hrv": 0,
  "restingHr": 0
}
```

### Update workflow
1. Edit `data/bio_signals_sample.json` with your new daily records.
2. Keep `date` values sorted in ascending order.
3. Keep values numeric for `strain`, `sleepHours`, `hrv`, and `restingHr`.
4. Refresh the project page to verify charts and summary metrics render correctly.

## Deployment

This site is designed for GitHub Pages.

### Deploy steps
1. Commit and push changes to the repository's publishing branch (typically `main`).
2. In GitHub, verify **Settings → Pages** is configured to deploy from the correct branch/folder.
3. Wait for the Pages build to complete.
4. Validate the live pages:
   - `/`
   - `/projects/body-distributed-system.html`

If the update does not appear immediately, hard-refresh the browser or wait for CDN cache propagation.
