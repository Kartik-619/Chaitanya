import React from 'react';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import'./event_over.css';
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
      title: "Under The  Hood"
     
    },
    { 
      img: "/images/events/i4.jpg",  
      title: "The Nexus Key"
    }
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
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
      <p className="carousel-description">
        Participate in the events and win the cash prize worth of   <b className='red text-xl'>₹ 75000</b>
      </p>
      
      <div className="carousel-wrapper">
        <Slider {...settings}>
          {events.map((event, index) => (
            <div key={index} className="event-card-container">
              <div className="event-card">
                <div className="event-image">
                  <img
                    src={event.img}
                    alt={event.title}
                    className="event-img"
                  />
                </div>
                <div className="event-content">
                  <h3 className="event-title">{event.title}</h3>
                  <p className="event-description">{event.description}</p>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}