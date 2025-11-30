import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "../styles/HealthCare.css";

import bookmarkIcon from "../assets/icons/bookmark.png";
import bookmarkFilled from "../assets/icons/bookmarkFill.png";
import locationIcon from "../assets/icons/location.png";

const API = "http://127.0.0.1:8000/api";

export default function Healthcare() {
  const [items, setItems] = useState([]);
  const [saved, setSaved] = useState({});

  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);

  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [slots, setSlots] = useState([]);

  const [showMsg, setShowMsg] = useState(false);

  const access = localStorage.getItem("access");
  const refresh = localStorage.getItem("refresh");

  /* ------------------------------------------------------
        REFRESH TOKEN
  ------------------------------------------------------ */
  const refreshAccess = async () => {
    try {
      const res = await axios.post(`${API}/accounts/refresh/`, {
        refresh,
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

  /* ------------------------------------------------------
        LOAD CARDIOLOGIST SERVICES
  ------------------------------------------------------ */
  const loadService = useCallback(() => {
    axios
      .get(`${API}/services/providers/by-service/?slug=home-health-cardiologist`)
      .then((res) => {
        const list = Array.isArray(res.data.results)
          ? res.data.results
          : res.data;

        const data = list.map((s) => ({
          id: s.id,
          service_id: s.id,
          provider_id: s.provider_id,
          title: s.title,
          provider_name: s.provider_name,
          provider_logo: s.provider_logo,
          address: s.address,
          price: s.price,
          rating: 4.9,
        }));

        setItems(data);
      })
      .catch((err) => console.log("LOAD ERROR:", err));
  }, []);

  useEffect(() => {
    loadService();
  }, [loadService]);

  /* ------------------------------------------------------
        LOAD SAVED SERVICES
  ------------------------------------------------------ */
  const loadSaved = useCallback(async () => {
    if (!access) return;

    try {
      const res = await authed(
        "get",
        `${API}/saved/profile/saved-services/`
      );

      const map = {};
      res.data.forEach((v) => (map[v.service] = true));

      setSaved(map);
    } catch {}
  }, [access]);

  useEffect(() => {
    loadSaved();
  }, [loadSaved]);

  /* ------------------------------------------------------
        SAVE OR UNSAVE
  ------------------------------------------------------ */
  const toggleSave = async (sid) => {
    if (!access) return alert("Please login first");

    try {
      await authed("post", `${API}/saved/save-service/`, { service: sid });

      setSaved((p) => ({ ...p, [sid]: !p[sid] }));
    } catch {}
  };

  /* ------------------------------------------------------
        FETCH AVAILABLE SLOTS
  ------------------------------------------------------ */
  const fetchSlots = async (provider_id, service_id, d) => {
    try {
      const res = await axios.get(
        `${API}/bookings/slots/?provider_id=${provider_id}&service_id=${service_id}&date=${d}`
      );

      setSlots(res.data.slots || []);
    } catch (err) {
      console.log("Slot ERR:", err);
    }
  };

  /* ---------------------------
        12 → 24 Hr Format
  --------------------------- */
  const to24 = (str) =>
    new Date("2025-01-01 " + str).toTimeString().slice(0, 8);

  /* ---------------------------
        BOOK SERVICE
  --------------------------- */
  const bookService = async () => {
    if (!date || !timeSlot) return alert("Select date & time");

    const [start, end] = timeSlot.split(" - ");

    const payload = {
      service: selected.service_id,
      provider: selected.provider_id,
      date,
      start_time: to24(start),
      end_time: to24(end),
      notes: "",
    };

    try {
      await authed("post", `${API}/bookings/`, payload);

      setShowModal(false);
      setShowMsg(true);

      setTimeout(() => setShowMsg(false), 3000);
    } catch {
      alert("Booking failed!");
    }
  };

  return (
    <div className="healthcare-container">
      <h2 className="healthcare-title">Health Care Services</h2>

      {/* ---------------- CARDS LIST ---------------- */}
      <div className="doctor-grid">
        {items.length === 0 ? (
          <p style={{ marginTop: 30 }}>❌ No Cardiologist Found</p>
        ) : (
          items.map((s) => (
            <div key={s.id} className="doctor-card">
              <div className="img-box">
                <img
                  src={`http://127.0.0.1:8000${s.provider_logo}`}
                  alt={s.title}
                />

                <div className="save-icon" onClick={() => toggleSave(s.id)}>
                  <img
                    src={saved[s.id] ? bookmarkFilled : bookmarkIcon}
                    alt=""
                  />
                </div>
              </div>

              <h3>{s.title}</h3>
              <p style={{ marginLeft: 12 }}>{s.provider_name}</p>

              <p style={{ margin: "0 12px" }}>₹ {s.price}</p>

              <p className="rating-distance">
                ⭐ {s.rating} |
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

      {/* ---------------- MODAL ---------------- */}
      {showModal && selected && (
        <div className="popup-overlay" onClick={() => setShowModal(false)}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <h3>Book {selected.title}</h3>

            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                fetchSlots(
                  selected.provider_id,
                  selected.service_id,
                  e.target.value
                );
              }}
            />

            {slots.length > 0 ? (
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
              >
                <option value="">Select time slot</option>
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

      {/* ---------------- SUCCESS MESSAGE ---------------- */}
      {showMsg && (
        <div className="toast-success">🔥 Booking Successful!</div>
      )}
    </div>
  );
}
