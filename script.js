"use strict";

// DATA
const account1 = {
  owner: "nixon ng",
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
  type: "premium",

  movementsDates: [
    "2023-11-18T21:31:17.178Z",
    "2024-12-23T07:42:02.383Z",
    "2025-07-28T09:15:04.904Z",
    "2025-08-01T10:17:24.185Z",
    "2025-08-08T14:11:59.604Z",
    "2025-09-14T17:01:17.194Z",
    "2025-09-17T23:36:17.929Z",
    "2025-09-19T10:51:36.790Z",
  ],
  currency: "SGD",
  locale: "en-GB", // de-DE
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
  type: "basic",

  movementsDates: [
    "2023-11-01T13:15:33.035Z",
    "2024-11-30T09:48:16.867Z",
    "2024-12-25T06:04:23.907Z",
    "2025-06-25T14:18:46.235Z",
    "2025-07-05T16:33:06.386Z",
    "2025-07-10T14:43:26.374Z",
    "2025-08-25T18:49:59.371Z",
    "2025-08-26T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const account3 = {
  owner: "Steven Thomas Williams",
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
  type: "premium",

  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2020-04-01T10:17:24.185Z",
    "2020-05-08T14:11:59.604Z",
    "2020-05-27T17:01:17.194Z",
    "2020-07-11T23:36:17.929Z",
    "2020-07-12T10:51:36.790Z",
  ],
  currency: "EUR",
  locale: "pt-PT", // de-DE
};

const account4 = {
  owner: "Sarah Smith",
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
  type: "basic",

  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2021-11-30T09:48:16.867Z",
    "2022-12-25T06:04:23.907Z",
    "2024-01-25T14:18:46.235Z",
    "2025-02-05T16:33:06.386Z",
    "2025-04-10T14:43:26.374Z",
    "2025-06-25T18:49:59.371Z",
    "2025-07-26T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const accounts = [account1, account2, account3, account4];

// ELEMENTS
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

//------------------------------------------------------------------------------------------
// Functions

//Calculating number of days ago
const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  // Display transaction Number of days ago
  const daysPassed = calcDaysPassed(new Date(), date);
  if (daysPassed === 0) return "Today";
  if (daysPassed === 1) return "Yesterday";
  if (daysPassed <= 7) return `${daysPassed} Days ago`;

  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(value);
};

// sorting of transaction based on Deposit or withdrawal
const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = "";

  const combineMovsDates = acc.movements.map((mov, i) => ({
    movement: mov,
    movementdate: acc.movementsDates.at(i),
  }));

  if (sort) combineMovsDates.sort((a, b) => a.movement - b.movement);

  combineMovsDates.forEach(function (obj, i) {
    const { movement, movementdate } = obj;
    const type = movement > 0 ? "deposit" : "withdrawal";

    const date = new Date(movementdate);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = formatCur(movement, acc.locale, acc.currency);

    const html = `<div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
          <div class="movements__date">${displayDate}</div>
          <div class="movements__value">${formattedMov}</div>
        </div>`;

    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

// Calculate total balance for each account
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce(function (acc, mov) {
    return acc + mov;
  }, 0);
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

// Calculation of overall transaction summary (Deposit,withdraw,interest)
const calcDisplaySummary = function (account) {
  //Deposit calculation
  const income = account.movements
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(income, account.locale, account.currency);

  //withdraw calculation
  const out = account.movements
    .filter((mov) => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(out, account.locale, account.currency);

  //interest calculation
  const interest = account.movements
    .filter((mov) => mov > 0)
    .map((deposit) => (deposit * account.interestRate) / 100)
    .filter((int) => {
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(
    interest,
    account.locale,
    account.currency
  );
};

//Login accounts
const CreateUsername = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(" ")
      .map((name) => name[0])
      .join("");
  });
};

CreateUsername(accounts);
// Negative and postive array
const deposits = account1.movements.filter(function (mov) {
  return mov > 0;
});

const withdrawals = account1.movements.filter(function (mov) {
  {
    return mov < 0;
  }
});

// Account balance
const balance = account1.movements.reduce(function (accumulator, mov) {
  return accumulator + mov;
}, 0);

const updateUI = function (acc) {
  //Displa movements
  displayMovements(acc);
  //Display Balance
  calcDisplayBalance(acc);
  //Display Summary
  calcDisplaySummary(acc);
};

//Logout timer function
const startLogOutTimer = function () {
  // Set timer to 10 mins
  let time = 600;

  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    //In each call, update remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    //If timer = 0, stop timer and log user out
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = `Log in to get started`;
      containerApp.style.opacity = 0;
    }
    //Decrease time every sec
    time--;
  };

  //Call timer every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

//EVENT HANDLERS----------------------------------------------------------------------------------------------------

let currentAccount, timer;

// LOGIN BUTTON
btnLogin.addEventListener("click", function (e) {
  //Prevent form from submiting
  e.preventDefault();

  currentAccount = accounts.find(
    (acc) => acc.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    //Display UI and welcome msg
    labelWelcome.textContent = `Welcome back ${
      currentAccount.owner.split(" ")[0]
    }`;
    containerApp.style.opacity = 100;

    // Create current date and time
    const now = new Date();

    const options = {
      hour: "numeric",
      minute: "numeric",
      day: "numeric",
      month: "numeric",
      year: "numeric",
    };

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    //Clear input field after login
    inputLoginUsername.value = "";
    inputLoginPin.value = "";
    //Lose focus on pin field
    inputLoginPin.blur();
    updateUI(currentAccount);
  }
  if (timer) clearInterval(timer);
  timer = startLogOutTimer(timer);
});

// TRANSFER BUTTON
btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAccount = accounts.find(
    (acc) => acc.username === inputTransferTo.value
  );
  // Clear input Field
  inputTransferAmount.value = inputTransferTo.value = "";

  if (
    amount > 0 &&
    receiverAccount &&
    currentAccount.balance >= amount &&
    receiverAccount?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAccount.movements.push(amount);
    receiverAccount.movementsDates.push(new Date());
    console.log("Transfer Valid");

    //Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());

    //Update UI
    updateUI(currentAccount);

    //Reset timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

// CLOSE BUTTON
btnClose.addEventListener("click", function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    //Find current account index in accounts array
    const index = accounts.findIndex(
      (acc) => acc.username === currentAccount.username
    );

    // Delete current account
    accounts.splice(index, 1);
    // Hide UI
    containerApp.style.opacity = 0;
  }
  // Clear field if wrong details
  inputCloseUsername.value = inputClosePin.value = "";
});

// LOAN BUTTON
btnLoan.addEventListener("click", function (e) {
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);
  if (
    amount > 0 &&
    currentAccount.movements.some((mov) => mov >= amount * 0.1)
  ) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);

      //Add loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      //Update UI
      updateUI(currentAccount);
    }, 2500);
  }
  //clear input field
  inputLoanAmount.value = "";

  //Reset timer
  clearInterval(timer);
  timer = startLogOutTimer();
});

// SORT BUTTON
let sorted = false;
btnSort.addEventListener("click", function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});
