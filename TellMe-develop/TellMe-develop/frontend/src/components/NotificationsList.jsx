import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

const NotificationsList = ({ token }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/notifications/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let data = res.data;

      if (data?.results) data = data.results;

      if (!Array.isArray(data)) data = [];

      setItems(data);
    } catch (err) {
      console.log("Error →", err);
      setItems([]);
    }
    setLoading(false);
  }, [token]);   // ✅ token dependency added

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);   // ✅ fixed warning

  if (loading) return <p>Loading notifications...</p>;

  if (!items.length)
    return (
      <div>
        <h2>Notifications</h2>
        <p>No notifications found.</p>
      </div>
    );

  return (
    <div>
      <h2 style={{ marginBottom: "10px" }}>Notifications</h2>

      {items.map((n) => (
        <div
          key={n.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: "10px",
            padding: "12px",
            marginBottom: "12px",
            background: "#fff",
          }}
        >
          <h4 style={{ marginBottom: 5 }}>{n.title}</h4>
          <p style={{ marginBottom: 5, color: "#444" }}>{n.message}</p>

          <small>
            <b>Sent at:</b> {n.sent_at ?? "—"}
          </small>
        </div>
      ))}
    </div>
  );
};

export default NotificationsList;
