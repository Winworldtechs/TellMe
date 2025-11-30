import React, { useState } from "react";
import "./EmergencyServices.css";

const EmergencyServices = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [showCallModal, setShowCallModal] = useState(false);

  // Static data for each emergency type
  const services = {
    fire: [
      {
        id: 1,
        name: "Central Fire Brigade",
        image:
          "https://cdn-icons-png.flaticon.com/512/2966/2966481.png",
        rating: 4.9,
        distance: "2 km away",
      },
      {
        id: 2,
        name: "City Fire Station",
        image:
          "https://cdn-icons-png.flaticon.com/512/482/482469.png",
        rating: 4.7,
        distance: "3.5 km away",
      },
    ],
    ambulance: [
      {
        id: 1,
        name: "City Ambulance Service",
        image:
          "https://cdn-icons-png.flaticon.com/512/2966/2966489.png",
        rating: 4.8,
        distance: "1 km away",
      },
      {
        id: 2,
        name: "Metro Emergency Care",
        image:
          "https://cdn-icons-png.flaticon.com/512/2821/2821605.png",
        rating: 4.6,
        distance: "2.5 km away",
      },
    ],
    carpool: [
      {
        id: 1,
        name: "Local Carpool Express",
        image:
          "https://cdn-icons-png.flaticon.com/512/743/743131.png",
        rating: 4.5,
        distance: "1 km away",
      },
      {
        id: 2,
        name: "Ride Together Group",
        image:
          "https://cdn-icons-png.flaticon.com/512/1946/1946402.png",
        rating: 4.7,
        distance: "2 km away",
      },
    ],
  };

  // UI for Service Selection
  const ServiceSelection = () => (
    <div className="sos-container">
      <h2>Emergency SOS Services</h2>
      <h3>Emergency Services</h3>

      <div className="sos-options">
        <div className="sos-card" onClick={() => setSelectedService("fire")}>
          <img src="https://cdn-icons-png.flaticon.com/512/2966/2966481.png" alt="Fire brigade" />
          <p>Fire brigade</p>
        </div>

        <div className="sos-card" onClick={() => setSelectedService("ambulance")}>
          <img src="https://cdn-icons-png.flaticon.com/512/2966/2966489.png" alt="Ambulance" />
          <p>Ambulance</p>
        </div>

        <div className="sos-card" onClick={() => setSelectedService("carpool")}>
          <img src="https://cdn-icons-png.flaticon.com/512/743/743131.png" alt="Car pooling" />
          <p>Car pooling</p>
        </div>
      </div>
    </div>
  );

  // UI for Listing Emergency Services (fire/ambulance/carpool)
  const ServiceList = ({ type }) => (
    <div className="service-list">
      <button className="back-btn" onClick={() => setSelectedService(null)}>← Back</button>
      <h2>{type === "fire" ? "Fire Brigade Services"
            : type === "ambulance" ? "Ambulance Services"
            : "Car Pooling Services"}</h2>

      {services[type].map((item) => (
        <div className="service-card" key={item.id}>
          <img src={item.image} alt={item.name} />
          <div className="info">
            <h4>{item.name}</h4>
            <p>⭐ {item.rating} | {item.distance}</p>
            <button onClick={() => setShowCallModal(true)}>Call Now</button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="emergency-wrapper">
      {!selectedService ? <ServiceSelection /> : <ServiceList type={selectedService} />}

      {showCallModal && (
        <div className="modal" onClick={(e) => e.target.className === "modal" && setShowCallModal(false)}>
          <div className="modal-content">
            <img
              src="https://cdn-icons-png.flaticon.com/512/724/724664.png"
              alt="SOS"
              className="sos-logo"
            />
            <h3>Emergency Call</h3>
            <p>Do you want to call emergency services?</p>
            <div className="modal-buttons">
              <button className="call-btn" onClick={() => alert("📞 Calling SOS...")}>Call</button>
              <button className="cancel-btn" onClick={() => setShowCallModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyServices;
