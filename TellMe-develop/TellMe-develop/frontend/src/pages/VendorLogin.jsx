import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/VendorAuth.css";

const API = "http://127.0.0.1:8000/api/accounts/";

export default function VendorLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${API}login/`, form);

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      navigate("/vendor/dashboard"); // dashboard future page
    } catch (err) {
      alert("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vendor-wrapper">
      <form className="vendor-card" onSubmit={handleSubmit}>
        <h2 className="vendor-title">Welcome back</h2>

        <div className="field">
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field">
          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <p
            className="forgot-link"
            onClick={() => navigate("/vendor/forgot-password")}
          >
            Forget password?
          </p>
        </div>

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="login-link">
          Don’t have an account?{" "}
          <span onClick={() => navigate("/vendor/register")}>Register</span>
        </p>
      </form>
    </div>
  );
}
