import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function FoodDetail() {
  const { fdcId }  = useParams();
  const navigate   = useNavigate();
  const [food, setFood]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    fetch(`/api/foods/${fdcId}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setFood(data))
      .catch(() => setError('Failed to load food'))
      .finally(() => setLoading(false));
  }, [fdcId]);

  if (loading) return <p>Loading…</p>;
  if (error)   return <p className="error">{error}</p>;

  return (
    <div className="detail-container container">
      <button className="home-btn-blue" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h1>{food.description}</h1>
      <p><em>{food.brandOwner || 'Unknown Brand'}</em></p>

      {food.ingredients && (
        <p><strong>Ingredients:</strong> {food.ingredients}</p>
      )}

      <h2>Nutrients</h2>
      <table className="min-w-full table-auto">
        <thead>
          <tr>
            <th className="py-2 px-4">Nutrient</th>
            <th className="py-2 px-4 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {food.nutrients.map(n => (
            <tr key={n.nutrientId} className="border-t">
              <td className="py-2 px-4">
                {n.nutrientName} ({n.nutrientUnit})
              </td>
              <td className="py-2 px-4 text-right">{n.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Attributes</h2>
      <ul>
        {food.attributes.map(a => (
          <li key={a.attributeId}>
            {a.name}: {a.value}
          </li>
        ))}
      </ul>
    </div>
  );
}











