import React from 'react';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './event_over.css';
import {Link} from 'react-router-dom';

export default function EventsCarousel() {
  const events = [
    { 
      img: "/images/events/I1.jpg", 
      title: "Integration Bee"
    },
    { 
      img: "/images/events/I2.jpg", 
      title: "Code Wars"
    },
    { 
      img: "/images/events/I3.jpg", 
      title: "Under The Hood"
    },
    { 
      img: "/images/events/i4.jpg",  
      title: "The Nexus Key"
    },{
      img: "/images/events/i5.jpg",  
      title: "Prompt engineering"
    }
  ];

  const handleRegisterClick = () => {
    // Open the external link in a new tab
    window.open('https://chaitanya-subdomain.vercel.app/', '_blank', 'noopener,noreferrer');
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <div className="events-carousel-container">
      <h1>Events & Activities</h1>
      <br/>
     
      
      <div className="carousel-wrapper">
        <Slider {...settings}>
          {events.map((event, index) => (
            <div key={index} className="event-card-container">
            <Link to="/events">
              <img
                src={event.img}
                alt={event.title}
                className="event-img"
              />
            </Link>
          </div>
          
          ))}
        </Slider>
      </div>
      
      {/* Register Button - Now opens external link */}
      <button className='eve_reg' onClick={handleRegisterClick}>
        Register
      </button>
    </div>
  );
}