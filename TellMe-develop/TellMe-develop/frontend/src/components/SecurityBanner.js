import React, { useState, useEffect } from 'react';
import './SecurityBanner.css';

// Base URL: confirmed from your API image
const BASE_URL = 'http://127.0.0.1:8000';
const API_URL = `${BASE_URL}/api/ads/`; 

const SecurityBanner = () => {
    const [adData, setAdData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAdData = async () => {
            try {
                const response = await fetch(API_URL);

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}.`);
                }
                
                const rawData = await response.json();
                let fetchedAds = [];
                
                // API Response Structure Handling (Confirmed: data is in 'results')
                if (rawData.results && Array.isArray(rawData.results)) {
                    fetchedAds = rawData.results;
                } else if (Array.isArray(rawData)) {
                    fetchedAds = rawData;
                } else if (rawData && typeof rawData === 'object') {
                    fetchedAds = [rawData];
                } 
                
                // --- Filtering and Validation Logic ---
                
                const validAds = fetchedAds.filter(ad => {
                    // ✅ ad.is_active की जाँच करें, default true मान लें यदि फ़ील्ड मौजूद नहीं है
                    const isActive = ad.is_active === undefined ? true : ad.is_active;
                    
                    // ✅ ad.title OR ad.details (API से प्राप्त) फ़ील्ड की जाँच करें
                    const hasContent = ad.title || ad.details; 

                    return isActive && hasContent;
                });
                
                if (validAds.length > 0) {
                    setAdData(validAds[0]);
                } else {
                    setAdData(null);
                }
                
            } catch (e) {
                console.error("Fetching data failed: ", e);
                setError(e.message || "Network error. Check if Django is running and CORS is configured.");
            } finally {
                setLoading(false);
            }
        };

        fetchAdData();
    }, []); 

// -------------------------------------------------------------
// --- Data Display ---
// -------------------------------------------------------------

    // ✅ 'description' की जगह 'details' का उपयोग करें
    const title = adData?.title || "Untitled Ad";
    const description = adData?.details || "No description provided."; 
    
    // Image URL Resolution (यदि आवश्यक हो)
    const imageUrl = adData?.image 
        ? (adData.image.startsWith('http') ? adData.image : `${BASE_URL}${adData.image}`) 
        : null;

    const bannerStyle = imageUrl 
        ? { backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${imageUrl})` } 
        : {};

    // --- Conditional Rendering (same as before) ---
    if (loading) return <section className="security-banner loading"><div className="banner-content"><h2>Loading Ad Data...</h2></div></section>;
    if (error) return <section className="security-banner error"><div className="banner-content"><h2>Error! Failed to load ad data.</h2><p>Details: **{error}**</p></div></section>;
    
    // ✅ Updated validation logic: now checks for 'details'
    if (!adData || (!adData.title && !adData.details)) {
        return (
            <section className="security-banner no-data">
                <div className="banner-content">
                    <h2>No Active Advertisement Available</h2>
                    <p>The API responded, but no valid or active ad content was found.</p>
                </div>
            </section>
        );
    }
    
    return (
        <section className="security-banner active" style={bannerStyle}>
            <div className="banner-content">
                <h2>{title}</h2>
                <p>{description}</p>
                <button>{adData.button_text || "Book now"}</button>
            </div>
        </section>
    );
};

export default SecurityBanner;