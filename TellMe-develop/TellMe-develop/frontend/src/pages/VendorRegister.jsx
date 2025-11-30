import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/VendorAuth.css";

const API = "http://127.0.0.1:8000/api/accounts/";

export default function VendorRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    phone: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, is_provider: true };
      const res = await axios.post(`${API}register/`, payload);

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      navigate("/vendor/create-profile");
    } catch (err) {
      alert(
        (err.response?.data && JSON.stringify(err.response.data)) ||
          "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vendor-wrapper">
      <form className="vendor-card" onSubmit={handleSubmit}>
        <h2 className="vendor-title">Join our partner network</h2>

        <div className="row-two">
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              name="password"
              minLength={6}
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>
        </div>

        <div className="row-two">
          <div className="field">
            <label>User name</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter user name"
              required
            />
          </div>
          <div className="field">
            <label>Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
            />
          </div>
        </div>

        <div className="row-two">
          <div className="field">
            <label>State</label>
            <input
              name="state"
              value={form.state}
              onChange={handleChange}
              placeholder="Enter your state"
            />
          </div>
          <div className="field">
            <label>City</label>
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="Enter your city"
            />
          </div>
        </div>

        <div className="field">
          <label>Pincode</label>
          <input
            name="pincode"
            value={form.pincode}
            onChange={handleChange}
            placeholder="Enter pincode"
          />
        </div>

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="login-link">
          Already have an account?{" "}
         <span onClick={() => navigate("/vendor/login")}>Login</span>
        </p>
      </form>
    </div>
  );
}
