import React, { useState } from "react";

// Farben und Styles für ein moderneres Aussehen
const colors = {
  background: "#f6f8fa",
  primary: "#1976d2",
  highlight: "#e3fcec",
  border: "#d1d5db",
  best: "#b3e5fc",
  button: "#1976d2",
  buttonText: "#fff"
};

const tableStyle = {
  borderCollapse: "separate",
  borderSpacing: "0",
  width: "100%",
  background: "#fff",
  borderRadius: "10px",
  overflow: "hidden",
  boxShadow: "0 2px 8px #e0e5e9"
};

const thTdStyle = {
  border: `1px solid ${colors.border}`,
  padding: "8px",
  textAlign: "center"
};

const thStyle = {
  ...thTdStyle,
  background: "#f3f4f6",
  fontWeight: "bold"
};

const inputStyle = {
  width: "70px",
  padding: "4px",
  borderRadius: "5px",
  border: `1px solid ${colors.border}`,
  textAlign: "center"
};

const buttonStyle = {
  background: colors.button,
  color: colors.buttonText,
  border: "none",
  borderRadius: "5px",
  padding: "4px 10px",
  marginLeft: "5px",
  cursor: "pointer",
  fontWeight: "bold"
};

const removeBtnStyle = {
  ...buttonStyle,
  background: "#e57373"
};

const addBtnStyle = {
  ...buttonStyle,
  background: "#4caf50"
};

const rules = [
  { label: "Maximin", value: "maximin" },
  { label: "Maximax", value: "maximax" },
  { label: "Laplace", value: "laplace" },
  { label: "Hurwicz", value: "hurwicz" },
  { label: "Savage (Minimax-Regret)", value: "savage" }
];

const defaultStates = ["Zustand 1", "Zustand 2", "Zustand 3"];
const defaultAlternatives = ["Alternative A", "Alternative B", "Alternative C"];
const defaultMatrix = [
  [50, 10, 20],
  [30, 40, 10],
  [20, 60, 70]
];

function calculate(matrix, rule, lambda = 0.5) {
  let results = [];
  let formulas = [];
  let bestIdx = 0;

  if (rule === "maximin") {
    results = matrix.map(row => Math.min(...row));
    formulas = matrix.map(row => `min(${row.join(", ")})`);
    bestIdx = results.indexOf(Math.max(...results));
  } else if (rule === "maximax") {
    results = matrix.map(row => Math.max(...row));
    formulas = matrix.map(row => `max(${row.join(", ")})`);
    bestIdx = results.indexOf(Math.max(...results));
  } else if (rule === "laplace") {
    results = matrix.map(row => row.reduce((a, b) => a + b, 0) / row.length);
    formulas = matrix.map(row => `(${row.join(" + ")}) / ${row.length}`);
    bestIdx = results.indexOf(Math.max(...results));
  } else if (rule === "hurwicz") {
    results = matrix.map(row => lambda * Math.max(...row) + (1 - lambda) * Math.min(...row));
    formulas = matrix.map(row => {
      const min = Math.min(...row);
      const max = Math.max(...row);
      return `λ·max + (1-λ)·min = ${lambda.toFixed(2)}·${max} + ${(1 - lambda).toFixed(2)}·${min}`;
    });
    bestIdx = results.indexOf(Math.max(...results));
  } else if (rule === "savage") {
    // Erzeuge Regret-Matrix und ausführliche Formel
    const regretMatrix = [];
    const maxPerCol = matrix[0].map((_, j) =>
      Math.max(...matrix.map(row => row[j]))
    );
    for (let i = 0; i < matrix.length; i++) {
      regretMatrix[i] = [];
      for (let j = 0; j < matrix[0].length; j++) {
        regretMatrix[i][j] = maxPerCol[j] - matrix[i][j];
      }
    }
    // Formel: für jede Zelle (maxZ1-x=regret)
    formulas = regretMatrix.map((row, i) =>
      `max(Regret: ` +
      row
        .map(
          (regret, j) =>
            `(maxZ${j + 1}-${matrix[i][j]}=${maxPerCol[j]}-${matrix[i][j]}=${regret})`
        )
        .join(", ") +
      `)`
    );
    results = regretMatrix.map(row => Math.max(...row));
    bestIdx = results.indexOf(Math.min(...results));
  }
  return { results, formulas, bestIdx };
}

function formatResult(result, rule) {
  if (rule === "laplace" || rule === "hurwicz") {
    return result.toFixed(2);
  }
  return result;
}

function App() {
  const [states, setStates] = useState([...defaultStates]);
  const [alternatives, setAlternatives] = useState([...defaultAlternatives]);
  const [matrix, setMatrix] = useState(defaultMatrix.map(row => [...row]));
  const [rule, setRule] = useState("maximin");
  const [hurwiczLambda, setHurwiczLambda] = useState(0.5);

  const { results, formulas, bestIdx } = calculate(matrix, rule, hurwiczLambda);

  const handleCellChange = (i, j, value) => {
    const newMatrix = matrix.map(row => [...row]);
    newMatrix[i][j] = Number(value);
    setMatrix(newMatrix);
  };

  const addAlternative = () => {
    setAlternatives([
      ...alternatives,
      `Alternative ${String.fromCharCode(65 + alternatives.length)}`
    ]);
    setMatrix([...matrix, Array(states.length).fill(0)]);
  };

  const addState = () => {
    setStates([...states, `Zustand ${states.length + 1}`]);
    setMatrix(matrix.map(row => [...row, 0]));
  };

  const removeAlternative = idx => {
    if (alternatives.length <= 1) return;
    setAlternatives(alternatives.filter((_, i) => i !== idx));
    setMatrix(matrix.filter((_, i) => i !== idx));
  };

  const removeState = idx => {
    if (states.length <= 1) return;
    setStates(states.filter((_, i) => i !== idx));
    setMatrix(matrix.map(row => row.filter((_, j) => j !== idx)));
  };

  const handleAlternativeNameChange = (i, value) => {
    const newAlternatives = [...alternatives];
    newAlternatives[i] = value;
    setAlternatives(newAlternatives);
  };

  const handleStateNameChange = (j, value) => {
    const newStates = [...states];
    newStates[j] = value;
    setStates(newStates);
  };

  return (
    <div style={{ maxWidth: 950, margin: "2em auto", fontFamily: "Inter, Arial, sans-serif", background: colors.background, borderRadius: 12, padding: 32 }}>
      <h2 style={{ color: colors.primary, marginBottom: 16 }}>Entscheidungsmatrix – Interaktive Übung</h2>
      <div style={{ marginBottom: "1em" }}>
        <label style={{ fontWeight: 500, fontSize: 18 }}>
          Entscheidungsregel:{" "}
          <select
            value={rule}
            onChange={e => setRule(e.target.value)}
            style={{
              ...inputStyle,
              width: 210,
              fontSize: 16,
              background: "#fff"
            }}
          >
            {rules.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {rule === "hurwicz" && (
        <div style={{ marginBottom: "1em", display: "flex", alignItems: "center" }}>
          <label style={{ fontWeight: 500, fontSize: 16, marginRight: 16 }}>
            Lambda (λ):{" "}
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={hurwiczLambda}
              onChange={e => setHurwiczLambda(Number(e.target.value))}
              style={{ verticalAlign: "middle", width: 180 }}
            />
            <span style={{ marginLeft: 12, color: colors.primary, fontWeight: 600 }}>{hurwiczLambda.toFixed(2)}</span>
          </label>
          <span style={{ color: "#666", marginLeft: 16, fontSize: 15 }}>
            (λ = Gewicht für das Maximum, 1-λ für das Minimum)
          </span>
        </div>
      )}
      <div style={{ overflowX: "auto" }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>
                Alternative
                <button style={addBtnStyle} onClick={addAlternative} title="Alternative hinzufügen">+</button>
              </th>
              {states.map((state, j) => (
                <th key={j} style={thStyle}>
                  <input
                    value={state}
                    onChange={e => handleStateNameChange(j, e.target.value)}
                    style={{ ...inputStyle, width: "100px", fontWeight: "bold" }}
                  />
                  <button
                    style={removeBtnStyle}
                    onClick={() => removeState(j)}
                    disabled={states.length <= 1}
                    title="Zustand entfernen"
                  >
                    –
                  </button>
                </th>
              ))}
              <th style={thStyle}>Berechnungslogik</th>
              <th style={thStyle}>Ergebnis</th>
            </tr>
          </thead>
          <tbody>
            {alternatives.map((alt, i) => (
              <tr
                key={i}
                style={
                  bestIdx === i
                    ? {
                        background: colors.best,
                        fontWeight: "bold",
                        boxShadow: `0 0 0 2px ${colors.primary} inset`
                      }
                    : { background: "#fff" }
                }
              >
                <td style={thTdStyle}>
                  <input
                    value={alt}
                    onChange={e => handleAlternativeNameChange(i, e.target.value)}
                    style={{ ...inputStyle, width: "120px", fontWeight: "bold" }}
                  />
                  <button
                    style={removeBtnStyle}
                    onClick={() => removeAlternative(i)}
                    disabled={alternatives.length <= 1}
                    title="Alternative entfernen"
                  >
                    –
                  </button>
                </td>
                {matrix[i].map((val, j) => (
                  <td key={j} style={thTdStyle}>
                    <input
                      type="number"
                      value={val}
                      onChange={e => handleCellChange(i, j, e.target.value)}
                      style={inputStyle}
                    />
                  </td>
                ))}
                <td style={{ ...thTdStyle, fontSize: "0.97em", color: "#666" }}>
                  {formulas[i]}
                </td>
                <td style={{ ...thTdStyle, fontSize: "1em" }}>
                  {formatResult(results[i], rule)}
                  {bestIdx === i && (
                    <span style={{ color: colors.primary, marginLeft: 6 }}>← empfohlen</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ margin: "1.5em 0 0 0" }}>
        <button style={addBtnStyle} onClick={addState}>Zustand (Spalte) hinzufügen</button>
      </div>
      <p style={{ color: "#7b8a97", fontSize: "0.93em", marginTop: "1.2em" }}>
        Tipp: Alle Werte und Namen können direkt angepasst werden. Die Berechnungslogik und das Ergebnis passen sich automatisch an.
      </p>
    </div>
  );
}

export default App;
