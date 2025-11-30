import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/ServiceCard.css";

import bookmarkFilled from "../assets/icons/bookmarkFill.png";
import locationIcon from "../assets/icons/location.png";

export default function Saved() {
  const [items, setItems] = useState([]);

  const access = () => localStorage.getItem("access");
  const refresh = () => localStorage.getItem("refresh");

  /* 🔄 Refresh token */
  const refreshAccess = async () => {
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/accounts/refresh/",
        { refresh: refresh() }
      );
      localStorage.setItem("access", res.data.access);
      return res.data.access;
    } catch {
      return null;
    }
  };

  /* ✅ Wrapper for authorized calls */
  const authed = async (url, method = "GET", body = null, retry = true) => {
    let token = access();
    try {
      return await axios({
        url,
        method,
        data: body,
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      if (err?.response?.status === 401 && retry) {
        const newToken = await refreshAccess();
        if (!newToken) {
          alert("Session expired. Login again");
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          window.location.href = "/login";
          return;
        }
        return authed(url, method, body, false);
      }
      throw err;
    }
  };

  /* ✅ Load saved list */
  const loadSaved = async () => {
    try {
      const res = await authed(
        "http://127.0.0.1:8000/api/saved/profile/saved-services/",
        "GET"
      );
      setItems(res.data);
    } catch (e) {
      console.log("❌ load error", e);
    }
  };

  /* ✅ Toggle Save (Remove) */
  const toggleSave = async (serviceId) => {
    try {
      await authed(
        "http://127.0.0.1:8000/api/saved/save-service/",
        "POST",
        { service: serviceId }
      );

      // ✅ Remove immediately from view
      setItems((prev) => prev.filter((x) => x.service_id !== serviceId));
    } catch (err) {
      console.log("❌ toggle save err", err?.response?.data || err);
    }
  };

  useEffect(() => {
    loadSaved();
  }, []);

  return (
    <div className="home-service-container">
      <h2>Saved Services</h2>

      {items.length === 0 ? (
        <p>No saved services.</p>
      ) : (
        <div className="service-list">
          {items.map((s) => (
            <div key={s.service_id} className="service-card">

              {/* ✅ IMAGE + save icon */}
              <div className="img-box">
                <img src={s.image} alt={s.name} />

                <div className="save-icon" onClick={() => toggleSave(s.service_id)}>
                  <img
                    src={bookmarkFilled}
                    alt="saved"
                    className="bookmark-icon"
                  />
                </div>
              </div>

              <div className="service-details">
                <h3>{s.name}</h3>

                {s.company && <p className="company">{s.company}</p>}
                {s.rating && <div className="rating">⭐ {s.rating}</div>}

                {s.distance && (
                  <div className="location">
                    <img src={locationIcon} alt="location" /> {s.distance}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
