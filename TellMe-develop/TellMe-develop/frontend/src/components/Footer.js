import React from 'react';
import './Footer.css';
import logo from '../assets/images/logo.png';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        {/* Left Section: Logo and Copyright */}
         <div className="logo-section">
            <img src={logo} alt="Tell Me Logo" className="logo-img" />
      
          <p>© {new Date().getFullYear()} Tell Me. All Rights Reserved.</p>
        </div>

        {/* Center Section: Company Links */}
        <div className="footer-center">
          <h4>Company</h4>
          <ul>
            <li><a href="/about">About us</a></li>
            <li><a href="/terms">Terms & Conditions</a></li>
          </ul>
        </div>

        {/* Right Section: Social Media */}
        <div className="footer-right">
          <h4>Follow us</h4>
          <div className="social-icons">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">📸</a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">▶️</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">🐦</a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">📘</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;