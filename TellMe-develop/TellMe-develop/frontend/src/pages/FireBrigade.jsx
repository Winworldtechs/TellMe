import React, { useState } from "react";
import "./Emergency.css";
import fireImg from "../assets/firebrigade.png"; // 🔥 use your image path
import phoneIcon from "../assets/icons/phone.png"; // 📞 phone icon (same as ambulance)

const FireBrigade = () => {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div className="emergency-container">
      <h2 className="emergency-title">Fire Brigade Emergency</h2>

      <div className="card-grid">
        <div className="emergency-card">
          <img src={fireImg} alt="Fire Brigade" />
          <div className="card-content">
            <h3>City Fire Service</h3>
            <p>⭐ 4.9 | 2 km away</p>
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
                onClick={() => alert("🚒 Calling Fire Brigade...")}
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

export default FireBrigade;
