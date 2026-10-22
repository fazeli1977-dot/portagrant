# Presentation readiness - October 22, 2026

## Delivered

- Public repository: https://github.com/fazeli1977-dot/portagrant
- Responsive local dashboard: simulate evidence, sponsor approval, partial
  release, completion and reset. Wallet detection never requests accounts;
  the persistent DEMO MODE label is not replaced with a live-network claim.
- Optimized release bundle: `artifacts/portagrant.contract` includes WASM and
  metadata. Missing author metadata, the incompatible library manifest and
  the unsupported original-manifest workaround were corrected.
- 16 contract tests (previously 3): malformed grants, wrong totals, authorization,
  blank evidence, overflow, duplicate releases and exact partial transfers.
- 31 JavaScript tests: precise u64 reads, finalization/subscription cleanup,
  error and timeout handling, late API cleanup, and dashboard transitions.
- Hardened deployment helper with explicit crypto initialization, input checks,
  bounded connection/finality waits, cleanup and finalized public evidence.
- Cargo/npm lockfiles; removed unused e2e dependency reduced the resolved Rust
  dependency graph from 707 to 171 packages.
- CI validation and downloadable raw WASM/demo artifacts. The optimized,
  metadata-bearing release bundle is committed separately.

## Local verification

- `node scripts/validate.mjs`: syntax, 31 JS tests, actual dependency imports,
  signer initialization, missing-config CLI checks, bundle ABI parsing, 16 Rust
  tests, clippy with warnings denied, raw release WASM build, Git whitespace.
- `cargo fmt --manifest-path contracts/portagrant/Cargo.toml -- --check`: passed
  using the installed stable formatter. The build toolchain remains Rust 1.88.0.
- `npm ci --ignore-scripts` and `npm audit --omit=dev` in `scripts`: passed with
  zero reported vulnerabilities. Two upstream deprecation warnings remain.
- `cargo +1.88.0 contract build --manifest-path contracts/portagrant/Cargo.toml --release --generate all`: passed.
- Generated ABI: constructor and all six messages parsed with Polkadot tooling.
- Chrome: evidence, partial release, completion, reset and wallet detection
  verified. Narrow layout had no horizontal overflow. Extension conflicts
  were observed, but no application error was identified. Mobile screenshot
  capture timed out; mobile layout checks used the live DOM, not screenshot QA.

The older `checkpoint-2-audit.md` preserves the initial snapshot and historical
hashes; this document describes the subsequent remediation.

## External requirements still pending

This is ready for an honest code-and-simulation presentation, not a claim of
live deployed escrow or a guarantee of bug-free production use.

- Supply a compatible Portaldot RPC and funded testnet signer.
- Verify runtime compatibility and costs, then record real addresses,
  finalized hashes and explorer records in `docs/deployment.md`.
- Implement browser signing before presenting an on-chain browser workflow.
- Choose an explicit project license before claiming licensing rights.

No on-chain transaction was sent, deployment evidence invented, seed committed,
or Git timestamp overridden for this delivery.
