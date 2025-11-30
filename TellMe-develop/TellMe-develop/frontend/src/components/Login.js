import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const API = "http://127.0.0.1:8000/api/accounts";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // if already logged in, go profile
  useEffect(() => {
    if (localStorage.getItem("access")) navigate("/profile");
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data?.detail || "Invalid credentials");
        return;
      }

      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      navigate("/profile");
    } catch (err) {
      alert("Server Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ maxWidth: 380, margin: "40px auto" }}>
      <form onSubmit={handleLogin} className="login-box" style={{ display: "grid", gap: 12 }}>
        <h2 style={{ marginBottom: 8 }}>Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />

        <div style={{ position: "relative" }}>
          <input
            type={showPw ? "text" : "password"}
            placeholder="Password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", paddingRight: 70 }}
          />
          <button
            type="button"
            onClick={() => setShowPw((s) => !s)}
            style={{
              position: "absolute",
              right: 6,
              top: 6,
              padding: "6px 10px",
              border: "1px solid #ddd",
              borderRadius: 6,
              background: "#f8f8f8",
              cursor: "pointer",
            }}
          >
            {showPw ? "Hide" : "Show"}
          </button>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <small>
          Don’t have an account?{" "}
          <Link to="/register">Register</Link>
        </small>
      </form>
    </div>
  );
}
