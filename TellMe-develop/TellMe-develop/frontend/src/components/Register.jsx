import React, { useState } from "react";
import { setTokens } from "../utils/auth";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    mobile: "",
    password: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://127.0.0.1:8000/api/accounts/register/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    await res.json();   // ✅ removed unused data

    if (!res.ok) {
      alert("Registration failed");
      return;
    }

    // ✅ auto login
    const loginRes = await fetch("http://127.0.0.1:8000/api/accounts/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
      }),
    });

    const loginData = await loginRes.json();

    if (loginRes.ok) {
      setTokens(loginData.access, loginData.refresh);
      alert("Registered Successfully!");
      navigate("/profile");
    } else {
      alert("Registered — Please Login");
      navigate("/login");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto" }}>
      <h2>Register</h2>

      <form onSubmit={handleSubmit}>
        <input name="username" onChange={handleChange} placeholder="Username" />
        <input
          type="email"
          name="email"
          onChange={handleChange}
          placeholder="Email"
        />
        <input name="mobile" onChange={handleChange} placeholder="Mobile" />
        <input
          type="password"
          name="password"
          onChange={handleChange}
          placeholder="Password"
        />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;
