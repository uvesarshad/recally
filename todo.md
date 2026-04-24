# RecallQ Audit and UI/UX Todo

## Completed
- [x] Audit app routes, shared layout, and core flows
- [x] Identify unfinished features, placeholders, and broken UX paths
- [x] Fix highest-impact UI/UX issues across shell, search, chat, modals, and landing page copy
- [x] Run focused verification with `npm run lint`
- [x] Run focused verification with `npm run typecheck`

## Fixed In This Pass
- [x] Switched the app back to a dark-first default theme in the root layout
- [x] Added a persistent quick-capture surface to the main app shell
- [x] Added a dedicated mobile navigation pattern with a drawer and bottom tab bar
- [x] Reworked search into a clearer hybrid retrieval page with counts, suggestions, separated exact/semantic results, and match-reason labels
- [x] Reworked chat into a denser threaded workspace with better empty states, export/delete controls, and citation drill-in to item detail state
- [x] Added overlay click and `Escape` dismissal for the create dialog and item detail modal
- [x] Improved canvas/graph with filters, map stats, search, relation threshold controls, stronger empty states, and fetch error handling
- [x] Standardized top-level settings alias routes so they consistently redirect to canonical `/app/...` pages
- [x] Added optimistic archive refresh events so feed, search, and graph react to capture and metadata changes without full-page refreshes
- [x] Added bulk archive actions with a short undo window before permanent delete
- [x] Added initial automated coverage for search explainability and preview URL resolution helpers
- [x] Removed user-facing mojibake/corrupted text from key screens
- [x] Removed or documented the remaining raw image lint warnings

## Decisions
- [x] Chat history remains browser-local for now. The current UX now states that explicitly instead of implying cross-device persistence.
- [x] Dynamic remote preview and avatar images stay on raw `<img>` with documented lint exceptions because their hosts are not constrained to a known allowlist.

## Notes
- Existing unrelated local changes detected in `lib/auth.config.ts`, `lib/auth.ts`, and `lib/env.ts`
- Untracked asset already present: `public/recall-hero-mockup.png`
- Route documentation added in `docs/architecture/route-structure.md`
- Changes in this pass were kept scoped to the audit and UI/UX improvements

## Remaining Larger-Scope Work
- [ ] Expand automated coverage from utility tests to end-to-end flows for capture, search, chat streaming, graph fetch, and metadata updates
- [ ] Improve graph/canvas performance for larger archives with clustering, progressive rendering, or windowing
- [ ] Replace the current theme toggle with a fuller preference model if light mode remains supported, including system-theme sync and stronger light tokens
- [ ] Add richer file/image handling with previews, file-type badges, and better upload-state feedback
- [ ] Improve settings UX with clearer plan/billing state, diagnostics, and sync indicators
- [ ] Replace remaining raw `<img>` usage only if remote image hosts become constrained enough for `next/image` or an internal proxy
- [ ] Add onboarding for first-run users with sample archive content or guided capture prompts
- [ ] Add analytics and observability for enrich failures, preview failures, reminder failures, and chat/search latency
- [ ] Run a focused accessibility and copy-consistency pass across the full product
