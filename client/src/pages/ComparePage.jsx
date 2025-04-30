// client/src/pages/ComparePage.jsx
import React, { useState, useEffect } from 'react';

export default function ComparePage() {
  const [search1, setSearch1]     = useState('');
  const [search2, setSearch2]     = useState('');
  const [sugs1, setSugs1]         = useState([]);
  const [sugs2, setSugs2]         = useState([]);
  const [sel1, setSel1]           = useState(null);
  const [sel2, setSel2]           = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [nutrients, setNutrients] = useState([]);

  // Suggestions for box 1
  useEffect(() => {
    if (!search1 || showTable) {
      setSugs1([]);
      return;
    }
    fetch(`/api/foods?search=${encodeURIComponent(search1)}&page=1&limit=5`)
      .then(res => res.ok ? res.json() : Promise.reject(res.status))
      .then(data => setSugs1(data))
      .catch(() => setSugs1([]));
  }, [search1, showTable]);

  // Suggestions for box 2
  useEffect(() => {
    if (!search2 || showTable) {
      setSugs2([]);
      return;
    }
    fetch(`/api/foods?search=${encodeURIComponent(search2)}&page=1&limit=5`)
      .then(res => res.ok ? res.json() : Promise.reject(res.status))
      .then(data => setSugs2(data))
      .catch(() => setSugs2([]));
  }, [search2, showTable]);

  // Compare action
  const compare = async () => {
    if (!sel1 || !sel2) return;
    const [f1, f2] = await Promise.all([
      fetch(`/api/foods/${sel1.fdcId}`).then(r => r.json()),
      fetch(`/api/foods/${sel2.fdcId}`).then(r => r.json())
    ]);
    const allNames = Array.from(new Set([
      ...f1.nutrients.map(n => n.nutrientName),
      ...f2.nutrients.map(n => n.nutrientName)
    ]));
    setNutrients(allNames.map(name => {
      const n1 = f1.nutrients.find(n => n.nutrientName === name) || {};
      const n2 = f2.nutrients.find(n => n.nutrientName === name) || {};
      return {
        name,
        a1: n1.amount || 0,
        a2: n2.amount || 0,
        unit: n1.nutrientUnit || n2.nutrientUnit || ''
      };
    }));
    setShowTable(true);
  };

  const reset = () => {
    setSearch1('');
    setSearch2('');
    setSel1(null);
    setSel2(null);
    setShowTable(false);
    setNutrients([]);
  };

  return (
    <div className="compare-page container">
      <button className="home-btn-blue" onClick={() => window.history.back()}>
        ← Home
      </button>
      <h1>Compare Foods</h1>

      <div className="compare-controls">
        {/* First food */}
        <div className="compare-box">
          <label>1) First food</label>
          <input
            className="compare-input"
            placeholder="Type to search…"
            value={search1}
            disabled={showTable}
            onChange={e => {
              setSearch1(e.target.value);
              setSel1(null);
            }}
          />
          <div className="suggestions">
            {sugs1.map(f => (
              <div
                key={f.fdcId}
                className={`suggestion-card ${sel1 === f ? 'selected' : ''}`}
                onClick={() => {
                  setSel1(f);
                  setSearch1(f.description);
                  setSugs1([]);
                }}
              >
                <strong>{f.description}</strong>
                <small>{f.brandOwner}</small>
              </div>
            ))}
          </div>
        </div>

        {/* Second food */}
        <div className="compare-box">
          <label>2) Second food</label>
          <input
            className="compare-input"
            placeholder="Type to search…"
            value={search2}
            disabled={showTable}
            onChange={e => {
              setSearch2(e.target.value);
              setSel2(null);
            }}
          />
          <div className="suggestions">
            {sugs2.map(f => (
              <div
                key={f.fdcId}
                className={`suggestion-card ${sel2 === f ? 'selected' : ''}`}
                onClick={() => {
                  setSel2(f);
                  setSearch2(f.description);
                  setSugs2([]);
                }}
              >
                <strong>{f.description}</strong>
                <small>{f.brandOwner}</small>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="compare-actions">
        <button
          className="compare-btn"
          onClick={compare}
          disabled={!sel1 || !sel2 || showTable}
        >
          Compare Foods
        </button>
        {showTable && (
          <button className="reset-btn" onClick={reset}>
            Reset
          </button>
        )}
      </div>

      {/* Comparison table */}
      {showTable && (
        <div className="compare-table-container">
          <button className="compare-close" onClick={() => setShowTable(false)}>
            ×
          </button>
          <table className="compare-table">
            <thead>
              <tr>
                <th>Nutrient</th>
                <th>{sel1.description}</th>
                <th>{sel2.description}</th>
              </tr>
            </thead>
            <tbody>
              {nutrients.map(n => (
                <tr key={n.name}>
                  <td>{n.name}{n.unit && ` (${n.unit})`}</td>
                  <td className="text-right">{n.a1}</td>
                  <td className="text-right">{n.a2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}








