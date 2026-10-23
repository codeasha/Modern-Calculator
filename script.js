const display = document.getElementById("display");
const expression = document.getElementById("expression");
const buttons = document.querySelectorAll(".key");

let current = "0";
let previous = null;
let operator = null;
let waiting = false;
let finished = false;
let lastExpression = "";

// Make numbers easier to read
function format(number) {
  if (!Number.isFinite(number)) return "Error";

  if (Math.abs(number) >= 1e12 ||
      (number !== 0 && Math.abs(number) < 1e-7)) {
    return number.toExponential(5);
  }

  return String(Number(number.toPrecision(11)));
}

// Refresh the screen
function update() {
  display.textContent = current;
  expression.textContent = lastExpression ||
    (previous !== null && operator ? `${format(previous)} ${operator}` : "");

  buttons.forEach(button => {
    button.classList.toggle(
      "selected",
      button.dataset.operator === operator && waiting
    );
  });
}

// Enter a number
function inputNumber(number) {
  if (current === "Error" || finished) {
    current = number;
    finished = waiting = false;
    lastExpression = "";
  } else if (waiting) {
    current = number;
    waiting = false;
    lastExpression = "";
  } else if (current === "0") {
    current = number;
  } else if (current === "-0") {
    current = "-" + number;
  } else if (current.replace(/[-.]/g, "").length < 12) {
    current += number;
  }

  update();
}

// Enter a decimal point
function inputDecimal() {
  if (current === "Error" || finished || waiting) {
    current = "0.";
    finished = waiting = false;
    lastExpression = "";
  } else if (!current.includes(".")) {
    current += ".";
  }

  update();
}

// Do the calculation
function calculate(a, b, op) {
  if (op === "+") return a + b;
  if (op === "−") return a - b;
  if (op === "×") return a * b;
  if (op === "÷") return b === 0 ? null : a / b;
  return b;
}

// Choose an operator
function chooseOperator(nextOperator) {
  if (current === "Error") return;

  const number = Number(current);

  if (operator && !waiting) {
    const answer = calculate(previous, number, operator);

    if (answer === null) {
      current = "Error";
      previous = operator = null;
      waiting = true;
      lastExpression = "Cannot divide by zero";
      update();
      return;
    }

    current = format(answer);
    previous = answer;
  } else {
    previous = number;
  }

  operator = nextOperator;
  waiting = true;
  finished = false;
  lastExpression = "";
  update();
}

// Show the answer
function equals() {
  if (operator === null || previous === null || waiting) return;

  const a = previous;
  const b = Number(current);
  const op = operator;
  const answer = calculate(a, b, op);

  lastExpression = answer === null
    ? "Cannot divide by zero"
    : `${format(a)} ${op} ${format(b)} =`;

  current = answer === null ? "Error" : format(answer);
  previous = operator = null;
  waiting = finished = true;

  update();
}

// Reset the calculator
function clear() {
  current = "0";
  previous = operator = null;
  waiting = finished = false;
  lastExpression = "";
  update();
}

// Change the sign
function changeSign() {
  if (current === "Error" || Number(current) === 0) return;

  current = current.startsWith("-")
    ? current.slice(1)
    : "-" + current;

  update();
}

// Convert to a percentage
function percent() {
  if (current === "Error") return;

  current = format(Number(current) / 100);
  waiting = finished = false;
  lastExpression = "";
  update();
}

// Handle calculator buttons
function press(action) {
  if (action === "clear") clear();
  if (action === "decimal") inputDecimal();
  if (action === "equals") equals();
  if (action === "sign") changeSign();
  if (action === "percent") percent();
}

buttons.forEach(button => {
  button.addEventListener("click", () => {
    if (button.dataset.number !== undefined) {
      inputNumber(button.dataset.number);
    } else if (button.dataset.operator) {
      chooseOperator(button.dataset.operator);
    } else {
      press(button.dataset.action);
    }
  });
});

// Handle keyboard input
document.addEventListener("keydown", event => {
  const key = event.key;

  if (/^[0-9]$/.test(key)) inputNumber(key);
  else if (key === ".") inputDecimal();
  else if (key === "+") chooseOperator("+");
  else if (key === "-") chooseOperator("−");
  else if (key === "*") chooseOperator("×");
  else if (key === "/") {
    event.preventDefault();
    chooseOperator("÷");
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    equals();
  } else if (key === "Escape" || key === "Delete") clear();
  else if (key === "%") percent();
});

update();