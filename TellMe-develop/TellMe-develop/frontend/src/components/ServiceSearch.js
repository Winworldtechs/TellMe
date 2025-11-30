import React, { useState, useEffect } from "react";


const ServiceSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const placeholderTexts = [
    "Search for Doctor Service...",
    "Search for Home Cleaning...",
    "Search for Electrician...",
    "Search for Rent Machinery...",
    "Search for Plumber..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prevIndex) => (prevIndex + 1) % placeholderTexts.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const services = [
    { id: 1, name: "Home Cleaning" },
    { id: 2, name: "Doctor Consultation" },
    { id: 3, name: "Plumber Service" },
    { id: 4, name: "Electrician" },
    { id: 5, name: "Rent Machinery" },
  ];

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ textAlign: "center", padding: "40px" }}>
      <h2 className="text-xl font-semibold mb-4">🔍 Search Services</h2>
      <input
        type="text"
        value={searchTerm}
        placeholder={placeholderTexts[placeholderIndex]}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: "60%",
          padding: "10px 15px",
          fontSize: "16px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          marginBottom: "20px",
          transition: "0.3s ease",
        }}
      />

      <div>
        {filteredServices.length > 0 ? (
          filteredServices.map((service) => (
            <div
              key={service.id}
              style={{
                border: "1px solid #ccc",
                margin: "10px auto",
                padding: "10px",
                width: "60%",
                borderRadius: "8px",
                fontSize: "18px",
              }}
            >
              {service.name}
            </div>
          ))
        ) : (
          <p>No service found</p>
        )}
      </div>
    </div>
  );
};

export default ServiceSearch;
