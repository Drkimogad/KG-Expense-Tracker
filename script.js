let currentUser = null;
let expenses = JSON.parse(localStorage.getItem('expenses') || '[]');

// Helper functions for login state
function isLoggedIn() {
    return localStorage.getItem('loggedIn') === 'true';
}

function getLoggedInUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

// Render Sign-Up page (redirect to Sign-In after signup)
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
            alert('Sign-up successful! Please sign in.');
            showSignIn(); // Redirect to sign-in after successful sign-up
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

// Render the Dashboard (with expense list and functionalities)
function showDashboard() {
    if (!isLoggedIn()) {
        showSignIn();
        return;
    }

    currentUser = getLoggedInUser();
    const content = document.getElementById('content');
    content.innerHTML = `
        <h1>Welcome, ${currentUser.email}</h1>
        <button onclick="logout()">Log Out</button>
        <h2>Expense Tracker</h2>
        
        <!-- Add Expense Form -->
        <form id="expenseForm">
            <input type="text" id="expenseName" placeholder="Expense Name" required>
            <input type="number" id="expenseAmount" placeholder="Amount" required>
            <input type="date" id="expenseDate" required>
            <select id="expenseCategory">
                <option value="bills">Bills</option>
                <option value="school">School</option>
                <option value="entertainment">Entertainment</option>
                <option value="groceries">Groceries</option>
                <option value="vacations">Vacations</option>
                <option value="transportation">Transportation</option>
            </select>
            <button type="submit">Add Expense</button>
        </form>

        <!-- Expense List -->
        <h2>Expenses</h2>
        <ul id="expenseList"></ul>

        <!-- Total Expenses -->
        <h2>Total Expenses: $<span id="totalExpense">0</span></h2>
    `;

    // Display saved expenses
    renderExpenseList();

    // Add expense functionality
    document.getElementById('expenseForm').addEventListener('submit', function (event) {
        event.preventDefault();
        const expenseName = document.getElementById('expenseName').value.trim();
        const expenseAmount = document.getElementById('expenseAmount').value.trim();
        const expenseDate = document.getElementById('expenseDate').value;
        const expenseCategory = document.getElementById('expenseCategory').value;

        const expense = { name: expenseName, amount: expenseAmount, date: expenseDate, category: expenseCategory };
        expenses.push(expense);
        localStorage.setItem('expenses', JSON.stringify(expenses));

        renderExpenseList();
        updateTotalExpenses();
    });
}

// Render the expense list
function renderExpenseList() {
    const expenseList = document.getElementById('expenseList');
    expenseList.innerHTML = ''; // Clear current list

    expenses.forEach((expense, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>${expense.name}</strong> - $${expense.amount} - ${expense.category} 
            <button onclick="deleteExpense(${index})">Delete</button>
            <button onclick="editExpense(${index})">Edit</button>
        `;
        expenseList.appendChild(li);
    });
}

// Update the total expenses displayed
function updateTotalExpenses() {
    const total = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    document.getElementById('totalExpense').textContent = total.toFixed(2);
}

// Delete expense functionality
function deleteExpense(index) {
    expenses.splice(index, 1);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    renderExpenseList();
    updateTotalExpenses();
}

// Edit expense functionality
function editExpense(index) {
    const expense = expenses[index];
    document.getElementById('expenseName').value = expense.name;
    document.getElementById('expenseAmount').value = expense.amount;
    document.getElementById('expenseDate').value = expense.date;
    document.getElementById('expenseCategory').value = expense.category;
    
    // Remove the expense and update form to edit
    deleteExpense(index);
}

// Log out functionality
function logout() {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('currentUser');
    alert('You have logged out.');
    showSignIn(); // Redirect to sign-in page
}

// Show the appropriate page when the app starts
if (isLoggedIn()) {
    showDashboard();
} else {
    showSignIn();
}
