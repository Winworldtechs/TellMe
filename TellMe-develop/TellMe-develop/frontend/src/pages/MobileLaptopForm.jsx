import React, { useState } from "react";
import "../styles/BarcodeForm.css";

// Razorpay script must be in index.html:
// <script src="https://checkout.razorpay.com/v1/checkout.js"></script>

const MobileLaptopForm = ({ deviceType }) => {
  const [formData, setFormData] = useState({
    deviceModel: "",
    purpose: "",
    price: "",
    description: "",
    name: "",
    phone: "",
    email: "",
    address: "",
    image: null,
  });

  const [successMessage, setSuccessMessage] = useState("");

  // -----------------------------
  // Handle input changes
  // -----------------------------
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  // -----------------------------
  // Start Razorpay Payment
  // -----------------------------
  const startPayment = async (orderId) => {
    try {
      // 1️⃣ Create Razorpay Order from backend
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
      console.log("RAZORPAY ORDER RESPONSE:", data);

      if (!data.razorpay_order_id) {
        alert("❌ Failed to initialize payment. Backend error.");
        return;
      }

      // 2️⃣ Razorpay options
      const options = {
        key: data.key, // backend key (important)
        amount: data.amount,
        currency: data.currency,
        order_id: data.razorpay_order_id,
        name: "TellMe Barcode Payment",
        description: "Pay ₹200 to generate your barcode",

        handler: async function (response) {
          // Payment success → verify with backend
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

          setSuccessMessage(
            "🎉 Payment successful! Your barcode will arrive shortly."
          );
          setTimeout(() => setSuccessMessage(""), 4000);
        },

        theme: { color: "#0D6EFD" },
      };

      // 3️⃣ Open Razorpay popup
      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error("Payment Error:", error);
      alert("❌ Payment initialization failed!");
    }
  };

  // -----------------------------
  // Submit Form → Create Order → Pay
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = new FormData();

    payload.append("type", "electronic");
    payload.append("company", formData.deviceModel);
    payload.append("model", formData.deviceModel);
    payload.append("owner_name", formData.name);

    if (formData.price) payload.append("price", formData.price);

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

    payload.append("electronic_detail.serial_number", "");
    payload.append("electronic_detail.warranty_till", "");
    payload.append("electronic_detail.purchase_date", "");

    if (formData.image) payload.append("image", formData.image);

    try {
      // Create order before payment
      const orderRes = await fetch("http://127.0.0.1:8000/api/barcodes/orders/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
        body: payload,
      });

      if (!orderRes.ok) {
        alert("❌ Failed to create order!");
        return;
      }

      const orderData = await orderRes.json();
      const createdOrderId = orderData.id;

      // Start payment
      startPayment(createdOrderId);

      // reset
      setFormData({
        deviceModel: "",
        purpose: "",
        description: "",
        name: "",
        phone: "",
        email: "",
        address: "",
        image: null,
      });

    } catch (err) {
      console.error(err);
      alert("❌ Something went wrong!");
    }
  };

  return (
    <div className="barcode-container">
      <h2>{deviceType === "mobile" ? "📱 Mobile Details" : "💻 Laptop Details"}</h2>

      {successMessage && <div className="success-popup">{successMessage}</div>}

      <form className="barcode-form" onSubmit={handleSubmit}>
        
        {/* BASIC SECTION */}
        <section className="form-section">
          <h3>Basic information</h3>

          <div className="form-row">
            <div className="form-group">
              <label>{deviceType === "mobile" ? "Mobile model" : "Laptop model"}</label>
              <input
                type="text"
                name="deviceModel"
                value={formData.deviceModel}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Purpose</label>
              <select name="purpose" value={formData.purpose} onChange={handleChange}>
                <option value="">Select purpose</option>
                <option value="personal">Personal</option>
                <option value="resale">Resale</option>
                <option value="office">Office Use</option>
              </select>
            </div>
          </div>

        

          <div className="form-group full">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>
        </section>

        {/* CONTACT INFO */}
        <section className="form-section">
          <h3>Contact information</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Your name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Phone number</label>
              <input
                type="text"
                name="phone"
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
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>

        {/* IMAGE UPLOAD */}
        <section className="form-section">
          <h3>📤 Image (optional)</h3>
          <div className="upload-box">
            <input type="file" id="imageUpload" name="image" onChange={handleChange} />
            <label htmlFor="imageUpload" className="upload-label">
              ⬆️ Upload image
            </label>
          </div>
        </section>

        <button type="submit" className="submit-btn">
          Pay ₹200 & Create Barcode
        </button>
      </form>
    </div>
  );
};

export default MobileLaptopForm;
