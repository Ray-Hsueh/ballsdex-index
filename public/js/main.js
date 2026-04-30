/**
 * ballsdex-index — main JS
 * Loads data/resolved.json and renders cog cards.
 */

const RESOLVED_URL = "data/resolved.json";

// ── Helpers ────────────────────────────────────────────────────────────────

function escHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Build the TOML snippet a user needs to add to extra/config.toml.
 * Uses the package name from pyproject.toml as the `path` value and
 * constructs the git URL with the pinned version.
 */
function buildInstallSnippet(cog) {
  const name = cog.name || cog.id;
  const version = cog.version ? `@v${cog.version}` : "";
  const location = `git+${cog.repo}.git${version}`;
  return `[[ballsdex.packages]]\nlocation = "${location}"\npath = "${name}"\nenabled = true`;
}

function copyToClipboard(btn, text) {
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.textContent;
    btn.textContent = "Copied!";
    setTimeout(() => { btn.textContent = orig; }, 1500);
  });
}

// ── Card builder ────────────────────────────────────────────────────────────

function buildCard(cog) {
  const name = escHtml(cog.name || cog.id);
  const version = escHtml(cog.version || "");
  const description = escHtml(cog.description || "No description provided.");
  const repoUrl = escHtml(cog.repo || "");
  const licenseText = escHtml(
    typeof cog.license === "string"
      ? cog.license
      : cog.license?.text || ""
  );
  const authors = (cog.authors || [])
    .map(a => escHtml(typeof a === "string" ? a : a.name || ""))
    .filter(Boolean)
    .join(", ");

  const snippet = buildInstallSnippet(cog);
  const fileHint = "extra/config.toml";

  const card = document.createElement("article");
  card.className = "card";
  card.innerHTML = `
    <div class="card-header">
      <span class="card-title">${name}</span>
      ${version ? `<span class="card-version">v${version}</span>` : ""}
    </div>
    <p class="card-description">${description}</p>
    <div class="card-meta">
      ${repoUrl ? `<span>Repository: <a href="${repoUrl}" target="_blank" rel="noopener noreferrer">${repoUrl}</a></span>` : ""}
      ${authors ? `<span>Authors: ${authors}</span>` : ""}
      ${licenseText ? `<span>License: ${licenseText}</span>` : ""}
    </div>
    <details class="install-block">
      <summary>Installation</summary>
      <div class="install-steps">
        <div>
          <p class="install-step-label">Add the following to <strong>${escHtml(fileHint)}</strong>:</p>
          <div class="code-block" id="snippet-${escHtml(cog.id)}"><button class="copy-btn" data-target="snippet-${escHtml(cog.id)}">Copy</button>${escHtml(snippet)}</div>
        </div>
      </div>
    </details>
  `;

  // Wire up copy button
  card.querySelector(".copy-btn").addEventListener("click", function () {
    copyToClipboard(this, snippet);
  });

  return card;
}

// ── Render ───────────────────────────────────────────────────────────────────

function renderSection(cogs, status, containerId, countId) {
  const container = document.getElementById(containerId);
  const countEl = document.getElementById(countId);
  const filtered = cogs.filter(c => c.status === status);

  countEl.textContent = filtered.length;

  if (filtered.length === 0) {
    container.innerHTML = `<p class="state-msg">No ${status} cogs yet.</p>`;
    return;
  }

  container.innerHTML = "";
  filtered.forEach(cog => container.appendChild(buildCard(cog)));
}

async function loadAndRender() {
  const approvedGrid = document.getElementById("approved-grid");
  const unapprovedGrid = document.getElementById("unapproved-grid");

  try {
    const res = await fetch(RESOLVED_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const cogs = await res.json();

    renderSection(cogs, "approved", "approved-grid", "approved-count");
    renderSection(cogs, "unapproved", "unapproved-grid", "unapproved-count");
  } catch (err) {
    const msg = `<p class="state-msg">Failed to load cog data: ${escHtml(err.message)}</p>`;
    approvedGrid.innerHTML = msg;
    unapprovedGrid.innerHTML = msg;
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", loadAndRender);
