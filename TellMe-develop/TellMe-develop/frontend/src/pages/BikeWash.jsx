import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "../styles/ServiceCard.css";

/* ICONS */
import bookmarkIcon from "../assets/icons/bookmark.png";
import bookmarkFilled from "../assets/icons/bookmarkFill.png";
import locationIcon from "../assets/icons/location.png";

/* API Base */
const API = "http://127.0.0.1:8000/api";

export default function BikeWash() {
  const [items, setItems] = useState([]);
  const [saved, setSaved] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [slots, setSlots] = useState([]);

  const [showMsg, setShowMsg] = useState(false); // SUCCESS MESSAGE

  const access = localStorage.getItem("access");
  const refresh = localStorage.getItem("refresh");

  /* ---------- Convert 12hr → 24hr ---------- */
  const to24 = (t) => {
    if (!t) return null;
    const [time, mer] = t.split(" ");
    let [h, m] = time.split(":");
    h = parseInt(h);
    if (mer === "PM" && h !== 12) h += 12;
    if (mer === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${m}:00`;
  };

  /* ---------- Token Refresh ---------- */
  const refreshAccessToken = async () => {
    if (!refresh) return null;
    try {
      const res = await axios.post(`${API}/accounts/refresh/`, { refresh });
      const newAccess = res.data.access;
      localStorage.setItem("access", newAccess);
      return newAccess;
    } catch {
      return null;
    }
  };

  /* ---------- Authenticated Request ---------- */
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
        return await axios({
          method,
          url,
          data,
          headers: { Authorization: `Bearer ${newToken}` },
        });
      }
      throw err;
    }
  };

  /* ---------- Load Bike Wash Vendors ---------- */
  const loadService = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/services/providers/by-service/?slug=bike-wash`);

      const services = Array.isArray(res.data.results)
        ? res.data.results
        : res.data;

      const formatted = services.map((s) => ({
        id: s.id,
        service_id: s.id,
        provider_id: s.provider_id,
        service_title: s.title,
        name: s.provider?.name || s.provider_name,
        address: s.provider?.address || s.address,
        provider_logo: s.provider?.logo || s.provider_logo,
        price: s.price,
        rating: 4.7,
      }));

      setItems(formatted);
    } catch (err) {
      console.log("Bike Wash Load Error:", err.message);
    }
  }, []);

  /* ---------- Load Saved Services ---------- */
  const loadSaved = useCallback(async () => {
    if (!access) return;
    try {
      const res = await authedRequest("get", `${API}/saved/profile/saved-services/`);
      const obj = {};
      res.data?.forEach((v) => (obj[v.service] = true));
      setSaved(obj);
    } catch {
      console.log("Saved Load Error");
    }
  }, [access]);

  useEffect(() => {
    loadService();
    loadSaved();
  }, [loadService, loadSaved]);

  /* ---------- Save / Unsave ---------- */
  const toggleSave = async (sid) => {
    if (!access) return alert("Please login first.");
    try {
      await authedRequest("post", `${API}/saved/save-service/`, { service: sid });
      setSaved((prev) => ({ ...prev, [sid]: !prev[sid] }));
    } catch (err) {
      console.log("Save error");
    }
  };

  /* ---------- Fetch Available Slots ---------- */
  const fetchAvailableSlots = async (provider_id, service_id, dateVal) => {
    if (!provider_id || !service_id || !dateVal) return;

    try {
      const res = await axios.get(
        `${API}/bookings/slots/?provider_id=${provider_id}&service_id=${service_id}&date=${dateVal}`
      );
      setSlots(res.data.slots || []);
    } catch (err) {
      console.log("Slot error:", err);
    }
  };

  /* ---------- Booking ---------- */
  const handleBooking = async () => {
    if (!access) return alert("Please login");
    if (!date || !timeSlot) return alert("Select date & time");

    const [start, end] = timeSlot.split(" - ");

    const payload = {
      service: selected.service_id,
      date,
      start_time: to24(start),
      end_time: to24(end),
      notes: "",
    };

    try {
      await authedRequest("post", `${API}/bookings/`, payload);

      setShowModal(false);

      // SUCCESS SCREEN
      setShowMsg(true);
      setTimeout(() => setShowMsg(false), 3000);
    } catch (err) {
      console.log("Booking ERR:", err.response?.data);
      alert("Booking Failed!");
    }
  };

  return (
    <div className="home-service-container">
      <h2>Bike Wash</h2>

      <div className="service-list">
        {items.length === 0 ? (
          <p>No Bike Wash Vendors Found</p>
        ) : (
          items.map((s) => (
            <div key={s.id} className="service-card">

              <div className="img-box">
                <img
                  src={`http://127.0.0.1:8000${s.provider_logo}`}
                  alt={s.name}
                  onError={(e) => (e.target.src = "/noimage.png")}
                />

                <div className="save-icon" onClick={() => toggleSave(s.id)}>
                  <img
                    className="bookmark-icon"
                    src={saved[s.id] ? bookmarkFilled : bookmarkIcon}
                    alt="save"
                  />
                </div>
              </div>

              <div className="service-details">
                <h3>{s.service_title}</h3>
                <p className="company">{s.name}</p>
                <p className="service-price">₹ {s.price}</p>
                <div className="rating">⭐ {s.rating}</div>
                <div className="location">
                  <img src={locationIcon} alt="" /> {s.address}
                </div>
                
              </div>

              <button
                className="book-btn"
                onClick={() => {
                  setSelected(s);
                  setSlots([]);
                  setDate("");
                  setTimeSlot("");
                  setShowModal(true);
                }}
              >
                Book Now
              </button>
            </div>
          ))
        )}
      </div>

      {/* ---------- BOOKING MODAL ---------- */}
      {showModal && selected && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Book {selected.service_title}</h3>

            <input
              type="date"
              value={date}
              onChange={(e) => {
                const newDate = e.target.value;
                setDate(newDate);
                fetchAvailableSlots(selected.provider_id, selected.service_id, newDate);
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
              <p style={{ color: "#555" }}>Select date to see slots</p>
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

      {/* ---------- SUCCESS MESSAGE ---------- */}
      {showMsg && (
        <div className="toast-success">✅ Booking request submitted!</div>
      )}
    </div>
  );
}
