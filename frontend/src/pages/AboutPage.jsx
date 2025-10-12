import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./AboutPage.css";
import Sidebar from "../component/navbar";
import Social from "../component/socials";

gsap.registerPlugin(ScrollTrigger);

export default function AboutPage() {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const textRef = useRef(null);
  const imagesRef = useRef(null);
  const galleryRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate heading with enhanced effects
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 80, scale: 0.9, rotationX: 45 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotationX: 0,
          duration: 1.5,
          ease: "power3.out",
          scrollTrigger: { trigger: headerRef.current, start: "top 85%" },
        }
      );

      // Animate paragraph with staggered text
      gsap.fromTo(
        textRef.current.querySelectorAll(".text-line"),
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: { trigger: textRef.current, start: "top 90%" },
        }
      );

      // Animate image grid with enhanced stagger
      gsap.fromTo(
        ".image-item",
        { opacity: 0, y: 60, scale: 0.85 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.2,
          stagger: {
            amount: 0.6,
            from: "center"
          },
          ease: "back.out(1.7)",
          scrollTrigger: { trigger: imagesRef.current, start: "top 85%" },
        }
      );

      // Animate gallery section
      gsap.fromTo(
        ".gallery-item",
        { opacity: 0, y: 80, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.1,
          stagger: {
            amount: 1,
            grid: "auto",
            from: "center"
          },
          ease: "power2.out",
          scrollTrigger: { 
            trigger: galleryRef.current, 
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          },
        }
      );

      // Floating animation for background elements
      gsap.to(".bg-blur-1", {
        y: 30,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      gsap.to(".bg-blur-2", {
        y: -40,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 0.5
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const openModal = (image) => {
    setSelectedImage(image);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'auto';
  };

  const mainImages = [
    {
      id: 1,
      src: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80",
      title: "Chaitanya Nights",
      description: "The spectacular night events that light up the campus"
    },
    {
      id: 2,
      src: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
      title: "Tech Arena",
      description: "Cutting-edge technology competitions and workshops"
    },
    {
      id: 3,
      src: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
      title: "Innovation Showcase",
      description: "Student innovations and creative projects on display"
    },
  ];

  const galleryImages = [
    {
      id: 1,
      src: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80",
      category: "Cultural"
    },
    {
      id: 2,
      src: "https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&w=600&q=80",
      category: "Technical"
    },
    {
      id: 3,
      src: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&q=80",
      category: "Workshops"
    },
    {
      id: 4,
      src: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=600&q=80",
      category: "Performances"
    },
    {
      id: 5,
      src: "https://images.unsplash.com/photo-1574267432553-4b4628081c31?auto=format&fit=crop&w=600&q=80",
      category: "Art & Design"
    },
    {
      id: 6,
      src: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=600&q=80",
      category: "Sports"
    },
    {
      id: 7,
      src: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80",
      category: "Awards"
    },
    {
      id: 8,
      src: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=600&q=80",
      category: "Exhibitions"
    }
  ];

  return (
    <section ref={sectionRef} className="about-section">
      {/* Enhanced Background gradients */}
      <div className="bg-blur-1"></div>
      <div className="bg-blur-2"></div>
      <div className="bg-blur-3"></div>

      {/* Particle background */}
      <div className="particles"></div>

      {/* Main Content */}
      <div className="about-content">
        {/* Enhanced Heading */}
        <header ref={headerRef} className="about-header">
          <h1 className="about-title">About Chaitanya</h1>
          <div className="title-underline"></div>
        </header>
    <Sidebar/>
    <Social/>
        {/* Enhanced Description */}
        <div ref={textRef} className="about-text">
          <p className="text-line">
           Chaitanya is a techno-cultural fest of HPTU — 
            a vibrant celebration of innovation, creativity, and talent that brings together 
            brilliant minds from across the nation.
         
            For the very first time, the student community at H.P.T.U have taken this opportunity to bring bright minds from all over the state through the various technical competitions and cultural events that are to be held at CHAITANYA.
          </p>
          <br/>
          <p className="text-line">
            Join us in this spectacular journey where technology meets culture, 
            and dreams transform into reality.
          </p>
          <br/>
          <p className="text-line">
            Venue: Himachal Pradesh Technical University<br/>
            Date: 7th to 10th November, 2025
          </p>
        </div>

        {/* Stats Section */}
        <div className="stats-section">
          <div className="stat-item">
            <h3>200+</h3>
            <p>Participants</p>
          </div>
          <div className="stat-item">
            <h3>10+</h3>
            <p>Events</p>
          </div>
          <div className="stat-item">
            <h3>3</h3>
            <p>Days</p>
          </div>
          <div className="stat-item">
            <h3>50+</h3>
            <p>Colleges</p>
          </div>
        </div>

        {/* Enhanced Image Grid */}
        <div ref={imagesRef} className="about-images">
          {mainImages.map((img) => (
            <div key={img.id} className="image-item" onClick={() => openModal(img)}>
              <img src={img.src} alt={img.title} />
              <div className="image-overlay">
                <h4>{img.title}</h4>
                <p>{img.description}</p>
                <button className="view-btn">View Details</button>
              </div>
            </div>
          ))}
        </div>

        {/* Gallery Section */}
        <section ref={galleryRef} className="gallery-section">
          <div className="gallery-header">
            <h2>Festival Gallery</h2>
            <p>Relive the magic through our collection of memorable moments</p>
          </div>
          <div className="gallery-grid">
            {galleryImages.map((image) => (
              <div 
                key={image.id} 
                className="gallery-item"
                onClick={() => openModal(image)}
              >
                <img src={image.src} alt={image.category} />
                <div className="gallery-overlay">
                  <span>{image.category}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeModal}>×</button>
            <img src={selectedImage.src} alt={selectedImage.title || selectedImage.category} />
            <div className="modal-info">
              <h3>{selectedImage.title || selectedImage.category}</h3>
              {selectedImage.description && <p>{selectedImage.description}</p>}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}