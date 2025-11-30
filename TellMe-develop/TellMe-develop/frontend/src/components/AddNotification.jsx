// src/components/AddNotification.jsx
import React, { useState } from "react";
import { createNotification } from "../api/notificationApi";

const AddNotification = () => {
  const [formData, setFormData] = useState({
    user: "",
    notif_type: "",
    title: "",
    message: "",
    payload: "{}",
    status: "pending",
    provider_response: "{}",
    sent_at: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await createNotification(formData);
      alert("✅ Notification Log saved!");
    } catch (err) {
      console.log(err);
      alert("❌ Error saving notification");
    }
  };

  return (
    <form onSubmit={submitHandler} style={{ width: "400px", margin: "auto" }}>
      <h3>Add Notification Log</h3>

      <label>User</label>
      <input name="user" onChange={handleChange} />

      <label>Notification Type</label>
      <input name="notif_type" onChange={handleChange} />

      <label>Title</label>
      <input name="title" onChange={handleChange} />

      <label>Message</label>
      <input name="message" onChange={handleChange} />

      <label>Payload (JSON)</label>
      <textarea name="payload" onChange={handleChange} />

      <label>Status</label>
      <select name="status" onChange={handleChange}>
        <option value="pending">Pending</option>
        <option value="sent">Sent</option>
        <option value="failed">Failed</option>
      </select>

      <label>Provider Response</label>
      <textarea name="provider_response" onChange={handleChange} />

      <label>Sent At</label>
      <input type="datetime-local" name="sent_at" onChange={handleChange} />

      <br />
      <button type="submit">Save Notification</button>
    </form>
  );
};

export default AddNotification;
