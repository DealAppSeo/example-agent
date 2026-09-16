# @hyperdag/example-agent

Stranger path for [TrustShell](https://github.com/DealAppSeo/trustshell) **main** (1.4.0 unpublished).
Until Sean publishes, this repo depends on `github:DealAppSeo/trustshell`, **not** `@hyperdag/trustshell@1.4.0` (that tag 404s; npm `latest` is 1.3.0).

## Install → four keyless commands

```bash
git clone https://github.com/DealAppSeo/example-agent
cd example-agent
npm install

# 1. HAL PASS
npx trustshell verify "The capital of France is Paris."

# 2. HAL VETO
npx trustshell verify "The Eiffel Tower is located in Rome, Italy."

# 3. RepID
npx trustshell repid trinity-shofet

# 4. range proof, client-side verify
npx trustshell proof trinity-shofet --verify
```

That is the whole demo. No API key. After **F-PUBLISH**, this package.json flips to `@hyperdag/trustshell@1.4.0` — not before.

## Optional: Express gate (same SDK)

```bash
npm start
# POST /agent/query {"query":"The Eiffel Tower is in Paris"}
```

The server calls `TrustShell.verifyOutput` (keyless). A VETO refuses the claim.

```bash
npm test
```

## License
Apache-2.0. Built on [HyperDAG Protocol](https://github.com/DealAppSeo/hyperdag-protocol).
