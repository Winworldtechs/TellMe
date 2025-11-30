import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./MostBookedDetails.css";

/* ⬇️ LOCATION ICON IMPORT */
import locationIcon from "../assets/icons/location.png";

const BASE_URL = "http://127.0.0.1:8000";

const MostBookedDetails = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);

  /* Booking popup state */
  const [showPopup, setShowPopup] = useState(false);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    axios.get(`${BASE_URL}/api/most-booked/${id}/`)
      .then(res => setService(res.data))
      .catch(err => console.log(err));
  }, [id]);

  const confirmBooking = () => {
    if (!date || !slot) return alert("Select date & slot");
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      setShowPopup(false);
    }, 2000);
  };

  if (!service) return <p style={{ textAlign: "center" }}>Loading...</p>;

  return (
    <>
      <section className="detail-wrapper">
        <div className="detail-card">
          <h1 className="detail-title">{service.title}</h1>

          <div className="detail-img-box">
            <img src={service.image} alt={service.title} className="detail-img" />
          </div>

          <p className="detail-provider">
            {service.provider_name ?? ""}
          </p>

          <p className="detail-price">₹ {service.price}</p>

          <p className="detail-rating">⭐ {service.rating}</p>

          <p className="detail-location">
            <img src={locationIcon} alt="location" className="loc-icon" />
            {service.location}
          </p>

          <button className="detail-book-btn" onClick={() => setShowPopup(true)}>
            Book Now
          </button>
        </div>
      </section>

      {/* POPUP */}
      {showPopup && (
        <div className="booking-overlay">
          <div className="booking-box">
            <h2>Book — {service.title}</h2>

            <label>Select Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

            <label>Select Time Slot</label>
            <div className="slot-container">
              {["9:00 AM","11:00 AM","2:00 PM","4:00 PM","6:00 PM"].map((t) => (
                <button
                  key={t}
                  className={slot === t ? "slot active" : "slot"}
                  onClick={() => setSlot(t)}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="booking-actions">
              <button className="confirm" onClick={confirmBooking}>Confirm Booking</button>
              <button className="cancel" onClick={() => setShowPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {showToast && (
        <div className="toast-success">🎉 Booking Confirmed Successfully!</div>
      )}
    </>
  );
};

export default MostBookedDetails;
