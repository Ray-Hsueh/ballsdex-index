# Ballsdex Package Index

A static frontend that lists community-submitted Ballsdex cogs (packages), with installation instructions generated from each package's `pyproject.toml`.

## How it works

1. **`data/cogs.json`** — the hand-maintained list of approved and unapproved packages, each pointing to a GitHub repository.
2. **GitHub Action** (`.github/workflows/resolve-cogs.yml`) — runs daily (or on every push to `data/cogs.json`). It clones every listed repo, reads its `pyproject.toml`, and writes the extracted metadata to **`data/resolved.json`**, then commits that file back.
3. **Frontend** (`public/`) — a plain HTML/CSS/JS site that fetches `data/resolved.json` at runtime and renders a card for each package.

## Adding a package

Edit `data/cogs.json` and add an entry to either the `approved` or `unapproved` list:

```json
{
  "id": "my-unique-id",
  "repo": "https://github.com/username/repo-name",
  "branch": "main"
}
```

Push the change — the GitHub Action will pick it up and update `resolved.json` automatically.

## Expected `pyproject.toml` structure

Each submitted repository should have a `pyproject.toml` at its root:

```toml
[project]
name = "my_cool_repo"
version = "1.0.0"
description = "A very nice repository"
license = "MIT"
authors = [
    { name = "laggron42", email = "laggron42@ballsdex.com" },
]

[project.urls]
Homepage = "https://github.com/username/repo-name"
```

## Installation snippet (generated per package)

The site displays the following snippet for each package, ready to paste into `extra/config.toml`:

```toml
[[ballsdex.packages]]
location = "git+https://github.com/username/repo-name.git@v1.0.0"
path = "my_cool_repo"
enabled = true
```

## Local development

Serve the `public/` directory with any static file server, e.g.:

```sh
python -m http.server 8080 --directory public
```

Then open <http://localhost:8080>.

## Running the resolve script locally

```sh
pip install tomli   # only needed on Python < 3.11
python scripts/resolve_cogs.py
```
