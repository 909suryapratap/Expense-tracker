const form = document.getElementById('transaction-form');
const descInput = document.getElementById('desc');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const transactionsList = document.getElementById('transactions');
const balanceEl = document.getElementById('balance');
const incomeEl = document.getElementById('income');
const expenseEl = document.getElementById('expense');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

let chart;

function init() {
    renderTransaction();
    updateSummary();
    updateChart();
}

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const desc = descInput.value.trim();
    const amount = +amountInput.value;
    const category = categoryInput.value;

    if (!desc || !amount) return;

    const transaction = {
        id: Date.now(),
        desc,
        amount,
        category
    };

    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));

    descInput.value = '';
    amountInput.value = '';

    renderTransaction();
    updateSummary();
    updateChart();
});

function renderTransaction() {
    transactionsList.innerHTML = '';
    transactions.forEach((t) => {
        const li = document.createElement('li');
        li.classList.add("transaction",t.amount >0 ? "income" : "expense");
        li.innerHTML = `
            <span>${t.desc} (${t.category})</span>
            <span>${t.amount > 0 ? '+' : ''}$${Math.abs(t.amount)}
            <button class="delete-btn" onclick="deleteTransaction(${t.id})">x</button>
            </span>
        `;
        transactionsList.appendChild(li);
    });
}   

function updateSummary() {
  const income = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const balance = income - expense;

  balanceEl.textContent = balance.toFixed(2);
  incomeEl.textContent = `+$${income.toFixed(2)}`;
  expenseEl.textContent = `-$${expense.toFixed(2)}`;
}

// Delete Transaction
function deleteTransaction(id) {
  transactions = transactions.filter((t) => t.id !== id);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  renderTransactions();
  updateSummary();
  updateChart();
}


function updateChart() {
  const categories = {};
  transactions.forEach((t) => {
    if (t.amount < 0) {
      categories[t.category] = (categories[t.category] || 0) + Math.abs(t.amount);
    }
  });

  const labels = Object.keys(categories);
  const data = Object.values(categories);

  if (chart) chart.destroy();

  const ctx = document.getElementById("chart").getContext("2d");
  chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            "#36a2eb",
            "#ff6384",
            "#ffce56",
            "#4bc0c0",
            "#9966ff",
          ],
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  });
}

init();