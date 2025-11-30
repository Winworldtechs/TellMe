import React, { useState } from "react";
import axios from "axios";
import "../styles/RentMachinery.css";
import drillImg from "../assets/images/drill2.png";
import locationIcon from "../assets/icons/location.png";

const DrillPage = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [showMsg, setShowMsg] = useState(false);

  const service = {
    name: "Electric Drill Machine",
    offer: 20,          // ✅ backend offer ID – EDIT this if needed
    company: "RentTools Hub",
    img: drillImg,
    rating: 4.9,
    distance: "1 km away"
  };

  const openPopup = () => setShowPopup(true);
  const closePopup = () => setShowPopup(false);

  const handleBooking = async () => {
    const token = localStorage.getItem("access");

    if (!token) return alert("Please login first");
    if (!date || !time) return alert("⚠️ Please select date & time!");

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return alert("User details missing!");

    const payload = {
      offer: service.offer,
      name: user?.name,
      email: user?.email,
      phone: user?.phone,
      booking_date: date
    };

    console.log("📦 Sending Payload:", payload);

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/services/offer-bookings/",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      console.log("✅ Booking Saved", res.data);

      setShowPopup(false);
      setShowMsg(true);
      setTimeout(() => setShowMsg(false), 3000);

      // Reset fields
      setDate("");
      setTime("");
    } catch (error) {
      console.log("❌ ERROR:", error.response?.data || error);
      alert("Booking failed");
    }
  };

  return (
    <div className="rentmachinery-container">
      <h2 className="rentmachinery-main-title">{service.name}</h2>

      <div className="rentmachinery-card">
        <img src={service.img} alt={service.name} className="rentmachinery-image" />

        <h3 className="rentmachinery-title">{service.name}</h3>

        <p className="rentmachinery-features-title">Features</p>
        <ul className="rentmachinery-features">
          <li>High torque motor</li>
          <li>Variable speed control</li>
          <li>Lightweight & portable</li>
        </ul>

        <div className="rentmachinery-rating">
          ⭐ {service.rating}
          <div className="rentmachinery-distance">
            <img src={locationIcon} alt="location" className="location-icon" />
            {service.distance}
          </div>
        </div>

        <button className="booknow-btn" onClick={openPopup}>
          Book now
        </button>
      </div>

      {/* ✅ Popup */}
      {showPopup && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <h3>Book {service.name}</h3>

            <label>Select Date:</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

            <label>Select Time:</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />

            <button className="proceed-btn" onClick={handleBooking}>
              Proceed to Book
            </button>
            <button className="close-btn" onClick={closePopup}>
              Close
            </button>
          </div>
        </div>
      )}

      {showMsg && (
        <div className="toast-success">
          ✅ Booking request submitted!
        </div>
      )}
    </div>
  );
};

export default DrillPage;
