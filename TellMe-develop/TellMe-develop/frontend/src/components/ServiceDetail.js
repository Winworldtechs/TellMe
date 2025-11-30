// ServiceDetail.js
import React from 'react';
import './ServiceDetail.css';

const ServiceDetail = ({ type }) => {
  const serviceData = {
    Cardiologist: {
      name: 'Dr. Anjali Sharma',
      rating: 4.8,
      distance: '1.3 km',
      specialty: 'Cardiologist',
      image: 'https://cdn-icons-png.flaticon.com/512/3467/3467794.png',
    },
    // Add Dentist, Physiotherapist similarly
  };

  const data = serviceData[type];

  return (
    <div className="service-fullscreen">
      <div className="service-card">
        <img src={data.image} alt={data.specialty} className="service-icon" />
        <h2>{data.name}</h2>
        <p>Specialty: {data.specialty}</p>
        <p>Rating: ⭐ {data.rating}</p>
        <p>Distance: {data.distance}</p>
        <button className="book-btn">Book Now</button>
      </div>
    </div>
  );
};

export default ServiceDetail;