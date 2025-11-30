import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Hero.css";

const HeroSection = () => {
  const [hero, setHero] = useState(null);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/hero/hero/")
      .then((res) => setHero(res.data))
      .catch((err) => console.error("Error fetching hero:", err));
  }, []);

  if (!hero) return <p>Loading hero section...</p>;

  return (
    <div className="hero-container">
      <div className="hero-text">
        <h1>{hero.title}</h1>
        <p>{hero.subtitle}</p>
        <button>{hero.button_text}</button>
      </div>

      <div className="hero-images-grid">
        <div className="image-item"><img src={hero.image1_url} alt="Service 1" /></div>
        <div className="image-item"><img src={hero.image2_url} alt="Service 2" /></div>
        <div className="image-item"><img src={hero.image3_url} alt="Service 3" /></div>
        <div className="image-item"><img src={hero.image4_url} alt="Service 4" /></div>
      </div>
    </div>
  );
};

export default HeroSection;
