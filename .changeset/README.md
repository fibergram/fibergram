# Changesets

Every PR that changes a package's public behavior adds a changeset:

```bash
pnpm changeset
```

Pick the affected packages and bump level (patch/minor/major), then write a
human-readable description. The bot collects them into a "Version Packages" PR;
merging it runs `changeset publish` via OIDC trusted publishing (design §14.1).

More: https://github.com/changesets/changesets
