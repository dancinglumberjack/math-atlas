(function (root) {
  'use strict';

  const MAX_LENGTH = 256;
  const FUNCTIONS = new Set(['sqrt', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'log', 'ln', 'abs']);
  const CONSTANTS = new Set(['pi', 'e', 'ans']);
  const isFiniteNumber = value => typeof value === 'number' && Number.isFinite(value);

  function finite(value) {
    if (!Number.isFinite(value)) throw new Error('That result is too large or is not a real number. Try smaller values.');
    return Object.is(value, -0) ? 0 : value;
  }

  function tokenize(expression) {
    if (typeof expression !== 'string') throw new Error('Enter a mathematical expression.');
    if (expression.length > MAX_LENGTH) throw new Error('Use an expression with 256 characters or fewer.');
    const input = expression.trim().toLowerCase().replace(/×/g, '*').replace(/÷/g, '/').replace(/[−–]/g, '-').replace(/π/g, 'pi').replace(/√/g, 'sqrt').replace(/²/g, '^2').replace(/³/g, '^3');
    if (!input) throw new Error('Enter a calculation first, such as 3/4 + 1/2.');
    const tokens = [];
    let at = 0;
    while (at < input.length) {
      const remaining = input.slice(at);
      const white = remaining.match(/^\s+/);
      if (white) { at += white[0].length; continue; }
      const number = remaining.match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?/);
      if (number) {
        const value = Number(number[0]);
        if (!Number.isFinite(value)) throw new Error('That number is too large.');
        tokens.push({ type: 'number', value });
        at += number[0].length;
        continue;
      }
      const identifier = remaining.match(/^[a-z]+/);
      if (identifier) {
        const name = identifier[0];
        if (!FUNCTIONS.has(name) && !CONSTANTS.has(name)) throw new Error('Use numbers, pi, e, ans, or a function shown on the keypad.');
        tokens.push({ type: 'name', value: name });
        at += name.length;
        continue;
      }
      if ('+-*/^()%!'.includes(input[at])) {
        tokens.push({ type: input[at], value: input[at] });
        at++;
        continue;
      }
      throw new Error('Use only numbers and calculator symbols. For multiplication, use × or *.');
    }
    tokens.push({ type: 'end' });
    return tokens;
  }

  /** Return a real, finite Number. % means divide by 100, including in sums. */
  function evaluate(expression, options) {
    options = options || {};
    const mode = options.angleMode || 'DEG';
    if (mode !== 'DEG' && mode !== 'RAD') throw new Error('Choose DEG or RAD for angles.');
    const ans = options.ans === undefined ? 0 : options.ans;
    if (!isFiniteNumber(ans)) throw new Error('The previous answer must be a finite number.');
    const tokens = tokenize(expression);
    let index = 0;
    let depth = 0;
    const peek = () => tokens[index].type;
    const take = type => peek() === type ? tokens[index++] : null;
    const expect = type => { if (!take(type)) throw new Error(type === ')' ? 'A closing parenthesis is missing.' : 'Check the order of numbers and symbols.'); };
    const enter = fn => {
      depth++;
      if (depth > 48) throw new Error('This expression is nested too deeply. Break it into smaller calculations.');
      try { return fn(); } finally { depth--; }
    };
    const toRadians = value => mode === 'DEG' ? value * Math.PI / 180 : value;
    const fromRadians = value => mode === 'DEG' ? value * 180 / Math.PI : value;

    function call(name, value) {
      if (name === 'sqrt') {
        if (value < 0) throw new Error('A square root needs a number of 0 or more in real-number mode.');
        return Math.sqrt(value);
      }
      if (name === 'abs') return Math.abs(value);
      if (name === 'log' || name === 'ln') {
        if (value <= 0) throw new Error('Logarithms need a number greater than 0.');
        return name === 'log' ? Math.log10(value) : Math.log(value);
      }
      if (name === 'asin' || name === 'acos') {
        if (value < -1 || value > 1) throw new Error('Inverse sine and cosine need a number from −1 to 1.');
        return fromRadians(name === 'asin' ? Math.asin(value) : Math.acos(value));
      }
      if (name === 'atan') return fromRadians(Math.atan(value));
      const radians = toRadians(value);
      if (name === 'tan') {
        if (Math.abs(Math.cos(radians)) < 1e-14) throw new Error('Tangent is undefined at this angle. Check the DEG/RAD setting.');
        return Math.tan(radians);
      }
      // Exact quarter turns avoid misleading floating-point traces such as cos(90°).
      const quarterTurns = mode === 'DEG' ? value / 90 : value / (Math.PI / 2);
      if (Number.isInteger(quarterTurns) && Math.abs(quarterTurns) <= 1e12) {
        const turn = ((quarterTurns % 4) + 4) % 4;
        return name === 'sin' ? [0, 1, 0, -1][turn] : [1, 0, -1, 0][turn];
      }
      return name === 'sin' ? Math.sin(radians) : Math.cos(radians);
    }

    function primary() {
      const number = take('number');
      if (number) return number.value;
      if (take('(')) return enter(() => { const value = sum(); expect(')'); return value; });
      const name = take('name');
      if (name) {
        if (name.value === 'pi') return Math.PI;
        if (name.value === 'e') return Math.E;
        if (name.value === 'ans') return ans;
        if (!take('(')) throw new Error('Put the function input in parentheses, such as sin(30) or sqrt(9).');
        return enter(() => { const value = sum(); expect(')'); return finite(call(name.value, value)); });
      }
      throw new Error(peek() === 'end' ? 'A number or function is missing at the end.' : 'A number or function is needed here.');
    }

    function postfix() {
      let value = primary();
      while (peek() === '%' || peek() === '!') {
        if (take('%')) value /= 100;
        else {
          take('!');
          if (!Number.isInteger(value) || value < 0) throw new Error('Factorial needs a whole number from 0 to 170.');
          if (value > 170) throw new Error('Use a factorial of 170 or less.');
          let product = 1;
          for (let n = 2; n <= value; n++) product *= n;
          value = product;
        }
        value = finite(value);
      }
      return value;
    }

    function power() {
      const base = postfix();
      if (!take('^')) return base;
      const exponent = enter(unary);
      if (base === 0 && exponent === 0) throw new Error('0^0 is indeterminate here. Use a nonzero base or exponent.');
      if (base === 0 && exponent < 0) throw new Error('Zero cannot be raised to a negative power: it would divide by zero.');
      if (base < 0 && !Number.isInteger(exponent)) throw new Error('A negative base with this exponent does not have a supported real-number result.');
      return finite(Math.pow(base, exponent));
    }

    function unary() {
      if (take('+')) return enter(unary);
      if (take('-')) return finite(-enter(unary));
      return power();
    }

    function product() {
      let value = unary();
      for (;;) {
        if (take('*')) value = finite(value * unary());
        else if (take('/')) {
          const divisor = unary();
          if (divisor === 0) throw new Error('You cannot divide by zero.');
          value = finite(value / divisor);
        } else if (peek() === '(' || peek() === 'name') {
          // Adjacent factors multiply at the same precedence as × and ÷.
          value = finite(value * unary());
        } else break;
      }
      return value;
    }

    function sum() {
      let value = product();
      for (;;) {
        if (take('+')) value = finite(value + product());
        else if (take('-')) value = finite(value - product());
        else break;
      }
      return value;
    }

    const result = sum();
    if (peek() !== 'end') throw new Error(peek() === ')' ? 'There is an extra closing parenthesis.' : 'Place an operation between these values.');
    return finite(result);
  }

  function format(value) {
    if (!isFiniteNumber(value)) return '';
    return String(Number(value.toPrecision(12)));
  }

  let initialized = false;
  let dialog;
  let expressionInput;
  let resultOutput;
  let message;
  let useButton;
  let answer = 0;
  let result = null;
  let history = [];
  let angleMode = 'DEG';
  let returnFocus;

  function practiceAvailable() {
    const input = document.getElementById('answer-input');
    const panel = document.getElementById('practice-panel');
    return !!(input && panel && !input.disabled && !panel.closest('[hidden]') && panel.getClientRects().length);
  }

  function refreshUseButton() {
    if (!useButton) return;
    useButton.hidden = !practiceAvailable();
    useButton.disabled = result === null;
  }

  function renderHistory() {
    const list = dialog.querySelector('.calc-history-list');
    list.replaceChildren();
    dialog.querySelector('.calc-history-empty').hidden = history.length > 0;
    history.forEach(entry => {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'calc-history-entry';
      button.textContent = entry.expression + ' = ' + format(entry.value) + ' · ' + entry.mode;
      button.setAttribute('aria-label', 'Reuse ' + entry.expression + ', answer ' + format(entry.value) + ', ' + entry.mode);
      button.addEventListener('click', () => {
        expressionInput.value = entry.expression;
        angleMode = entry.mode;
        dialog.querySelector('[name="calc-angle"][value="' + entry.mode + '"]').checked = true;
        invalidate();
        expressionInput.focus();
      });
      item.append(button);
      list.append(item);
    });
  }

  function invalidate() {
    result = null;
    resultOutput.textContent = '—';
    message.textContent = '';
    expressionInput.removeAttribute('aria-invalid');
    refreshUseButton();
  }

  function calculate(event) {
    if (event) event.preventDefault();
    try {
      result = evaluate(expressionInput.value, { angleMode, ans: answer });
      answer = result;
      resultOutput.textContent = format(result);
      message.textContent = 'Result ready. Display rounded to 12 significant figures.';
      expressionInput.removeAttribute('aria-invalid');
      history.unshift({ expression: expressionInput.value.trim(), value: result, mode: angleMode });
      history = history.slice(0, 5);
      renderHistory();
    } catch (error) {
      result = null;
      resultOutput.textContent = '—';
      message.textContent = error.message;
      expressionInput.setAttribute('aria-invalid', 'true');
    }
    refreshUseButton();
  }

  function insertText(text) {
    const start = expressionInput.selectionStart === null ? expressionInput.value.length : expressionInput.selectionStart;
    const end = expressionInput.selectionEnd === null ? start : expressionInput.selectionEnd;
    const next = expressionInput.value.slice(0, start) + text + expressionInput.value.slice(end);
    if (next.length > MAX_LENGTH) {
      message.textContent = 'Use an expression with 256 characters or fewer.';
      expressionInput.focus();
      return;
    }
    expressionInput.value = next;
    expressionInput.focus();
    expressionInput.setSelectionRange(start + text.length, start + text.length);
    invalidate();
  }

  function backspace() {
    const start = expressionInput.selectionStart || 0;
    const end = expressionInput.selectionEnd || 0;
    const from = start === end ? Math.max(0, start - 1) : start;
    expressionInput.value = expressionInput.value.slice(0, from) + expressionInput.value.slice(end);
    expressionInput.focus();
    expressionInput.setSelectionRange(from, from);
    invalidate();
  }

  function init() {
    if (typeof document === 'undefined') return;
    const opener = document.getElementById('calculator-open');
    if (opener && opener.dataset.calcBound !== 'true') {
      opener.addEventListener('click', open);
      opener.dataset.calcBound = 'true';
    }
    if (initialized) return;
    initialized = true;
    dialog = document.createElement('dialog');
    dialog.id = 'calculator-dialog';
    dialog.setAttribute('aria-labelledby', 'calc-title');
    dialog.innerHTML = '<div class="calc-heading"><div><p class="calc-eyebrow">A tool for your working</p><h2 id="calc-title">Scientific calculator</h2></div><button type="button" class="calc-close" aria-label="Close calculator">✕</button></div>' +
      '<p class="calc-intro">Explore a calculation, then use your reasoning to explain the answer.</p>' +
      '<form class="calc-form"><fieldset class="calc-angle"><legend>Angles</legend><label><input type="radio" name="calc-angle" value="DEG" checked> Degrees</label><label><input type="radio" name="calc-angle" value="RAD"> Radians</label></fieldset>' +
      '<label class="calc-expression-label" for="calc-expression">Your calculation</label><input id="calc-expression" class="calc-expression" type="text" maxlength="256" placeholder="3/4 + sin(30)" autocomplete="off" autocapitalize="off" spellcheck="false" aria-describedby="calc-syntax calc-message">' +
      '<div class="calc-result-row"><span>Result</span><output class="calc-result" aria-live="polite" aria-atomic="true">—</output></div><p id="calc-message" class="calc-message" aria-live="polite" aria-atomic="true"></p>' +
      '<div class="calc-keypad" aria-label="Calculator keypad"></div><button type="submit" class="calc-equals">Calculate =</button></form>' +
      '<button type="button" class="calc-use" hidden disabled>Use in practice answer →</button>' +
      '<details class="calc-help"><summary>Notation and tips</summary><p id="calc-syntax">Type or use the keypad. Press Enter to calculate. Use parentheses for functions: sin(30), sqrt(9). log is base 10; ln is base e. sin⁻¹, cos⁻¹, and tan⁻¹ mean inverse functions (asin, acos, atan).</p><p>Percent always divides by 100: 50% = 0.5 and 200 + 10% = 200.1. Factorial (!) uses whole numbers from 0 to 170. Fractions use /, powers use ^, and 1e-3 means 0.001. Adjacent factors multiply left to right with × and ÷: 6/2(1+2) = 9. Use parentheses to show your intent.</p><p>DEG uses degrees and RAD uses radians. ans is your most recent successful answer (0 at first). Results display up to 12 significant figures. Calculations and the last five results stay in this page only.</p></details>' +
      '<details class="calc-history"><summary>Recent calculations <span class="calc-history-caption">(this page)</span></summary><p class="calc-history-empty">Your last five calculations will appear here.</p><ol class="calc-history-list"></ol><button type="button" class="calc-history-clear">Clear history</button></details>';
    document.body.append(dialog);
    expressionInput = dialog.querySelector('.calc-expression');
    resultOutput = dialog.querySelector('.calc-result');
    message = dialog.querySelector('.calc-message');
    useButton = dialog.querySelector('.calc-use');
    const keys = [
      ['sin', 'sin(', 'Sine'], ['cos', 'cos(', 'Cosine'], ['tan', 'tan(', 'Tangent'], ['π', 'pi', 'Pi'], ['e', 'e', 'Euler’s number'], ['C', 'clear', 'Clear calculation'],
      ['sin⁻¹', 'asin(', 'Inverse sine'], ['cos⁻¹', 'acos(', 'Inverse cosine'], ['tan⁻¹', 'atan(', 'Inverse tangent'], ['(', '(', 'Open parenthesis'], [')', ')', 'Close parenthesis'], ['⌫', 'back', 'Backspace'],
      ['√', 'sqrt(', 'Square root'], ['log', 'log(', 'Base ten logarithm'], ['ln', 'ln(', 'Natural logarithm'], ['xʸ', '^', 'Power'], ['%', '%', 'Percent, divide by 100'], ['÷', '/', 'Divide'],
      ['7', '7'], ['8', '8'], ['9', '9'], ['x²', '^2', 'Square'], ['n!', '!', 'Factorial'], ['×', '*', 'Multiply'],
      ['4', '4'], ['5', '5'], ['6', '6'], ['abs', 'abs(', 'Absolute value'], ['ans', 'ans', 'Previous answer'], ['−', '-', 'Subtract'],
      ['1', '1'], ['2', '2'], ['3', '3'], ['0', '0'], ['.', '.', 'Decimal point'], ['+', '+', 'Add']
    ];
    const keypad = dialog.querySelector('.calc-keypad');
    keys.forEach(([label, value, accessible]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'calc-key';
      button.textContent = label;
      if (accessible) button.setAttribute('aria-label', accessible);
      if (value === 'clear' || value === 'back') button.classList.add('calc-key-edit');
      button.addEventListener('click', () => {
        if (value === 'clear') { expressionInput.value = ''; invalidate(); expressionInput.focus(); }
        else if (value === 'back') backspace();
        else insertText(value);
      });
      keypad.append(button);
    });
    dialog.querySelector('.calc-form').addEventListener('submit', calculate);
    dialog.querySelector('.calc-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
      if (returnFocus && returnFocus.isConnected) returnFocus.focus();
    });
    expressionInput.addEventListener('input', invalidate);
    dialog.querySelectorAll('[name="calc-angle"]').forEach(input => input.addEventListener('change', () => {
      angleMode = input.value;
      invalidate();
    }));
    useButton.addEventListener('click', () => {
      if (result === null || !practiceAvailable()) return;
      const input = document.getElementById('answer-input');
      input.value = format(result);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      returnFocus = input;
      dialog.close();
      input.focus();
    });
    dialog.querySelector('.calc-history-clear').addEventListener('click', () => { history = []; renderHistory(); });
  }

  function open() {
    if (typeof document === 'undefined') return;
    init();
    if (dialog.open) return;
    returnFocus = document.activeElement;
    refreshUseButton();
    dialog.showModal();
    expressionInput.focus();
  }

  root.MathCalculator = Object.freeze({ evaluate, format, init, open });
})(typeof window === 'undefined' ? globalThis : window);
