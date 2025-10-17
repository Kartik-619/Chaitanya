import React, { useState, useEffect, useRef } from 'react';
import { Mail, ExternalLink, Sparkles, Award, Star } from 'lucide-react';
import Sidebar from '../../component/navbar';
import Social from '../../component/socials';

export default function SponsorsPage() {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredEmail, setHoveredEmail] = useState(false);
  const [visibleCards, setVisibleCards] = useState([]);
  const [emailStatus, setEmailStatus] = useState('');
  const cardRefs = useRef([]);

  // Add your sponsors here
  const sponsors = [
    // Example sponsor structure:
    // { id: 0, name: 'Tech Corp', tier: 'Platinum', description: 'Leading tech company', website: 'https://techcorp.com', logo: '💻', slideFrom: 'left' }
  ];

  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, sponsors.length);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cardId = entry.target.getAttribute('data-card-id');
            setTimeout(() => {
              setVisibleCards((prev) => [...prev, parseInt(cardId)]);
            }, parseInt(cardId) * 150);
          }
        });
      },
      { threshold: 0.3, rootMargin: '0px 0px -50px 0px' }
    );

    cardRefs.current.forEach((ref) => ref && observer.observe(ref));

    return () => {
      cardRefs.current.forEach((ref) => ref && observer.unobserve(ref));
    };
  }, [sponsors.length]);

  const getTierColor = (tier) => {
    switch (tier) {
      case 'Platinum':
        return { bg: 'rgba(139, 169, 230, 0.15)', border: '#8BA9E6', shadow: '139, 169, 230' };
      case 'Gold':
        return { bg: 'rgba(147, 197, 253, 0.15)', border: '#93C5FD', shadow: '147, 197, 253' };
      case 'Silver':
        return { bg: 'rgba(167, 139, 250, 0.15)', border: '#A78BFA', shadow: '167, 139, 250' };
      case 'Bronze':
        return { bg: 'rgba(196, 181, 253, 0.15)', border: '#C4B5FD', shadow: '196, 181, 253' };
      default:
        return { bg: 'rgba(255, 255, 255, 0.05)', border: '#9ca3af', shadow: '156, 163, 175' };
    }
  };

  const getSlideAnimation = (slideFrom, cardId) => {
    const isVisible = visibleCards.includes(cardId);
    switch (slideFrom) {
      case 'left':
        return {
          transform: isVisible ? 'translateX(0) rotate(0deg)' : 'translateX(-100px) rotate(-5deg)',
          opacity: isVisible ? 1 : 0,
          transition: 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        };
      case 'right':
        return {
          transform: isVisible ? 'translateX(0) rotate(0deg)' : 'translateX(100px) rotate(5deg)',
          opacity: isVisible ? 1 : 0,
          transition: 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        };
      default:
        return {
          transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(50px) scale(0.9)',
          opacity: isVisible ? 1 : 0,
          transition: 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        };
    }
  };

  const handleEmailClick = () => {
    const email = 'chndlntn@gmail.com';
    const subject = 'TechFest 2025 Sponsorship Inquiry';
    const body = `Hello TechFest Team,

I am interested in becoming a sponsor for TechFest 2025 and would like to learn more about sponsorship opportunities.

Thank you,
[Your Name]
[Company Name]`;

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    setEmailStatus('opening-gmail');

    const newTab = window.open(gmailUrl, '_blank');
    if (newTab) {
      newTab.focus();
      setTimeout(() => setEmailStatus(''), 2000);
    } else {
      setEmailStatus('popup-blocked');
      setTimeout(() => {
        window.location.href = gmailUrl;
      }, 1000);
    }
  };

  const copyEmailToClipboard = () => {
    navigator.clipboard
      .writeText('chndlntn@gmail.com')
      .then(() => {
        setEmailStatus('copied');
        setTimeout(() => setEmailStatus(''), 3000);
      })
      .catch(() => {
        setEmailStatus('copy-failed');
        setTimeout(() => setEmailStatus(''), 3000);
      });
  };

  return (
    <div
      style={{
        background: 'linear-gradient(180deg, #000000 0%, #0a0515 25%, #0f0a1f 50%, #0a0515 75%, #000000 100%)',
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'auto'
      }}
    >
      {/* Background animations */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden'
      }}>
        <div
          style={{
            position: 'absolute',
            borderRadius: '50%',
            filter: 'blur(48px)',
            background: 'radial-gradient(circle, rgba(147, 197, 253, 0.15) 0%, transparent 70%)',
            width: '600px',
            height: '600px',
            top: '5%',
            right: '5%',
            animation: 'float 12s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            borderRadius: '50%',
            filter: 'blur(48px)',
            background: 'radial-gradient(circle, rgba(167, 139, 250, 0.15) 0%, transparent 70%)',
            width: '500px',
            height: '500px',
            bottom: '5%',
            left: '5%',
            animation: 'float 10s ease-in-out infinite reverse',
          }}
        />
        <Sidebar/>
        <Social/>
        <div
          style={{
            position: 'absolute',
            borderRadius: '50%',
            filter: 'blur(48px)',
            background: 'radial-gradient(circle, rgba(196, 181, 253, 0.1) 0%, transparent 70%)',
            width: '400px',
            height: '400px',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'pulse 8s ease-in-out infinite',
          }}
        />
      </div>

      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '64px 16px',
        paddingTop: '80px'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '64px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px'
          }}>


            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              
              <h1
                style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  margin: '0 16px',
                  background: 'linear-gradient(135deg, #93C5FD 0%, #A78BFA 50%, #C4B5FD 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: '0 0 40px rgba(147, 197, 253, 0.3)',
                }}
              >
                OUR SPONSORS
              </h1>
             
            </div>

            <div style={{ width: '128px' }}></div>
          </div>

          <p style={{
            fontSize: '1.6rem',
            color: '#d1d5db',
            maxWidth: '672px',
            margin: '0 auto',
            lineHeight: '1.75',
            textAlign: 'center'
          }}>
            We're grateful to our amazing sponsors who make this tech fest possible. Together, we're shaping the future of technology and innovation.
          </p>
        </div>

        {/* Sponsors Grid */}
        {sponsors.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '96px 0'
          }}>
            <div style={{
              fontSize: '84px',
              marginBottom: '24px',
              animation: 'float 3s ease-in-out infinite'
            }}>🤝</div>
            <h3 style={{
              fontSize: '30px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '12px'
            }}>No Sponsors Yet</h3>
            <p style={{
              color: '#e5e7eb',
              fontSize: '1.6rem'
            }}>Be the first to sponsor our amazing event!</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(1, 1fr)',
            gap: '32px',
            marginBottom: '64px',
            maxWidth: '1120px',
            margin: '0 auto'
          }}>
            {sponsors.map((sponsor, index) => {
              const tierColors = getTierColor(sponsor.tier);
              const slideAnimation = getSlideAnimation(sponsor.slideFrom, sponsor.id);

              return (
                <div
                  key={sponsor.id}
                  ref={(el) => (cardRefs.current[index] = el)}
                  data-card-id={sponsor.id}
                  style={{
                    position: 'relative',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    transition: 'all 0.5s ease',
                    cursor: 'pointer',
                    background: hoveredCard === index ? tierColors.bg : 'rgba(10, 5, 21, 0.5)',
                    border: `1px solid ${hoveredCard === index ? tierColors.border : 'rgba(255, 255, 255, 0.08)'}`,
                    transform: `${slideAnimation.transform} ${hoveredCard === index ? 'translateY(-12px) scale(1.02)' : 'translateY(0) scale(1)'}`,
                    boxShadow: hoveredCard === index
                      ? `0 20px 50px rgba(${tierColors.shadow}, 0.3), 0 0 30px rgba(${tierColors.shadow}, 0.2)`
                      : '0 8px 32px rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(10px)',
                    opacity: slideAnimation.opacity,
                    transition: `${slideAnimation.transition}, box-shadow 0.3s ease, border 0.3s ease, transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
                  }}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Tier Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    zIndex: 10
                  }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        fontSize: '1.6rem',
                        fontWeight: 'bold',
                        background: `rgba(${tierColors.shadow}, 0.25)`,
                        border: `1px solid ${tierColors.border}`,
                        color: tierColors.border,
                      }}
                    >
                      <Star size={14} fill={tierColors.border} />
                      <span>{sponsor.tier}</span>
                    </div>
                  </div>

                  {/* Gradient Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      opacity: hoveredCard === index ? 0.5 : 0,
                      transition: 'opacity 0.5s ease',
                      background: `linear-gradient(135deg, ${tierColors.border}10 0%, transparent 100%)`,
                    }}
                  />

                  <div style={{
                    position: 'relative',
                    padding: '32px'
                  }}>
                    {/* Logo */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      marginBottom: '24px'
                    }}>
                      <div
                        style={{
                          fontSize: '84px',
                          transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), filter 0.5s ease',
                          transform: hoveredCard === index ? 'scale(1.2) rotate(5deg)' : 'scale(1) rotate(0deg)',
                          filter: hoveredCard === index ? `drop-shadow(0 0 20px ${tierColors.border})` : 'none',
                        }}
                      >
                        {sponsor.logo}
                      </div>
                    </div>

                    {/* Name */}
                    <h3
                      style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: 'white',
                        textAlign: 'center',
                        marginBottom: '12px',
                        textShadow: hoveredCard === index ? `0 0 20px ${tierColors.border}` : 'none',
                        transition: 'text-shadow 0.3s ease',
                      }}
                    >
                      {sponsor.name}
                    </h3>

                    {/* Description */}
                    <p style={{
                      color: '#9ca3af',
                      textAlign: 'center',
                      fontSize: '14px',
                      lineHeight: '1.75',
                      marginBottom: '24px'
                    }}>
                      {sponsor.description}
                    </p>

                    {/* Website */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center'
                    }}>
                      <a
                        href={sponsor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          transition: 'all 0.3s ease',
                          background: hoveredCard === index
                            ? `rgba(${tierColors.shadow}, 0.25)`
                            : 'rgba(255, 255, 255, 0.05)',
                          border: `1px solid ${hoveredCard === index ? tierColors.border : 'rgba(255, 255, 255, 0.2)'}`,
                          color: hoveredCard === index ? tierColors.border : '#ffffff',
                          textDecoration: 'none'
                        }}
                      >
                        <span style={{
                          fontSize: '14px',
                          fontWeight: '500'
                        }}>Visit Website</span>
                        <ExternalLink size={16} />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Become a Sponsor Section */}
        <div
          style={{
            maxWidth: '672px',
            margin: '0 auto',
            textAlign: 'center',
            transform: visibleCards.length >= sponsors.length ? 'translateY(0)' : 'translateY(50px)',
            opacity: visibleCards.length >= sponsors.length ? 1 : 0,
            transition: 'all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) 300ms',
          }}
        >
          <div
            style={{
              borderRadius: '24px',
              padding: '48px',
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, rgba(10, 5, 21, 0.8) 0%, rgba(15, 10, 31, 0.8) 50%, rgba(10, 5, 21, 0.8) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(147, 197, 253, 0.25)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(147, 197, 253, 0.08)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.2,
                background: 'radial-gradient(circle at 50% 50%, rgba(147, 197, 253, 0.15) 0%, transparent 70%)',
                animation: 'pulse 4s ease-in-out infinite',
              }}
            />

            <div style={{
              position: 'relative',
              zIndex: 10
            }}>
              <Award size={64} style={{ 
                color: '#93C5FD',
                margin: '0 auto 24px auto'
              }} />
              <h2
                style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  marginBottom: '16px',
                  background: 'linear-gradient(135deg, #93C5FD 0%, #A78BFA 50%, #C4B5FD 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Become a Sponsor
              </h2>
              <p style={{
                fontSize: '18px',
                color: '#d1d5db',
                marginBottom: '24px',
                lineHeight: '1.75'
              }}>
                Join us in empowering the next generation of tech innovators. Partner with us to make a lasting impact on the tech community.
              </p>

              {emailStatus && (
                <div
                  style={{
                    marginBottom: '16px',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    ...(emailStatus === 'copied'
                      ? { background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.3)' }
                      : emailStatus === 'copy-failed'
                      ? { background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }
                      : emailStatus === 'opening-gmail'
                      ? { background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' }
                      : {})
                  }}
                >
                  {emailStatus === 'copied'
                    ? 'Email copied to clipboard!'
                    : emailStatus === 'copy-failed'
                    ? 'Failed to copy email.'
                    : emailStatus === 'opening-gmail'
                    ? 'Opening Gmail...'
                    : ''}
                </div>
              )}

              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '16px'
              }}>
                <button
                  onMouseEnter={() => setHoveredEmail(true)}
                  onMouseLeave={() => setHoveredEmail(false)}
                  onClick={handleEmailClick}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    borderRadius: '9999px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    background: 'linear-gradient(135deg, #93C5FD 0%, #A78BFA 100%)',
                    color: '#000',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Mail size={20} /> <span>Email Us</span>
                </button>

                <button
                  onClick={copyEmailToClipboard}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    borderRadius: '9999px',
                    fontWeight: '600',
                    border: '1px solid rgba(156, 163, 175, 0.3)',
                    color: 'white',
                    transition: 'all 0.3s ease',
                    background: 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  <Mail size={20} /> <span>Copy Email</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); }
          33% { transform: translateY(-30px) translateX(20px) rotate(3deg); }
          66% { transform: translateY(-15px) translateX(-20px) rotate(-3deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}