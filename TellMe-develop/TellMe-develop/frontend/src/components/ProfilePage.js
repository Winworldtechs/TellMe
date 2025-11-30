import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.css";
import NotificationsList from "./NotificationsList";

/* ===== ICONS ===== */
import personalIcon from "../assets/icons/profile.png";
import savedIcon from "../assets/icons/save1.png";
import notificationIcon from "../assets/icons/4.png";
import termsIcon from "../assets/icons/2.png";
import aboutIcon from "../assets/icons/2.png";

const API = "http://127.0.0.1:8000/api";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("personal");

  const [user, setUser] = useState({});
  const [savedServices, setSavedServices] = useState([]);

  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const access = () => localStorage.getItem("access");
  const refresh = () => localStorage.getItem("refresh");

  /* ✅ Refresh Token */
  const refreshAccessToken = useCallback(async () => {
    const r = refresh();
    if (!r) return null;

    try {
      const res = await fetch(`${API}/accounts/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: r }),
      });

      if (!res.ok) return null;
      const data = await res.json();
      localStorage.setItem("access", data.access);
      return data.access;
    } catch {
      return null;
    }
  }, []);

  /* ✅ Auto-fetch with retry */
  const authedFetch = useCallback(
    async (url, options = {}, retry = true) => {
      let token = access();
      if (!token) throw new Error("NO_TOKEN");

      const res = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(options.headers || {}),
        },
      });

      if (res.status === 401 && retry) {
        const newToken = await refreshAccessToken();
        if (!newToken) throw new Error("SESSION_EXPIRED");

        return authedFetch(url, options, false);
      }

      return res;
    },
    [refreshAccessToken]
  );

  /* ✅ Load Profile */
  const loadProfile = useCallback(async () => {
    try {
      const res = await authedFetch(`${API}/accounts/profile/`);
      const data = await res.json();

      setUser(data);
      setFormData({
        username: data.username || "",
        phone: data.phone || "",
        city: data.city || "",
        state: data.state || "",
        pincode: data.pincode || "",
      });
    } catch {
      navigate("/login");
    }
  }, [authedFetch, navigate]);

  /* ✅ Load saved services */
  const loadSavedServices = useCallback(async () => {
    try {
      const res = await authedFetch(`${API}/saved/profile/saved-services/`);
      const data = await res.json();
      setSavedServices(data);
    } catch {}
  }, [authedFetch]);

  useEffect(() => {
    (async () => {
      await loadProfile();
      await loadSavedServices();
      setLoading(false);
    })();
  }, [loadProfile, loadSavedServices]);

  /* ✅ detect changes */
  const diffPayload = useMemo(() => {
    const payload = {};
    if (formData.username !== (user.username || "")) payload.username = formData.username;
    if ((formData.phone || "") !== (user.phone || "")) payload.phone = formData.phone;
    if ((formData.city || "") !== (user.city || "")) payload.city = formData.city;
    if ((formData.state || "") !== (user.state || "")) payload.state = formData.state;
    if ((formData.pincode || "") !== (user.pincode || "")) payload.pincode = formData.pincode;
    return payload;
  }, [formData, user]);

  const hasChanges = Object.keys(diffPayload).length > 0;

  /* ✅ Update */
  const handleUpdate = async () => {
    if (!hasChanges) return;
    setSaving(true);
    try {
      const res = await authedFetch(`${API}/accounts/profile/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(diffPayload),
      });

      const data = await res.json();
      setUser(data);
      setEditMode(false);
      alert("Updated!");
    } catch {
      alert("Server error");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (loading) return <div className="profile-container">Loading...</div>;

  return (
    <div className="profile-container">
      <h1>Profile</h1>

      <div className="profile-main-content">
        
        {/* SIDEBAR */}
        <div className="profile-sidebar">
          {[
            ["personal", personalIcon, "Personal Details"],
            ["saved", savedIcon, "Saved"],
            ["notifications", notificationIcon, "Notifications"],
            ["terms", termsIcon, "Terms"],
            ["about", aboutIcon, "About Us"],
          ].map(([id, icon, label]) => (
            <div
              key={id}
              className={`profile-nav-item ${activeTab === id ? "active" : ""}`}
              onClick={() => setActiveTab(id)}
            >
              <img src={icon} className="side-icon" alt="" /> {label}
            </div>
          ))}

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* RIGHT PANEL */}
        <div className="profile-content-panel">
        
          {/* PERSONAL */}
          {activeTab === "personal" && (
            <>
              <h2>Personal Details</h2>

              {!editMode ? (
                <div className="personal-details-view">
                  <p><strong>Username:</strong> {user.username}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Phone:</strong> {user.phone || "-"}</p>
                  <p><strong>City:</strong> {user.city || "-"}</p>
                  <p><strong>State:</strong> {user.state || "-"}</p>
                  <p><strong>Pincode:</strong> {user.pincode || "-"}</p>

                  <button className="btn-edit" onClick={() => setEditMode(true)}>
                    Edit
                  </button>
                </div>
              ) : (
                <div className="personal-details-grid">

                  <input className="detail-field" value={user.email || ""} disabled />

                  <input
                    className="detail-field"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Name"
                  />

                  <input
                    className="detail-field"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Phone"
                  />

                  <input
                    className="detail-field"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="City"
                  />

                  <input
                    className="detail-field"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="State"
                  />

                  <input
                    className="detail-field"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    placeholder="Pincode"
                  />

                  <button className="btn-save" onClick={handleUpdate} disabled={!hasChanges || saving}>
                    {saving ? "Saving..." : "Save"}
                  </button>

                  <button className="btn-cancel" onClick={() => setEditMode(false)}>
                    Cancel
                  </button>
                </div>
              )}
            </>
          )}

          {/* SAVED */}
          {activeTab === "saved" && (
            <>
              <h2>Saved Services</h2>

              {savedServices.length === 0 ? (
                <p>No saved services.</p>
              ) : (
                savedServices.map((s, i) => (
                  <div key={i} className="saved-card">
                    <img src={s.image} alt="" />
                    <p>{s.name}</p>
                  </div>
                ))
              )}
            </>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <NotificationsList token={access()} user={user} />
          )}

          {activeTab === "terms" && <div>Terms & Conditions</div>}
          {activeTab === "about" && <div>About Us</div>}
        </div>
      </div>
    </div>
  );
}
