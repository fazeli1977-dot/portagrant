# PortaGrant check-in audit - October 25, 2026

## Scope and verdict

Repository: https://github.com/fazeli1977-dot/portagrant (public, branch master).
Audited starting HEAD: d91e0f4bff12f825e6dfe24d811c91d5d6661d72.
This is a source/readiness review, not a professional security certification.
Local prototype validation passes; check-in evidence is incomplete.

## Source and development evidence

| Commit | Author date | Change |
|---|---|---|
| d91e0f4 | 2026-10-22 +03:30 | Pinned network, broadcast opt-in and resource budgets |
| b4faef6 | 2026-10-22 +03:30 | Release bundle and interactive simulation |
| e745e32 | 2026-10-22 +03:30 | Inspection hardening and audit |
| 2769fbf | 2026-10-14 +03:30 | Complete milestone reads |
| cde61a1 | 2026-10-07 +03:30 | Initial MVP, including escrow contract and frontend |

Four commits meet the event date window before this audit. However, the initial
MVP predates the event and already contains the core escrow. The rule that code
be primarily produced October 14-November 6 needs organizer review; commit count
and later improvements do not resolve eligibility. Do not backdate or rewrite history.

Pre-audit CI for d91e0f4 passed:
https://github.com/fazeli1977-dot/portagrant/actions/runs/39760865986

## Verification performed locally

- npm ci --ignore-scripts --prefix scripts: 69 packages installed, 0 reported
  vulnerabilities; upstream deprecation warnings remain.
- node scripts/validate.mjs: passed, including 36 JavaScript tests, 16 Rust
  tests, syntax, actual SDK imports, local test-key initialization, CLI missing
  configuration checks, committed bundle ABI/WASM parsing, clippy with warnings
  denied, locked release WASM build and whitespace validation.
- cargo fmt --manifest-path contracts/portagrant/Cargo.toml -- --check: passed.
- Environment: Node v22.23.2, Cargo 1.88.0.
- Browser at http://127.0.0.1:4173: observed initial 1,200 simulated POT,
  evidence submission, sponsor approval, 1/2 released, 600 simulated POT remaining.
  No wallet signature, RPC write or transfer occurred.
- Release bundle SHA-256:
  2901474DBB1CB6B8E072F6334B02D47F75F8E02A25DB921D16659990108581AE.
  ABI parsing is not a reproducible optimized-bundle rebuild or a deployment proof.
- Read-only official RPC observation is in docs/deployment.md; contracts
  interfaces exist, but signing compatibility and constructor execution are untested.

## Findings and remaining risks

| Status | Item | Evidence / next step |
|---|---|---|
| Complete | Public source, README, dated development history | Public GitHub and Git log |
| Complete | Architecture documentation | Corrected to separate simulation from planned wallet/RPC integration |
| Complete | Local contract/helper/dashboard checks | 52 tests plus build, clippy, formatting and ABI checks passed |
| Complete | Honest local prototype | Browser evidence-to-partial-release simulation verified |
| Incomplete | Public demo or <=3-minute video | No supplied URL; homepage empty; GitHub Pages API returned 404 |
| Incomplete | Live testnet deployment | No verified address, constructor receipt, interaction hash or explorer evidence |
| Blocked | Signing/funding and network approval | No signer supplied to this workspace; observed genesis is not an independently trusted pin |
| Incomplete | Browser signing | Dashboard uses only local state |
| Incomplete | License | No license selected; owner must choose terms |
| Blocked | Check-in timing | Deadline passed; late acceptance requires organizer decision |
| Blocked | Project eligibility | October 7 MVP predates the build window |
| Blocked | DoraHacks project identity | Current Manage Submission lists PortaPulse, not PortaGrant |

Authorization, exact escrow totals, checked arithmetic and single-release guards
are covered by unit tests. No live-chain E2E test, constructor dry-run,
transfer-failure integration test or independent security audit was performed.
There is no refund/cancellation/dispute path: funds can remain locked if evidence
or sponsor approval never arrives. Evidence/title and milestone inputs are not
application-bounded; runtime storage/gas limits still need practical testing.
These are product/security limitations, not reasons to invent chain evidence.

## Official schedule and UI observation

Source inspected in the signed-in browser:
https://dorahacks.io/hackathon/portaldot-hacker-house-2026/detail

- Check-in: October 24, 2026 at 12:00 UTC / 15:30 Asia/Tehran (past).
- Final submission/code freeze: November 6, 2026 at 04:00 UTC / 07:30 Asia/Tehran.
- Manage Submission is accessible, but lists PortaPulse / Node Operations &
  Tooling, not PortaGrant. Clicking Submit new Build did not expose a separate
  editable form in the observed state. Save Changes stayed disabled.
- No separate open check-in form or deadline extension was observed. An open
  final-submission workflow must not be described as an open check-in.

Prepared content is in docs/dorahacks-draft.md. No form fields were entered,
no submission saved, no organizer message sent, and no on-chain transaction
broadcast. No existing submission, hosting setting or project license was changed.
