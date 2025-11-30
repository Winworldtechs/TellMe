import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/HealthCare.css";

import bookmark from "../assets/icons/bookmark.png";
import bookmarkFill from "../assets/icons/bookmarkFill.png";
import locationIcon from "../assets/icons/location.png";

const API = "http://127.0.0.1:8000/api";

export default function Nearby({ type }) {
  const [items, setItems] = useState([]);
  const [saved, setSaved] = useState({});

  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [slots, setSlots] = useState([]);
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");

  const [showMsg, setShowMsg] = useState(false); // ⭐ SUCCESS MESSAGE

  const access = localStorage.getItem("access");

  /* Refresh Token */
  const refreshAccess = async () => {
    try {
      const res = await axios.post(`${API}/accounts/refresh/`, {
        refresh: localStorage.getItem("refresh"),
      });
      localStorage.setItem("access", res.data.access);
      return res.data.access;
    } catch {
      return null;
    }
  };

  const authed = async (method, url, data = null, retry = true) => {
    let token = localStorage.getItem("access");

    try {
      return await axios({
        method,
        url,
        data,
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      if (err.response?.status === 401 && retry) {
        const newToken = await refreshAccess();
        if (!newToken) return;
        return authed(method, url, data, false);
      }
      throw err;
    }
  };

  /* LOAD Providers */
  useEffect(() => {
    let slug = "";

    if (type === "physio") slug = "home-health-physiotherapist";
    else if (type === "dentist") slug = "home-health-dentist";

    axios
      .get(`${API}/services/providers/by-service/?slug=${slug}`)
      .then((res) => {
        const list = Array.isArray(res.data.results)
          ? res.data.results
          : res.data;
        setItems(list);
      })
      .catch((err) => console.log("LOAD ERROR:", err));
  }, [type]);

  /* LOAD SAVED */
  useEffect(() => {
    if (!access) return;

    authed("get", `${API}/saved/profile/saved-services/`)
      .then((res) => {
        const map = {};
        res.data.forEach((v) => (map[v.service] = true));
        setSaved(map);
      })
      .catch(() => {});
  }, []);

  const toggleSave = async (sid) => {
    if (!access) return alert("Please login");

    try {
      await authed("post", `${API}/saved/save-service/`, { service: sid });
      setSaved((p) => ({ ...p, [sid]: !p[sid] }));
    } catch {}
  };

  const fetchSlots = async (provider_id, service_id, d) => {
    try {
      const res = await axios.get(
        `${API}/bookings/slots/?provider_id=${provider_id}&service_id=${service_id}&date=${d}`
      );
      setSlots(res.data.slots || []);
    } catch {}
  };

  const to24 = (t) =>
    new Date("2025-01-01 " + t).toTimeString().slice(0, 8);

  /* BOOK NOW */
  const bookService = async () => {
    if (!date || !timeSlot) return alert("Select date & time");

    const [start, end] = timeSlot.split(" - ");

    const payload = {
      service: selected.id,
      provider: selected.provider_id,
      date,
      start_time: to24(start),
      end_time: to24(end),
      notes: "",
    };

    try {
      await authed("post", `${API}/bookings/`, payload);

      setShowModal(false);

      // ⭐ Show success message
      setShowMsg(true);
      setTimeout(() => setShowMsg(false), 3000);
    } catch {
      alert("Booking Failed!");
    }
  };

  return (
    <div className="healthcare-container">
      <h2 className="healthcare-title">
        {type === "physio" ? "Physiotherapist" : "Dentist"} Services
      </h2>

      <div className="doctor-grid">
        {items.length === 0 ? (
          <p>No doctors found</p>
        ) : (
          items.map((s) => (
            <div className="doctor-card" key={s.id}>
              <div className="img-box">
                <img
                  src={`http://127.0.0.1:8000${s.provider_logo}`}
                  alt={s.title}
                />

                <div className="save-icon" onClick={() => toggleSave(s.id)}>
                  <img src={saved[s.id] ? bookmarkFill : bookmark} alt="" />
                </div>
              </div>

              <h3>{s.title}</h3>
              <p style={{ marginLeft: "12px" }}>{s.provider_name}</p>
              <p style={{ margin: "0 12px" }}>₹ {s.price}</p>

              <p className="rating-distance">
                ⭐ 4.9 | 2 km away <br /> 
                <span className="location">
                  <img src={locationIcon} alt="" /> {s.address}
                </span>
              </p>

              

              <button
                className="book-btn"
                onClick={() => {
                  setSelected(s);
                  setDate("");
                  setTimeSlot("");
                  setSlots([]);
                  setShowModal(true);
                }}
              >
                Book now
              </button>
            </div>
          ))
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="popup-overlay" onClick={() => setShowModal(false)}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <h3>Book {selected.title}</h3>

            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                fetchSlots(selected.provider_id, selected.id, e.target.value);
              }}
            />

            {slots.length > 0 ? (
              <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
                <option value="">Select Time Slot</option>
                {slots.map((slot, i) => (
                  <option key={i} value={slot.label}>
                    {slot.label}
                  </option>
                ))}
              </select>
            ) : (
              <p style={{ color: "#666" }}>Select date to load slots</p>
            )}

            <button className="checkout-btn" onClick={bookService}>
              Confirm Booking
            </button>

            <button className="close-popup" onClick={() => setShowModal(false)}>
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ⭐ SUCCESS TOAST ⭐ */}
      {showMsg && (
        <div className="toast-success">🔥 Booking Successful!</div>
      )}
    </div>
  );
}
