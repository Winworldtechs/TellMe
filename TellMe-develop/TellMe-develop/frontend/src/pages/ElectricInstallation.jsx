import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/ServiceCard.css";

/* Icons */
import locationIcon from "../assets/icons/location.png";
import bookmarkIcon from "../assets/icons/bookmark.png";
import bookmarkFilled from "../assets/icons/bookmarkFill.png";

export default function ElectricInstallation() {
  const API = "http://127.0.0.1:8000/api";
  const token = localStorage.getItem("access");

  const [services, setServices] = useState([]);
  const [saved, setSaved] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);

  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);         // ✅ FIXED
  const [selectedSlot, setSelectedSlot] = useState("");

  /* ---------------- LOAD SERVICES ---------------- */
  const loadServices = async () => {
    try {
      const res = await axios.get(
        `${API}/services/providers/by-service/?slug=electric-installation`
      );

      const formatted = res.data.results.map((s) => ({
        service_id: s.id,
        provider_id: s.provider_id,
        title: s.title,
        price: s.price,
        provider_name: s.provider_name,
        provider_logo: s.provider_logo,
        address: s.address,
        rating: 4.7, // static for now
      }));

      setServices(formatted);
    } catch (err) {
      console.log("Load Services ERR:", err);
    }
  };

  /* ---------------- LOAD SAVED SERVICES ---------------- */
  const loadSaved = async () => {
    if (!token) return;

    try {
      const res = await axios.get(`${API}/saved/profile/saved-services/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const map = {};
      res.data.forEach((s) => (map[s.service] = true));
      setSaved(map);
    } catch (err) {
      console.log("Saved ERR:", err);
    }
  };

  useEffect(() => {
    loadServices();
    loadSaved();
  }, []);

  /* ---------------- SAVE / UNSAVE ---------------- */
  const toggleSave = async (sid) => {
    if (!token) return alert("Please login");

    try {
      const res = await axios.post(
        `${API}/saved/save-service/`,
        { service: sid },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSaved((prev) => ({ ...prev, [sid]: res.data.saved }));
    } catch (err) {
      console.log("Save ERR:", err);
    }
  };

  /* ---------------- FETCH SLOTS ---------------- */
  const fetchSlots = async (pid, sid, d) => {
    try {
      const res = await axios.get(
        `${API}/bookings/slots/?provider_id=${pid}&service_id=${sid}&date=${d}`
      );
      setSlots(res.data.slots || []);
    } catch (err) {
      console.log("Slot ERR:", err);
    }
  };

  /* ---------------- TIME FORMAT ---------------- */
  const convertTime = (str) => {
    let [time, mer] = str.split(" ");
    let [h, m] = time.split(":");
    h = parseInt(h);

    if (mer === "PM" && h !== 12) h += 12;
    if (mer === "AM" && h === 12) h = 0;

    return `${h.toString().padStart(2, "0")}:${m}:00`;
  };

  /* ---------------- BOOKING ---------------- */
  const bookNow = async () => {
    if (!token) return alert("Login required");
    if (!date || !selectedSlot) return alert("Select date & time");

    const [start, end] = selectedSlot.split(" - ");

    const payload = {
      service: selected.service_id,
      provider: selected.provider_id,
      date,
      start_time: convertTime(start),
      end_time: convertTime(end),
    };

    try {
      await axios.post(`${API}/bookings/`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Booking successful!");
      setShowModal(false);
    } catch (err) {
      console.log("Booking ERR:", err.response?.data);
      alert("Booking failed");
    }
  };

  /* ---------------- RENDER ---------------- */
  return (
    <div className="home-service-container">
      <h2>Electric Installation</h2>

      <div className="service-list">
        {services.length === 0 ? (
          <p>No vendors available</p>
        ) : (
          services.map((s) => (
            <div className="service-card" key={s.service_id}>
              <div className="img-box">
                <img src={s.provider_logo} alt="" />

                <div className="save-icon" onClick={() => toggleSave(s.service_id)}>
                  <img
                    src={saved[s.service_id] ? bookmarkFilled : bookmarkIcon}
                    alt="save"
                  />
                </div>
              </div>

              <div className="service-details">
                <h3>{s.title}</h3>
                <p className="company">{s.provider_name}</p>

                <div className="rating">⭐ {s.rating}</div>

                <div className="location">
                  <img src={locationIcon} alt="" /> {s.address}
                </div>

                <p className="service-price">₹ {s.price}</p>
              </div>

              <button
                className="book-btn"
                onClick={() => {
                  setSelected(s);
                  setShowModal(true);
                  setSlots([]);          // RESET
                  setSelectedSlot("");
                  setDate("");
                }}
              >
                Book Now
              </button>
            </div>
          ))
        )}
      </div>

      {/* ---------------- MODAL ---------------- */}
      {showModal && selected && (
        <div className="modal">
          <div className="modal-content">
            <h3>Book {selected.title}</h3>

            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                fetchSlots(selected.provider_id, selected.service_id, e.target.value);
              }}
            />

            {slots.length > 0 ? (
              <select onChange={(e) => setSelectedSlot(e.target.value)}>
                <option>Select Time Slot</option>
                {slots.map((slot, index) => (
                  <option key={index}>{slot.label}</option>
                ))}
              </select>
            ) : (
              <p>Select a date to load available slots</p>
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
