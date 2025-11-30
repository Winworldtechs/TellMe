import React, { useState } from "react";
import "../styles/DailyNeeds.css";
import fruitsImg from "../assets/images/fruits.png";

const Fruits = () => {
  const [booked, setBooked] = useState(false);

  const handleBook = () => {
    setBooked(true);
    setTimeout(() => setBooked(false), 3000);
  };

  return (
    <div className="daily-container">
      <h2>Fruits</h2>
      <div className="daily-card">
        <img src={fruitsImg} alt="Fruits" />
        <div className="daily-info">
          <h3>Fresh Seasonal Fruits</h3>
          <p>Natural, juicy and hand-picked from local farms.</p>
          <div className="rating">⭐⭐⭐⭐☆</div>
          <p className="price">₹120 / kg</p>
          <button onClick={handleBook}>Book Now</button>
        </div>
      </div>
      {booked && <div className="notification">✅ Fruits booked successfully!</div>}
    </div>
  );
};

export default Fruits;
