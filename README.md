# Ballsdex Package Index

A static frontend that lists community-submitted Ballsdex cogs (packages), with installation instructions generated from each package's `pyproject.toml`.

## How to submit a package

To submit a package, create a pull request that adds an entry to `data/cogs.json` with the following format:

```json
{
  "id": "example-cog",
  "repo": "https://github.com/username/repo-name",
  "branch": "main"
}
```

Make sure to replace the `id`, `repo`, and `branch` fields with the appropriate values for your package. The `id` should be a unique identifier for your package, the `repo` should be the URL of your GitHub repository, and the `branch` should be the branch where your package's code is located (usually "main" or "master").
