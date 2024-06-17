import "./App.css"
import { useReducer } from "react";
import DigitButton from "./DigitButton"
import OperationButton from "./OperationButton"

// action types for the reducer function
export const ACTIONS = {
  ADD_DIGIT: "add-digit",
  CHOOSE_OPERATION: "choose-operation",
  CLEAR: "clear",
  DELETE_DIGIT: "delete-digit",
  EVALUATE: "evaluate"
}

/**
 * reducer function for managing calculator state.
 * @param {object} state - the current state.
 * @param {object} action - the action object with type and payload.
 * @returns {object} - the updated state.
 */

function reducer(state, { type, payload }) {
  switch (type) {
    case ACTIONS.ADD_DIGIT:
      // if overwrite mode is active, update currentOperand with the new digit
      if (state.overwrite) {
        return {
          ...state,
          currentOperand: payload.digit,
          overwrite: false,
        };
      }

      // handle special case: starting with a decimal point
      if (state.currentOperand == null && payload.digit === ".") {
        return {
          ...state,
          currentOperand: "0.",
        };
      }

      // handle negative sign
      /***
      if (state.currentOperand == null && payload.digit === "-N") {
        return {
          ...state,
          currentOperand: "-",
        };
      }
      */

      // avoid leading zeros (except for decimal points)
      if (payload.digit === "0" && state.currentOperand === "0") return state;

      // prevent multiple decimal points
      if (payload.digit === "." && state.currentOperand.includes(".")) return state;
      // append the digit to the currentOperand
      return {
        ...state,
        currentOperand: `${state.currentOperand || ""}${payload.digit}`,
      };

    case ACTIONS.DELETE_DIGIT:
      // if overwrite mode is active, clear currentOperand
      if (state.overwrite) {
        return {
          ...state,
          currentOperand: null,
          overwrite: false,
        };
      }
      // handle deletion of digits
      if (state.currentOperand == null) return state;
      if (state.currentOperand.length === 1) {
        return {
          ...state,
          currentOperand: null,
        };
      }
      // remove the last character from currentOperand
      return {
        ...state,
        currentOperand: state.currentOperand.slice(0, -1),
      };

    case ACTIONS.CLEAR:
      // reset the calculator state
      return {};

    case ACTIONS.CHOOSE_OPERATION:
      // handle choosing an operation
      if (state.currentOperand == null && state.previousOperand == null) return state;
      if (state.currentOperand == null) {
        // no current operand, set the operation
        return {
          ...state,
          operation: payload.operation,
        };
      }
      if (state.previousOperand == null) {
        // set the operation and move currentOperand to previousOperand
        return {
          ...state,
          operation: payload.operation,
          previousOperand: state.currentOperand,
          currentOperand: null,
        };
      }
      // evaluate the previous expression and update state
      return {
        ...state,
        previousOperand: evaluate(state),
        operation: payload.operation,
        currentOperand: null,
      };

    case ACTIONS.EVALUATE:
      // handle evaluating the expression
      if (
        state.operation == null ||
        state.currentOperand == null ||
        state.previousOperand == null
      ) {
        // not enough information to evaluate
        return state;
      }
      // calculate the result and reset state
      return {
        ...state,
        previousOperand: null,
        overwrite: true,
        operation: null,
        currentOperand: evaluate(state),
      };
  }
}

// helper function to evaluate the result
function evaluate({ currentOperand, previousOperand, operation }) {
  const prev = parseFloat(previousOperand)
  const curr = parseFloat(currentOperand)

  if (isNaN(prev) || isNaN(curr)) return ""

  let result = ""

  switch (operation) {
    case "+": result = prev + curr
      break
    case "-": result = prev - curr
      break
    case "x": result = prev * curr
      break
    case "/": result = prev / curr
      break
    case "%":
      result = (previousOperand.includes(".") || currentOperand.includes(".")) ? NaN : prev % curr
      break
  }

  return result.toString()
}

const INT_FORMATTER = new Intl.NumberFormat("en-us", { maximumFractionDigits: 0 })

function formatOperand(operand) {
  if (operand == null) return

  const [integer, decimal] = operand.split(".")

  if (decimal == null) return INT_FORMATTER.format(integer)

  return `${INT_FORMATTER.format(integer)}.${decimal}`
}

function App() {
  // set up the initial state for the calculator by using the useReducer hook
  const [{ currentOperand, previousOperand, operation }, dispatch] = useReducer(reducer, {})

  return (
    <div className="calc-grid">
      <div className="output-display">
        <div className="prev-operand">{formatOperand(previousOperand)} {operation}</div>
        <div className="curr-operand">{formatOperand(currentOperand)}</div>
      </div>
      <button className="AC" onClick={() => dispatch({ type: ACTIONS.CLEAR })}>AC</button>
      <button className="DEL" onClick={() => dispatch({ type: ACTIONS.DELETE_DIGIT })}>DEL</button>
      <OperationButton operation="%" dispatch={dispatch} />
      <OperationButton operation="/" dispatch={dispatch} />
      <DigitButton digit="1" dispatch={dispatch} />
      <DigitButton digit="2" dispatch={dispatch} />
      <DigitButton digit="3" dispatch={dispatch} />
      <OperationButton operation="x" dispatch={dispatch} />
      <DigitButton digit="4" dispatch={dispatch} />
      <DigitButton digit="5" dispatch={dispatch} />
      <DigitButton digit="6" dispatch={dispatch} />
      <OperationButton operation="+" dispatch={dispatch} />
      <DigitButton digit="7" dispatch={dispatch} />
      <DigitButton digit="8" dispatch={dispatch} />
      <DigitButton digit="9" dispatch={dispatch} />
      <OperationButton operation="-" dispatch={dispatch} />
      <DigitButton digit="." dispatch={dispatch} />
      <DigitButton digit="0" dispatch={dispatch} />
      <button className="span-two" onClick={() => dispatch({ type: ACTIONS.EVALUATE })}>=</button>
    </div>
  );
}

export default App;