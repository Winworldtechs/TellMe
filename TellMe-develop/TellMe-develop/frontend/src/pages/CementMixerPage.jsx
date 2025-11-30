import React, { useState } from "react";
import "../styles/RentMachinery.css";
import cementMixerImg from "../assets/images/cement-mixer1.png";
import locationIcon from "../assets/icons/location.png";

const CementMixerPage = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const handleBookNow = () => setShowPopup(true);

  const handleBooking = () => {
    if (!date || !time) {
      alert("⚠️ Please select both date and time!");
      return;
    }
    alert(`✅ Booking Successful!\nDate: ${date}\nTime: ${time}`);
    setShowPopup(false);
    setDate("");
    setTime("");
  };

  return (
    <div className="rentmachinery-container">
      {/* 🔹 Title outside the card */}
      <h2 className="rentmachinery-main-title">Electric Cement Mixer</h2>

      <div className="rentmachinery-card">
        <img
          src={cementMixerImg}
          alt="Cement Mixer"
          className="rentmachinery-image"
        />

        <p className="rentmachinery-features-title">Features</p>
        <ul className="rentmachinery-features">
          <li>500L Mixing Capacity</li>
          <li>Electric Motor – Efficient & Portable</li>
        </ul>

        <div className="rentmachinery-rating">
          ⭐ 4.8
          <div className="rentmachinery-distance">
            <img src={locationIcon} alt="location" className="location-icon" />
            2 km away
          </div>
        </div>

        <button className="booknow-btn" onClick={handleBookNow}>
          Book now
        </button>
      </div>

      {/* 🔹 Booking Popup */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>Book Electric Cement Mixer</h3>

            <label>Select Date:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <label>Select Time:</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />

            <button className="proceed-btn" onClick={handleBooking}>
              Proceed to Book
            </button>
            <button className="close-btn" onClick={() => setShowPopup(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CementMixerPage;
