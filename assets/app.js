const form = document.querySelector("#lead-form");
const result = document.querySelector("#form-result");
const apiOrigin =
  window.AI_BRAND_API_ORIGIN ||
  (location.hostname.endsWith("github.io") ? "https://ai-brand-checkup.pages.dev" : "");

function apiUrl(path) {
  return `${apiOrigin}${path}`;
}

function setSubmitting(isSubmitting) {
  form?.querySelector("button")?.toggleAttribute("disabled", isSubmitting);
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const payload = {
    company: data.get("company"),
    website: data.get("website"),
    category: data.get("category"),
    context: data.get("context"),
    email: data.get("email"),
  };

  result.textContent = "正在提交...";
  setSubmitting(true);

  try {
    const response = await fetch(apiUrl("/api/lead"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await response.json().catch(() => ({}));

    if (!response.ok || !body.ok) {
      throw new Error(body.error || "提交失败");
    }

    result.textContent = "已提交。后台已收到线索。";
    form.reset();
  } catch (error) {
    result.textContent = error instanceof Error ? error.message : "提交失败，请稍后重试。";
  } finally {
    setSubmitting(false);
  }
});
