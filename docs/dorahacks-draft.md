# PortaGrant - prepared DoraHacks content (NOT SUBMITTED)

Prepared October 25, 2026. Do not submit as complete check-in evidence or replace
PortaPulse. Team identity/contact data has not been copied into this draft.

## Project name
PortaGrant

## Suggested track
Ecosystem DApps (proposed, not selected or saved)

## One-sentence overview
Milestone-based native grant escrow for Portaldot, with builder evidence and
sponsor-reviewed releases implemented in Rust/ink! and a local simulation dashboard.

## Public repository
https://github.com/fazeli1977-dot/portagrant

## Current progress
The ink! contract implements grant creation, exact native escrow, builder-only
evidence submission, sponsor-only approval, partial payouts, completion and
grant/milestone reads. The release bundle includes WASM and metadata. Local
validation on October 25 passed 16 Rust tests and 36 JavaScript tests, clippy,
release WASM compilation, ABI parsing and formatting. The browser dashboard
demonstrates evidence submission and partial release using simulated funds.
Deployment helpers default to preflight and require explicit broadcast opt-in.

## Architecture
https://github.com/fazeli1977-dot/portagrant/blob/master/docs/architecture.md

## Deployment status / contract address / transaction hash
No verified deployment, contract address or transaction hash is available.
The official RPC responded to read-only inspection; this is not deployment evidence.
Keep required address/hash fields empty rather than entering invented values.

## Demo status
Local simulation: from the repository root run:

    python -m http.server 4173 --bind 127.0.0.1 --directory frontend

Open http://127.0.0.1:4173 locally. There is no verified public live-demo URL or
public demo video. A localhost URL is not a public demo link.

## Outstanding work
Independently confirm network identity and signing compatibility; provide a
funded testnet signer locally; review constructor dry-run and execution budgets;
deploy with explicit approval; record finalized constructor and interaction
receipts; implement browser signing; publish a live simulation or <=3-minute
video; choose a project license; resolve eligibility and late check-in with organizers.

## Submission blockers
The check-in deadline was October 24, 2026 at 12:00 UTC. The observed Manage
Submission lists PortaPulse under Node Operations & Tooling and does not
establish a PortaGrant check-in or an extension. Confirm the correct project and
late-check-in process before creating or altering a submission. The initial MVP
is dated October 7, before the October 14 build-period start; disclose this and
request organizer eligibility review. No history was rewritten.

## Approval boundary
No DoraHacks save, submit, message, wallet-address transmission, wallet signature,
on-chain transaction or hosting/security-setting change has been performed.
Obtain specific approval immediately before such actions.
