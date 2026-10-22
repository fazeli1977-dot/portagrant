# Release contract bundle

`portagrant.contract` contains optimized WASM and ink! metadata, generated on
October 22, 2026 with Rust 1.88.0 and cargo-contract 5.0.3 in RELEASE mode:

```powershell
cargo +1.88.0 contract build --manifest-path contracts/portagrant/Cargo.toml --release --generate all
```

The embedded WASM is 12,679 bytes. This is a build artifact, not evidence of
deployment or an external security audit. Rebuild after contract changes.
`node scripts/validate.mjs` parses the committed bundle using the real ABI.
See `docs/presentation-readiness.md` for validation and remaining requirements.
