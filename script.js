let currentUser = null;

// Helper functions for login state
function isLoggedIn() {
    return localStorage.getItem('loggedIn') === 'true';
}

function getLoggedInUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

// Render Sign-Up page (default starting page)
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

    document.getElementById('signUpForm').addEventListener('submit', function (event) {
        event.preventDefault();
        const newEmail = document.getElementById('newEmail').value.trim();
        const newPassword = document.getElementById('newPassword').value.trim();
        const users = JSON.parse(localStorage.getItem('users') || '[]');

        if (users.some(user => user.email === newEmail)) {
            alert('Email already exists. Please use a different email.');
        } else {
            users.push({ email: newEmail, password: newPassword });
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('currentUser', JSON.stringify({ email: newEmail }));
            alert('Sign-up successful! You are now logged in.');
            showDashboard();  // Automatically redirect to Dashboard after sign-up
        }
    });
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

    document.getElementById('signInForm').addEventListener('submit', function (event) {
        event.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const users = JSON.parse(localStorage.getItem('users') || '[]');

        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('currentUser', JSON.stringify(user));
            alert('Login successful!');
            showDashboard();
        } else {
            alert('Invalid email or password. Please try again.');
        }
    });
}

// Render the Dashboard
function showDashboard() {
    if (!isLoggedIn()) {
        showSignIn();  // If not logged in, redirect to sign-in
        return;
    }

    currentUser = getLoggedInUser();
    const content = document.getElementById('content');
    content.innerHTML = `
        <h1>Welcome, ${currentUser.email}</h1>
        <button onclick="logout()">Log Out</button>
        <h2>Expense Tracker</h2>
        <form id="expenseForm">
            <input type="text" id="expenseName" placeholder="Expense Name" required>
            <input type="number" id="expenseAmount" placeholder="Amount" required>
            <input type="date" id="expenseDate" required>
            
            <select id="currency">
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="ZAR">South African Rand</option>
                <option value="EGP">Egyptian Pound</option>
            </select>
            <button type="submit">Add Expense</button>
        </form>
        <h2>Expenses</h2>
        <ul id="expenseList"></ul>
        <h2>Total Expenses: $<span id="totalExpense">0</span></h2>
    `;

    document.getElementById('expenseForm').addEventListener('submit', function (event) {
        event.preventDefault();
        const expenseName = document.getElementById('expenseName').value.trim();
        const expenseAmount = parseFloat(document.getElementById('expenseAmount').value);
        const expenseCategory = document.getElementById('currency').value;

        if (!expenseName || isNaN(expenseAmount) || expenseAmount <= 0) {
            alert('Please enter valid expense details.');
            return;
        }

        const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
        expenses.push({ expenseName, expenseAmount, expenseCategory });
        localStorage.setItem('expenses', JSON.stringify(expenses));
        document.getElementById('expenseForm').reset();
        displayExpenses();
    });

    displayExpenses();
}

// Display expenses in the dashboard
function displayExpenses() {
    const expenseList = document.getElementById('expenseList');
    const totalExpenseElem = document.getElementById('totalExpense');
    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    let totalExpense = 0;

    expenseList.innerHTML = '';
    expenses.forEach(expense => {
        totalExpense += expense.expenseAmount;
        const li = document.createElement('li');
        li.textContent = `${expense.expenseName} - $${expense.expenseAmount} (${expense.expenseCategory})`;
        expenseList.appendChild(li);
    });

    totalExpenseElem.textContent = totalExpense.toFixed(2);
}

// Log out the user
function logout() {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('currentUser');
    showSignIn();
}

// Initialize the app (start with Sign-Up page if not logged in, else Dashboard)
if (isLoggedIn()) {
    showDashboard();
} else {
    showSignUp();
}
