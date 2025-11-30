import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "../styles/ServiceCard.css";

/* ICONS */
import bookmarkIcon from "../assets/icons/bookmark.png";
import bookmarkFilled from "../assets/icons/bookmarkFill.png";
import locationIcon from "../assets/icons/location.png";

/* === API BASE === */
const API = "http://127.0.0.1:8000/api";

export default function CarWash() {
  const [items, setItems] = useState([]);
  const [saved, setSaved] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [slots, setSlots] = useState([]);

  const access = localStorage.getItem("access");
  const refresh = localStorage.getItem("refresh");

  /* === Convert AM–PM → 24hr === */
  const to24 = (t) => {
    if (!t) return null;
    const [time, mer] = t.split(" ");
    let [h, m] = time.split(":");
    h = parseInt(h);
    if (mer === "PM" && h !== 12) h += 12;
    if (mer === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${m}:00`;
  };

  /* === Refresh Token === */
  const refreshAccessToken = async () => {
    if (!refresh) return null;
    try {
      const res = await axios.post(`${API}/accounts/refresh/`, { refresh });
      const newAccess = res.data.access;
      localStorage.setItem("access", newAccess);
      return newAccess;
    } catch (err) {
      console.error("Token Refresh Failed:", err.response?.data);
      localStorage.clear();
      alert("Session expired. Please login again.");
      return null;
    }
  };

  /* === Authenticated Request === */
  const authedRequest = async (method, url, data = null) => {
    let token = localStorage.getItem("access");
    try {
      const res = await axios({
        method,
        url,
        data,
        headers: { Authorization: `Bearer ${token}` },
      });
      return res;
    } catch (err) {
      if (err.response?.status === 401 && refresh) {
        const newToken = await refreshAccessToken();
        if (!newToken) throw err;
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

  /* === Load Car Wash Providers === */
  const loadService = useCallback(async () => {
    try {
      const res = await axios.get(
        `${API}/services/providers/by-service/?slug=car-wash`
      );

      const services = Array.isArray(res.data.results)
        ? res.data.results
        : res.data;

      const formatted = services.map((s) => ({
        id: s.id,
        service_id: s.id,
        provider_id: s.provider_id,
        service_title: s.title,
        name: s.provider_name,
        address: s.address,
        provider_logo: s.provider_logo, // backend से सही path आता है
        price: s.price,
        rating: s.rating || 4.5,
      }));

      setItems(formatted);
    } catch (err) {
      console.log("Service Load Error:", err.message);
      setItems([]);
    }
  }, []);

  /* === Load Saved Services === */
  const loadSaved = useCallback(async () => {
    if (!access) return;
    try {
      const res = await authedRequest(
        "get",
        `${API}/saved/profile/saved-services/`
      );
      const obj = {};
      res.data?.forEach((v) => {
        obj[v.service] = true;
      });
      setSaved(obj);
    } catch (err) {
      console.log("Saved Load Error:", err.message);
    }
  }, [access]);

  useEffect(() => {
    loadService();
    loadSaved();
  }, [loadService, loadSaved]);

  /* === Toggle Save === */
  const toggleSave = async (sid) => {
    if (!access) return alert("Please login first.");
    try {
      await authedRequest("post", `${API}/saved/save-service/`, { service: sid });
      setSaved((prev) => ({ ...prev, [sid]: !prev[sid] }));
    } catch (err) {
      console.log("Save Error:", err.message);
    }
  };

  /* === Fetch Available Slots === */
  const fetchAvailableSlots = async (provider_id, service_id, dateVal) => {
    setSlots([]);
    if (!provider_id || !service_id || !dateVal) return;

    try {
      const res = await axios.get(
        `${API}/bookings/slots/?provider_id=${provider_id}&service_id=${service_id}&date=${dateVal}`
      );

      setSlots(res.data?.slots || []);
    } catch (err) {
      console.log("Slot Fetch Error:", err.response?.data || err.message);
      setSlots([]);
    }
  };

  /* === Handle Booking === */
  const handleBooking = async () => {
    if (!access) return alert("Please login first.");
    if (!date || !timeSlot) return alert("Select date & slot.");

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
      alert("Booking Successful!");
      setShowModal(false);
    } catch (err) {
      console.log("Booking Error:", err.response?.data);
      alert("Booking Failed!");
    }
  };

  return (
    <div className="home-service-container">
      <h2>Car Wash</h2>

      <div className="service-list">
        {items.length === 0 ? (
          <p>No Car Wash Vendors Found</p>
        ) : (
          items.map((s) => (
            <div key={s.id} className="service-card">
              <div className="img-box">
                <img
                  src={`http://127.0.0.1:8000${s.provider_logo}`}
                  alt={s.name}
                  onError={(e) => (e.target.src = "/default.jpg")}
                />
                <div className="save-icon" onClick={() => toggleSave(s.id)}>
                  <img
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
                  <img src={locationIcon} alt="loc" /> {s.address}
                </div>
              </div>

              <button
                className="book-btn"
                onClick={() => {
                  setSelected(s);
                  setShowModal(true);
                }}
              >
                Book Now
              </button>
            </div>
          ))
        )}
      </div>

      {/* === BOOKING MODAL === */}
      {showModal && selected && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Book {selected.service_title}</h3>

            <input
              type="date"
              value={date}
              onChange={(e) => {
                const val = e.target.value;
                setDate(val);
                fetchAvailableSlots(selected.provider_id, selected.service_id, val);
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
              <p style={{ color: "#777" }}>Select a date to view slots.</p>
            )}

            <button className="checkout-btn" onClick={handleBooking}>
              Confirm Booking
            </button>
            <button
              className="close-btn"
              onClick={() => setShowModal(false)}
              style={{ marginTop: 8 }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
