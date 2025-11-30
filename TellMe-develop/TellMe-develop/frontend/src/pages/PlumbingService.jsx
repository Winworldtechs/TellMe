import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "../styles/ServiceCard.css";

/* ICONS */
import bookmarkIcon from "../assets/icons/bookmark.png";
import bookmarkFilled from "../assets/icons/bookmarkFill.png";
import locationIcon from "../assets/icons/location.png";

/* API Base */
const API = "http://127.0.0.1:8000/api";

export default function PlumbingService() {
  const [service, setService] = useState(null);
  const [saved, setSaved] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showMsg, setShowMsg] = useState(false);

  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");

  const access = localStorage.getItem("access");
  const refresh = localStorage.getItem("refresh");

  /* ------------ Convert 12h → 24h ------------ */
  const to24 = (t) => {
    if (!t) return null;
    const [time, mer] = t.split(" ");
    let [h, m] = time.split(":");
    h = parseInt(h);

    if (mer === "PM" && h !== 12) h += 12;
    if (mer === "AM" && h === 12) h = 0;

    return `${String(h).padStart(2, "0")}:${m}:00`;
  };

  /* ------------ Token Refresh ------------ */
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

  /* ------------ Auth Request ------------ */
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

  /* ------------ Load Service From Backend (tap-repair) ------------ */
  const loadService = useCallback(async () => {
    try {
      const res = await axios.get(
        `${API}/services/providers/by-service/?slug=tap-repair`
      );

      if (res.data.results?.length > 0) {
        const s = res.data.results[0];

        const logo =
          s.provider?.logo ||
          s.provider_logo ||
          ""; // No fallback

        setService({
          id: s.id,
          provider_id: s.provider_id,
          title: s.title,
          provider_name: s.provider_name,
          provider_logo: logo,
          address: s.address,
          price: s.price,
          rating: 4.7,
          distance: "1.2 km away",
        });
      }
    } catch (err) {
      console.log("Load Service ERROR:", err);
    }
  }, []);

  useEffect(() => {
    loadService();
  }, [loadService]);

  /* ------------ Load Saved ------------ */
  const loadSaved = async () => {
    if (!access || !service) return;

    try {
      const res = await authedRequest(
        "get",
        `${API}/saved/profile/saved-services/`
      );

      setSaved(res.data.some((item) => item.service === service.id));
    } catch {}
  };

  useEffect(() => {
    loadSaved();
  }, [service]);

  /* ------------ Save Toggle ------------ */
  const toggleSave = async () => {
    if (!access) return alert("Please login first");

    try {
      await authedRequest("post", `${API}/saved/save-service/`, {
        service: service.id,
      });
      setSaved((prev) => !prev);
    } catch (err) {
      console.log("Save ERR:", err);
    }
  };

  /* ------------ Fetch Time Slots ------------ */
  const fetchSlots = async (provider_id, service_id, date) => {
    try {
      const res = await axios.get(
        `${API}/bookings/slots/?provider_id=${provider_id}&service_id=${service_id}&date=${date}`
      );
      setSlots(res.data.slots || []);
    } catch (err) {
      console.log("Slot ERROR:", err);
    }
  };

  /* ------------ Handle Booking ------------ */
  const handleBooking = async () => {
    if (!access) return alert("Please login");
    if (!date || !selectedSlot) return alert("Select date & time");

    const [start, end] = selectedSlot.split(" - ");

    const payload = {
      service: service.id,
      provider: service.provider_id,
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
      alert("Booking Failed");
      console.log("BOOK ERR:", err.response?.data);
    }
  };

  if (!service) return <h3 style={{ textAlign: "center" }}>Loading...</h3>;

  return (
    <div className="home-service-container">
      <h2>Plumbing – Tap Repair</h2>

      <div className="service-list">
        <div className="service-card">
          {/* -------- IMAGE (NO FALLBACK) -------- */}
          <div className="img-box">
            <img
              src={`http://127.0.0.1:8000${service.provider_logo}`}
              alt="provider"
            />

            <div className="save-icon" onClick={toggleSave}>
              <img
                src={saved ? bookmarkFilled : bookmarkIcon}
                className="bookmark-icon"
                alt=""
              />
            </div>
          </div>

          <div className="service-details">
            <h3>{service.title}</h3>
            <p className="company">{service.provider_name}</p>

            <p className="service-price">₹ {service.price}</p>

            <div className="rating">⭐ {service.rating}</div>

            <div className="location">
              <img src={locationIcon} alt="" /> {service.address}
            </div>
          </div>

          <button
            className="book-btn"
            onClick={() => {
              setShowModal(true);
              setSelectedSlot("");
              setDate("");
              setSlots([]);
            }}
          >
            Book Now
          </button>
        </div>
      </div>

      {/* -------- MODAL -------- */}
      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Book {service.title}</h3>

            <input
              type="date"
              value={date}
              onChange={(e) => {
                const d = e.target.value;
                setDate(d);
                fetchSlots(service.provider_id, service.id, d);
              }}
            />

            {slots.length > 0 ? (
              <select
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
              >
                <option value="">Select Time Slot</option>

                {slots.map((slot, i) => (
                  <option key={i}>{slot.label}</option>
                ))}
              </select>
            ) : (
              <p>Select a date to load slots</p>
            )}

            <button className="checkout-btn" onClick={handleBooking}>
              Confirm Booking
            </button>

            <button
              className="close-btn"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showMsg && <div className="toast-success">✅ Booking Successful!</div>}
    </div>
  );
}
