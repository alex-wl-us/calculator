export type Operator = "+" | "-" | "\u00d7" | "\u00f7";

export interface CalcState {
  display: string;
  prevValue: number | null;
  operator: Operator | null;
  overwrite: boolean;
  memory: number;
  error: string | null;
}

export const initialCalcState: CalcState = {
  display: "0",
  prevValue: null,
  operator: null,
  overwrite: true,
  memory: 0,
  error: null,
};

const MAX_DIGITS = 15;

function formatResult(value: number): string {
  if (!Number.isFinite(value)) return "Error";
  if (Object.is(value, -0)) value = 0;
  const fixed = Math.abs(value) < 1e15 ? value.toPrecision(12) : value.toString();
  let str = parseFloat(fixed).toString();
  if (str.length > MAX_DIGITS + 2) {
    str = value.toExponential(6);
  }
  return str;
}

function applyOp(a: number, b: number, op: Operator): number {
  switch (op) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "\u00d7":
      return a * b;
    case "\u00f7":
      if (b === 0) return NaN;
      return a / b;
  }
}

export function inputDigit(state: CalcState, digit: string): CalcState {
  if (state.error) {
    return { ...initialCalcState, memory: state.memory };
  }
  if (state.overwrite) {
    return { ...state, display: digit === "." ? "0." : digit, overwrite: false };
  }
  if (digit === "." && state.display.includes(".")) return state;
  if (state.display.replace("-", "").replace(".", "").length >= MAX_DIGITS) return state;
  return { ...state, display: state.display === "0" && digit !== "." ? digit : state.display + digit };
}

export function toggleSign(state: CalcState): CalcState {
  if (state.error) return state;
  if (state.display === "0") return state;
  if (state.display.startsWith("-")) {
    return { ...state, display: state.display.slice(1) };
  }
  return { ...state, display: "-" + state.display };
}

export function deleteLast(state: CalcState): CalcState {
  if (state.error) return { ...initialCalcState, memory: state.memory };
  if (state.overwrite) return state;
  const next = state.display.length > 1 ? state.display.slice(0, -1) : "0";
  return { ...state, display: next, overwrite: next === "0" };
}

export function clearAll(state: CalcState): CalcState {
  return { ...initialCalcState, memory: state.memory };
}

export function chooseOperator(state: CalcState, op: Operator): CalcState {
  if (state.error) return state;
  const current = parseFloat(state.display);
  if (state.prevValue === null) {
    return { ...state, prevValue: current, operator: op, overwrite: true };
  }
  if (state.overwrite) {
    return { ...state, operator: op };
  }
  const result = applyOp(state.prevValue, current, state.operator as Operator);
  if (!Number.isFinite(result)) {
    return { ...initialCalcState, memory: state.memory, error: "Cannot divide by zero", display: "Error" };
  }
  return { ...state, display: formatResult(result), prevValue: result, operator: op, overwrite: true };
}

export function equals(state: CalcState): CalcState {
  if (state.error) return state;
  if (state.operator === null || state.prevValue === null) return state;
  const current = parseFloat(state.display);
  const result = applyOp(state.prevValue, current, state.operator);
  if (!Number.isFinite(result)) {
    return { ...initialCalcState, memory: state.memory, error: "Cannot divide by zero", display: "Error" };
  }
  return { ...state, display: formatResult(result), prevValue: null, operator: null, overwrite: true };
}

export function memoryAdd(state: CalcState): CalcState {
  if (state.error) return state;
  const current = parseFloat(state.display);
  return { ...state, memory: state.memory + current, overwrite: true };
}

export function memorySubtract(state: CalcState): CalcState {
  if (state.error) return state;
  const current = parseFloat(state.display);
  return { ...state, memory: state.memory - current, overwrite: true };
}

export function memoryRecall(state: CalcState): CalcState {
  if (state.error) return state;
  return { ...state, display: formatResult(state.memory), overwrite: true };
}

export function memoryClear(state: CalcState): CalcState {
  return { ...state, memory: 0 };
}
