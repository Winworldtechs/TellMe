import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../styles/ServiceCard.css"; 

import locationIcon from "../assets/icons/location.png";
import bookmarkIcon from "../assets/icons/bookmark.png";
import bookmarkFilled from "../assets/icons/bookmarkFill.png";
import placeholderImg from "../assets/images/Frame 27.png";

const API_BASE = "http://127.0.0.1:8000"; 
const API = `${API_BASE}/api`;

export default function ApplianceRepair() {
  const { service } = useParams(); 

  const tokenKey = "access";
  const refreshKey = "refresh";

  const [vendors, setVendors] = useState([]);
  const [savedMap, setSavedMap] = useState({});
  const [loading, setLoading] = useState(true);

  // Booking modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlotValue, setSelectedSlotValue] = useState(""); 
  const [toast, setToast] = useState("");

  
  const fullImageUrl = (path) => {
    if (!path) return placeholderImg;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
   
    return `${API_BASE}${path}`;
  };

  // Token refresh helper
  const refreshAccessToken = async () => {
    const refresh = localStorage.getItem(refreshKey);
    if (!refresh) return null;
    try {
      const res = await axios.post(`${API}/accounts/refresh/`, { refresh });
      const newAccess = res.data.access;
      localStorage.setItem(tokenKey, newAccess);
      return newAccess;
    } catch (err) {
      console.error("Refresh failed", err?.response?.data || err.message);
      return null;
    }
  };

  // Authed request with retry on 401
  const authedRequest = useCallback(
    async (opts) => {
      // opts: { method, url, data, headers }
      let token = localStorage.getItem(tokenKey);
      try {
        const res = await axios({
          ...opts,
          headers: { ...(opts.headers || {}), Authorization: token ? `Bearer ${token}` : undefined },
        });
        return res;
      } catch (err) {
        if (err.response?.status === 401) {
          const newToken = await refreshAccessToken();
          if (!newToken) throw err;
          // retry
          const res = await axios({
            ...opts,
            headers: { ...(opts.headers || {}), Authorization: `Bearer ${newToken}` },
          });
          return res;
        }
        throw err;
      }
    },
    []
  );

  // Load vendors for current service slug
  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/services/providers/by-service/?slug=${service}`);
      const items = (res.data?.results || []).map((x) => ({
        id: x.id,
        title: x.title || x.service_title || x.name,
        price: x.price,
        provider_id: x.provider_id ?? x.provider?.id ?? x.provider_id,
        provider_name: x.provider_name ?? x.provider?.name ?? x.provider_name,
        provider_logo: fullImageUrl(x.provider_logo ?? x.provider?.logo ?? x.provider_logo),
        address: x.address ?? (x.provider && x.provider.address) ?? "",
        raw: x, // keep original object
      }));
      setVendors(items);
    } catch (err) {
      console.error("Failed to load vendors:", err?.response?.data || err.message);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Load saved services for logged-in user
  const loadSaved = useCallback(async () => {
    const access = localStorage.getItem(tokenKey);
    if (!access) {
      setSavedMap({});
      return;
    }
    try {
      const res = await authedRequest({ method: "get", url: `${API}/saved/profile/saved-services/` });
      // res.data likely an array with objects like { service: <id>, ... }
      const map = {};
      (res.data || []).forEach((s) => {
        if (s.service != null) map[s.service] = true;
      });
      setSavedMap(map);
    } catch (err) {
      console.log("Saved load error", err?.response?.data || err.message);
    }
  }, [authedRequest]);

  useEffect(() => {
    fetchVendors();
    loadSaved();
  }, [fetchVendors, loadSaved, service]);

  // Toggle save / unsave
  const toggleSave = async (serviceId) => {
    const access = localStorage.getItem(tokenKey);
    if (!access) return alert("Please login to save services.");
    // optimistic UI
    setSavedMap((p) => ({ ...p, [serviceId]: !p[serviceId] }));
    try {
      const res = await authedRequest({
        method: "post",
        url: `${API}/saved/save-service/`,
        data: { service: serviceId },
        headers: { "Content-Type": "application/json" },
      });
      // backend returns { saved: true/false }
      const savedVal = res.data?.saved;
      setSavedMap((p) => ({ ...p, [serviceId]: Boolean(savedVal) }));
    } catch (err) {
      console.error("Save error", err?.response?.data || err.message);
      // revert
      setSavedMap((p) => ({ ...p, [serviceId]: !p[serviceId] }));
      alert("Could not update saved status.");
    }
  };

  // Fetch available slots for provider + service + date
  const fetchSlots = async (provider_id, service_id, targetDate) => {
    setSlots([]);
    if (!provider_id || !service_id || !targetDate) return;
    try {
      const res = await axios.get(
        `${API}/bookings/slots/?provider_id=${provider_id}&service_id=${service_id}&date=${targetDate}`
      );
      // normalize slots to objects { label, start_time, end_time }
      const rawSlots = res.data?.slots || [];
      const normalized = rawSlots.map((s) => {
        const label = s.label ?? `${s.start_time ?? ""} - ${s.end_time ?? ""}`;
        const start_time = s.start_time ?? s.start ?? (s.start_time_str ?? null);
        const end_time = s.end_time ?? s.end ?? (s.end_time_str ?? null);
        return { label, start_time, end_time };
      });
      setSlots(normalized);
    } catch (err) {
      console.error("Slot fetch error", err?.response?.data || err.message);
      setSlots([]);
    }
  };

  // Open booking modal for vendor
  const openBooking = (vendor) => {
    setSelectedVendor(vendor);
    setDate("");
    setSlots([]);
    setSelectedSlotValue("");
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedVendor(null);
    setDate("");
    setSlots([]);
    setSelectedSlotValue("");
  };

  // Convert selectedSlotValue (JSON string) to payload times
  const parseSelectedSlot = (val) => {
    if (!val) return null;
    try {
      const obj = JSON.parse(val);
      return { start_time: obj.start_time, end_time: obj.end_time, label: obj.label };
    } catch {
      // not JSON, maybe the backend returned label only; try to split on " - "
      const parts = val.split(" - ");
      if (parts.length >= 2) return { start_time: parts[0].trim(), end_time: parts[1].trim(), label: val };
      return { start_time: val, end_time: val, label: val };
    }
  };

  // Book slot
  const handleBooking = async () => {
    const access = localStorage.getItem(tokenKey);
    if (!access) return alert("Please login to book.");
    if (!selectedVendor) return alert("No vendor selected.");
    if (!date) return alert("Select a date.");
    if (!selectedSlotValue) return alert("Select a time slot.");

    const slot = parseSelectedSlot(selectedSlotValue);
    if (!slot || !slot.start_time || !slot.end_time) {
      return alert("Invalid slot selected.");
    }

    const payload = {
      service: selectedVendor.id,
      provider: selectedVendor.provider_id,
      date,
      start_time: slot.start_time,
      end_time: slot.end_time,
      notes: "",
    };

    try {
      await authedRequest({
        method: "post",
        url: `${API}/bookings/`,
        data: payload,
        headers: { "Content-Type": "application/json" },
      });

      setToast("Booking successful!");
      setTimeout(() => setToast(""), 3000);
      closeModal();
      // refresh slots for same date (so booked slot disappears)
      fetchSlots(selectedVendor.provider_id, selectedVendor.id, date);
    } catch (err) {
      console.error("Booking failed", err?.response?.data || err.message);
      const respData = err?.response?.data || {};
      const providerProblem =
        err?.response?.status === 400 &&
        (respData.provider || (String(respData.detail || "").toLowerCase().includes("provider")));
      if (providerProblem) {
        try {
          const payload2 = { ...payload };
          delete payload2.provider;
          await authedRequest({
            method: "post",
            url: `${API}/bookings/`,
            data: payload2,
            headers: { "Content-Type": "application/json" },
          });
          setToast("Booking successful (without provider)!");
          setTimeout(() => setToast(""), 3000);
          closeModal();
          return;
        } catch (err2) {
          console.error("Booking fallback failed", err2?.response?.data || err2.message);
        }
      }
      alert("Booking failed. See console for details.");
    }
  };

  // UI render helpers
  const vendorCard = (v) => (
    <div className="service-card" key={v.id} style={{ minWidth: 240 }}>
      <div className="img-box">
        <img
          src={v.provider_logo || placeholderImg}
          alt={v.provider_name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = placeholderImg;
          }}
        />
        <div className="save-icon" onClick={() => toggleSave(v.id)}>
          <img src={savedMap[v.id] ? bookmarkFilled : bookmarkIcon} alt="save" />
        </div>
      </div>

      <div className="service-details">
        <h3>{v.title}</h3>
        <p className="company">{v.provider_name}</p>
         <p className="service-price">₹ {v.price}</p>
        <div className="rating">⭐ 4.8</div>
        <div className="location">
          <img src={locationIcon} alt="loc" /> {v.address}
        </div>
       
      </div>

      <button
        className="book-btn"
        onClick={() => openBooking(v)}
      >
        Book Now
      </button>
    </div>
  );

  return (
    <div className="home-service-container">
      <h2 style={{ textTransform: "capitalize" }}>{service?.replace("-", " ") || "Appliance Repair"}</h2>

      {loading ? (
        <p>Loading vendors...</p>
      ) : vendors.length === 0 ? (
        <p>No vendors available</p>
      ) : (
        <div className="service-list">
          {vendors.map(vendorCard)}
        </div>
      )}

      {/* Booking modal */}
      {showModal && selectedVendor && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Book {selectedVendor.title}</h3>

            <label style={{ display: "block", margin: "8px 0" }}>Select date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                const d = e.target.value;
                setDate(d);
                setSelectedSlotValue("");
                setSlots([]);
                if (d) fetchSlots(selectedVendor.provider_id, selectedVendor.id, d);
              }}
            />

            <div style={{ marginTop: 12 }}>
              {slots.length > 0 ? (
                <select
                  value={selectedSlotValue}
                  onChange={(e) => setSelectedSlotValue(e.target.value)}
                >
                  <option value="">Select time slot</option>
                  {slots.map((s, i) => {
                    // stringify slot for option value
                    const val = JSON.stringify({ start_time: s.start_time, end_time: s.end_time, label: s.label });
                    return (
                      <option key={i} value={val}>
                        {s.label}
                      </option>
                    );
                  })}
                </select>
              ) : date ? (
                <p style={{ marginTop: 8 }}>No slots available for selected date</p>
              ) : (
                <p style={{ marginTop: 8 }}>Select a date to view slots</p>
              )}
            </div>

            <div style={{ marginTop: 16 }}>
              <button className="checkout-btn" onClick={handleBooking}>
                Confirm Booking
              </button>
              <button className="close-btn" onClick={closeModal} style={{ marginLeft: 8 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className="toast-success">{toast}</div>}
    </div>
  );
}
