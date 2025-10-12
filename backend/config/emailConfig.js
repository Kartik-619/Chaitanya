const EMAIL_CONFIG = {
  // Email service configuration
  SERVICE: 'Gmail',
  FROM_EMAIL: 'chaitanyahptu@gmail.com',
  FROM_NAME: 'Chaitanya 2025 Team',
  
  // ID Card design constants
  ID_CARD: {
    SIZE: [540, 320],
    MARGIN: 0,
    PRIMARY_COLOR: '#8B0000',
    BACKGROUND_COLOR: '#f7f7f9',
    CARD_COLOR: '#ffffff',
    BORDER_COLOR: '#e0e0e0',
    LEFT_PANEL_WIDTH: 160,
    PROFILE_RADIUS: 48
  },
  
  // Font sizes
  FONT_SIZES: {
    EVENT_TITLE: 13,
    EVENT_SUBTITLE: 9,
    PROFILE_INITIALS: 28,
    STUDENT_NAME: 20,
    COLLEGE: 10,
    REGISTRATION_ID: 11,
    EVENTS: 9,
    AMOUNT: 10,
    QR_LABEL: 8,
    FOOTER: 9
  },
  
  // Positions and spacing
  POSITIONS: {
    CARD_OFFSET: 12,
    LEFT_PANEL_OFFSET: 8,
    EVENT_TITLE: { x: 20, y: 22 },
    EVENT_SUBTITLE: { x: 20, y: 44 },
    PROFILE_CENTER: { y: 108 },
    CONTENT_OFFSET: 20,
    QR_SIZE: 92,
    QR_OFFSET: 18,
    FOOTER_HEIGHT: 28
  }
};

module.exports = { EMAIL_CONFIG };