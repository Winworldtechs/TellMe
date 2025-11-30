import React, { useState } from "react";
import axios from "axios";
import "../styles/VendorAuth.css";
import { useNavigate } from "react-router-dom";

const API = "http://127.0.0.1:8000/api/accounts/";

export default function VendorForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}password-reset/`, { email });
      alert("Reset link sent to your email");
      navigate("/vendor/login");
    } catch (err) {
      alert("Email not found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vendor-wrapper">
      <form className="vendor-card" onSubmit={handleSubmit}>
        <h2 className="vendor-title">Forget password</h2>

        <div className="field">
          <label>Email</label>
          <input
            name="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>
    </div>
  );
}
