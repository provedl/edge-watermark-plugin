const ruleListEl = document.getElementById("ruleList");
const newSiteInput = document.getElementById("newSite");
const newTextInput = document.getElementById("newText");
const addRuleBtn = document.getElementById("addRuleBtn");
const enableToggle = document.getElementById("enableToggle");

let rules = [];

function renderRules() {
  if (rules.length === 0) {
    ruleListEl.innerHTML = '<div class="empty-tip">暂无规则，请添加</div>';
    return;
  }
  ruleListEl.innerHTML = rules
    .map(
      (rule, i) => `
    <div class="rule-item">
      <div class="rule-info">
        <span class="rule-site">${rule.site}</span>
        <span class="rule-text">${rule.text}</span>
      </div>
      <button class="btn-remove" data-index="${i}">&times;</button>
    </div>`
    )
    .join("");

  ruleListEl.querySelectorAll(".btn-remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      rules.splice(Number(btn.dataset.index), 1);
      save();
      renderRules();
    });
  });
}

function save() {
  chrome.storage.sync.set({
    rules,
    enabled: enableToggle.checked,
  });
}

chrome.storage.sync.get(["rules", "enabled"], (data) => {
  rules = data.rules || [];
  enableToggle.checked = data.enabled !== false;
  renderRules();
});

addRuleBtn.addEventListener("click", () => {
  const site = newSiteInput.value.trim().toLowerCase();
  const text = newTextInput.value.trim();
  if (!site || !text) return;
  const cleaned = site.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  if (cleaned) {
    rules.push({ site: cleaned, text });
    save();
    renderRules();
  }
  newSiteInput.value = "";
  newTextInput.value = "";
});

newTextInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addRuleBtn.click();
});

enableToggle.addEventListener("change", save);
