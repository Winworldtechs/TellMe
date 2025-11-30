import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ServiceCategories.css";

// Category icons
import homeIcon from "../assets/icons/home.png";
import starIcon from "../assets/icons/star.png";
import rentIcon from "../assets/icons/rent.png";
import healthIcon from "../assets/icons/doctor.png";
import dailyneed from "../assets/icons/image 97.png";
import barcodeIcon from "../assets/icons/product.png";
import sosIcon from "../assets/icons/sos.png";

// Home service icons
import acIcon from "../assets/icons/ac.png";
import computerIcon from "../assets/icons/computer.png";
import washingIcon from "../assets/icons/washing.png";
import tapIcon from "../assets/icons/tap.png";
import cleaningIcon from "../assets/icons/cleaning.png";
import cctvIcon from "../assets/icons/cctv.png";

// Other icons
import bikeIcon from "../assets/icons/bike.png";
import carIcon from "../assets/icons/car.png";
import installIcon from "../assets/icons/install.png";
import repairIcon from "../assets/icons/repair.png";
import gymIcon from "../assets/icons/gym.png";
import drillIcon from "../assets/icons/drill.png";
import mixerIcon from "../assets/icons/mixer.png";
import generatorIcon from "../assets/icons/generator.png";
import breakerIcon from "../assets/icons/breaker.png";
import carpoolIcon from "../assets/icons/carpool.png";
import bike2Icon from "../assets/icons/2bike.png";
import car4Icon from "../assets/icons/Frame 1.png";
import landIcon from "../assets/icons/Frame 18.png";
import flatIcon from "../assets/icons/Frame 10.png";
import mobileIcon from "../assets/icons/Frame 02.png";
import laptopIcon from "../assets/icons/Frame 19.png";
import moreIcon from "../assets/icons/Frame 01.png";
import cardiologistIcon from "../assets/icons/image 88.png";
import physiotherapistIcon from "../assets/icons/Frame 16.png";
import dentistIcon from "../assets/icons/Frame 17.png";
import FruitesIcon from "../assets/icons/image 100.png";
import vegetablesIcon from "../assets/icons/image 101.png";
import dairyIcon from "../assets/icons/image 102.png";
import moreotherIcon from "../assets/icons/Frame 01.png";

// ✅ Main categories
const categories = [
  { icon: homeIcon, label: "Home services" },
  { icon: starIcon, label: "Most by services" },
  { icon: rentIcon, label: "Rent machines" },
  { icon: healthIcon, label: "Health care" },
  { icon: dailyneed, label: "Daily needs" },
  { icon: barcodeIcon, label: "bar code" },
  { icon: sosIcon, label: "SOS" },
];

// ✅ All Home Services
const homeServices = {
  "Appliance repair": [
    { name: "AC repair", icon: acIcon },
    { name: "Computer repair", icon: computerIcon },
    { name: "Washing machine repair", icon: washingIcon },
  ],
  "Plumbing services": [{ name: "Tap repair", icon: tapIcon }],
  "Cleaning services": [{ name: "Deep home cleaning", icon: cleaningIcon }],
  "Installation services": [{ name: "CCTV installation", icon: cctvIcon }],
};

// ✅ Other categories
const mostBookedServices = {
  "Vehicle care": [
    { name: "Bike wash", icon: bikeIcon },
    { name: "Car wash", icon: carIcon },
  ],
  "Electrical services": [
    { name: "Electricity installation", icon: installIcon },
    { name: "Electricity repair", icon: repairIcon },
  ],
  "Trainer": [{ name: "Gym trainer", icon: gymIcon }],
};



// ✅ Rent Machines
const rentMachines = {
  "Rent machineries": [
    { name: "Drill", icon: drillIcon },
    { name: "Cement mixer", icon: mixerIcon },
    { name: "Diesel generator", icon: generatorIcon },
    { name: "Concrete breaker", icon: breakerIcon },
  ],
};

// ✅ Health care services (not implemented yet)
const Healthcare = {
  "home services": [
    { name: "Cardiologist", icon: cardiologistIcon },
  ],
  "nearby" : [
    
    { name: "Physiotherapist", icon: physiotherapistIcon },
    { name: "Dentist", icon: dentistIcon },
  ],
};

// daily needs (not implemented yet)
const dailyNeeds = {
  "Daily needs": [
    {
      name: "Fruits & Vegetables",
      icon: FruitesIcon,
      subCategories: [
        { name: "Fruits", icon: FruitesIcon },
        { name: "Vegetables", icon: vegetablesIcon },
      ],
    },
    {
      name: "Dairy & Other",
      icon: dairyIcon,
      subCategories: [
        { name: "Dairy", icon: dairyIcon },
        { name: "MoreOther", icon: moreotherIcon },
      ],
    },
  ],
};

// ✅ Barcode
const barcodeServices = {
  vehicle: [
    { name: "2 wheeler", icon: bike2Icon },
    { name: "4 wheeler", icon: car4Icon },
  ],
  property: [
    { name: "land", icon: landIcon },
    { name: "flat", icon: flatIcon },
  ],
  electronics: [
    { name: "mobile", icon: mobileIcon },
    { name: "laptop", icon: laptopIcon },
  ],
  more: [{ name: "more", icon: moreIcon }],
};

// ✅ SOS Services
const sosServices = {
  "Emergency Services": [
    { name: "Car pooling", icon: carpoolIcon },
  ],
};






const ServiceCategories = () => {
  const [activeCategory, setActiveCategory] = useState(null);
  const navigate = useNavigate();

  const createSlug = (name) =>
    name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const handleClick = (label) => {
    setActiveCategory((prev) => (prev === label ? null : label));
  };

  // navigation logic
  const handleServiceClick = (serviceName) => {
    const slug = createSlug(serviceName);

    // SOS: check car-pooling first to avoid matching 'car' generic checks
    if (slug.includes("car-pooling") || slug.includes("carpool"))
      return navigate("/sos/car-pooling");
  
    



    // Home Services pages
    if (slug.includes("ac") || slug.includes("computer") || slug.includes("washing"))
      return navigate(`/appliance-repair/${slug}`);

    if (slug.includes("tap")) return navigate("/plumbing-service");
    if (slug.includes("cleaning")) return navigate("/cleaning-service");
    if (slug === "cctv-installation") return navigate("/installation-service");
    

    // Most booked services
    if (slug.includes("bike-wash"))
     return navigate("/vehicle-care/bike-wash");
    if (slug.includes("electricity-installation"))
      return navigate("/electric-installation");
    if (slug.includes("electricity-repair"))
      return navigate("/electric-repair");




    if (slug.includes("car-wash"))
  return navigate("/vehicle-care/car-wash");

    if (slug.includes("repair") || slug.includes("electricity")) return navigate("/electric-services");
    if (slug.includes("gym") || slug.includes("trainer")) return navigate("/trainer-services");
      

   

    // Trainer -> /trainer-services
    if (slug.includes("gym-trainer") || slug.includes("trainer"))
      return navigate("/trainer-services");

    

    // Rent Machines
    if (slug.includes("drill")) return navigate("/rent-machines/drill");
    if (slug.includes("cement-mixer")) return navigate("/rent-machines/cement-mixer");
    if (slug.includes("diesel-generator")) return navigate("/rent-machines/diesel-generator");
    if (slug.includes("concrete-breaker")) return navigate("/rent-machines/concrete-breaker");

    // Health Care Navigation
    if (slug.includes("cardio")) return navigate("/health-care/homeservice/home");

    if (slug.includes("physio")) return navigate("/health-care/physio");

    if (slug.includes("dent")) return navigate("/health-care/dentist");


    // Daily needs
    if (slug.includes("fruits")) return navigate("/daily-needs/fruits");
    if (slug.includes("vegetables")) return navigate("/daily-needs/vegetables");
    if (slug.includes("dairy")) return navigate("/daily-needs/dairy");
    if (slug.includes("moreother")) return navigate("/daily-needs/moreother");

    // Barcode vehicle
    if (slug.includes("2-wheeler")) return navigate("/barcode/vehicle/bike");
    if (slug.includes("4-wheeler") || slug.includes("4-wheeler"))
      return navigate("/barcode/vehicle/car");
    // Property barcode
    if (slug.includes("land")) return navigate("/barcode/property/land");
    if (slug.includes("flat")) return navigate("/barcode/property/flat");
    if (slug.includes("more")) return navigate("/barcode/more/more")

    // Electronics barcode
    // --- Barcode ---
    if (slug.includes("2-wheeler")) return navigate("/barcode/vehicle/bike");
    if (slug.includes("4-wheeler")) return navigate("/barcode/vehicle/car");
    if (slug.includes("land")) return navigate("/barcode/property/land");
    if (slug.includes("flat")) return navigate("/barcode/property/flat");
    if (slug.includes("mobile")) {return navigate("/barcode/electronics/mobile");
     }
    if (slug.includes("laptop")) {return navigate("/barcode/electronics/laptop");
     }


    // fallback
    navigate(`/search/${slug}`);
  };

  const renderServiceGroup = (data, title) => (
    <div className="home-service-details">
      <h3>{title}</h3>
      {Object.entries(data).map(([group, items], idx) => (
        <div key={idx} className="home-service-group">
          <h4>{group}</h4>
          <div className="home-service-items">
            {items.map((service, i) => (
              <div
                key={i}
                className="home-service-item"
                onClick={() => handleServiceClick(service.name)}
              >
                <img src={service.icon} alt={service.name} />
                <span>{service.name}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <section className="service-categories">
      <h2>Explore Our Service Categories</h2>

      {/* Top Category Buttons */}
      <div className="category-list">
        {categories.map((cat, index) => (
          <div
            className={`category-card ${activeCategory === cat.label ? "active" : ""}`}
            key={index}
            onClick={() => handleClick(cat.label)}
          >
            <img src={cat.icon} alt={cat.label} className="category-icon" />
            <span>{cat.label}</span>
          </div>
          
        ))}
      </div>

      {activeCategory === "Home services" &&
        renderServiceGroup(homeServices, "Available Home Services")}

      {activeCategory === "Most by services" &&
        renderServiceGroup(mostBookedServices, "Most Booked Services")}

      {activeCategory === "Rent machines" &&
        renderServiceGroup(rentMachines, "Rent Machineries")}

      {activeCategory === "Health care" &&
        renderServiceGroup(Healthcare, "Health Care")}

      
      
      {activeCategory === "Daily needs" &&
        renderServiceGroup(dailyNeeds, "Daily Need Services")}

      {activeCategory === "bar code" &&
        renderServiceGroup(barcodeServices, "Bar Code Services")}

      {activeCategory === "SOS" &&
        renderServiceGroup(sosServices, "Emergency SOS Services")}
    </section>
  );
};

export default ServiceCategories;
