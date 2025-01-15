let currentUser = null; // For keeping track of logged-in user

// Helper functions for login state
function isLoggedIn() {
    return localStorage.getItem('loggedIn') === 'true';
}

function getLoggedInUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

// Render Sign-In page
function showSignIn() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h1>Sign In</h1>
        <form id="signInForm">
            <label for="email">Email:</label>
            <input type="email" id="email" required>
            <label for="password">Password:</label>
            <input type="password" id="password" required>
            <button type="submit">Sign In</button>
        </form>
        <p>Don't have an account? <a href="#" onclick="showSignUp()">Sign Up</a></p>
    `;

    document.getElementById('signInForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(user => user.email === email && user.password === password);

        if (user) {
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('currentUser', JSON.stringify(user));
            showDashboard();
        } else {
            alert('Invalid credentials');
        }
    });
}

// Render Sign-Up page
function showSignUp() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h1>Sign Up</h1>
        <form id="signUpForm">
            <label for="newEmail">Email:</label>
            <input type="email" id="newEmail" required>
            <label for="newPassword">Password:</label>
            <input type="password" id="newPassword" required>
            <button type="submit">Sign Up</button>
        </form>
        <p>Already have an account? <a href="#" onclick="showSignIn()">Sign In</a></p>
    `;

    document.getElementById('signUpForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const newEmail = document.getElementById('newEmail').value;
        const newPassword = document.getElementById('newPassword').value;
        const users = JSON.parse(localStorage.getItem('users')) || [];

        if (users.some(user => user.email === newEmail)) {
            alert('Email already exists');
        } else {
            users.push({ email: newEmail, password: newPassword });
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('currentUser', JSON.stringify({ email: newEmail }));
            showSignIn();
        }
    });
}

// Render the Dashboard (Expense Tracker)
function showDashboard() {
    if (!isLoggedIn()) {
        showSignIn();
        return;
    }

    currentUser = getLoggedInUser();
    const content = document.getElementById('content');
    content.innerHTML = `
        <h1>Expense Tracker</h1>
        <div id="expense-form">
            <input type="text" id="expense-name" placeholder="Expense Name" required>
            <input type="number" id="expense-amount" placeholder="Amount" required>
            <input type="date" id="expense-date" required>
            
            <select id="expense-category">
                <option value="bills">Bills</option>
                <option value="entertainment">Entertainment</option>
                <option value="groceries">Groceries</option>
                <option value="vacations">Vacations</option>
                <option value="schools">Schools</option>
                <option value="transportation">Transportation</option>
                <option value="healthcare">Healthcare</option>
                <option value="dining-out">Dining Out</option>
                <option value="shopping">Shopping</option>
                <option value="subscriptions">Subscriptions</option>
            </select>
            <button type="submit" id="submit-expense">Add Expense</button>
        </div>
        <h2>Expenses</h2>
        <ul id="expenseList"></ul>
        <h2>Total Expenses: $<span id="totalExpense">0</span></h2>
        <h2>Category Breakdown:</h2>
        <div id="categoryBreakdown"></div>
        <button id="exportCsv">Export to CSV</button>
    `;
    
    document.getElementById('expenseForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const expenseName = document.getElementById('expenseName').value;
        const expenseAmount = parseFloat(document.getElementById('expenseAmount').value);
        const expenseCategory = document.getElementById('expenseCategory').value;

        if (!expenseName || isNaN(expenseAmount) || expenseAmount <= 0) {
            alert('Please enter valid expense details');
            return;
        }

        const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
        expenses.push({ expenseName, expenseAmount, expenseCategory });
        localStorage.setItem('expenses', JSON.stringify(expenses));

        document.getElementById('expenseForm').reset();
        displayExpenses();
    });

    displayExpenses();
    document.getElementById('exportCsv').addEventListener('click', exportExpensesToCSV);
}

// Display expenses in the dashboard
function displayExpenses() {
    const expenseList = document.getElementById('expenseList');
    const totalExpenseElem = document.getElementById('totalExpense');
    const categoryBreakdownElem = document.getElementById('categoryBreakdown');
    
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    let totalExpense = 0;
    const categoryBreakdown = {};

    expenseList.innerHTML = '';
    expenses.forEach((expense, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>${expense.expenseName}</strong> - $${expense.expenseAmount} (${expense.expenseCategory})
            <button class="edit" onclick="editExpense(${index})">Edit</button>
            <button class="delete" onclick="deleteExpense(${index})">Delete</button>
        `;
        expenseList.appendChild(li);

        totalExpense += expense.expenseAmount;
        if (!categoryBreakdown[expense.expenseCategory]) {
            categoryBreakdown[expense.expenseCategory] = 0;
        }
        categoryBreakdown[expense.expenseCategory] += expense.expenseAmount;
    });

    totalExpenseElem.textContent = totalExpense.toFixed(2);

    categoryBreakdownElem.innerHTML = Object.entries(categoryBreakdown).map(([category, amount]) => `
        <p><strong>${category}:</strong> $${amount.toFixed(2)}</p>
    `).join('');
}

// Edit an expense
function editExpense(index) {
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    const expense = expenses[index];

    document.getElementById('expenseName').value = expense.expenseName;
    document.getElementById('expenseAmount').value = expense.expenseAmount;
    document.getElementById('expenseCategory').value = expense.expenseCategory;

    expenses.splice(index, 1);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    displayExpenses();
}

// Delete an expense
function deleteExpense(index) {
    if (confirm("Are you sure you want to delete this expense?")) {
        const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
        expenses.splice(index, 1);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        displayExpenses();
    }
}

// Export Expenses to CSV
function exportExpensesToCSV() {
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    let csvContent = "Expense Name,Amount,Category\n";

    expenses.forEach(expense => {
        csvContent += `${expense.expenseName},${expense.expenseAmount},${expense.expenseCategory}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'expenses.csv';
    link.click();
}

// Initialize the app
if (isLoggedIn()) {
    showDashboard();
} else {
    showSignIn();
}
