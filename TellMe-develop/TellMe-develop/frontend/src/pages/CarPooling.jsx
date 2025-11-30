import React, { useState, useEffect } from "react";
import "./Emergency.css";
import phoneIcon from "../assets/icons/phone.png";
import locationIcon from "../assets/icons/location.png"; // 📍 Location Icon IMPORT

const CarPooling = () => {
  const [vendors, setVendors] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  // 🟢 Fetch vendors from backend
  useEffect(() => {
    fetch("http://localhost:8000/api/sos/carpool/vendors/")
      .then((res) => res.json())
      .then((data) => {
        console.log("Backend Response:", data);
        setVendors(data.results || []); // Pagination fix
      })
      .catch((err) => console.log("Error fetching vendors:", err));
  }, []);

  return (
    <div className="emergency-container">
      <h2 className="emergency-title">Car Pooling Emergency</h2>

      <div className="card-grid">
        {vendors.map((vendor) => (
          <div className="emergency-card" key={vendor.id}>
            <img
              src={vendor.image}
              alt={vendor.name}
              className="vendor-img"
            />

            <div className="card-content">
              <h3>{vendor.name}</h3>

              {/* ⭐ Rating */}
              <p className="vendor-rating">⭐ {vendor.rating}</p>

              {/* 📍 Distance with ICON */}
              <p className="vendor-distance">
                <img src={locationIcon} className="location-icon" alt="loc" />
                {vendor.distance}
              </p>
            </div>

            <button
              className="call-btn"
              onClick={() => {
                setSelectedVendor(vendor);
                setShowPopup(true);
              }}
            >
              Call now
            </button>
          </div>
        ))}
      </div>

      {/* POPUP START */}
      {showPopup && selectedVendor && (
        <div className="popup-overlay">
          <div className="popup-box">

            <h3 className="popup-title">Call {selectedVendor.name}</h3>

            <img
              src={phoneIcon}
              alt="Call Icon"
              className="popup-icon"
            />

            <p className="popup-phone">📞 {selectedVendor.phone}</p>

            <div className="popup-buttons">

              <button
                className="cancel-btn"
                onClick={() => setShowPopup(false)}
              >
                End Call
              </button>

              <button
                className="call-confirm-btn"
                onClick={() => {
                  window.location.href = `tel:${selectedVendor.phone}`;
                }}
              >
                Call Now
              </button>

            </div>
          </div>
        </div>
      )}
      {/* POPUP END */}
    </div>
  );
};

export default CarPooling;
