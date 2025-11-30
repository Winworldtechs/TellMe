import React, { useState, useEffect } from "react";
import "./Header.css";

/* Images */
import logo from "../assets/images/logo.png";
import locationIconImg from "../assets/icons/location.png";
import searchIconImg from "../assets/icons/search.png";
import cartIconImg from "../assets/icons/cart.png";
import profileIconImg from "../assets/icons/profile.png";

import axios from "axios";
import { useNavigate } from "react-router-dom";

/* Local search data */
import { allSearchItems } from "../components/searchData";

const Header = ({ onSearchResults }) => {
  const [location, setLocation] = useState("Detecting...");
  const [query, setQuery] = useState("");
  const [suggest, setSuggest] = useState([]);

  const navigate = useNavigate();

  /* Detect Location via backend */
  useEffect(() => {
    const detectUserLocation = () => {
      if (!navigator.geolocation) {
        setLocation("Not Supported");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const res = await axios.get(
              `http://127.0.0.1:8000/api/accounts/reverse-geocode?lat=${position.coords.latitude}&lon=${position.coords.longitude}`
            );

            const addr = res.data.address;

            const city =
              addr?.city ||
              addr?.town ||
              addr?.village ||
              addr?.county ||
              addr?.suburb ||
              addr?.state_district ||
              addr?.state ||
              "Your Location";

            setLocation(city);
          } catch (err) {
            console.log("Location Error:", err);
            setLocation("Unavailable");
          }
        },
        () => setLocation("Permission Denied")
      );
    };

    detectUserLocation();
  }, []);

  /* Search Handler */
  const handleSearchChange = async (val) => {
    setQuery(val);

    if (!val) return setSuggest([]);

    // Local Client-side Search
    const filtered = allSearchItems.filter((x) =>
      x.name.toLowerCase().includes(val.toLowerCase())
    );
    setSuggest(filtered);

    // Backend Search
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/services/?search=${val}`
      );
      if (onSearchResults) onSearchResults(response.data);
    } catch {
      if (onSearchResults) onSearchResults([]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") setSuggest([]);
  };

  /* Suggestion Click */
  const handleSelect = (item) => {
    setQuery("");
    setSuggest([]);

    if (item.path) navigate(item.path);
  };

  return (
    <header className="main-header">
      <div className="header-container">

        {/* LOGO */}
        <div className="logo-section" onClick={() => navigate("/")}>
          <img src={logo} alt="Tell Me" className="logo-img" />
        </div>

        <div className="action-buttons">

          {/* LOCATION */}
          <div className="location-box">
            <img src={locationIconImg} className="location-icon-img" alt="" />
            <span className="location-text">{location}</span>
          </div>

          {/* SEARCH */}
          <div className="search-wrapper">
            <div className="search-box">
              <img src={searchIconImg} alt="" className="search-icon-img" />
              <input
                type="text"
                placeholder="Search services or vendors..."
                value={query}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyPress={handleKeyPress}
                className="search-input"
              />
            </div>

            {suggest.length > 0 && (
              <div className="suggest-box">
                {suggest.map((item, i) => (
                  <div
                    key={i}
                    className="suggest-item"
                    onClick={() => handleSelect(item)}
                  >
                    {item.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* BECOME A VENDOR BUTTON */}
          <div
            className="vendor-register-btn"
            onClick={() => navigate("/vendor/register")}
          >
            Become a Vendor
          </div>

          {/* CART */}
          <div className="icon-btn" onClick={() => navigate("/cart")}>
            <img src={cartIconImg} alt="" />
          </div>

          {/* PROFILE */}
          <div className="icon-btn" onClick={() => navigate("/profile")}>
            <img src={profileIconImg} alt="" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
