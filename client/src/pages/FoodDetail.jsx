import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function FoodDetail() {
  const { fdcId } = useParams();
  const navigate = useNavigate();
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFood = async () => {
      try {
        const response = await fetch(`/api/foods/${fdcId}`);
        if (!response.ok) throw new Error('Food not found');
        const data = await response.json();
        setFood(data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFood();
  }, [fdcId]);

  if (loading) return <div className="container"><p>Loading...</p></div>;
  if (error) return <div className="container"><p className="error">{error}</p></div>;

  return (
    <div className="container">
      <button className="home-btn-blue" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="food-detail">
        <h1>{food.description}</h1>
        {food.brandOwner && <p className="brand">{food.brandOwner}</p>}

        {food.ingredients && (
          <div className="section">
            <h2>Ingredients</h2>
            <p>{food.ingredients}</p>
          </div>
        )}

        <div className="section">
          <h2>Nutrition Facts</h2>
          <table className="nutrient-table">
            <thead>
              <tr>
                <th>Nutrient</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {food.nutrients?.map(nutrient => (
                <tr key={nutrient.nutrientId}>
                  <td>{nutrient.nutrientName} ({nutrient.nutrientUnit})</td>
                  <td>{nutrient.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {food.attributes?.length > 0 && (
          <div className="section">
            <h2>Attributes</h2>
            <ul className="attribute-list">
              {food.attributes.map(attr => (
                <li key={attr.attributeId}>
                  <strong>{attr.name}:</strong> {attr.value}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}














