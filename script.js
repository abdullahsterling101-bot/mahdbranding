// Each row pairs "mark on top" (square) with "mark on left" (wide); the brand mark sits alone.
const ROWS = [
  ["Mahd English - Mahd Clinic", "English · Mahd Clinic"],
  ["Mahd Arabic - Eyadat Mahd", "Arabic · عيادة مهد"],
  ["Mahd English - Mahd only", "English · Mahd"],
  ["Mahd Arabic - Mahd only", "Arabic · مهد"],
];
const MARK = "Mahd - brand mark only";

const PALETTE = [
  ["White", "#FFFFFF"],
  ["Petal", "#FCF6F7"],
  ["Pale mauve", "#EDD9E1"],
  ["Dusty rose", "#DCAAB6"],
  ["Mauve", "#9A5F77"],
  ["Plum", "#6E3B54"],
  ["Berry", "#552A3D"],
];

function file(base, layout, kind, theme) {
  if (kind === "animated") return `${base}${layout} - animated - ${theme}.gif`;
  return `${base}${layout} - ${theme} - web.png`;
}

function card(base, layout, shape, caption, kind) {
  const fig = document.createElement("figure");
  fig.className = `logo-card ${shape}`;
  const frame = document.createElement("div");
  frame.className = "logo-frame";
  const img = document.createElement("img");
  img.dataset.light = file(base, layout, kind, "light");
  img.dataset.dark = file(base, layout, kind, "dark");
  img.alt = caption;
  img.loading = kind === "animated" ? "eager" : "lazy";
  img.decoding = "async";
  frame.appendChild(img);
  const cap = document.createElement("figcaption");
  cap.textContent = caption;
  fig.append(frame, cap);
  return fig;
}

function buildGrid(grid) {
  const kind = grid.dataset.kind;
  for (const [base, label] of ROWS) {
    const row = document.createElement("div");
    row.className = "logo-row";
    row.append(
      card(base, " - mark on top", "square", `${label} · mark on top`, kind),
      card(base, " - mark on left", "wide", `${label} · mark on left`, kind),
    );
    grid.appendChild(row);
  }
  const row = document.createElement("div");
  row.className = "logo-row single";
  const layout = kind === "animated" ? "" : " - square";
  row.appendChild(card(MARK, layout, "square", "Brand mark only", kind));
  grid.appendChild(row);
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return `${n >> 16}, ${(n >> 8) & 255}, ${n & 255}`;
}

const toast = document.querySelector(".toast");
let toastTimer;
function showToast(text) {
  toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1600);
}

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const t = document.createElement("textarea");
    t.value = text;
    document.body.appendChild(t);
    t.select();
    document.execCommand("copy");
    t.remove();
  }
  showToast(`Copied ${text}`);
}

function buildPalette(box) {
  for (const [name, hex] of PALETTE) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "swatch";
    b.innerHTML = `
      <span class="swatch-color" style="background:${hex}"></span>
      <span class="swatch-info">
        <span class="swatch-name">${name}</span>
        <span class="swatch-hex">${hex}</span>
        <span class="swatch-rgb">RGB ${hexToRgb(hex)}</span>
      </span>`;
    b.setAttribute("aria-label", `${name}, ${hex}. Copy code`);
    b.addEventListener("click", () => copy(hex));
    box.appendChild(b);
  }
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelectorAll("img[data-light]").forEach((img) => {
    img.src = img.dataset[theme];
  });
  document.querySelectorAll("[data-set-theme]").forEach((b) => {
    b.setAttribute("aria-pressed", String(b.dataset.setTheme === theme));
  });
  try { localStorage.setItem("mahd-theme", theme); } catch {}
}

document.querySelectorAll(".logo-grid").forEach(buildGrid);
buildPalette(document.querySelector(".swatches"));
document.querySelectorAll("[data-set-theme]").forEach((b) => {
  b.addEventListener("click", () => setTheme(b.dataset.setTheme));
});

let saved = "light";
try { saved = localStorage.getItem("mahd-theme") || "light"; } catch {}
setTheme(saved === "dark" ? "dark" : "light");
