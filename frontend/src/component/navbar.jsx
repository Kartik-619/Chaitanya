// Sidebar.jsx
import { useState } from "react";
import Typewriter from "./typewriter";
import "./navbar.css";
import { Link } from "react-router-dom";

// Hamburger Icon (☰)
const MenuIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
    <path fill="currentColor" d="M0 96C0 78.4 14.4 64 32 64H416C433.6 64 448 78.4 448 96C448 113.6 433.6 128 416 128H32C14.4 128 0 113.6 0 96zM0 256C0 238.4 14.4 224 32 224H416C433.6 224 448 238.4 448 256C448 273.6 433.6 288 416 288H32C14.4 288 0 273.6 0 256zM448 416C448 433.6 433.6 448 416 448H32C14.4 448 0 433.6 0 416C0 398.4 14.4 384 32 384H416C433.6 384 448 398.4 448 416z" />
  </svg>
);

// Close Icon (✕)
const CloseIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
    <path fill="currentColor" d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z" />
  </svg>
);

export default function Sidebar() {
  const [menu, setMenu] = useState(false);

  return (
    <>
      {/* Toggle Button */}
      <button
        type="button"
        className="fixed top-5 right-5 z-50 p-2 cursor-pointer text-white hover:bg-white hover:bg-opacity-10 rounded transition"
        onClick={() => setMenu(true)}
        aria-label="Open menu"
      >
        <MenuIcon className="w-6 h-6" />
      </button>

      {/* Overlay (when open) */}
      {menu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
            onClick={() => setMenu(false)}
          >
            {/* Logo Text */}
            <Typewriter
              text="Chaitanya 1.0"
              className="icon_name price-font text-9xl md:text-9xl text-center"
            />
          </div>

          {/* Sidebar Panel */}
          <div
  className="fixed top-0 right-0 h-full w-110 bg-stone-900 shadow-xl z-50 transform transition-transform duration-300 ease-in-out"
  style={{ boxShadow: "0 0 30px rgba(0,0,0,0.5)" }}
  onClick={(e) => e.stopPropagation()}
>
  {/* Header */}
  <div className="p-5 border-b border-gray-600 flex justify-between items-center bg-stone-800 relative">
    <h3 className="price-font text-5xl font-bold text-white absolute left-1/2 transform -translate-x-1/2">Menu</h3>
    <button
      onClick={() => setMenu(false)}
      className="p-1 hover:bg-gray-700 rounded transition ml-auto"
      aria-label="Close menu"
    >
      <CloseIcon className="text-white w-5 h-5" />
    </button>
  </div>


            {/* Navigation Links */}
            <ul className="nav-links">
              <li>
                <Link
                  to="/"
                  onClick={() => setMenu(false)}
                  className="price-font text-4xl md:text-4xl text-white hover:text-shadow-white transition"
                >
                  Home
                </Link>
              </li>
              
              <li>
                <Link
                  to="/events"
                  onClick={() => setMenu(false)}
                  className="price-font text-4xl md:text-4xl text-white hover:text-shadow-white transition"
                >
                  Events
                </Link>
              </li>
              <li>
                <a
                  href="http://localhost:3001"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMenu(false)}
                  className="price-font text-4xl md:text-4xl text-white hover:text-shadow-white transition"
                >
                  Register
                </a>
              </li>
              
              <li>
                <Link
                  to="/about"
                  onClick={() => setMenu(false)}
                  className="price-font text-4xl md:text-4xl text-white hover:text-shadow-white transition"
                >
                About
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  onClick={() => setMenu(false)}
                  className="price-font text-4xl md:text-4xl text-white hover:text-shadow-white transition"
                >
                Contact US
                </Link>
              </li>
            </ul>
            </div>
            
        </>
      )}
    </>
  );
}