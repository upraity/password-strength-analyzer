const passwordInput = document.getElementById("password");
const toggleBtn = document.getElementById("toggleBtn");
const clearBtn = document.getElementById("clearBtn");
const meterFill = document.getElementById("meterFill");
const strengthLabel = document.getElementById("strengthLabel");
const scoreText = document.getElementById("scoreText");
const criteriaEl = document.getElementById("criteria");
const suggestionsEl = document.getElementById("suggestions");
const lengthValue = document.getElementById("lengthValue");
const uniqueValue = document.getElementById("uniqueValue");
const varietyValue = document.getElementById("varietyValue");
const patternValue = document.getElementById("patternValue");

const commonPasswords = new Set([
  "password","password1","123456","12345678","123456789","1234567890",
  "qwerty","qwerty123","admin","admin123","letmein","welcome",
  "iloveyou","monkey","dragon","football","abc123","111111","000000"
]);

const criteriaDefinitions = [
  ["length", "At least 12 characters"],
  ["long", "At least 16 characters"],
  ["lower", "Contains lowercase letters"],
  ["upper", "Contains uppercase letters"],
  ["number", "Contains numbers"],
  ["special", "Contains special characters"],
  ["unique", "Uses a good variety of characters"],
  ["pattern", "No obvious repeated/sequential pattern"]
];

function analyze(password) {
  const lower = /[a-z]/.test(password);
  const upper = /[A-Z]/.test(password);
  const number = /\d/.test(password);
  const special = /[^A-Za-z0-9]/.test(password);
  const length = password.length;
  const unique = new Set(password).size;
  const variety = [lower, upper, number, special].filter(Boolean).length;

  const lowerPassword = password.toLowerCase();
  const common = commonPasswords.has(lowerPassword);
  const repeated = /(.)\1{3,}/.test(password);
  const sequential = /(0123|1234|2345|3456|4567|5678|6789|abcd|bcde|cdef|qwer|asdf|zxcv)/i.test(password);
  const obviousPattern = common || repeated || sequential;

  let score = 0;
  if (length >= 8) score += 15;
  if (length >= 12) score += 20;
  if (length >= 16) score += 15;
  if (length >= 20) score += 5;
  score += variety * 10;
  if (unique >= 8) score += 5;
  if (unique >= 12) score += 5;
  if (obviousPattern) score -= 30;
  if (common) score -= 20;
  score = Math.max(0, Math.min(100, score));

  let label = "Very Weak";
  if (score >= 80) label = "Very Strong";
  else if (score >= 60) label = "Strong";
  else if (score >= 40) label = "Moderate";
  else if (score >= 20) label = "Weak";

  const passed = {
    length: length >= 12,
    long: length >= 16,
    lower, upper, number, special,
    unique: unique >= Math.min(8, Math.max(4, Math.floor(length * 0.55))),
    pattern: !obviousPattern
  };

  const suggestions = [];
  if (length < 12) suggestions.push("Use at least 12 characters.");
  if (length < 16) suggestions.push("Consider using 16 or more characters for stronger protection.");
  if (!lower) suggestions.push("Add lowercase letters.");
  if (!upper) suggestions.push("Add uppercase letters.");
  if (!number) suggestions.push("Add numbers.");
  if (!special) suggestions.push("Add special characters such as !, @, # or %.");
  if (obviousPattern) suggestions.push("Avoid common passwords, repeated characters and simple sequences.");
  if (unique < 8 && length >= 8) suggestions.push("Use more varied characters instead of repeating the same characters.");
  if (!suggestions.length) suggestions.push("This password meets the main checks. Prefer a unique password that you do not reuse elsewhere.");

  return { score, label, passed, length, unique, variety, obviousPattern, common, suggestions };
}

function renderEmpty() {
  meterFill.style.width = "0%";
  meterFill.style.background = "transparent";
  strengthLabel.textContent = "No password";
  scoreText.textContent = "Score: 0/100";
  lengthValue.textContent = "0";
  uniqueValue.textContent = "0";
  varietyValue.textContent = "0/4";
  patternValue.textContent = "None";
  criteriaEl.innerHTML = criteriaDefinitions.map(([, text]) =>
    `<div class="criterion"><span class="icon">•</span><span>${text}</span></div>`).join("");
  suggestionsEl.innerHTML = "<li>Enter a password to see suggestions.</li>";
}

function render(result) {
  meterFill.style.width = result.score + "%";
  meterFill.style.background = result.score < 20 ? "#dc2626" :
    result.score < 40 ? "#ea580c" :
    result.score < 60 ? "#ca8a04" :
    result.score < 80 ? "#16a34a" : "#15803d";

  strengthLabel.textContent = result.label;
  scoreText.textContent = `Score: ${result.score}/100`;
  lengthValue.textContent = result.length;
  uniqueValue.textContent = result.unique;
  varietyValue.textContent = `${result.variety}/4`;
  patternValue.textContent = result.obviousPattern ? (result.common ? "Common password" : "Pattern detected") : "None";

  criteriaEl.innerHTML = criteriaDefinitions.map(([key, text]) => {
    const pass = result.passed[key];
    return `<div class="criterion ${pass ? "pass" : "fail"}"><span class="icon">${pass ? "✓" : "!"}</span><span>${text}</span></div>`;
  }).join("");

  suggestionsEl.innerHTML = result.suggestions.map(item => `<li>${item}</li>`).join("");
}

passwordInput.addEventListener("input", () => {
  const password = passwordInput.value;
  if (!password) renderEmpty();
  else render(analyze(password));
});

toggleBtn.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";
  toggleBtn.textContent = isPassword ? "Hide" : "Show";
});

clearBtn.addEventListener("click", () => {
  passwordInput.value = "";
  passwordInput.type = "password";
  toggleBtn.textContent = "Show";
  renderEmpty();
  passwordInput.focus();
});

renderEmpty();
