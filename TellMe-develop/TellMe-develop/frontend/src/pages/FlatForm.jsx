import React, { useState } from "react";
import "../styles/BarcodeForm.css";
import uploadIcon from "../assets/icons/upload.png";

const FlatForm = () => {
  const [formData, setFormData] = useState({
    flatLocation: "",
    purpose: "",
    description: "",
    name: "",
    phone: "",
    email: "",
    address: "",
    image: null,
  });

  const [successMessage, setSuccessMessage] = useState("");

  // -----------------------------
  // Handle Input Change
  // -----------------------------
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  // -----------------------------
  // START PAYMENT
  // -----------------------------
  const startPayment = async (orderId) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/barcodes/orders/${orderId}/create_razorpay_order/`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
        }
      );

      const data = await res.json();

      if (!data.razorpay_order_id) {
        alert("❌ Payment initialization failed!");
        return;
      }

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "TellMe Barcode Payment",
        description: "Pay ₹200 to generate barcode",
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

        theme: { color: "#FF7F00" },
      };

      new window.Razorpay(options).open();

    } catch (error) {
      console.error(error);
      alert("❌ Payment error!");
    }
  };

  // -----------------------------
  // VALIDATE + CREATE ORDER + PAYMENT
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    // --------------------------
    // VALIDATION
    // --------------------------
    if (
      !formData.flatLocation ||
      !formData.purpose ||
      !formData.description ||
      !formData.name ||
      !formData.phone ||
      !formData.email ||
      !formData.address
    ) {
      alert("❌ Please fill all required fields before proceeding!");
      return;
    }

    const payload = new FormData();

    // BASIC flat info
    payload.append("type", "home");
    payload.append("company", formData.flatLocation);
    payload.append("model", formData.flatLocation);
    payload.append("owner_name", formData.name);

    // NOTIFICATIONS JSON (extra details)
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

    // Home Detail Mapping
    payload.append("home_detail.address", formData.flatLocation);
    payload.append("home_detail.property_type", formData.purpose);
    payload.append("home_detail.area_sqft", "");

    if (formData.image) payload.append("image", formData.image);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/barcodes/orders/", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
        body: payload,
      });

      if (!res.ok) {
        alert("❌ Failed to create barcode order!");
        return;
      }

      const data = await res.json();
      const orderId = data.id;

      startPayment(orderId);

      // RESET FORM
      setFormData({
        flatLocation: "",
        purpose: "",
        description: "",
        name: "",
        phone: "",
        email: "",
        address: "",
        image: null,
      });

    } catch (error) {
      console.error(error);
      alert("❌ Something went wrong!");
    }
  };

  return (
    <div className="barcode-container">
      <h2 className="barcode-title">🏠 Order your bar code</h2>

      {successMessage && <div className="success-popup">{successMessage}</div>}

      <form onSubmit={handleSubmit}>
        {/* BASIC INFO */}
        <div className="form-section">
          <h3 className="section-title">Basic information</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Flat location</label>
              <input
                type="text"
                name="flatLocation"
                value={formData.flatLocation}
                onChange={handleChange}
                placeholder="Enter flat location"
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
                <option value="Rent">Rent</option>
                <option value="Sell">Sell</option>
              </select>
            </div>
          </div>

          <div className="form-group full-width">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Write a description of the flat"
              rows="3"
            ></textarea>
          </div>
        </div>

        {/* CONTACT INFO */}
        <div className="form-section">
          <h3 className="section-title">Contact information</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Your name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
              />
            </div>

            <div className="form-group">
              <label>Phone number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your address"
              />
            </div>
          </div>
        </div>

        {/* IMAGE UPLOAD */}
        <div className="form-section">
          <h3 className="section-title">📤 Image (optional)</h3>
          <div className="upload-box">
            <input type="file" name="image" onChange={handleChange} />
            <img src={uploadIcon} alt="Upload" className="upload-icon" />
            <p>Upload image</p>
          </div>
        </div>

        <button className="submit-btn">Pay ₹200 & Create barcode</button>
      </form>
    </div>
  );
};

export default FlatForm;
