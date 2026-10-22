# Checkpoint 2 audit - October 22, 2026

## Scope and readiness

This is a source-tree audit, not a third-party security certification or proof
of live testnet operation. The repository was clean at baseline commit
`2769fbff15c4b2048339c0ca9bf58cb841552e08`.

- The ink! contract implements grant creation, builder evidence submission,
  sponsor approval, native escrow release, and grant/milestone reads.
- Three existing contract unit tests cover creation, ordered milestone reads,
  and completion. Negative authorization, duplicate release, failed transfer,
  and arithmetic boundary regression coverage remains a follow-up.
- The dashboard is explicitly demo-only: it renders hard-coded milestones and
  detects injected providers, but does not query or sign contract operations.
- `docs/deployment.md` still contains pending addresses and transaction hashes,
  a literal `$hash` placeholder, and a malformed approval method label.
  No live deployment or interaction evidence was established in this audit.
- The deployment helper does not wait explicitly for finalization, bound its
  subscription lifetime, or disconnect on all failure paths. It should be
  hardened before being relied upon for final deployment evidence.
- The check-in deadline recorded in the repository is October 24, 2026 at
  12:00 UTC; this audit does not independently verify event rules or deadlines.
- Git and GitHub CLI could not resolve the configured `naomi197/portagrant`
  remote with the current access. This does not establish whether it was
  deleted, renamed, made private, or is inaccessible to this account.

## Improvement delivered

The inspection helper previously opened an RPC connection before validating
the grant ID or reading metadata, rejected valid contract IDs above JavaScript's
safe integer range, and leaked its connection on failed queries.

It now validates the complete unsigned `u64` decimal range before connection,
passes IDs as exact strings without rounding, loads metadata before connection,
and disconnects after successful reads, dispatch errors, RPC rejections, output
decoding errors, and contract-construction failures. The query logic is isolated
for dependency-free tests; CI runs those tests as well as syntax checks.

The tests use mocked contract queries. They do not claim RPC compatibility,
finality, funded deployment, or live-chain end-to-end coverage.

## Validation commands

Run from the repository root:

```powershell
npm test --prefix scripts
node --check frontend/app.js
Get-ChildItem scripts -Filter *.mjs | ForEach-Object { node --check $_.FullName }
cargo +1.88.0 test --manifest-path contracts/portagrant/Cargo.toml
cargo +1.88.0 clippy --manifest-path contracts/portagrant/Cargo.toml --all-targets -- -D warnings
cargo +1.88.0 build --manifest-path contracts/portagrant/Cargo.toml --release --target wasm32-unknown-unknown --no-default-features
git diff --check
```

No transaction was sent, no deployment evidence was fabricated, and no Git
author/committer timestamp was overridden for this checkpoint.

## Local validation results

All checks above passed on October 22, 2026 using Node.js 22.23.2 and Rust
1.88.0 on Windows: 9 helper tests, 3 contract tests, frontend/helper syntax
checks, clippy with warnings denied, release WASM build, and Git whitespace
checks. These are local results, not a claim that remote CI has run.

The directly built WASM SHA-256 is
`1eb6c5318ea4c490e279e65c5ffe9d5fc416e1dc82722508a48e9b17a26ac777`.
This is a local build artifact, not a deployed address or transaction receipt;
it is not a substitute for a metadata-bearing `.contract` bundle.
