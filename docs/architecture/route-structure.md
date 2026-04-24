# Route Structure

Recall's canonical authenticated routes live under `/app/...`.

## Canonical pages

- `/app` for the main archive feed
- `/app/search` for hybrid search
- `/app/chat` for archive chat
- `/app/canvas` for the canvas view
- `/app/graph` for the graph view
- `/app/settings/profile`, `/app/settings/integrations`, and `/app/settings/billing` for settings

## Alias and redirect pages

The repo still keeps a few top-level alias pages so older links continue to work:

- `app/(app)/canvas/page.tsx` redirects to `/app/canvas`
- `app/(app)/graph/page.tsx` redirects to `/app/graph`
- `app/(app)/settings/page.tsx` redirects to `/app/settings/profile`
- `app/(app)/settings/billing/page.tsx` redirects to `/app/settings/billing`

This keeps the public route tree stable while making `/app/...` the only canonical destination for navigation, search params, and future UI work.
