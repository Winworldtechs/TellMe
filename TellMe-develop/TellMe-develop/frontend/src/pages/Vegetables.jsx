import React, { useState } from "react";
import "../styles/DailyNeeds.css";
import vegImg from "../assets/images/vegetable.png";

const Vegetables = () => {
  const [booked, setBooked] = useState(false);

  const handleBook = () => {
    setBooked(true);
    setTimeout(() => setBooked(false), 3000);
  };

  return (
    <div className="daily-container">
      <h2>Vegetables</h2>
      <div className="daily-card">
        <img src={vegImg} alt="Vegetables" />
        <div className="daily-info">
          <h3>Organic Vegetables</h3>
          <p>Freshly harvested and pesticide-free veggies.</p>
          <div className="rating">⭐⭐⭐⭐⭐</div>
          <p className="price">₹90 / kg</p>
          <button onClick={handleBook}>Book Now</button>
        </div>
      </div>
      {booked && <div className="notification">✅ Vegetables booked successfully!</div>}
    </div>
  );
};

export default Vegetables;
