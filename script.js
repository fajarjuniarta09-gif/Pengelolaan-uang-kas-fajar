const defaultTransactions = [
  { id: 1, date: "2026-11-24", description: "Iuran kas kelas", category: "Iuran", type: "income", amount: 50000 },
  { id: 2, date: "2026-11-23", description: "Pembelian spidol", category: "Perlengkapan", type: "expense", amount: 125000 },
  { id: 3, date: "2026-11-22", description: "Iuran kas kelas", category: "Iuran", type: "income", amount: 250000 },
  { id: 4, date: "2026-11-20", description: "Konsumsi rapat kelas", category: "Acara", type: "expense", amount: 180000 },
  { id: 5, date: "2026-11-18", description: "Iuran kas kelas", category: "Iuran", type: "income", amount: 300000 }
];

const defaultMembers = [
  { id: 1, name: "Ahmad Rizky", nis: "24102001", paid: true, date: "24 Nov 2026" },
  { id: 2, name: "Anisa Putri", nis: "24102002", paid: true, date: "23 Nov 2026" },
  { id: 3, name: "Bima Pratama", nis: "24102003", paid: false, date: "-" },
  { id: 4, name: "Citra Dewi", nis: "24102004", paid: true, date: "22 Nov 2026" },
  { id: 5, name: "Dimas Saputra", nis: "24102005", paid: false, date: "-" }
];

let transactions = JSON.parse(localStorage.getItem("kasTransactions")) || defaultTransactions;
let members = JSON.parse(localStorage.getItem("kasMembers")) || defaultMembers;

const rupiah = value => new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0
}).format(value);

function saveData() {
  localStorage.setItem("kasTransactions", JSON.stringify(transactions));
  localStorage.setItem("kasMembers", JSON.stringify(members));
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" })
    .format(new Date(dateString + "T00:00:00"));
}

function initials(name) {
  return name.split(" ").map(part => part[0]).join("").slice(0, 2).toUpperCase();
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

function transactionRow(item) {
  return `<tr>
    <td>${formatDate(item.date)}</td>
    <td><strong>${escapeHtml(item.description)}</strong></td>
    <td>${escapeHtml(item.category)}</td>
    <td><span class="type-badge ${item.type}">${item.type === "income" ? "Pemasukan" : "Pengeluaran"}</span></td>
    <td class="align-right"><strong>${item.type === "income" ? "+" : "-"} ${rupiah(item.amount)}</strong></td>
  </tr>`;
}

function transactionRowWithDelete(item) {
  const row = transactionRow(item);
  return row.replace("</tr>", `<td><button class="delete-button" data-delete="${item.id}" aria-label="Hapus">×</button></td></tr>`);
}

function memberRowPreview(member) {
  return `<div class="member-row">
    <div class="member-avatar">${initials(member.name)}</div>
    <div class="member-name"><strong>${escapeHtml(member.name)}</strong><span>${member.nis}</span></div>
    <button class="${member.paid ? "status-paid" : "status-unpaid"}" data-member="${member.id}">${member.paid ? "Sudah bayar" : "Belum bayar"}</button>
  </div>`;
}

function memberRowFull(member) {
  return `<tr>
    <td><strong>${escapeHtml(member.name)}</strong></td>
    <td>${member.nis}</td>
    <td><button class="${member.paid ? "status-paid" : "status-unpaid"}" data-member="${member.id}">${member.paid ? "Sudah bayar" : "Belum bayar"}</button></td>
    <td>${member.date}</td>
    <td></td>
  </tr>`;
}

function renderChart() {
  const monthNames = ["Jun", "Jul", "Ags", "Sep", "Okt", "Nov"];
  const values = [
    [550000, 320000], [780000, 410000], [680000, 530000],
    [920000, 440000], [850000, 610000], [980000, 520000]
  ];
  const max = 2000000;
  document.getElementById("chartArea").innerHTML = monthNames.map((month, index) => `
    <div class="month-group">
      <div class="bar income" style="height:${Math.max(3, values[index][0] / max * 100)}%"></div>
      <div class="bar expense" style="height:${Math.max(3, values[index][1] / max * 100)}%"></div>
      <span class="month-label">${month}</span>
    </div>
  `).join("");
}

function render() {
  const income = transactions.filter(item => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const expense = transactions.filter(item => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
  const balance = income - expense;
  const incomeCount = transactions.filter(item => item.type === "income").length;
  const expenseCount = transactions.filter(item => item.type === "expense").length;
  const paidCount = members.filter(member => member.paid).length;
  const percent = members.length ? Math.round((paidCount / members.length) * 100) : 0;

  document.getElementById("balanceValue").textContent = rupiah(balance);
  document.getElementById("incomeValue").textContent = rupiah(income);
  document.getElementById("expenseValue").textContent = rupiah(expense);
  document.getElementById("incomeCount").textContent = `${incomeCount} transaksi`;
  document.getElementById("expenseCount").textContent = `${expenseCount} transaksi`;
  document.getElementById("paidMembers").textContent = `${paidCount} / ${members.length}`;
  document.getElementById("paymentPercent").textContent = `${percent}%`;
  document.getElementById("paymentProgress").style.width = `${percent}%`;
  document.getElementById("reportIncome").textContent = rupiah(income);
  document.getElementById("reportExpense").textContent = rupiah(expense);
  document.getElementById("reportBalance").textContent = rupiah(balance);

  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));
  document.getElementById("recentTransactions").innerHTML = sorted.slice(0, 5).map(transactionRow).join("");
  document.getElementById("allTransactions").innerHTML = sorted.map(transactionRowWithDelete).join("");
  document.getElementById("memberPreview").innerHTML = members.slice(0, 4).map(memberRowPreview).join("");
  document.getElementById("memberTable").innerHTML = members.map(memberRowFull).join("");
  renderChart();
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2400);
}

function openModal() {
  document.getElementById("transactionModal").classList.add("open");
  document.getElementById("transactionModal").setAttribute("aria-hidden", "false");
  document.getElementById("transactionDate").value = new Date().toISOString().slice(0, 10);
  document.getElementById("transactionDescription").focus();
}

function closeModal() {
  document.getElementById("transactionModal").classList.remove("open");
  document.getElementById("transactionModal").setAttribute("aria-hidden", "true");
  document.getElementById("transactionForm").reset();
}

document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));
    document.getElementById(button.dataset.page).classList.add("active");
    document.querySelector(".topbar h1").textContent = button.querySelector("span:last-child").textContent;
  });
});

document.querySelectorAll("[data-go]").forEach(button => {
  button.addEventListener("click", () => document.querySelector(`.nav-item[data-page="${button.dataset.go}"]`).click());
});

["openTransactionModal", "openTransactionModal2"].forEach(id => {
  const button = document.getElementById(id);
  if (button) button.addEventListener("click", openModal);
});
document.getElementById("closeModal").addEventListener("click", closeModal);
document.getElementById("cancelModal").addEventListener("click", closeModal);
document.getElementById("transactionModal").addEventListener("click", event => {
  if (event.target.id === "transactionModal") closeModal();
});

document.getElementById("transactionForm").addEventListener("submit", event => {
  event.preventDefault();
  transactions.unshift({
    id: Date.now(),
    date: document.getElementById("transactionDate").value,
    description: document.getElementById("transactionDescription").value.trim(),
    amount: Number(document.getElementById("transactionAmount").value),
    category: document.getElementById("transactionCategory").value,
    type: document.getElementById("transactionType").value
  });
  saveData();
  closeModal();
  render();
  showToast("Transaksi berhasil disimpan");
});

document.addEventListener("click", event => {
  const deleteButton = event.target.closest("[data-delete]");
  if (deleteButton) {
    transactions = transactions.filter(item => item.id !== Number(deleteButton.dataset.delete));
    saveData();
    render();
    showToast("Transaksi berhasil dihapus");
  }

  const memberButton = event.target.closest("[data-member]");
  if (memberButton) {
    const member = members.find(item => item.id === Number(memberButton.dataset.member));
    member.paid = !member.paid;
    member.date = member.paid ? "26 Nov 2026" : "-";
    saveData();
    render();
  }
});

document.getElementById("resetPayments").addEventListener("click", () => {
  members.forEach(member => { member.paid = false; member.date = "-"; });
  saveData();
  render();
  showToast("Status pembayaran bulan ini berhasil direset");
});

document.getElementById("exportReport").addEventListener("click", () => {
  const header = "Tanggal,Keterangan,Kategori,Tipe,Jumlah\n";
  const rows = transactions.map(item =>
    [item.date, item.description, item.category, item.type === "income" ? "Pemasukan" : "Pengeluaran", item.amount].join(",")
  ).join("\n");
  const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "laporan-kas-kelas.csv";
  link.click();
  URL.revokeObjectURL(url);
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeModal();
});

render();