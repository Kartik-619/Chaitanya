import React from 'react';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './event_over.css';
import { Link } from 'react-router-dom';

export default function EventsCarousel() {
  const events = [
    {
      img: "https://res.cloudinary.com/dpe1pmwsv/image/upload/v1690000000/I1_q5z0as.jpg",
      title: "Integration Bee"
    },
    {
      img: "https://res.cloudinary.com/dpe1pmwsv/image/upload/v1690000001/i5_r4phcv.jpg",
      title: "Code Wars"
    },
    {
      img: "https://res.cloudinary.com/dpe1pmwsv/image/upload/v1690000002/i4_e5e4co.jpg",
      title: "Under The Hood"
    },
    {
      img: "https://res.cloudinary.com/dpe1pmwsv/image/upload/v1690000003/I2_phkhss.jpg",
      title: "The Nexus Key"
    },
    {
      img: "https://res.cloudinary.com/dpe1pmwsv/image/upload/v1690000004/I3_nr8paz.jpg",
      title: "Prompt Engineering"
    }
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    arrows: true,
    fade: true,
    cssEase: 'linear',
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          arrows: true,
        }
      },
      {
        breakpoint: 768,
        settings: {
          arrows: false,
          dots: true
        }
      }
    ]
  };

  return (
    <div className="events-carousel-container">
      <div className="carousel-content">
        <Slider {...settings}>
          {events.map((event, index) => (
            <div key={index} className="slide-item">
              <div className="image-container">
                <Link to="/events">
                  <img
                    src={event.img}
                    alt={event.title}
                    className="event-image"
                  />
                </Link>
                <div className="event-title-overlay">
                  <h3>{event.title}</h3>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
      
      
    </div>
  );
}