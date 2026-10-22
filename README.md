# PortaGrant

PortaGrant is a milestone-based grant escrow for the Portaldot V3 ecosystem. A sponsor locks native funds, a builder submits milestone evidence, and the sponsor releases each payment only after review.

## Presentation status

Public source: https://github.com/fazeli1977-dot/portagrant

The contract and local dashboard simulation are available for review. The demo
walks through evidence submission, approval, partial release, completion, and
reset without sending transactions. **Live testnet deployment and browser
signing are not complete.** See `docs/deployment.md` for outstanding evidence
and `docs/demo-script.md` for an honest presentation walkthrough.

## Product

PortaGrant turns ecosystem grants and bounties into an auditable workflow:

1. Sponsor creates a grant with titled milestones and exact escrow amounts.
2. Builder submits a public evidence reference for each milestone.
3. Sponsor approves a submitted milestone.
4. The contract transfers only that milestone amount to the builder.
5. The grant becomes `Completed` only after every milestone is released.

The contract rejects empty grants, zero-value milestones, empty evidence, mismatched escrow totals, unauthorized callers, duplicate releases, and arithmetic overflow.

## Repository

The validated release bundle is in `artifacts/portagrant.contract`. See
`docs/presentation-readiness.md` for completed checks and live-chain requirements.

```text
contracts/portagrant/   Rust/ink! contract, unit tests, WASM artifact
frontend/               dependency-free demo dashboard
scripts/                Node.js deployment and read helpers
docs/                   architecture, deployment evidence, submission checklist
```

## Prerequisites

- Rust toolchain `1.88.0` (the repository uses ink! `5.1.1`).
- `cargo-contract` `5.0.3` for metadata/bundled artifacts when the local toolchain supports it.
- Node.js 20+ for deployment helpers.
- A Portaldot testnet RPC endpoint and a funded testnet deployer account.

Never commit a seed phrase, private key, or `.env` file.

## Build and test

```powershell
cd contracts/portagrant
cargo +1.88.0 test
cargo +1.88.0 clippy --all-targets -- -D warnings
rustup target add wasm32-unknown-unknown --toolchain 1.88.0-x86_64-pc-windows-msvc
cargo +1.88.0 rustc --lib --release --target wasm32-unknown-unknown --no-default-features --crate-type=cdylib
```

The direct WASM artifact is written to `target/wasm32-unknown-unknown/release/portagrant.wasm`. On environments where `cargo-contract` post-processing works, generate the complete `.contract` bundle with:

```powershell
rustup component add rust-src clippy --toolchain 1.88.0-x86_64-pc-windows-msvc
cargo +1.88.0 contract build --release --generate all
```

## Full local validation

Install the locked helper dependencies with `cd scripts; npm ci --ignore-scripts`.
Return to the repository root and run `node scripts/validate.mjs`. This checks
all JavaScript syntax, helper/dashboard tests, actual dependency imports and
local signer initialization, locked Rust tests, clippy, the release WASM build,
and whitespace. It fails at the first unsuccessful check. Rustfmt can be
checked separately with `cargo fmt --manifest-path contracts/portagrant/Cargo.toml -- --check`.

The Cargo and npm lockfiles are committed for reproducible dependency resolution.
No test sends funds or claims live-chain end-to-end coverage.

## Run the demo

Run the dependency-free helper and dashboard regression tests with `npm test --prefix scripts`.
`GRANT_ID` accepts unsigned decimal IDs across the full contract `u64` range;
the read helper validates input before connecting and disconnects after query failures.

```powershell
cd frontend
python -m http.server 4173
```

Open `http://localhost:4173`. The dashboard is an honest demo mode until a contract address and provider integration are configured.

## Testnet deployment

1. Build the WASM and obtain the generated contract metadata JSON.
2. Copy `scripts/.env.example` to `scripts/.env` and set the RPC endpoint, local signer URI, WASM path, and metadata path.
3. Install helper dependencies with `cd scripts; npm ci --ignore-scripts`.
4. Deploy with `npm run deploy`.
5. Record the real address, constructor hash, interaction hashes, UTC timestamps, signer, and explorer URL in `docs/deployment.md`.

The deployment helper waits for finalization, bounds connection/finality waits,
and reports public deployment evidence. On timeout, check the chain before retrying.

The scripts fail closed when required environment values are missing. They do not print or upload private keys.

## Hacker House compliance

- Primary implementation is Rust/ink! and designed for Portaldot's WASM contract environment.
- Development evidence belongs in public Git history; keep at least three dated commits during the Hacker House period.
- Keep contract address, testnet transactions, architecture, and demo evidence updated before check-in and final submission.
- Do not claim testnet deployment until the address and transaction hashes are real and verifiable.

See `docs/submission-checklist.md` for the dated check-in/final requirements and `docs/deployment.md` for the evidence record.
