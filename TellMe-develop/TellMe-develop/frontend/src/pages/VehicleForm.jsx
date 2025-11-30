import React, { useState } from "react";
import "../styles/VehicleForm.css";

const VehicleForm = ({ type }) => {
  const [formData, setFormData] = useState({
    vehicleModel: "",
    purpose: "",
    description: "",
    name: "",
    phone: "",
    email: "",
    address: "",
    image: null,
  });

  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  // ─────────────────────────────────────────────
  // 🔥 Razorpay Payment
  // ─────────────────────────────────────────────
  const startPayment = async (orderId) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/barcodes/orders/${orderId}/create_razorpay_order/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      const data = await res.json();

      if (!data.razorpay_order_id) {
        alert("Payment initialization failed!");
        return;
      }

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "TellMe Barcode Payment",
        description: "Pay ₹200 to generate vehicle barcode",
        order_id: data.razorpay_order_id,

        handler: async function (response) {
          await fetch(
            `http://127.0.0.1:8000/api/barcodes/orders/${orderId}/verify_payment/`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("access")}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            }
          );

          setSuccessMessage("🎉 Payment successful! Barcode will be delivered soon.");
          setTimeout(() => setSuccessMessage(""), 4000);
        },

        theme: { color: "#fc8b00" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Payment error!");
    }
  };

  // ─────────────────────────────────────────────
  // 🔥 Submit → Create Order → Start Payment
  // ─────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = new FormData();
    payload.append("type", type);
    payload.append("company", formData.vehicleModel);
    payload.append("model", formData.vehicleModel);
    payload.append("owner_name", formData.name);

    payload.append(
      "notifications",
      JSON.stringify({
        purpose: formData.purpose,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        description: formData.description,
      })
    );

    if (formData.image) payload.append("image", formData.image);

    const res = await fetch("http://127.0.0.1:8000/api/barcodes/orders/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access")}`,
      },
      body: payload,
    });

    if (!res.ok) {
      alert("❌ Order creation failed!");
      return;
    }

    const data = await res.json();
    startPayment(data.id);
  };

  return (
    <div className="barcode-container">
      <h2 className="barcode-title">
        {type === "bike" ? "🏍 Order your bar code" : "🚗 Order your bar code"}
      </h2>

      {successMessage && <div className="success-popup">{successMessage}</div>}

      <form className="barcode-form" onSubmit={handleSubmit}>
        {/* BASIC SECTION */}
        <section className="form-section">
          <h3>Basic information</h3>

          <div className="form-row">
            <div className="form-group">
              <label>{type === "bike" ? "Bike model" : "Car model"}</label>
              <input
                type="text"
                name="vehicleModel"
                placeholder="Enter vehicle model"
                value={formData.vehicleModel}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Purpose</label>
              <select
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
              >
                <option value="">Select purpose</option>
                <option value="Personal">Personal</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>
          </div>

          <div className="form-group full">
            <label>Description</label>
            <textarea
              name="description"
              placeholder="Write a description of the product"
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section className="form-section">
          <h3>Contact information</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Your name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Phone number</label>
              <input
                type="text"
                name="phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                name="address"
                placeholder="Enter your address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>

        {/* UPLOAD SECTION */}
        <section className="form-section">
          <h3>📤 Image (optional)</h3>

          <div className="upload-box">
            <input
              id="imageUpload"
              type="file"
              name="image"
              onChange={handleChange}
            />
            <label htmlFor="imageUpload" className="upload-label">
              <div className="upload-icon">⬆️</div>
              <p>Upload image</p>
            </label>
          </div>
        </section>

        <button type="submit" className="submit-btn">
          Pay ₹200 & Create barcode
        </button>
      </form>
    </div>
  );
};

export default VehicleForm;
