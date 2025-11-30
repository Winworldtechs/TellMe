import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "../styles/ServiceCard.css";

/* ICONS */
import bookmarkIcon from "../assets/icons/bookmark.png";
import bookmarkFilled from "../assets/icons/bookmarkFill.png";
import locationIcon from "../assets/icons/location.png";

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

  /* Convert 12hr → 24hr */
  const to24 = (t) => {
    let [time, mer] = t.split(" ");
    let [h, m] = time.split(":");
    h = parseInt(h);

    if (mer === "PM" && h !== 12) h += 12;
    if (mer === "AM" && h === 12) h = 0;

    return `${String(h).padStart(2, "0")}:${m}:00`;
  };

  /* Refresh token */
  const refreshAccessToken = async () => {
    try {
      const res = await axios.post(`${API}/accounts/refresh/`, { refresh });
      localStorage.setItem("access", res.data.access);
      return res.data.access;
    } catch {
      return null;
    }
  };

  /* Auth Request Wrapper */
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

  /* LOAD CCTV SERVICES */
  const loadService = useCallback(async () => {
    try {
      const res = await axios.get(
        `${API}/services/providers/by-service/?slug=home-security-cctv`
      );

      const services = Array.isArray(res.data.results)
        ? res.data.results
        : res.data;

      const formatted = services.map((s) => ({
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

  /* Load saved services */
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

  /* Save toggle */
  const toggleSave = async (sid) => {
    if (!access) return alert("Please login");

    try {
      await authedRequest("post", `${API}/saved/save-service/`, {
        service: sid,
      });

      setSaved((prev) => ({ ...prev, [sid]: !prev[sid] }));
    } catch {
      console.log("Save Error");
    }
  };

  /* Fetch slots */
  const fetchAvailableSlots = async (pid, sid, d) => {
    try {
      const res = await axios.get(
        `${API}/bookings/slots/?provider_id=${pid}&service_id=${sid}&date=${d}`
      );

      setSlots(res.data.slots || []);
    } catch (err) {
      console.log("Slot Error:", err);
    }
  };

  /* Booking */
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
      alert("Booking failed");
    }
  };

  return (
    <div className="home-service-container">
      <h2>CCTV & Security Installation</h2>

      <div className="service-list">
        {items.map((s) => (
          <div className="service-card" key={s.id}>
            <div className="img-box">
              <img src={`http://127.0.0.1:8000${s.provider_logo}`} alt={s.title} />

              <div className="save-icon" onClick={() => toggleSave(s.id)}>
                <img src={saved[s.id] ? bookmarkFilled : bookmarkIcon} alt="save" />
              </div>
            </div>

            <div className="service-details">
              <h3>{s.title}</h3>
              <p className="company">{s.provider_name}</p>

              <div className="rating">⭐ {s.rating}</div>

              <div className="location">
                <img src={locationIcon} alt="loc" /> {s.address}
              </div>

              <p className="service-price">₹ {s.price}</p>
            </div>

            <button
              className="book-btn"
              onClick={() => {
                setSelected(s);
                setTimeSlot("");
                setDate("");
                setShowModal(true);
              }}
            >
              Book Now
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
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

      {showMsg && (
        <div className="toast-success">✅ Booking Successful!</div>
      )}
    </div>
  );
}
