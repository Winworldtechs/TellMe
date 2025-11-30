import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";   // ⬅️ add this
import "./MostBooked.css";

const BASE_URL = "http://127.0.0.1:8000";

const MostBooked = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();  // ⬅️ add this

  useEffect(() => {
    axios.get(`${BASE_URL}/api/most-booked/`)
      .then(res => setServices(res.data.results))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;

  return (
    <section className="most-booked">
      <h2>Most Booked Services</h2>
      <div className="booked-list">
        {services.map((service) => (
          <div
            className="booked-card"
            key={service.id}
            onClick={() => navigate(`/most-booked/${service.id}/${service.slug}`)} // ⬅️ Open detail page
          >
            <img src={service.image} alt={service.title} />
            <div className="booked-info"><h3>{service.title}</h3></div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default MostBooked;
