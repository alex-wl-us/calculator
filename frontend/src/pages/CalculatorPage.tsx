import { useCallback, useEffect, useState } from "react";
import { Delete, Divide, Minus, Plus, X } from "lucide-react";
import { Button, Card, IconButton, Badge, Alert } from "../ui";
import {
  CalcState,
  Operator,
  initialCalcState,
  inputDigit,
  toggleSign,
  deleteLast,
  clearAll,
  chooseOperator,
  equals,
  memoryAdd,
  memorySubtract,
  memoryRecall,
  memoryClear,
} from "../lib/calculator";

interface CalculatorPageProps {}

const MULTIPLY_SIGN = String.fromCharCode(0xd7);
const DIVIDE_SIGN = String.fromCharCode(0xf7);
const PLUS_MINUS_SIGN = String.fromCharCode(0xb1);
const EM_DASH = String.fromCharCode(0x2014);

export function CalculatorPage(_props: CalculatorPageProps) {
  const [state, setState] = useState<CalcState>(initialCalcState);

  const handleDigit = useCallback((d: string) => setState((s) => inputDigit(s, d)), []);
  const handleOperator = useCallback((op: Operator) => setState((s) => chooseOperator(s, op)), []);
  const handleEquals = useCallback(() => setState((s) => equals(s)), []);
  const handleClear = useCallback(() => setState((s) => clearAll(s)), []);
  const handleDelete = useCallback(() => setState((s) => deleteLast(s)), []);
  const handleSign = useCallback(() => setState((s) => toggleSign(s)), []);
  const handleDecimal = useCallback(() => setState((s) => inputDigit(s, ".")), []);
  const handleMPlus = useCallback(() => setState((s) => memoryAdd(s)), []);
  const handleMMinus = useCallback(() => setState((s) => memorySubtract(s)), []);
  const handleMR = useCallback(() => setState((s) => memoryRecall(s)), []);
  const handleMC = useCallback(() => setState((s) => memoryClear(s)), []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key >= "0" && e.key <= "9") {
        handleDigit(e.key);
        e.preventDefault();
      } else if (e.key === ".") {
        handleDecimal();
        e.preventDefault();
      } else if (e.key === "+") {
        handleOperator("+");
      } else if (e.key === "-") {
        handleOperator("-");
      } else if (e.key === "*") {
        handleOperator(MULTIPLY_SIGN as Operator);
      } else if (e.key === "/") {
        handleOperator(DIVIDE_SIGN as Operator);
        e.preventDefault();
      } else if (e.key === "Enter" || e.key === "=") {
        handleEquals();
        e.preventDefault();
      } else if (e.key === "Backspace") {
        handleDelete();
      } else if (e.key === "Escape") {
        handleClear();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleDigit, handleDecimal, handleOperator, handleEquals, handleDelete, handleClear]);

  const hasMemory = state.memory !== 0;

  return (
    <div className="container narrow stack-lg calculator-page">
      <div className="stack-sm calculator-heading">
        <div className="eyebrow">Utility</div>
        <h1 className="page-title">Calculator</h1>
        <p className="muted">Basic arithmetic with memory, keyboard support, and error handling.</p>
      </div>

      <Card variant="surface" tight>
        <div className="stack">
          <div className="row-between">
            <Badge tone={hasMemory ? "accent" : "neutral"} dot>
              {hasMemory ? `M = ${state.memory}` : "No memory stored"}
            </Badge>
            {state.operator && (
              <span className="muted mono">
                {state.prevValue} {state.operator}
              </span>
            )}
          </div>

          <div className="calculator-display mono" aria-live="polite">
            {state.display}
          </div>

          {state.error && (
            <Alert tone="danger">
              {state.error} {EM_DASH} press C to continue
            </Alert>
          )}

          <div className="calculator-grid">
            <Button tone="outline" onClick={handleMC}>MC</Button>
            <Button tone="outline" onClick={handleMPlus}>M+</Button>
            <Button tone="outline" onClick={handleMMinus}>M-</Button>
            <Button tone="outline" onClick={handleMR}>MR</Button>

            <Button tone="danger" onClick={handleClear}>C</Button>
            <IconButton icon={Delete} aria-label="Delete last digit" tone="outline" onClick={handleDelete} />
            <Button tone="outline" onClick={handleSign}>{PLUS_MINUS_SIGN}</Button>
            <IconButton icon={Divide} aria-label="Divide" tone="outline" onClick={() => handleOperator(DIVIDE_SIGN as Operator)} />

            <Button size="lg" onClick={() => handleDigit("7")}>7</Button>
            <Button size="lg" onClick={() => handleDigit("8")}>8</Button>
            <Button size="lg" onClick={() => handleDigit("9")}>9</Button>
            <IconButton icon={X} aria-label="Multiply" tone="outline" onClick={() => handleOperator(MULTIPLY_SIGN as Operator)} />

            <Button size="lg" onClick={() => handleDigit("4")}>4</Button>
            <Button size="lg" onClick={() => handleDigit("5")}>5</Button>
            <Button size="lg" onClick={() => handleDigit("6")}>6</Button>
            <IconButton icon={Minus} aria-label="Subtract" tone="outline" onClick={() => handleOperator("-")} />

            <Button size="lg" onClick={() => handleDigit("1")}>1</Button>
            <Button size="lg" onClick={() => handleDigit("2")}>2</Button>
            <Button size="lg" onClick={() => handleDigit("3")}>3</Button>
            <IconButton icon={Plus} aria-label="Add" tone="outline" onClick={() => handleOperator("+")} />

            <Button size="lg" onClick={() => handleDigit("0")}>0</Button>
            <Button size="lg" onClick={handleDecimal}>.</Button>
            <Button size="lg" tone="primary" onClick={handleEquals} className="calculator-equals">
              =
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
