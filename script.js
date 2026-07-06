
if (localStorage.getItem("loggedIn") !== "true") {
  window.location.href = "login.html";
}


let chartInstance;
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let editId = null;


function getCurrency() {
  const settings = JSON.parse(localStorage.getItem("settings")) || {};
  return settings.currency || "₹";
}

let dashboard = document.querySelector(".section-1");
let settingpage = document.getElementById("setting-page");
let dashboardbtn = document.querySelector(".dashboard");
let settingbtn = document.querySelector(".setting");

settingpage.style.display = "none";

settingbtn.addEventListener("click", function (e) {
  e.preventDefault();
  dashboard.style.display = "none";
  settingpage.style.display = "block";
});

dashboardbtn.addEventListener("click", function (e) {
  e.preventDefault();
  settingpage.style.display = "none";
  dashboard.style.display = "block";
});

const darkToggle = document.querySelector("#dark-mode");
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
  document.body.classList.add("dark");
  darkToggle.checked = true;
}

darkToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
});

const addbtn = document.querySelector(".add-btn");
const modal = document.getElementById("add-trans");
const removebtn = document.querySelector(".trans-close");
const transform = document.getElementById("trans-form");
const modalTitle = document.querySelector(".trans-title");
const submitBtn = document.querySelector(".trans-btn");

addbtn.addEventListener("click", () => {
  editId = null;
  transform.reset();
  modalTitle.textContent = "Add Transaction";
  submitBtn.textContent = "Save Transaction";
  modal.classList.add("active");
});

removebtn.addEventListener("click", () => {
  modal.classList.remove("active");
});

modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.remove("active");
});

transform.addEventListener("submit", function (e) {
  e.preventDefault();

  const type = document.getElementById("trans-type").value;
  const description = document.getElementById("trans-desc").value;
  const amount = Number(document.getElementById("trans-amt").value);
  const date = document.getElementById("trans-date").value;
  const category = document.getElementById("trans-category").value;

  if (editId !== null) {
    const t = transactions.find((t) => t.id === editId);
    if (t) {
      t.type = type;
      t.description = description;
      t.amount = amount;
      t.date = date;
      t.category = category;
    }
    editId = null;
  } else {
    transactions.push({
      id: Date.now(),
      type,
      description,
      amount,
      date,
      category,
    });
  }

  localStorage.setItem("transactions", JSON.stringify(transactions));

  modal.classList.remove("active");
  transform.reset();

  renderTransactions();
  updateSummary();
  updateChart();
});

function openEditModal(id) {
  const t = transactions.find((t) => t.id === id);
  if (!t) return;

  editId = id;
  document.getElementById("trans-type").value = t.type;
  document.getElementById("trans-desc").value = t.description;
  document.getElementById("trans-amt").value = t.amount;
  document.getElementById("trans-date").value = t.date;
  document.getElementById("trans-category").value = t.category;

  modalTitle.textContent = "Edit Transaction";
  submitBtn.textContent = "Update Transaction";
  modal.classList.add("active");
}

const searchInput = document.getElementById("searchInput");
const typeFilter = document.getElementById("typeFilter");
const tablebody = document.getElementById("tableBody");

function getFilteredTransactions() {
  const query = (searchInput.value || "").toLowerCase().trim();
  const type = typeFilter.value;

  return transactions.filter((t) => {
    const matchesQuery =
      !query ||
      t.description.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query);
    const matchesType = type === "all" || t.type === type;
    return matchesQuery && matchesType;
  });
}

searchInput.addEventListener("input", renderTransactions);
typeFilter.addEventListener("change", renderTransactions);

function renderTransactions() {
  tablebody.innerHTML = "";
  const currency = getCurrency();
  const list = getFilteredTransactions();

  if (list.length === 0) {
    tablebody.innerHTML = `<tr><td colspan="5" style="text-align:center; opacity:0.6;">No transactions found</td></tr>`;
    return;
  }

  list
    .slice()
    .reverse()
    .forEach((t) => {
      const isIncome = t.type === "income";
      const row = `<tr>
        <td>${t.date}</td>
        <td><strong>${t.description}</strong></td>
        <td><span class="tag">${t.category}</span></td>
        <td class="${isIncome ? "text-green" : "text-red"}">
          ${isIncome ? "+" : "-"}${currency}${t.amount}
        </td>
        <td>
          <button class="action-button edit-btn" onclick="openEditModal(${t.id})">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="action-button delete-btn" onclick="deleteTransaction(${t.id})">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>`;
      tablebody.innerHTML += row;
    });
}

function updateSummary() {
  let income = 0;
  let expense = 0;
  const currency = getCurrency();

  transactions.forEach((t) => {
    if (t.type === "income") income += t.amount;
    else expense += t.amount;
  });

  document.querySelector(".balance").innerText = `${currency}${income - expense}`;
  document.querySelector(".income").innerText = `${currency}${income}`;
  document.querySelector(".expense").innerText = `${currency}${expense}`;
  document.querySelector(".count").innerText = transactions.length;
}

function updateChart() {
  let income = 0;
  let expense = 0;

  transactions.forEach((t) => {
    if (t.type === "income") income += t.amount;
    else expense += t.amount;
  });

  if (chartInstance) {
    chartInstance.destroy();
  }

  const ctx = document.getElementById("cashFlowChart");

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Income", "Expense"],
      datasets: [
        {
          label: "Amount",
          data: [income, expense],
          backgroundColor: ["#16a34a", "#dc2626"],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

function deleteTransaction(id) {
  if (!confirm("Delete this transaction?")) return;
  transactions = transactions.filter((t) => t.id !== id);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  renderTransactions();
  updateSummary();
  updateChart();
}

const resetBtn = document.getElementById("reset");
resetBtn.addEventListener("click", () => {
  if (!confirm("This will permanently delete all your transaction data. Continue?")) return;
  localStorage.removeItem("transactions");
  transactions = [];
  searchInput.value = "";
  typeFilter.value = "all";
  renderTransactions();
  updateSummary();
  updateChart();
});

const logoutBtn = document.querySelector(".log-out");
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("loggedIn");
  window.location.href = "login.html";
});

const settingForm = document.getElementById("setting-form");
const settingName = document.getElementById("setting-name");
const settingCurrency = document.getElementById("setting-currency");
const userNameLabel = document.querySelector(".name");

(function loadSettings() {
  const settings = JSON.parse(localStorage.getItem("settings")) || {};
  if (settings.name) {
    settingName.value = settings.name;
    userNameLabel.textContent = settings.name;
  }
  if (settings.currency) {
    settingCurrency.value = settings.currency;
  }
})();

settingForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const settings = {
    name: settingName.value.trim() || "Kirtan Sharma",
    currency: settingCurrency.value,
  };

  localStorage.setItem("settings", JSON.stringify(settings));
  userNameLabel.textContent = settings.name;

  renderTransactions();
  updateSummary();

  alert("Settings saved");

  settingpage.style.display = "none";
  dashboard.style.display = "block";
});

renderTransactions();
updateSummary();
updateChart();
