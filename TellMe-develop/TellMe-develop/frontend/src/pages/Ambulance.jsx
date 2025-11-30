import React, { useState } from "react";
import "./Emergency.css";
import ambulanceImg from "../assets/ambulance.png"; // use your image path
import phoneIcon from "../assets/icons/phone.png"; // 📞 Add your phone icon image here

const Ambulance = () => {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div className="emergency-container">
      <h2 className="emergency-title">Ambulance Emergency</h2>

      <div className="card-grid">
        <div className="emergency-card">
          <img src={ambulanceImg} alt="Ambulance Service" />
          <div className="card-content">
            <h3>City Ambulance Service</h3>
            <p>⭐ 4.8 | 1 km away</p>
          </div>
          <button className="call-btn" onClick={() => setShowPopup(true)}>
            Call now
          </button>
        </div>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>Call SOS</h3>

            {/* 📞 Phone Icon Center */}
            <img src={phoneIcon} alt="Call Icon" className="popup-icon" />

            <div className="popup-buttons">
              <button className="cancel-btn" onClick={() => setShowPopup(false)}>
                Cancel
              </button>
              <button
                className="call-confirm-btn"
                onClick={() => alert("🚑 Calling Ambulance...")}
              >
                Call
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ambulance;
