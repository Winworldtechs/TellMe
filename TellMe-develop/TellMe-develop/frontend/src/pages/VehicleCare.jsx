import React, { useState } from "react";
import "../styles/ServiceCard.css";
import bikeWash from "../assets/images/Frame 26.png";
import carWash from "../assets/images/Frame 17.png";
import locationIcon from "../assets/icons/location.png"; // ✅ Location icon added

export default function VehicleCare() {
  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState("");

  const services = [
    { name: "Bike Wash", company: "By Speedo Cleaners", img: bikeWash, rating: 4.8, distance: "1.5 km away" },
    { name: "Car Wash", company: "By Auto Shine Experts", img: carWash, rating: 4.8, distance: "3 km away" },
  ];

  const openModal = (service) => {
    setSelectedService(service);
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  return (
    <div className="home-service-container">
      <div className="home-service-header">
        <h2>Vehicle Care</h2>
      </div>

      <div className="service-list">
        {services.map((s, i) => (
          <div className="service-card" key={i}>
            <img src={s.img} alt={s.name} />
            <div className="service-details">
              <h3>{s.name}</h3>
              <p className="company">{s.company}</p>
              <div className="rating">
                <span className="star">⭐</span> {s.rating}
              </div>
              <div className="location">
                <img src={locationIcon} alt="location" /> {s.distance}
              </div>
            </div>
            <button className="book-btn" onClick={() => openModal(s.name)}>
              Book now
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Book {selectedService}</h3>
            <input type="date" />
            <select>
              <option>Select Time</option>
              <option>09:00 AM - 11:00 AM</option>
              <option>12:00 PM - 02:00 PM</option>
              <option>03:00 PM - 05:00 PM</option>
              <option>06:00 PM - 08:00 PM</option>
            </select>
            <button className="checkout-btn" onClick={closeModal}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
