import { useCallback, useEffect, useState } from "react";
import { Delete } from "lucide-react";
import { Card, Button, Badge } from "../ui";

type Operator = "+" | "-" | "×" | "÷" | "^";

interface CalcState {
  display: string;
  prevValue: number | null;
  operator: Operator | null;
  waitingForOperand: boolean;
  error: boolean;
}

const initialState: CalcState = {
  display: "0",
  prevValue: null,
  operator: null,
  waitingForOperand: false,
  error: false,
};

function applyOperator(a: number, b: number, op: Operator): number {
  switch (op) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "×":
      return a * b;
    case "÷":
      if (b === 0) return NaN;
      return a / b;
    case "^":
      return Math.pow(a, b);
    default:
      return b;
  }
}

function formatResult(n: number): string {
  if (Number.isNaN(n) || !Number.isFinite(n)) return "Error";
  const rounded = Math.round(n * 1e10) / 1e10;
  const str = rounded.toString();
  if (str.length > 14) {
    return rounded.toPrecision(10).replace(/\.?0+$/, "").replace(/\.?0+e/, "e");
  }
  return str;
}

export function CalculatorPage() {
  const [state, setState] = useState<CalcState>(initialState);

  const inputDigit = useCallback((digit: string) => {
    setState((s) => {
      if (s.error) return { ...initialState, display: digit };
      if (s.waitingForOperand) {
        return { ...s, display: digit, waitingForOperand: false };
      }
      if (s.display === "0") {
        return { ...s, display: digit };
      }
      if (s.display.replace("-", "").length >= 14) return s;
      return { ...s, display: s.display + digit };
    });
  }, []);

  const inputDecimal = useCallback(() => {
    setState((s) => {
      if (s.error) return { ...initialState, display: "0." };
      if (s.waitingForOperand) {
        return { ...s, display: "0.", waitingForOperand: false };
      }
      if (s.display.includes(".")) return s;
      return { ...s, display: s.display + "." };
    });
  }, []);

  const clearAll = useCallback(() => {
    setState(initialState);
  }, []);

  const deleteLast = useCallback(() => {
    setState((s) => {
      if (s.error) return initialState;
      if (s.waitingForOperand) return s;
      if (s.display.length <= 1 || (s.display.length === 2 && s.display.startsWith("-"))) {
        return { ...s, display: "0" };
      }
      return { ...s, display: s.display.slice(0, -1) };
    });
  }, []);

  const toggleSign = useCallback(() => {
    setState((s) => {
      if (s.error) return s;
      if (s.display === "0") return s;
      return {
        ...s,
        display: s.display.startsWith("-") ? s.display.slice(1) : "-" + s.display,
      };
    });
  }, []);

  const chooseOperator = useCallback((nextOperator: Operator) => {
    setState((s) => {
      if (s.error) return s;
      const inputValue = parseFloat(s.display);
      if (s.prevValue === null) {
        return {
          ...s,
          prevValue: inputValue,
          operator: nextOperator,
          waitingForOperand: true,
        };
      }
      if (s.waitingForOperand) {
        return { ...s, operator: nextOperator };
      }
      const result = applyOperator(s.prevValue, inputValue, s.operator as Operator);
      if (Number.isNaN(result)) {
        return { ...initialState, display: "Error", error: true };
      }
      return {
        display: formatResult(result),
        prevValue: result,
        operator: nextOperator,
        waitingForOperand: true,
        error: false,
      };
    });
  }, []);

  const equals = useCallback(() => {
    setState((s) => {
      if (s.error) return s;
      if (s.operator === null || s.prevValue === null) return s;
      const inputValue = parseFloat(s.display);
      const result = applyOperator(s.prevValue, inputValue, s.operator);
      if (Number.isNaN(result)) {
        return { ...initialState, display: "Error", error: true };
      }
      return {
        display: formatResult(result),
        prevValue: null,
        operator: null,
        waitingForOperand: true,
        error: false,
      };
    });
  }, []);

  const sqrt = useCallback(() => {
    setState((s) => {
      if (s.error) return s;
      const value = parseFloat(s.display);
      if (value < 0) return { ...initialState, display: "Error", error: true };
      return { ...s, display: formatResult(Math.sqrt(value)), waitingForOperand: true };
    });
  }, []);

  const percent = useCallback(() => {
    setState((s) => {
      if (s.error) return s;
      const value = parseFloat(s.display);
      const base = s.prevValue !== null ? s.prevValue : value;
      const result = s.prevValue !== null ? (base * value) / 100 : value / 100;
      return { ...s, display: formatResult(result), waitingForOperand: true };
    });
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key >= "0" && e.key <= "9") {
        inputDigit(e.key);
      } else if (e.key === ".") {
        inputDecimal();
      } else if (e.key === "+") {
        chooseOperator("+");
      } else if (e.key === "-") {
        chooseOperator("-");
      } else if (e.key === "*") {
        chooseOperator("×");
      } else if (e.key === "/") {
        e.preventDefault();
        chooseOperator("÷");
      } else if (e.key === "^") {
        chooseOperator("^");
      } else if (e.key === "%") {
        percent();
      } else if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        equals();
      } else if (e.key === "Backspace") {
        deleteLast();
      } else if (e.key === "Escape") {
        clearAll();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inputDigit, inputDecimal, chooseOperator, percent, equals, deleteLast, clearAll]);

  const opLabel = state.operator ? ` ${state.operator} ` : "";
  const expression = state.prevValue !== null ? `${formatResult(state.prevValue)}${opLabel}` : "";

  return (
    <div className="container narrow stack-lg animate-in">
      <div className="stack-sm calc-heading">
        <span className="eyebrow">Scientific Calculator</span>
        <h1 className="page-title">Quick Calculate</h1>
        <p className="page-subtitle">
          Basic arithmetic plus square root, percentage and exponents. Keyboard input supported.
        </p>
      </div>
      <Card variant="elevated" tight>
        <div className="calc-display">
          <div className="calc-expression muted mono">{expression || "\u00a0"}</div>
          <div className={`calc-result mono ${state.error ? "calc-result-error" : ""}`}>
            {state.display}
          </div>
        </div>
        <div className="calc-sci-row">
          <Button tone="outline" size="sm" onClick={sqrt} aria-label="Square root">
            √
          </Button>
          <Button tone="outline" size="sm" onClick={percent} aria-label="Percentage">
            %
          </Button>
          <Button tone="outline" size="sm" onClick={() => chooseOperator("^")} aria-label="Exponent">
            x^y
          </Button>
          <Button tone="outline" size="sm" onClick={toggleSign} aria-label="Toggle sign">
            +/-
          </Button>
        </div>
        <div className="calc-grid">
          <Button tone="danger" onClick={clearAll} aria-label="Clear">
            C
          </Button>
          <Button tone="ghost" icon={Delete} onClick={deleteLast} aria-label="Delete last digit" />
          <Button tone="outline" onClick={() => chooseOperator("÷")} aria-label="Divide">
            ÷
          </Button>
          <Button tone="outline" onClick={() => chooseOperator("×")} aria-label="Multiply">
            ×
          </Button>

          <Button onClick={() => inputDigit("7")}>7</Button>
          <Button onClick={() => inputDigit("8")}>8</Button>
          <Button onClick={() => inputDigit("9")}>9</Button>
          <Button tone="outline" onClick={() => chooseOperator("-")} aria-label="Subtract">
            −
          </Button>

          <Button onClick={() => inputDigit("4")}>4</Button>
          <Button onClick={() => inputDigit("5")}>5</Button>
          <Button onClick={() => inputDigit("6")}>6</Button>
          <Button tone="outline" onClick={() => chooseOperator("+")} aria-label="Add">
            +
          </Button>

          <Button onClick={() => inputDigit("1")}>1</Button>
          <Button onClick={() => inputDigit("2")}>2</Button>
          <Button onClick={() => inputDigit("3")}>3</Button>
          <Button tone="primary" className="calc-equals" onClick={equals} aria-label="Equals">
            =
          </Button>

          <Button className="calc-zero" onClick={() => inputDigit("0")}>
            0
          </Button>
          <Button onClick={inputDecimal} aria-label="Decimal point">
            .
          </Button>
        </div>
      </Card>
      <div className="row-wrap calc-hint">
        <Badge tone="info">Keyboard: 0-9 + - * / ^ % Enter Backspace Esc</Badge>
      </div>
    </div>
  );
}
