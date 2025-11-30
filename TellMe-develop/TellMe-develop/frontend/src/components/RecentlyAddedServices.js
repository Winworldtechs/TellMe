import React, { useEffect, useState } from 'react';
// 1. ✅ useNavigate hook को import करें
import { useNavigate } from 'react-router-dom';
import './RecentlyAddedServices.css'; // Optional styling

const ServicesPage = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // 2. ✅ useNavigate hook को initialize करें
    const navigate = useNavigate();

    useEffect(() => {
        // API call to fetch Service Providers data
        fetch('http://127.0.0.1:8000/api/services/providers/')
            .then(res => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then(data => {
                const serviceList = Array.isArray(data) ? data : data.results || data.services || [];
                setServices(serviceList);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching services:', err);
                setLoading(false);
            });
    }, []);

    // 3. ✅ Card click handler function
    const handleCardClick = (serviceId, serviceName) => {
        // serviceName को एक URL-friendly slug में बदलें (e.g., "Quick Clean" -> "quick-clean")
        const slug = serviceName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        
        // एक नया URL बनाएं। (e.g., /provider/123/quick-clean)
        const newUrl = `/provider/${serviceId}/${slug}`;

        console.log(`Navigating to provider detail page: ${newUrl}`);
        // 4. ✅ नए पेज पर navigate करें
        navigate(newUrl);
    };

    if (loading) return <p>Loading services...</p>;

    if (services.length === 0) return <p>No services found at the moment.</p>;


    return (
        <section className="exclusive-offers">
            <h2>Recently Added Services</h2>
            <div className="offers-container">
                {services.map(service => (
                    <div 
                        className="offer-card" 
                        key={service.id}
                        // 5. ✅ पूरे div पर onClick इवेंट और cursor style लगाएं
                        onClick={() => handleCardClick(service.id, service.name)}
                        style={{ cursor: 'pointer' }}
                    >
                        <img
                            src={
                                service?.logo_url
                                    ? `http://127.0.0.1:8000${service.logo_url}` 
                                    : '/default-logo.png' // fallback image path
                            }
                            alt={service?.name || 'Provider'}
                            className="offer-image"
                        />
                        <div className="offer-info">
                            <h3>{service.name || 'Service Provider'}</h3> 
                            <p>
                                {service.description ? service.description.substring(0, 70) + '...' : 'Details not available.'}
                            </p>
                            <p>
                                <strong>₹{service.charges || 'N/A'}</strong> 
                                {service.open_time && ` • Open at ${service.open_time}`}
                            </p>
                            {/* 6. ❌ Book Now बटन को हटा दिया गया */}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ServicesPage;