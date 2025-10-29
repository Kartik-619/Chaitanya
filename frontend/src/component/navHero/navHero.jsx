import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './NavHero.css';
import Typewriter from '../typewriter';

export default function NavHero() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            <nav className="nav-header">
                {/* Logo/Brand */}
                <div className="nav-logo">
                    <Link to="/" className="logo-text">CHAITANYA</Link>
                </div>

                {/* Navigation Links */}
                <div className="nav-menu">
                    <Link to="/" className="menu-item">Home</Link>
                    <Link to="/about" className="menu-item">About</Link>
                    <Link to="/events" className="menu-item">Events</Link>
                    <Link to="/contact" className="menu-item">Contact</Link>
                </div>

                {/* Action Buttons */}
                <div className="nav-buttons">
                    <a
                        href="https://chaitanya-subdomain.vercel.app/"
                        className="register-link"
                    >
                        Register
                    </a>
                </div>

                {/* Mobile Menu Button */}
                <div className="mobile-nav">
                    <button 
                        className={`hamburger-btn ${isMobileMenuOpen ? 'active' : ''}`}
                        onClick={toggleMobileMenu}
                    >
                        <span className="hamburger-line"></span>
                        <span className="hamburger-line"></span>
                        <span className="hamburger-line"></span>
                    </button>
                </div>
            </nav>

            {/* Full Screen Mobile Sidebar */}
            <div className={`mobile-sidebar ${isMobileMenuOpen ? 'active' : ''}`}>
                {/* Close Button */}
                <button className="mobile-close-btn" onClick={closeMobileMenu}>
                    <span className="close-icon">×</span>
                </button>

             

                {/* Mobile Navigation Links */}
                <div className="mobile-nav-menu">
                    <Link to="/" className="mobile-nav-item" onClick={closeMobileMenu}>
                        <span className="mobile-nav-icon">🏠</span>
                        Home
                    </Link>
                    <Link to="/about" className="mobile-nav-item" onClick={closeMobileMenu}>
                        <span className="mobile-nav-icon">ℹ️</span>
                        About
                    </Link>
                    <Link to="/events" className="mobile-nav-item" onClick={closeMobileMenu}>
                        <span className="mobile-nav-icon">🎪</span>
                        Events
                    </Link>
                    <Link to="/contact" className="mobile-nav-item" onClick={closeMobileMenu}>
                        <span className="mobile-nav-icon">📞</span>
                        Contact
                    </Link>
                </div>

                {/* Mobile Register Button */}
                <div className="mobile-register-section">
                    <a
                        href="https://chaitanya-subdomain.vercel.app/"
                        className="mobile-register-btn"
                        onClick={closeMobileMenu}
                    >
                        Register Now
                    </a>
                </div>

                {/* Footer Section */}
                <div className="mobile-footer">
                    <p className="mobile-footer-text">Join us for an unforgettable experience</p>
                </div>
            </div>

            {/* Overlay */}
            <div 
                className={`mobile-overlay ${isMobileMenuOpen ? 'active' : ''}`}
                onClick={closeMobileMenu}
            ></div>
        </>
    );
}