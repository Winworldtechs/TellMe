// src/components/HealthcareCards.js

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // ✅ Added useParams and useNavigate
import './HealthcareCards.css';

// Image Imports
import doc1 from '../assets/images/1.png'; 
import doc2 from '../assets/images/2.png';
import doc3 from '../assets/images/3.png';
import doc4 from '../assets/images/4.png';
import doc5 from '../assets/images/5.png';

const allDoctorsData = [ // Renamed to allDoctorsData
    {
        name: 'Dr. anjali sharma',
        specialty: 'Cardiologist', 
        rating: 4.8,
        distance: '1.3 km away',
        image: doc1, 
    },
    {
        name: 'Dr. rohan mehra',
        specialty: 'Dentist', 
        rating: 4.8,
        distance: '2 km away',
        image: doc2, 
    },
    {
        name: 'Dr. riya ahuja',
        specialty: 'Physiotherapist', 
        rating: 4.8,
        distance: '4 km away',
        image: doc3, 
    },
    {
        name: 'Dr. megha singh',
        specialty: 'Cardiologist',
        rating: 4.8,
        distance: '2 km away',
        image: doc4, 
    },
    {
        name: 'Dr. rohan verma',
        specialty: 'Dentist',
        rating: 4.8,
        distance: '5 km away',
        image: doc5, 
    },
];

const HealthcareCards = () => {
    // URL से specialtySlug प्राप्त करें (जैसे: cardiologist)
    const { specialtySlug } = useParams();
    const navigate = useNavigate();

    // Slug (e.g., cardiologist) को सामान्य नाम (e.g., Cardiologist) में बदलने के लिए
    const getCurrentSpecialty = () => {
        if (!specialtySlug) return 'All Specialties';
        
        // Slug को वापस Title Case में बदलें (जैसे: 'physiotherapist' -> 'Physiotherapist')
        const name = specialtySlug.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        
        return name;
    };
    
    const specialtyName = getCurrentSpecialty();
    
    // doctorsData को specialty के आधार पर फ़िल्टर करें
    const filteredDoctors = allDoctorsData.filter(doctor => {
        // यह सुनिश्चित करें कि तुलना केस-इनसेटिव हो
        return doctor.specialty.toLowerCase() === specialtyName.toLowerCase();
    });

    // पीछे जाने के लिए हैंडलर
    const handleBack = () => {
        navigate(-1); // Go back to the previous page (ServiceCategories)
    };

    // बुकिंग हैंडलर
    const handleBookNow = (doctorName) => {
        alert(`Booking now for ${doctorName} (${specialtyName})`);
        // यहां आप navigate('/booking-form/' + doctorName); का उपयोग कर सकते हैं
    };

    return (
        <section className="healthcare-section">
            <button className="back-button" onClick={handleBack} style={{
                padding: '10px 15px',
                marginBottom: '20px',
                backgroundColor: '#f0f0f0',
                border: '1px solid #ccc',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '1em',
            }}>
                 &#8592; Back to Services
            </button>
            <h2 className="section-title">
                Available {specialtyName}s Near You
            </h2>
            
            <div className="doctors-container">
                {filteredDoctors.length > 0 ? (
                    filteredDoctors.map((doctor, index) => (
                        <div key={index} className="doctor-card">
                            
                            {/* Doctor Card Content (as before) */}
                            <div className="doctor-image-wrapper">
                                <img src={doctor.image} alt={doctor.name} className="doctor-image" />
                                <span className="bookmark-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17 3H7C5.89543 3 5 3.89543 5 5V21L12 18L19 21V5C19 3.89543 18.1046 3 17 3Z" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </span>
                            </div>

                            <div className="doctor-details">
                                <h3 className="doctor-name">{doctor.name}</h3>
                                <p className="doctor-specialty">{doctor.specialty}</p>
                                
                                <div className="doctor-info-row">
                                    <span className="rating">
                                        &#9733; {doctor.rating}
                                    </span>
                                    <span className="distance">
                                        &#x1F4CD; {doctor.distance}
                                    </span>
                                </div>

                                <button 
                                    className="book-button"
                                    onClick={() => handleBookNow(doctor.name)}
                                >
                                    Book now
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No {specialtyName}s found near your location.</p>
                )}
            </div>
        </section>
    );
};

export default HealthcareCards;