// import React, { useState, useEffect, useContext, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import { AuthContext } from "../context/AuthContext";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";
// import "../App.css";

// export default function TrackPage() {
//   const { user } = useContext(AuthContext);
//   const navigate = useNavigate();

//   // redirect to home if not logged in
//   useEffect(() => {
//     if (!user) navigate("/");
//   }, [user, navigate]);

//   const token = user?.token;

//   const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
//   const [entries, setEntries] = useState([]);
//   const [search, setSearch] = useState("");
//   const [suggestions, setSuggestions] = useState([]);

//   const loadEntries = useCallback(() => {
//     fetch(`/api/entries?date=${date}`, {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//       .then((res) => (res.ok ? res.json() : Promise.reject()))
//       .then((data) => setEntries(data))
//       .catch(() => setEntries([]));
//   }, [date, token]);

//   useEffect(() => {
//     if (token) loadEntries();
//   }, [loadEntries, token]);

//   // compute totals
//   const totals = entries.reduce(
//     (acc, e) => {
//       acc.Calories += e.calories || 0;
//       acc.Protein += e.protein || 0;
//       acc.Carbs += e.carbs || 0;
//       acc.Fat += e.fat || 0;
//       acc.Sugars += e.sugars || 0;
//       return acc;
//     },
//     { Calories: 0, Protein: 0, Carbs: 0, Fat: 0, Sugars: 0 }
//   );

//   const chartData = Object.entries(totals).map(([name, value]) => ({
//     name,
//     value: Number(value.toFixed(2)),
//   }));

//   // dynamic suggestions
//   useEffect(() => {
//     if (!search) return setSuggestions([]);
//     fetch(`/api/foods?search=${encodeURIComponent(search)}&page=1&limit=10`)
//       .then((r) => (r.ok ? r.json() : Promise.reject()))
//       .then((json) => setSuggestions(json.foods))
//       .catch(() => setSuggestions([]));
//   }, [search]);

//   const addEntry = (food) => {
//     fetch(`/api/foods/${food.fdcId}`)
//       .then((r) => (r.ok ? r.json() : Promise.reject()))
//       .then((full) => {
//         const getAmt = (name) =>
//           full.nutrients.find((n) => n.nutrientName === name)?.amount || 0;

//         const entry = {
//           fdcId: full.fdcId,
//           description: full.description,
//           date,
//           calories: getAmt("Energy"),
//           protein: getAmt("Protein"),
//           carbs: getAmt("Carbohydrate, by difference"),
//           fat: getAmt("Total lipid (fat)"),
//           sugars: getAmt("Sugars, total"),
//         };

//         return fetch("/api/entries", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify(entry),
//         });
//       })
//       .then((r) => {
//         if (!r.ok) throw new Error();
//         loadEntries();
//         setSearch("");
//         setSuggestions([]);
//       })
//       .catch(() =>
//         alert("Could not add entry. Please make sure you’re logged in.")
//       );
//   };

//   return (
//     <div className="container">
//       <button className="home-btn-blue" onClick={() => navigate(-1)}>
//         ← Back
//       </button>

//       <h1>Track My Calories</h1>

//       {user && (
//         <p style={{ color: "var(--secondary)" }}>
//           Logged in as <strong>{user.email}</strong>
//         </p>
//       )}

//       {/* Chart */}
//       <div style={{ width: "100%", height: 300, marginBottom: "2rem" }}>
//         <ResponsiveContainer>
//           <BarChart data={chartData}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="name" stroke="var(--text-secondary)" />
//             <YAxis stroke="var(--text-secondary)" />
//             <Tooltip />
//             <Bar dataKey="value" fill="var(--primary)" />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>

//       {/* Entries Table */}
//       <div className="detail-container entries-table">
//         <h2>Entries on {date}</h2>
//         <table>
//           <thead>
//             <tr>
//               <th>Time</th>
//               <th>Description</th>
//               <th>Cal</th>
//               <th>Prot</th>
//               <th>Carb</th>
//               <th>Fat</th>
//               <th>Sug</th>
//             </tr>
//           </thead>
//           <tbody>
//             {entries.length === 0 ? (
//               <tr>
//                 <td colSpan="7">No entries for this date</td>
//               </tr>
//             ) : (
//               entries.map((e) => (
//                 <tr key={e._id}>
//                   <td>{new Date(e.createdAt).toLocaleTimeString()}</td>
//                   <td>{e.description}</td>
//                   <td>{e.calories}</td>
//                   <td>{e.protein}</td>
//                   <td>{e.carbs}</td>
//                   <td>{e.fat}</td>
//                   <td>{e.sugars}</td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//         <p className="totals">
//           Total for day:&nbsp; Calories {totals.Calories.toFixed(2)},&nbsp;
//           Protein {totals.Protein.toFixed(2)},&nbsp; Carbs{" "}
//           {totals.Carbs.toFixed(2)},&nbsp; Fat {totals.Fat.toFixed(2)},&nbsp;
//           Sugars {totals.Sugars.toFixed(2)}
//         </p>
//       </div>

//       {/* Date & Search */}
//       <div className="track-controls">
//         <input
//           type="date"
//           className="date-picker"
//           value={date}
//           onChange={(e) => setDate(e.target.value)}
//         />
//         <div className="search-bar" style={{ flex: 1 }}>
//           <input
//             placeholder="Search food..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />
//           <button>Find</button>
//         </div>
//       </div>

//       {/* Suggestions */}
//       <div className="grid">
//         {suggestions.map((f) => (
//           <div key={f.fdcId} className="card" onClick={() => addEntry(f)}>
//             <h3>{f.description}</h3>
//             <p>{f.brandOwner}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
