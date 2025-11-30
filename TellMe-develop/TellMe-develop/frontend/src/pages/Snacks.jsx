import React, { useState } from "react";
import "../styles/DailyNeeds.css";
import snacksImg from "../assets/images/snack.png";

const Snacks = () => {
  const [booked, setBooked] = useState(false);

  const handleBook = () => {
    setBooked(true);
    setTimeout(() => setBooked(false), 3000);
  };

  return (
    <div className="daily-container">
      <h2>Snacks</h2>
      <div className="daily-card">
        <img src={snacksImg} alt="Snacks" />
        <div className="daily-info">
          <h3>Delicious Snacks</h3>
          <p>Crunchy, fresh and ready to eat anytime.</p>
          <div className="rating">⭐⭐⭐⭐☆</div>
          <p className="price">₹80 / pack</p>
          <button onClick={handleBook}>Book Now</button>
        </div>
      </div>
      {booked && <div className="notification">✅ Snacks booked successfully!</div>}
    </div>
  );
};

export default Snacks;
