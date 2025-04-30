import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect }    from 'react';

export default function FoodDetail() {
  const { fdcId }   = useParams();
  const nav         = useNavigate();
  const [food, setFood]     = useState(null);
  const [loading, setLoad]  = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    fetch(`http://localhost:4000/api/foods/${fdcId}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => setFood(data))
      .catch(() => setError('Failed to load food'))
      .finally(() => setLoad(false));
  }, [fdcId]);

  if (loading) return <p>Loading…</p>;
  if (error)   return <p className="error">{error}</p>;

  return (
    <>
      <button className="home-btn-blue" onClick={()=>nav(-1)}>Back</button>
      <div className="detail-container">
        <h1>{food.description}</h1>
        <p><em>{food.brandOwner}</em></p>
        {food.ingredients && (
          <p><strong>Ingredients:</strong> {food.ingredients}</p>
        )}
        <h2>Nutrients</h2>
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4">Nutrient</th>
              <th className="py-2 px-4">Amount</th>
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
    </>
  );
}










