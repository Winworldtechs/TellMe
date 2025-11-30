import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

import locationIcon from "../assets/icons/location.png";
import "../styles/ServiceCard.css";

const API = "http://127.0.0.1:8000/api";

export default function ProviderDetails() {
  const { user } = useContext(AuthContext);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");

  const id = window.location.pathname.split("/")[2];

  // ---------------- LOAD PROVIDER ----------------
  useEffect(() => {
    loadProvider();
  }, []);

  const loadProvider = async () => {
    try {
      const res = await axios.get(`${API}/services/providers/${id}/`);
      setProvider(res.data);
    } catch (err) {
      console.log("Provider ERR:", err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- LOAD SLOTS ----------------
  const loadSlots = async (dateValue) => {
    try {
      const res = await axios.get(
        `${API}/bookings/slots/?provider_id=${provider.id}&service_id=${provider.id}&date=${dateValue}`
      );

      setSlots(res.data.slots || []);
    } catch (err) {
      console.log("Slot ERR:", err);
    }
  };

  // ----------- TIME FORMAT Convert -----------
  const convertTime = (t) => {
    let [time, mer] = t.split(" ");
    let [h, m] = time.split(":");
    h = parseInt(h);

    if (mer === "PM" && h !== 12) h += 12;
    if (mer === "AM" && h === 12) h = 0;

    return `${h.toString().padStart(2, "0")}:${m}:00`;
  };

  // ---------------- BOOKING ----------------
  const bookNow = async () => {
    if (!user) return alert("Please login first!");
    if (!date || !selectedSlot) return alert("Select date and time slot!");

    const [start, end] = selectedSlot.split(" - ");

    const payload = {
      service: provider.id,
      provider: provider.id,
      date,
      start_time: convertTime(start),
      end_time: convertTime(end),
    };

    try {
      await axios.post(`${API}/bookings/`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });

      alert("Booking successful!");
      setShowModal(false);
    } catch (err) {
      console.log("Booking ERR:", err.response?.data);
      alert("Booking failed!");
    }
  };

  if (loading) return <p>Loading...</p>;

  if (!provider) return <p>Error loading provider.</p>;

  return (
    <div className="home-service-container">
      <div className="service-card" style={{ width: "100%" }}>
        <div className="img-box">
          <img
            src={provider.logo_url ? `http://127.0.0.1:8000${provider.logo_url}` : ""}
            alt=""
          />
        </div>

        <div className="service-details">
          <h3>{provider.name}</h3>
          <p>{provider.description}</p>

          <p className="service-price">₹ {provider.charges}</p>

          <div className="location">
            <img src={locationIcon} alt="" /> {provider.address}
          </div>
        </div>

        <button className="book-btn" onClick={() => setShowModal(true)}>
          Book Now
        </button>
      </div>

      {/* === BOOKING MODAL === */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">

            <h3>Book {provider.name}</h3>

            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                loadSlots(e.target.value);
              }}
            />

            {slots.length > 0 ? (
              <select value={selectedSlot} onChange={(e) => setSelectedSlot(e.target.value)}>
                <option>Select Slot</option>
                {slots.map((slot, idx) => (
                  <option key={idx}>{slot.label}</option>
                ))}
              </select>
            ) : (
              <p>Select date to load slots</p>
            )}

            <button className="checkout-btn" onClick={bookNow}>
              Confirm Booking
            </button>

            <button className="close-btn" onClick={() => setShowModal(false)}>
              Close
            </button>

          </div>
        </div>
      )}
    </div>
  );
}
