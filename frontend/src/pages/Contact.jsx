import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ContactPage.css';
import Icon from '../component/icon';
import Social from '../component/socials';

import Sidebar from '../component/navbar';
// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const ContactPage = () => {
  const heroRef = useRef(null);
  const particlesRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero section animations
      gsap.fromTo(".hero-title", 
        { opacity: 0, y: 100, scale: 0.8 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.5,
          ease: "power3.out",
          delay: 0.5
        }
      );

      gsap.fromTo(".hero-subtitle",
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          delay: 1
        }
      );

      gsap.fromTo(".contact-card",
        { opacity: 0, scale: 0 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "back.out(1.7)",
          delay: 1.5,
          stagger: 0.2
        }
      );

      // Floating particles animation
      gsap.to(".floating-particle", {
        y: -30,
        x: "random(-20, 20)",
        rotation: "random(-180, 180)",
        duration: "random(3, 6)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.2
      });

      // Section animations with ScrollTrigger
      gsap.fromTo(".info-card",
        { opacity: 0, y: 80 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".info-section",
            start: "top 70%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // Parallax effects
      gsap.to(".parallax-bg", {
        yPercent: -30,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });

      gsap.to(".parallax-element", {
        yPercent: -50,
        ease: "none",
        scrollTrigger: {
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });

      // Interactive hover effects
      const setupHoverEffects = () => {
        // Contact cards hover
        gsap.utils.toArray(".contact-card").forEach((card) => {
          card.addEventListener("mouseenter", () => {
            gsap.to(card, {
              y: -10,
              scale: 1.02,
              duration: 0.3,
              ease: "power2.out"
            });
          });
          card.addEventListener("mouseleave", () => {
            gsap.to(card, {
              y: 0,
              scale: 1,
              duration: 0.3,
              ease: "power2.out"
            });
          });
        });

        // Info cards hover
        gsap.utils.toArray(".info-card").forEach((card) => {
          card.addEventListener("mouseenter", () => {
            gsap.to(card, {
              y: -5,
              duration: 0.3,
              ease: "power2.out"
            });
          });
          card.addEventListener("mouseleave", () => {
            gsap.to(card, {
              y: 0,
              duration: 0.3,
              ease: "power2.out"
            });
          });
        });
      };

      setupHoverEffects();
    });

    return () => ctx.revert();
  }, []);

  const contactMethods = [
    {
      icon: "📧",
      title: "Email Us",
      details: [
        "pro.advaitkaushal@gmail.com",
        "pathaniaabhishek5555@gmail.com",
        "chaitanyahptu@gmail.com"
      ],
      description: "Send us an email for any queries or information"
    },
    
    {
      icon: "📱",
      title: "Call Us",
      details: [
        "+91 9459111001",
        "+91 9816367020"
      ],
      description: "Available during business hours"
    },
    {
      icon: "📍",
      title: "Visit Us",
      details: [
        "Himachal Pradesh Technical University",
        "Hamirpur, Himachal Pradesh"
      ],
      description: "Come visit our campus"
    }
  ];

  const quickInfo = [
    {
      icon: "⏰",
      title: "Response Time",
      value: "Within 24 hours",
      color: "text-emerald"
    },
    {
      icon: "🔄",
      title: "Availability",
      value: "Mon - Sat, 9AM - 6PM",
      color: "text-blue"
    },
    {
      icon: "💬",
      title: "Support",
      value: "Technical & General",
      color: "text-purple"
    },
    {
      icon: "🌐",
      title: "Social Media",
      value: "Instagram Active",
      color: "text-pink"
    }
  ];

  return (
    <div className="contact-page">
      <Icon/>
      <Sidebar/>
      <Social/>
      {/* Animated Background */}
      <div className="animated-background">
        <div className="parallax-bg" />
        <div className="parallax-element parallax-element-1" />
        <div className="parallax-element parallax-element-2" />
        
        {/* Floating Particles */}
        <div ref={particlesRef} className="particles-container">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="floating-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="hero-section">
        <div className="hero-container">
          <h1 className="hero-title">
            CONTACT US
          </h1>
          
          <p className="hero-subtitle">
            Get in Touch • We're Here to Help • Quick Response Guaranteed
          </p>

          {/* Contact Cards */}
          <div className="contact-cards-grid">
            {contactMethods.map((method, index) => (
              <div
                key={index}
                className="contact-card"
              >
                <div className="contact-card-icon">
                  {method.icon}
                </div>
                <h3 className="contact-card-title">
                  {method.title}
                </h3>
                <div className="contact-card-details">
                  {method.details.map((detail, idx) => (
                    <p key={idx} className="contact-card-detail">
                      {detail}
                    </p>
                  ))}
                </div>
                <p className="contact-card-description">
                  {method.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Info Section */}
      <section className="info-section">
        <div className="info-container">
          <h2 className="info-section-title">
            <span className="info-section-icon">⚡</span>
            Quick Information
            <span className="info-section-icon">⚡</span>
          </h2>

          <div className="info-cards-grid">
            {quickInfo.map((info, index) => (
              <div
                key={index}
                className="info-card"
              >
                <div className="info-card-icon">
                  {info.icon}
                </div>
                <h3 className="info-card-title">
                  {info.title}
                </h3>
                <p className={`info-card-value ${info.color}`}>
                  {info.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Contact Section */}
      <section className="additional-contact-section">
        <div className="additional-contact-container">
          <h2 className="additional-contact-title">
            Need <span className="highlight-text">Immediate</span> Help?
          </h2>
          <p className="additional-contact-subtitle">
            For urgent matters, feel free to call us directly or send an email. We'll get back to you as soon as possible.
          </p>
          
          <div className="contact-methods-card">
            <div className="contact-methods-grid">
              <div className="contact-method">
                <div className="contact-method-icon">📞</div>
                <h3 className="contact-method-title">Direct Call</h3>
                <p className="contact-method-value">+91 9459111001</p>
                <p className="contact-method-label">Advait Kaushal</p>
              </div>
              <div className="contact-method">
                <div className="contact-method-icon">📧</div>
                <h3 className="contact-method-title">Primary Email</h3>
                <p className="contact-method-value">pro.advaitkaushal@gmail.com</p>
                <p className="contact-method-label">Official Contact</p>
              </div>
            </div>
          </div>

          <div className="fest-email-card">
            <h3 className="fest-email-title">Fest Email</h3>
            <p className="fest-email-value">chaitanyahptu@gmail.com</p>
            <p className="fest-email-label">For general fest-related queries and information</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="social-links">
            {[
              { name: 'Twitter', url: '#' },
              { name: 'Instagram', url: 'https://www.instagram.com/chaitanyahptu/?hl=en' },
              { name: 'LinkedIn', url: '#' },
              { name: 'GitHub', url: '#' }
            ].map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                {social.name}
              </a>
            ))}
          </div>
          <p className="footer-copyright">
            © 2025 CHAITANYA Tech Fest. Built with 🖤 by HPTU Students
          </p>
          <div className="footer-contact">
            Contact: pro.advaitkaushal@gmail.com | +91 9459111001
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContactPage;