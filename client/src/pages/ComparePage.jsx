import React, { useState, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE_URL || '';

export default function ComparePage() {
  const [search1, setSearch1]     = useState('');
  const [search2, setSearch2]     = useState('');
  const [sugs1, setSugs1]         = useState([]);
  const [sugs2, setSugs2]         = useState([]);
  const [sel1, setSel1]           = useState(null);
  const [sel2, setSel2]           = useState(null);
  const [locked1, setLocked1]     = useState(false);
  const [locked2, setLocked2]     = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [nutrients, setNutrients] = useState([]);

  useEffect(() => {
    if (!search1 || showTable || locked1) return setSugs1([]);
    fetch(`${API_BASE}/api/foods?search=${encodeURIComponent(search1)}&page=1&limit=100`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setSugs1(data.foods))
      .catch(() => setSugs1([]));
  }, [search1, showTable, locked1]);

  useEffect(() => {
    if (!search2 || showTable || locked2) return setSugs2([]);
    fetch(`${API_BASE}/api/foods?search=${encodeURIComponent(search2)}&page=1&limit=100`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setSugs2(data.foods))
      .catch(() => setSugs2([]));
  }, [search2, showTable, locked2]);

  const compare = async () => {
    if (!sel1 || !sel2) return;
    const [f1, f2] = await Promise.all([
      fetch(`${API_BASE}/api/foods/${sel1.fdcId}`).then(r => r.json()),
      fetch(`${API_BASE}/api/foods/${sel2.fdcId}`).then(r => r.json())
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
    setLocked1(false);
    setLocked2(false);
    setShowTable(false);
    setNutrients([]);
  };

  return (
    <div className="compare-page container">
      <button className="home-btn-blue" onClick={() => window.history.back()}>← Home</button>
      <h1>Compare Foods</h1>

      <div className="compare-controls">
        <CompareBox label="1) First food" search={search1} setSearch={setSearch1} suggestions={sugs1} setSuggestions={setSugs1} selected={sel1} setSelected={setSel1} locked={locked1} setLocked={setLocked1} showTable={showTable} />
        <CompareBox label="2) Second food" search={search2} setSearch={setSearch2} suggestions={sugs2} setSuggestions={setSugs2} selected={sel2} setSelected={setSel2} locked={locked2} setLocked={setLocked2} showTable={showTable} />
      </div>

      <div className="compare-actions">
        <button className="compare-btn" onClick={compare} disabled={!sel1 || !sel2 || showTable}>Compare Foods</button>
        {showTable && <button className="reset-btn" onClick={reset}>Reset</button>}
      </div>

      {showTable && (
        <div className="compare-table-container">
          <button className="compare-close" onClick={() => setShowTable(false)}>×</button>
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

function CompareBox({ label, search, setSearch, suggestions, setSuggestions, selected, setSelected, locked, setLocked, showTable }) {
  return (
    <div className="compare-box">
      <label>{label}</label>
      <input
        className="compare-input"
        placeholder="Type to search…"
        value={search}
        disabled={locked || showTable}
        onChange={e => {
          setSearch(e.target.value);
          setSelected(null);
          setLocked(false);
        }}
      />
      <div className="suggestions">
        {suggestions.map(f => (
          <div
            key={f.fdcId}
            className={`suggestion-card ${selected === f ? 'selected' : ''}`}
            onClick={() => {
              setSelected(f);
              setSearch(f.description);
              setSuggestions([]);
              setLocked(true);
            }}
          >
            <strong>{f.description}</strong>
            <small>{f.brandOwner}</small>
          </div>
        ))}
      </div>
    </div>
  );
}













