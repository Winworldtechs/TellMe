import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/ServiceCard.css";

import locationIcon from "../assets/icons/location.png";
import bookmarkIcon from "../assets/icons/bookmark.png";
import bookmarkFilled from "../assets/icons/bookmarkFill.png";
import gymTrainer from "../assets/images/gym.png";
import yogaTrainer from "../assets/images/yoga.png";

export default function Trainer() {
  const API = "http://127.0.0.1:8000/api";
  const token = localStorage.getItem("access");

  const [gymTrainers, setGymTrainers] = useState([]);
  const [yogaTrainers, setYogaTrainers] = useState([]);
  const [savedList, setSavedList] = useState({});

  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");

  // ---------------- FETCH TRAINERS FROM BACKEND ----------------
  useEffect(() => {
    loadGymTrainers();
    loadYogaTrainers();
    loadSaved();
  }, []);

  const loadGymTrainers = async () => {
    try {
      const res = await axios.get(`${API}/services/providers/by-service/?slug=gym-trainer`);
      setGymTrainers(res.data.results);
    } catch (err) {
      console.log("Gym Trainer Error:", err);
    }
  };

  const loadYogaTrainers = async () => {
    try {
      const res = await axios.get(`${API}/services/providers/by-service/?slug=yoga-trainer`);
      setYogaTrainers(res.data.results);
    } catch (err) {
      console.log("Yoga Trainer Error:", err);
    }
  };

  // ---------------- LOAD SAVED ----------------
  const loadSaved = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API}/saved/profile/saved-services/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const map = {};
      res.data.forEach((s) => (map[s.service] = true));
      setSavedList(map);
    } catch (err) {
      console.log("Save Load ERR:", err);
    }
  };

  const toggleSave = async (sid) => {
    if (!token) return alert("Please login");
    try {
      const res = await axios.post(
        `${API}/saved/save-service/`,
        { service: sid },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSavedList((prev) => ({ ...prev, [sid]: res.data.saved }));
    } catch {}
  };

  // ---------------- FETCH SLOTS ----------------
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

  const convertTime = (t) => {
    let [time, mer] = t.split(" ");
    let [h, m] = time.split(":");
    h = parseInt(h);
    if (mer === "PM" && h !== 12) h += 12;
    if (mer === "AM" && h === 12) h = 0;
    return `${h.toString().padStart(2, "0")}:${m}:00`;
  };

  const bookNow = async () => {
    if (!token) return alert("Login required");
    if (!date || !selectedSlot) return alert("Select date & time");

    const [start, end] = selectedSlot.split(" - ");

    const payload = {
      service: selected.id,
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
      console.log("Booking error:", err?.response?.data);
    }
  };

  return (
    <div className="home-service-container">
      <h2>Trainer Services</h2>

      {/* ---------------- GYM TRAINER ---------------- */}
      <h3>Gym Trainer</h3>
      <div className="service-list">
        {gymTrainers.length === 0 ? (
          <p>No gym trainers available</p>
        ) : (
          gymTrainers.map((s) => (
            <div className="service-card" key={s.id}>
              <div className="img-box">
                <img src={gymTrainer} alt="" />
                <div className="save-icon" onClick={() => toggleSave(s.id)}>
                  <img
                    src={savedList[s.id] ? bookmarkFilled : bookmarkIcon}
                    alt="save"
                  />
                </div>
              </div>

              <div className="service-details">
                <h3>{s.title}</h3>
                <p className="company">{s.provider_name}</p>
                <div className="rating">⭐ 4.8</div>
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
                }}
              >
                Book Trainer
              </button>
            </div>
          ))
        )}
      </div>

      {/* ---------------- YOGA TRAINER ---------------- */}
      <h3>Yoga Trainer</h3>
      <div className="service-list">
        {yogaTrainers.length === 0 ? (
          <p>No yoga trainers available</p>
        ) : (
          yogaTrainers.map((s) => (
            <div className="service-card" key={s.id}>
              <div className="img-box">
                <img src={yogaTrainer} alt="" />
                <div className="save-icon" onClick={() => toggleSave(s.id)}>
                  <img
                    src={savedList[s.id] ? bookmarkFilled : bookmarkIcon}
                    alt="save"
                  />
                </div>
              </div>

              <div className="service-details">
                <h3>{s.title}</h3>
                <p className="company">{s.provider_name}</p>
                <div className="rating">⭐ 4.8</div>
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
                }}
              >
                Book Trainer
              </button>
            </div>
          ))
        )}
      </div>

      {/* ---------------- MODAL ---------------- */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Book {selected.title}</h3>

            <input
              type="date"
              onChange={(e) => {
                setDate(e.target.value);
                fetchSlots(selected.provider_id, selected.id, e.target.value);
              }}
            />

            {slots.length > 0 ? (
              <select onChange={(e) => setSelectedSlot(e.target.value)}>
                <option>Select Time</option>
                {slots.map((slot, i) => (
                  <option key={i}>{slot.label}</option>
                ))}
              </select>
            ) : (
              <p>Select a date to load slots</p>
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
