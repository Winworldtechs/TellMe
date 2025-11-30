// src/components/TodaysDeals.js

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./TodaysDeals.css";

const TodaysDeals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/deals/deals/")
      .then((res) => res.json())
      .then((data) => {
        setDeals(Array.isArray(data) ? data : data.results || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const createSlug = (name) =>
    name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const openDeal = (deal) => {
    navigate(`/deal/${createSlug(deal.title)}`, { state: deal });
  };

  if (loading) return <p>Loading deals...</p>;

  return (
    <section className="todays-deals">
      <h2>Today's deals</h2>

      <div className="deal-cards">
        {deals.map((deal) => (
          <div key={deal.id} className="deal-card" onClick={() => openDeal(deal)}>
            <img src={deal.image} alt={deal.title} />

            <span className="discount-badge">{deal.discount || "10% OFF"}</span>

            <h3>{deal.title}</h3>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TodaysDeals;
