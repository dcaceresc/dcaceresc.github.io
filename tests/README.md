# Portfolio checks

These tests use Node's built-in test runner and inspect the generated HTML, with no additional test dependencies.

Build before running tests so assertions use the current pages:

```sh
npm run build && node --test tests/professional-evidence.test.mjs
```

Run the complete suite and check patch whitespace:

```sh
npm run build && node --test tests/*.test.mjs
git diff --check
```

- `portfolio.test.mjs` covers the hiring-focused home page and navigation (T1).
- `professional-evidence.test.mjs` covers project ordering, unfinished-work labels, documented objectives and technologies, project evidence anchors, professional contributions, retained employment and education details, certificate access, and page heading structure (T2).

The checks preserve all three projects and six skill groups. They do not verify external service availability, employment history, project completion, accessibility in a browser, or visual behavior on different screens. Content must remain limited to documented evidence; passing tests do not substantiate new proficiency claims or measured outcomes.
