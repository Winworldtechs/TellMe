import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/ProviderForm.css";
import { useNavigate } from "react-router-dom";

// default preview image (uploaded file path you've provided)
const defaultLogo = "sandbox:/mnt/data/7e439211-e64f-4721-bad8-01192cd86e8f.png";

const API = "http://127.0.0.1:8000/api";

export default function ProviderCreate() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(defaultLogo);

  const [form, setForm] = useState({
    category_id: "",
    name: "",
    address: "",
    lat: "",
    lng: "",
    open_time: "09:00",
    close_time: "18:00",
    slot_interval: 30,
    open_days: [], // ["Mon","Tue"...]
    charges: "",
    description: "",
  });
  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => {
    // fetch categories
    axios
      .get(`${API}/categories/`)
      .then((res) => setCategories(res.data.results || res.data))
      .catch((err) => console.log("Cat err", err));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "open_days") {
      // checkbox group
      const day = value;
      setForm((s) => {
        const arr = new Set(s.open_days || []);
        if (checked) arr.add(day);
        else arr.delete(day);
        return { ...s, open_days: Array.from(arr) };
      });
      return;
    }
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleLogo = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setLogoFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      if (form.category_id) fd.append("category_id", form.category_id);
      fd.append("name", form.name);
      if (logoFile) fd.append("logo", logoFile);
      fd.append("address", form.address);
      fd.append("lat", form.lat);
      fd.append("lng", form.lng);
      fd.append("open_time", form.open_time);
      fd.append("close_time", form.close_time);
      fd.append("slot_interval", form.slot_interval);
      fd.append("open_days", JSON.stringify(form.open_days));
      if (form.charges) fd.append("charges", form.charges);
      fd.append("description", form.description);

      const res = await axios.post(`${API}/providers/create/`, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Provider profile created!");
      navigate("/vendor/dashboard");
    } catch (err) {
      console.error("Create provider ERR:", err.response?.data || err);
      alert("Failed to create provider: " + (err.response?.data || ""));
    } finally {
      setLoading(false);
    }
  };

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="provider-form-page">
      <form className="provider-card" onSubmit={handleSubmit}>
        <h2>Create Provider Profile</h2>

        <label>Category</label>
        <select
          name="category_id"
          value={form.category_id}
          onChange={(e) => setForm((s) => ({ ...s, category_id: e.target.value }))}
          required
        >
          <option value="">-- Select Category --</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>

        <label>Business Name</label>
        <input name="name" value={form.name} onChange={handleChange} required />

        <label>Logo</label>
        <div className="logo-row">
          <img src={preview} alt="logo preview" className="logo-preview" />
          <input type="file" accept="image/*" onChange={handleLogo} />
        </div>

        <label>Address</label>
        <textarea name="address" value={form.address} onChange={handleChange} />

        <div className="two-cols">
          <div>
            <label>Latitude</label>
            <input name="lat" value={form.lat} onChange={handleChange} />
          </div>
          <div>
            <label>Longitude</label>
            <input name="lng" value={form.lng} onChange={handleChange} />
          </div>
        </div>

        <div className="two-cols">
          <div>
            <label>Open Time</label>
            <input type="time" name="open_time" value={form.open_time} onChange={handleChange} />
          </div>
          <div>
            <label>Close Time</label>
            <input type="time" name="close_time" value={form.close_time} onChange={handleChange} />
          </div>
        </div>

        <label>Slot Interval (minutes)</label>
        <input type="number" name="slot_interval" value={form.slot_interval} onChange={handleChange} min={5} />

        <label>Open Days</label>
        <div className="days-row">
          {days.map((d) => (
            <label key={d} className="day-chip">
              <input
                type="checkbox"
                name="open_days"
                value={d}
                checked={form.open_days.includes(d)}
                onChange={handleChange}
              />
              {d}
            </label>
          ))}
        </div>

        <label>Charges (₹)</label>
        <input name="charges" value={form.charges} onChange={handleChange} />

        <label>Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} />

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Create Provider"}
        </button>
      </form>
    </div>
  );
}