import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "../styles/ServiceCard.css";

/* ICONS */
import bookmarkIcon from "../assets/icons/bookmark.png";
import bookmarkFilled from "../assets/icons/bookmarkFill.png";
import locationIcon from "../assets/icons/location.png";

/* API Base */
const API = "http://127.0.0.1:8000/api";

export default function InstallationService() {
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

  /* ========= TIME CONVERT 12hr ➝ 24hr ========== */
  const to24 = (t) => {
    let [time, mer] = t.split(" ");
    let [h, m] = time.split(":");
    h = parseInt(h);

    if (mer === "PM" && h !== 12) h += 12;
    if (mer === "AM" && h === 12) h = 0;

    return `${String(h).padStart(2, "0")}:${m}:00`;
  };

  /* ========= REFRESH TOKEN ========== */
  const refreshAccessToken = async () => {
    try {
      const res = await axios.post(`${API}/accounts/refresh/`, { refresh });
      localStorage.setItem("access", res.data.access);
      return res.data.access;
    } catch {
      return null;
    }
  };

  /* ========= AUTH REQUEST ========== */
  const authedRequest = async (method, url, data = null) => {
    let token = localStorage.getItem("access");

    try {
      return await axios({
        method,
        url,
        data,
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      if (err.response?.status === 401) {
        const newToken = await refreshAccessToken();
        if (!newToken) return;
        return axios({
          method,
          url,
          data,
          headers: { Authorization: `Bearer ${newToken}` },
        });
      }
      throw err;
    }
  };

  /* ========= LOAD CCTV SERVICES ========== */
  const loadService = useCallback(async () => {
    try {
      const res = await axios.get(
        `${API}/services/providers/by-service/?slug=home-security-cctv`
      );

      const data = Array.isArray(res.data.results)
        ? res.data.results
        : res.data;

      const formatted = data.map((s) => ({
        id: s.id,
        service_id: s.id,
        provider_id: s.provider_id,
        title: s.title,
        price: s.price,
        provider_name: s.provider_name,
        provider_logo: s.provider_logo,
        address: s.address,
        rating: 4.8,
      }));

      setItems(formatted);
    } catch (err) {
      console.log("CCTV Load Error:", err.message);
    }
  }, []);

  /* ========= LOAD SAVED SERVICES ========== */
  const loadSaved = useCallback(async () => {
    if (!access) return;
    try {
      const res = await authedRequest(
        "get",
        `${API}/saved/profile/saved-services/`
      );

      const savedMap = {};
      res.data?.forEach((v) => (savedMap[v.service] = true));
      setSaved(savedMap);
    } catch {
      console.log("Saved Load Error");
    }
  }, [access]);

  useEffect(() => {
    loadService();
    loadSaved();
  }, [loadService, loadSaved]);

  /* ========= SAVE / UNSAVE ========== */
  const toggleSave = async (sid) => {
    if (!access) return alert("Please login first.");

    try {
      await authedRequest("post", `${API}/saved/save-service/`, {
        service: sid,
      });

      setSaved((prev) => ({ ...prev, [sid]: !prev[sid] }));
    } catch (err) {
      console.log("Save Error:", err.message);
    }
  };

  /* ========= FETCH SLOTS ========== */
  const fetchAvailableSlots = async (provider_id, service_id, d) => {
    try {
      const res = await axios.get(
        `${API}/bookings/slots/?provider_id=${provider_id}&service_id=${service_id}&date=${d}`
      );

      setSlots(res.data.slots || []);
    } catch (err) {
      console.log("Slot Error:", err);
    }
  };

  /* ========= BOOK SERVICE ========== */
  const handleBooking = async () => {
    if (!access) return alert("Please login");
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
      await authedRequest("post", `${API}/bookings/`, payload);

      setShowModal(false);
      setShowMsg(true);
      setTimeout(() => setShowMsg(false), 3000);
    } catch (err) {
      console.log("Booking Error:", err.response?.data);
      alert("Booking Failed!");
    }
  };

  return (
    <div className="home-service-container">
      <h2>CCTV & Security Installation</h2>

      <div className="service-list">
        {items.length === 0 ? (
          <p>No CCTV Installation Services Found</p>
        ) : (
          items.map((s) => (
            <div key={s.id} className="service-card">
              {/* IMAGE */}
              <div className="img-box">
                <img
                  src={`http://127.0.0.1:8000${s.provider_logo}`}
                  alt={s.title}
                />

                {/* Save Icon */}
                <div className="save-icon" onClick={() => toggleSave(s.id)}>
                  <img
                    src={saved[s.id] ? bookmarkFilled : bookmarkIcon}
                    alt="save"
                  />
                </div>
              </div>

              {/* DETAILS */}
              <div className="service-details">
                <h3>{s.title}</h3>
                <p className="company">{s.provider_name}</p>

                <p className="service-price">₹ {s.price}</p>

                <div className="rating">⭐ {s.rating}</div>

                <div className="location">
                  <img src={locationIcon} alt="" />
                  {s.address}
                </div>

                
              </div>

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
                Book Now
              </button>
            </div>
          ))
        )}
      </div>

      {/* ========= MODAL ========= */}
      {showModal && selected && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Book {selected.title}</h3>

            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                fetchAvailableSlots(
                  selected.provider_id,
                  selected.service_id,
                  e.target.value
                );
              }}
            />

            {/* Time slots */}
            {slots.length > 0 ? (
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
              >
                <option value="">Select Time Slot</option>
                {slots.map((slot, i) => (
                  <option key={i} value={slot.label}>
                    {slot.label}
                  </option>
                ))}
              </select>
            ) : (
              <p style={{ color: "#555" }}>Select date to view slots</p>
            )}

            <button className="checkout-btn" onClick={handleBooking}>
              Confirm Booking
            </button>

            <button className="close-btn" onClick={() => setShowModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* SUCCESS MESSAGE */}
      {showMsg && (
        <div className="toast-success">🔥 Booking Successful!</div>
      )}
    </div>
  );
}
