import React, { useState, useEffect } from 'react';
import Icon from "./icon";
import NavHero from "./navHero/navHero";
import "./aboutNew.css";
import { useNavigate } from 'react-router-dom';


const AboutNew = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentEvent, setCurrentEvent] = useState('');
  const [currDesc,setCurr]=useState('');
  // MANUAL SPEED CONTROL - Change this value to control slide speed
  const slideSpeed = 4000; // Change this number (in milliseconds)

  const events = [
    {
      img: "https://res.cloudinary.com/dpe1pmwsv/image/upload/v1690000000/I1_q5z0as.jpg",
      title: "Data-Thon",
      fullDesc: "Test your data science and machine learning skills in this prediction competition. Build models to solve real-world problems with accuracy.",

    },
    {
      img: "https://res.cloudinary.com/dpe1pmwsv/image/upload/v1690000001/i5_r4phcv.jpg",
      title: "Prompt Engineering",
      fullDesc: "Showcase your skill in designing prompts that yield precise, creative AI outputs.",

    },
    {
      img: "https://res.cloudinary.com/dpe1pmwsv/image/upload/v1690000002/i4_e5e4co.jpg",
      title: "Retro Themeing",
      fullDesc: "Bring back the classic vibes! Participate in this creative design contest inspired by retro culture, art, and fashion.",

    },
    {
      img: "https://res.cloudinary.com/dpe1pmwsv/image/upload/v1690000003/I2_phkhss.jpg",
      title: "Code Forge",
      fullDesc: "Join us for an intense 36-hour hackathon where teams compete to create groundbreaking applications. ",

    },
    {
      img: "https://res.cloudinary.com/dpe1pmwsv/image/upload/v1690000004/I3_nr8paz.jpg",
      title: "E-Sports",
      fullDesc: "Face off in popular titles like Valorant, FreeFire, and BGMI.",

    }
  ];
  const navigate = useNavigate();

  const handleViewEvents = () => {
    navigate('/events');
  };

  const handleRegisterClick = () => {
    window.open('https://chaitanya-subdomain.vercel.app/', '_blank');
  };

  // Auto slide - uses the slideSpeed variable
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === events.length - 1 ? 0 : prevIndex + 1
      );
    }, slideSpeed); // Using the slideSpeed variable here

    return () => clearInterval(interval);
  }, [events.length, slideSpeed]); // Added slideSpeed to dependencies

  // Update current event title
  useEffect(() => {
    setCurrentEvent(events[currentIndex].title);
    setCurr(events[currentIndex].fullDesc);
  }, [currentIndex, events]);

  return (
    <div className='about-container'>
      <NavHero />
      
      <h1 className="events-heading">Events and Activities</h1>

      <div className="content-wrapper">
        <div className="carousel-container">
          <div className="carousel">
            <div className="carousel-inner">
              {events.map((event, index) => (
                <div
                  key={index}
                  className={`slide ${index === currentIndex ? 'active' : ''}`}
                >
                  <div className="image-wrapper">
                    <img
                      src={event.img}
                      alt={event.title}
                      className="event-poster"
                    />
                   
                  </div>
                </div>
              ))}
            </div>          
          </div>
        </div>
        
        <div className="action-buttons">
          <div className="current-event">
            <h3>Current Event:</h3>
            <h2>{currentEvent}</h2>
          </div>
          <div className='current-desc'>
            <h2>Description</h2>
            <h3>{currDesc}</h3>
          </div>
          <button className="btn view-btn" onClick={handleViewEvents}>View All Events</button>
          <button className="btn register-btn" onClick={handleRegisterClick}>Register Now</button>
        </div>
      </div>
      
      <Icon />
    </div>
  );
};

export default AboutNew;