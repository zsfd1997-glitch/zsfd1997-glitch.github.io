const form = document.querySelector("#admin-form");
const tokenInput = document.querySelector("#token");
const status = document.querySelector("#admin-status");
const list = document.querySelector("#lead-list");
const exportLink = document.querySelector("#export-link");
const apiOrigin =
  window.AI_BRAND_API_ORIGIN ||
  (location.hostname.endsWith("github.io") ? "https://ai-brand-checkup.pages.dev" : "");

function apiUrl(path) {
  return `${apiOrigin}${path}`;
}

const hashToken = new URLSearchParams(location.hash.slice(1)).get("token");
const storedToken = localStorage.getItem("ai-brand-admin-token");

if (hashToken || storedToken) {
  tokenInput.value = hashToken || storedToken;
  loadLeads(tokenInput.value);
}

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const token = tokenInput.value.trim();
  if (!token) return;
  localStorage.setItem("ai-brand-admin-token", token);
  loadLeads(token);
});

async function loadLeads(token) {
  setStatus("正在读取...");
  exportLink.setAttribute("aria-disabled", "true");
  exportLink.href = "#";

  try {
    const response = await fetch(apiUrl(`/api/lead?token=${encodeURIComponent(token)}`));
    const body = await response.json().catch(() => ({}));

    if (!response.ok || !body.ok) {
      throw new Error(body.error || "读取失败");
    }

    renderLeads(body.leads || []);
    exportLink.href = apiUrl(`/api/lead?token=${encodeURIComponent(token)}&format=csv`);
    exportLink.setAttribute("aria-disabled", "false");
    setStatus(`已读取 ${body.leads?.length || 0} 条线索。`);
  } catch (error) {
    list.innerHTML = "";
    setStatus(error instanceof Error ? error.message : "读取失败");
  }
}

function renderLeads(leads) {
  if (!leads.length) {
    list.innerHTML = '<p class="empty-state">暂无线索。</p>';
    return;
  }

  list.replaceChildren(
    ...leads.map((lead) => {
      const card = document.createElement("article");
      card.className = "lead-card";
      card.innerHTML = `
        <header>
          <h2>${escapeHtml(lead.website || "未填写官网")}</h2>
          <time>${formatTime(lead.createdAt)}</time>
        </header>
        <div class="lead-meta">
          <span>${escapeHtml(lead.category || "未填写类型")}</span>
          <span>${escapeHtml(lead.email || "未填写邮箱")}</span>
        </div>
        <p>${escapeHtml(lead.context || "未填写问题")}</p>
      `;
      return card;
    }),
  );
}

function setStatus(text) {
  status.textContent = text;
}

function formatTime(value) {
  if (!value) return "未知时间";
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[char];
  });
}
