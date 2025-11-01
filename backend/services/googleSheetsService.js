/**
 * 📊 GOOGLE SHEETS SERVICE
 * 
 * This service handles all Google Sheets integration:
 * - Registration data storage and retrieval
 * - Event participation tracking
 * - Attendance marking and management
 * - Batch processing for high volume
 * 
 * 🔄 DATA FLOW:
 * - Registrations → Main Registrations Sheet
 * - Event Participation → Events Participation Sheet  
 * - Attendance → Events Participation Sheet (timestamp updates)
 */

const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const { SHEETS_CONFIG } = require('../config/constants');
const { getEventPrice } = require('../config/eventPricing');
const BackupService = require('./backupService');

class GoogleSheetsService {
  constructor() {
    this.failedRegistrationsFile = path.join(__dirname, '../backups/failed-registrations.json');

    // Google Sheets configuration from environment
    this.spreadsheetId = SHEETS_CONFIG.SPREADSHEET_ID;
    this.range = 'Registrations!A:Y'; // Main registrations sheet range (Columns A-Y)
    this.eventsRange = 'Events Participation!A:M'; // Events participation sheet range (Columns A-M)
    this.sheets = null; // Google Sheets API client
    this.initialized = false; // Track if Sheets API is ready
    
    // Batch queue system for handling high volume registrations
    this.writeQueue = []; // Queue to hold pending registrations
    this.isProcessingQueue = false; // Prevent multiple queue processing
    this.BATCH_SIZE = 5; // Process 5 registrations per API call to avoid limits
  }

  /**
   * Initialize Google Sheets API connection with service account
   */
  async initialize() {
    try {
      console.log('🔄 [DEBUG] Initializing Google Sheets Service...');
      
      // Path to service account credentials
      const credPath = path.join(process.cwd(), 'techfest-credentials.json');
      
      // Check if credentials file exists
      if (!fs.existsSync(credPath)) {
        console.log('❌ [DEBUG] Google Sheets credentials not found');
        return false;
      }
      
      // Load service account credentials
      const serviceAccount = JSON.parse(fs.readFileSync(credPath, 'utf8'));
      console.log('📧 [DEBUG] Service Account:', serviceAccount.client_email);
      
      // Create authentication client
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: serviceAccount.client_email,
          private_key: serviceAccount.private_key,
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      // Initialize Google Sheets API client
      this.sheets = google.sheets({ version: 'v4', auth });
      this.initialized = true;
      
      console.log('✅ [DEBUG] Google Sheets Service Ready!');
      return true;
      
    } catch (error) {
      console.error('❌ [DEBUG] Google Sheets initialization failed:', error.message);
      return false;
    }
  }

  /**
   * Ensure Sheets API is initialized before operations
   */
  async ensureInitialized() {
    if (!this.initialized) {
      return await this.initialize();
    }
    return true;
  }

  // ==================== BATCH QUEUE SYSTEM ====================

  /**
   * Add registration to queue for batch processing
   */
  async queueRegistration(registrationData) {
    // Add registration to the processing queue
    this.writeQueue.push(registrationData);
    console.log(`📝 Queued registration: ${registrationData.registrationId} (Queue: ${this.writeQueue.length})`);
    
    // Start processing if queue reaches batch size and not already processing
    if (!this.isProcessingQueue && this.writeQueue.length >= this.BATCH_SIZE) {
      this.processQueue();
    }
    
    // Return immediate success - data is safely queued
    return {
      success: true,
      registrationId: registrationData.registrationId,
      message: 'Registration queued for processing',
      sheetsAvailable: true
    };
  }

    /**
   * Process the queue in batches to avoid API rate limits
   */
  async processQueue() {
    // Prevent multiple concurrent queue processing
    if (this.isProcessingQueue || this.writeQueue.length === 0) return;
    
    this.isProcessingQueue = true;
    
    // Process batches until queue is empty
    while (this.writeQueue.length > 0) {
      // Take next batch of registrations (up to BATCH_SIZE)
      const batch = this.writeQueue.splice(0, this.BATCH_SIZE);
      console.log(`🔄 Processing batch of ${batch.length} registrations`);
      
      try {
        const values = []; // Array to hold all rows for this batch
        
        // Process each registration in the batch
        for (const reg of batch) {
          if (reg.registrationType === 'individual') {
            // Individual registration - single row
            values.push([
              reg.registrationId,                    // A: Registration ID
              reg.personalDetails.name,              // B: Name
              reg.personalDetails.email,             // C: Email
              reg.personalDetails.phone,             // D: Phone
              reg.personalDetails.college,           // E: College
              'Individual',                          // F: Main Event
              1,                                     // G: Team Size
              reg.totalAmount,                       // H: Amount
              'completed',                           // I: Payment Status
              new Date().toISOString(),              // J: Registration Date
              JSON.stringify(reg.prelimEvents || []), // K: Prelim Events
              reg.personalDetails.name,              // L: Team Leader Name
              reg.personalDetails.email,             // M: Team Leader Email
              'Individual',                          // N: Team ID
              'Individual',                          // O: Team Name
              reg.paymentDetails?.method,            // P: Payment Method
              reg.paymentDetails?.paymentId,         // Q: Transaction ID
              reg.paymentDetails?.transactionDate,   // R: Payment Date
              JSON.stringify(reg.qrData || {}),      // S: QR Data
              reg.isPremium ? 'Yes' : 'No',          // T: Premium Status
              reg.needsAccommodation ? 'Yes' : 'No', // U: Accommodation
              reg.needsFood ? 'Yes' : 'No',          // V: Food
              reg.needsFood ? 400 : 0,               // W: Food Amount
              reg.esportsGame || 'N/A',              // X: E-sports Game
              reg.projectBazaar ? 'Yes' : 'No'       // Y: Project Bazaar
            ]);
          } else {
            // Team registration - multiple rows (leader + members)
            
            // Team Leader row
            values.push([
              reg.registrationId,                    // A: Registration ID
              reg.teamLeader.name,                   // B: Name
              reg.teamLeader.email,                  // C: Email
              reg.teamLeader.phone,                  // D: Phone
              reg.teamLeader.college,                // E: College
              reg.mainEvent,                         // F: Main Event
              reg.teamSize,                          // G: Team Size
              reg.totalAmount,                       // H: Amount
              'completed',                           // I: Payment Status
              new Date().toISOString(),              // J: Registration Date
              JSON.stringify(reg.teamLeader.prelimEvents || []), // K: Prelim Events
              reg.teamLeader.name,                   // L: Team Leader Name
              reg.teamLeader.email,                  // M: Team Leader Email
              reg.teamId,                            // N: Team ID
              reg.teamName,                          // O: Team Name
              reg.paymentDetails?.method,            // P: Payment Method
              reg.paymentDetails?.paymentId,         // Q: Transaction ID
              reg.paymentDetails?.transactionDate,   // R: Payment Date
              JSON.stringify(reg.qrData || {}),      // S: QR Data
              reg.isPremium ? 'Yes' : 'No',          // T: Premium Status
              reg.needsAccommodation ? 'Yes' : 'No', // U: Accommodation
              reg.needsFood ? 'Yes' : 'No',          // V: Food
              reg.needsFood ? (400 * reg.teamSize) : 0, // W: Food Amount
              reg.esportsGame || 'N/A',              // X: E-sports Game
              reg.projectBazaar ? 'Yes' : 'No'       // Y: Project Bazaar
            ]);
            
            // Team Members rows (each member gets their own row)
            if (reg.teamMembers && reg.teamMembers.length > 0) {
              reg.teamMembers.forEach((member, index) => {
                const memberRegId = `${reg.registrationId}-M${index + 1}`;
                values.push([
                  memberRegId,                         // A: Member Registration ID
                  member.name,                         // B: Name
                  member.email,                        // C: Email
                  member.phone,                        // D: Phone
                  member.college,                      // E: College
                  reg.mainEvent,                       // F: Main Event
                  reg.teamSize,                        // G: Team Size
                  0,                                   // H: Amount (free for members)
                  'completed',                         // I: Payment Status
                  new Date().toISOString(),            // J: Registration Date
                  JSON.stringify(member.prelimEvents || []), // K: Prelim Events
                  reg.teamLeader.name,                 // L: Team Leader Name
                  reg.teamLeader.email,                // M: Team Leader Email
                  reg.teamId,                          // N: Team ID
                  reg.teamName,                        // O: Team Name
                  reg.paymentDetails?.method,          // P: Payment Method
                  reg.paymentDetails?.paymentId,       // Q: Transaction ID
                  reg.paymentDetails?.transactionDate, // R: Payment Date
                  JSON.stringify(reg.qrData || {}),    // S: QR Data
                  reg.isPremium ? 'Yes' : 'No',        // T: Premium Status
                  reg.needsAccommodation ? 'Yes' : 'No', // U: Accommodation
                  reg.needsFood ? 'Yes' : 'No',        // V: Food
                  reg.needsFood ? 400 : 0,             // W: Food Amount per member
                  reg.esportsGame || 'N/A',            // X: E-sports Game
                  reg.projectBazaar ? 'Yes' : 'No'     // Y: Project Bazaar
                ]);
              });
            }
          }
        } // ✅ CORRECTLY CLOSED THE FOR LOOP
        
        // SINGLE API CALL for entire batch (saves 80% API calls)
        await this.sheets.spreadsheets.values.append({
          spreadsheetId: this.spreadsheetId,
          range: 'Registrations!A:Y',
          valueInputOption: 'RAW', // Don't convert data types
          resource: { values }, // All batch data in one request
        });
        
        console.log(`✅ Batch of ${batch.length} saved to Sheets`);
        
        // Wait 2 seconds between batches to stay under 100 requests/100 seconds limit
        if (this.writeQueue.length > 0) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
      } catch (error) {
        console.error('❌ Batch save failed:', error);
        // Re-add failed batch to front of queue for retry
        this.writeQueue.unshift(...batch);
        break; // Stop processing on error
      }
    }
    
    this.isProcessingQueue = false;
    
    // Continue processing if more items accumulated in queue
    if (this.writeQueue.length > 0) {
      setTimeout(() => this.processQueue(), 5000); // Retry after 5 seconds
    }
  }

  // ==================== DATA RETRIEVAL ====================

  /**
   * Get all registrations from Google Sheets for admin dashboard
   */
  async getAllRegistrations() {
    try {
      console.log('🔄 [SHEETS] Getting all registrations...');
      
      const initialized = await this.ensureInitialized();
      if (!initialized) {
        console.log('❌ Google Sheets not initialized');
        return { success: false, message: 'Google Sheets not available', data: [] };
      }

      console.log('📊 Fetching from spreadsheet:', this.spreadsheetId);
      console.log('📊 Range:', this.range);
      
      // Get all rows from the registrations sheet
      const result = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: this.range,
      });

      const rows = result.data.values || [];
      console.log('📊 Raw rows from sheet:', rows.length);
      
      if (rows.length === 0) {
        console.log('❌ NO DATA FOUND in Google Sheets');
        return { success: true, data: [], count: 0 };
      } else {
        console.log('✅ Data found, headers:', rows[0]);
      }

      // Process rows (skip header row at index 0)
      const registrations = rows.slice(1).map((row, index) => {
        try {
          let registrationType = 'team';
          let personalDetails = {};
          let teamData = null;

          // Detect individual registrations by ID prefix or team size
          if (row[0] && (row[0].includes('IND') || row[6] === '1')) {
            registrationType = 'individual';
            personalDetails = {
              name: row[1] || '',
              email: row[2] || '',
              phone: row[3] || '',
              college: row[4] || ''
            };
          } else {
            // Team registration
            personalDetails = {
              name: row[1] || '',
              email: row[2] || '',
              phone: row[3] || '',
              college: row[4] || ''
            };
            
            // Parse team members from JSON string
            let teamMembers = [];
            if (row[10] && row[10] !== '') {
              try {
                teamMembers = JSON.parse(row[10]);
              } catch (parseError) {
                console.log('⚠️ Could not parse teamMembers:', row[10]);
                teamMembers = [];
              }
            }

            teamData = {
              teamName: row[14] || '', // Column O
              mainEvent: row[5] || '',
              teamMembers: teamMembers,
              teamSize: parseInt(row[6]) || 1,
              esportsGame: row[21] || null // Column V
            };
          }

          // Parse prelim events from JSON string
          let prelimEvents = [];
          if (row[10] && row[10] !== '') {
            try {
              prelimEvents = JSON.parse(row[10]);
            } catch (parseError) {
              console.log('⚠️ Could not parse prelimEvents:', row[10]);
              prelimEvents = [];
            }
          }

          // Build registration object with new fields
          const registration = {
            registrationType: registrationType,
            registrationId: row[0] || `REG-${index + 1}`,
            teamId: row[13] || null,
            personalDetails: personalDetails,
            prelimEvents: prelimEvents,
            teamData: teamData,
            mainEvent: row[5] || '',
            teamSize: parseInt(row[6]) || 1,
            amount: parseFloat(row[7]) || 0,
            paymentStatus: row[8] || 'completed',
            paymentMethod: row[15] || 'razorpay',
            transactionId: row[16] || '',
            paymentDate: row[17] || '',
            registrationDate: row[9] || new Date().toISOString(),
            qrData: row[18] ? JSON.parse(row[18]) : null,
            isPremium: row[19] === 'Yes', // Column T
            needsAccommodation: row[20] === 'Yes', // Column U
            needsFood: row[21] === 'Yes',         // Column V - Food
            foodAmount: parseFloat(row[22]) || 0,  // Column W - Food Amount
            esportsGame: row[23] || null,          // Column X - E-sports Game
            projectBazaar: row[24] === 'Yes'       // Column Y - Project Bazaar
          };

          console.log(`📝 Processed ${registrationType} registration ${index + 1}:`, personalDetails.name);
          return registration;

        } catch (error) {
          console.error(`❌ Error processing row ${index + 1}:`, error);
          return null; // Skip corrupted rows
        }
      }).filter(reg => reg !== null); // Remove null entries

      console.log('✅ Successfully processed', registrations.length, 'registrations');
      
      return {
        success: true,
        data: registrations,
        count: registrations.length
      };

    } catch (error) {
      console.error('❌ Google Sheets fetch error:', error.message);
      return {
        success: false,
        message: 'Failed to fetch from Google Sheets: ' + error.message,
        data: []
      };
    }
  }

  /**
   * Save registration data to Google Sheets with backup fallback
   */
  async saveRegistration(registrationData) {
  try {
    console.log('💾 [SHEETS DEBUG] Starting saveRegistration for:', registrationData.registrationId);
    
    const initialized = await this.ensureInitialized();
    if (!initialized) {
      console.log('❌ Sheets not available, saving to backup');
      // Save to backup if Sheets unavailable
      const BackupService = require('./backupService');
      await BackupService.saveFailedRegistration(registrationData, 'sheets_unavailable');
      return { 
        success: true, 
        message: 'Saved to backup - Sheets unavailable',
        backup: true,
        registrationId: registrationData.registrationId
      };
    }

    console.log('✅ [SHEETS DEBUG] Sheets API initialized, preparing data...');

    // Prepare the row data with new fields
    let values = [];
    
    if (registrationData.registrationType === 'individual') {
      const foodAmount = 400; 
      
      // INDIVIDUAL REGISTRATION - CORRECT COLUMN MAPPING
      values.push([
        registrationData.registrationId,                    // A: Registration ID
        registrationData.personalDetails.name,              // B: Name
        registrationData.personalDetails.email,             // C: Email
        registrationData.personalDetails.phone,             // D: Phone
        registrationData.personalDetails.college,           // E: College
        'Individual',                                       // F: Main Event
        1,                                                  // G: Team Size
        registrationData.totalAmount || 0,                  // H: Amount
        'completed',                                        // I: Payment Status
        new Date().toISOString(),                           // J: Registration Date
        JSON.stringify(registrationData.prelimEvents || []), // K: Prelim Events
        registrationData.personalDetails.name,              // L: Team Leader Name
        registrationData.personalDetails.email,             // M: Team Leader Email
        'Individual',                                       // N: Team ID
        'Individual',                                       // O: Team Name
        registrationData.paymentDetails?.method || 'razorpay', // P: Payment Method
        registrationData.paymentDetails?.paymentId || '',   // Q: Transaction ID
        registrationData.paymentDetails?.transactionDate || new Date().toISOString(), // R: Payment Date
        JSON.stringify(registrationData.qrData || {}),      // S: QR Data
        registrationData.isPremium ? 'Yes' : 'No',          // T: Premium Status
        registrationData.needsAccommodation ? 'Yes' : 'No', // U: Accommodation
        registrationData.needsFood ? 'Yes' : 'No',          // V: Food
        registrationData.needsFood ? 400 : 0,               // W: Food Amount
        registrationData.esportsGame || 'N/A',              // X: E-sports Game
        registrationData.projectBazaar ? 'Yes' : 'No'       // Y: Project Bazaar
      ]);
        } else {
      // Team registration
      // TEAM LEADER - CORRECT COLUMN MAPPING
      values.push([
        registrationData.registrationId,                    // A
        registrationData.teamLeader.name,                   // B
        registrationData.teamLeader.email,                  // C
        registrationData.teamLeader.phone,                  // D
        registrationData.teamLeader.college,                // E
        registrationData.mainEvent,                         // F
        registrationData.teamSize,                          // G
        registrationData.totalAmount || 0,                  // H
        'completed',                                        // I
        new Date().toISOString(),                           // J
        JSON.stringify(registrationData.teamLeader.prelimEvents || []), // K
        registrationData.teamLeader.name,                   // L
        registrationData.teamLeader.email,                  // M
        registrationData.teamId,                            // N
        registrationData.teamName,                          // O
        registrationData.paymentDetails?.method || 'razorpay', // P
        registrationData.paymentDetails?.paymentId || '',   // Q
        registrationData.paymentDetails?.transactionDate || new Date().toISOString(), // R
        JSON.stringify(registrationData.qrData || {}),      // S
        registrationData.isPremium ? 'Yes' : 'No',          // T
        registrationData.needsAccommodation ? 'Yes' : 'No', // U
        registrationData.needsFood ? 'Yes' : 'No',          // V: Food
        registrationData.needsFood ? (400 * registrationData.teamSize) : 0, // W: Food Amount (TOTAL FOR TEAM)
        registrationData.esportsGame || 'N/A',              // X
        registrationData.projectBazaar ? 'Yes' : 'No'       // Y
      ]);

      // TEAM MEMBERS - ONLY ONCE!
      if (registrationData.teamMembers && registrationData.teamMembers.length > 0) {
        registrationData.teamMembers.forEach((member, index) => {
          const memberRegId = `${registrationData.registrationId}-M${index + 1}`;
          values.push([
            memberRegId,                                    // A: Member Registration ID
            member.name,                                    // B: Name
            member.email,                                   // C: Email
            member.phone,                                   // D: Phone
            member.college,                                 // E: College
            registrationData.mainEvent,                     // F: Main Event
            registrationData.teamSize,                      // G: Team Size
            0,                                              // H: Amount (free for members)
            'completed',                                    // I: Payment Status
            new Date().toISOString(),                       // J: Registration Date
            JSON.stringify(member.prelimEvents || []),      // K: Prelim Events
            registrationData.teamLeader.name,               // L: Team Leader Name
            registrationData.teamLeader.email,              // M: Team Leader Email
            registrationData.teamId,                        // N: Team ID
            registrationData.teamName,                      // O: Team Name
            registrationData.paymentDetails?.method || 'razorpay', // P: Payment Method
            registrationData.paymentDetails?.paymentId || '', // Q: Transaction ID
            registrationData.paymentDetails?.transactionDate || new Date().toISOString(), // R: Payment Date
            JSON.stringify(registrationData.qrData || {}),  // S: QR Data
            registrationData.isPremium ? 'Yes' : 'No',      // T: Premium Status
            registrationData.needsAccommodation ? 'Yes' : 'No', // U: Accommodation
            registrationData.needsFood ? 'Yes' : 'No',      // V: Food
            registrationData.needsFood ? 400 : 0,           // W: Food Amount per member
            registrationData.esportsGame || 'N/A',          // X: E-sports Game
            registrationData.projectBazaar ? 'Yes' : 'No'   // Y: Project Bazaar
          ]);
        });
      }
    }

    console.log(`📊 [SHEETS DEBUG] Prepared ${values.length} rows for saving`);

    // Save to Google Sheets
    console.log('🔄 [SHEETS DEBUG] Calling Google Sheets API...');
    const response = await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: 'Registrations!A:X',
      valueInputOption: 'RAW',
      resource: { values },
    });

    console.log('✅ [SHEETS DEBUG] Successfully saved to Google Sheets:', response.data.updates.updatedRange);
    
    return {
      success: true,
      message: 'Registration saved to Google Sheets successfully',
      registrationId: registrationData.registrationId,
      rowsSaved: values.length
    };

  } catch (error) {
    console.error('❌ [SHEETS DEBUG] Error saving to Google Sheets:', error);
    console.error('❌ [SHEETS DEBUG] Error details:', error.message);
    
     // Save to backup when Sheets fails
    const BackupService = require('./backupService');
    await BackupService.saveFailedRegistration(registrationData, 'sheets_error');

    return {
      success: true,
      message: 'Saved to backup - will retry later',
      backup:true,
      registrationId: registrationData.registrationId,
      error: error.message
    };
  }
}

  // ==================== EVENTS PARTICIPATION TRACKING ====================

  /**
   * Save event participation data to separate sheet for attendance tracking
   */
  async saveToEventsSheet(registrationData) {
      try {
        console.log('🎯 [EVENTS SHEET] Saving events data for:', registrationData.registrationId);
        console.log('🎯 [EVENTS SHEET DEBUG] Registration data:', {
          type: registrationData.registrationType,
          teamId: registrationData.teamId,
          teamLeader: registrationData.teamLeader?.name,
          teamMembers: registrationData.teamMembers?.length || 0,
          leaderPrelimEvents: registrationData.teamLeader?.prelimEvents || [],
          mainEvent: registrationData.mainEvent,
          isPremium: registrationData.isPremium,
          esportsGame: registrationData.esportsGame
        });
        
        const initialized = await this.ensureInitialized();
        if (!initialized) {
          console.log('❌ Google Sheets not initialized for events sheet');
          return;
        }

        const eventValues = [];

        if (registrationData.registrationType === 'individual') {
          console.log('👤 Processing individual events');
          // Individual prelim events tracking
          (registrationData.prelimEvents || []).forEach(event => {
            const eventPrice = getEventPrice(event, false); // Individual pays full price
            eventValues.push([
              registrationData.registrationId, // A: Registration ID
              '-',                              // B: Team ID (none for individuals)
              registrationData.personalDetails.name, // C: Name
              registrationData.personalDetails.email, // D: Email
              'Prelim',                        // E: Event Type
              event,                           // F: Event Name
              eventPrice,                      // G: Event Price
              '',                              // H: Day 1 Timestamp (empty initially)
              '',                              // I: Day 2 Timestamp (empty initially)
              '',                              // J: Day 3 Timestamp (empty initially)
              registrationData.isPremium ? 'Yes' : 'No', // K: Premium Status (NEW)
              registrationData.esportsGame || 'N/A',
              registrationData.projectBazaar ? 'Yes' : 'No'
            ]);
            console.log(`✅ Added prelim event for individual: ${event}`);
          });
        } else {
          console.log('👥 Processing team events for team:', registrationData.teamName);
          
          // Process team leader FIRST with ALL events
          console.log('👑 Processing team leader events:', registrationData.teamLeader.name);
          
          // Team Leader - Main Event
          eventValues.push([
            registrationData.registrationId,    // A: Registration ID (leader uses main ID)
            registrationData.teamId,            // B: Team ID
            registrationData.teamLeader.name,   // C: Name
            registrationData.teamLeader.email,  // D: Email
            'Main',                             // E: Event Type
            registrationData.mainEvent,         // F: Event Name
            registrationData.totalAmount,       // G: Event Price (team total)
            '',                                 // H: Day 1 Timestamp
            '',                                 // I: Day 2 Timestamp
            '',                                 // J: Day 3 Timestamp
            registrationData.isPremium ? 'Yes' : 'No' ,                              // K: Premium Status
            registrationData.esportsGame || 'N/A',
            registrationData.projectBazaar ? 'Yes' : 'No'
          ]);
          console.log(`✅ Added MAIN event for leader: ${registrationData.mainEvent}`);
          
          // Team Leader - Prelim Events
          (registrationData.teamLeader.prelimEvents || []).forEach(event => {
            eventValues.push([
              registrationData.registrationId,    // A: Registration ID (leader uses main ID)
              registrationData.teamId,            // B: Team ID
              registrationData.teamLeader.name,   // C: Name
              registrationData.teamLeader.email,  // D: Email
              'Prelim',                           // E: Event Type
              event,                              // F: Event Name
              0,                                  // G: Event Price (free for team leader prelims)
              '',                                 // H: Day 1 Timestamp
              '',                                 // I: Day 2 Timestamp
              '',                                 // J: Day 3 Timestamp
              registrationData.isPremium ? 'Yes' : 'No', // ✅ K: Premium Status - USE ACTUAL VALUE            
              registrationData.esportsGame || 'N/A',
              registrationData.projectBazaar ? 'Yes' : 'No' 
            ]);
            console.log(`✅ Added PRELIM event for leader: ${event}`);
          });

          // Process team members
          if (registrationData.teamMembers && registrationData.teamMembers.length > 0) {
            console.log(`👥 Processing ${registrationData.teamMembers.length} team members`);
            
            registrationData.teamMembers.forEach((member, index) => {
              const memberRegId = `${registrationData.registrationId}-M${index + 1}`;
              console.log(`👤 Processing team member ${index + 1}:`, member.name);
              
              // Team Member - Main Event
              eventValues.push([
                memberRegId,                      // A: Member Registration ID
                registrationData.teamId,          // B: Team ID
                member.name,                      // C: Name
                member.email,                     // D: Email
                'Main',                           // E: Event Type
                registrationData.mainEvent,       // F: Event Name
                0,                                // G: Event Price (free for members)
                '',                               // H: Day 1 Timestamp
                '',                               // I: Day 2 Timestamp
                '',                               // J: Day 3 Timestamp
                registrationData.isPremium ? 'Yes' : 'No', // ✅ K: Premium Status - USE ACTUAL VALUE              
                registrationData.esportsGame || 'N/A' ,
                registrationData.projectBazaar ? 'Yes' : 'No' 
              ]);
              console.log(`✅ Added MAIN event for member ${member.name}: ${registrationData.mainEvent}`);

              // Team Member - Prelim Events
              (member.prelimEvents || []).forEach(event => {
                eventValues.push([
                  memberRegId,                    // A: Member Registration ID
                  registrationData.teamId,        // B: Team ID
                  member.name,                    // C: Name
                  member.email,                   // D: Email
                  'Prelim',                       // E: Event Type
                  event,                          // F: Event Name
                  0,                              // G: Event Price (free for team members)
                  '',                             // H: Day 1 Timestamp
                  '',                             // I: Day 2 Timestamp
                  '',                             // J: Day 3 Timestamp
                  registrationData.isPremium ? 'Yes' : 'No' ,                           // K: Premium Status
                  registrationData.esportsGame || 'N/A',
                  registrationData.projectBazaar ? 'Yes' : 'No' 
                ]);
                console.log(`✅ Added PRELIM event for member ${member.name}: ${event}`);
              });
            });
          }
        }

        // Save events data if there are any events to track
        if (eventValues.length > 0) {
          console.log(`📊 Saving ${eventValues.length} event records to Events sheet`);
          await this.sheets.spreadsheets.values.append({
            spreadsheetId: this.spreadsheetId,
            range: 'Events Participation!A:M',
            valueInputOption: 'RAW',
            resource: { values: eventValues },
          });
          console.log(`✅ Saved ${eventValues.length} event records to Events sheet`);
          
          // Log summary of what was saved
          const leaderEvents = eventValues.filter(ev => ev[0] === registrationData.registrationId);
          const memberEvents = eventValues.filter(ev => ev[0] !== registrationData.registrationId);
          
          console.log('📋 Events Save Summary:');
          console.log(`   - Team Leader: ${leaderEvents.length} events`);
          console.log(`   - Team Members: ${memberEvents.length} events`);
          console.log(`   - Main Events: ${eventValues.filter(ev => ev[4] === 'Main').length}`);
          console.log(`   - Prelim Events: ${eventValues.filter(ev => ev[4] === 'Prelim').length}`);
          console.log(`   - E-sports Game: ${registrationData.esportsGame || 'N/A'}`);
        } else {
          console.log('⚠️ No events to save for this registration');
        }

      } catch (error) {
        console.error('❌ Error saving to Events sheet:', error.message);
        console.error('❌ Error stack:', error.stack);
      }
    }  

  // ==================== ATTENDANCE MARKING ====================

  /**
   * Update attendance when QR code is scanned
   */
  async updateAttendance(registrationId, eventName, day, timestamp) {
    try {
      const initialized = await this.ensureInitialized();
      if (!initialized) return { success: false, message: 'Sheets not available' };

      // Get all rows from events participation sheet
      const result = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: this.eventsRange,
      });

      const rows = result.data.values || [];
      let rowIndex = -1;

      // Find the specific event row for this registration
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] === registrationId && rows[i][5] === eventName) {
          rowIndex = i;
          break;
        }
      }

      if (rowIndex !== -1) {
        // Determine which column to update based on day
        let columnIndex;
        if (day === 'Day 1') columnIndex = 7; // Column H
        else if (day === 'Day 2') columnIndex = 8; // Column I
        else if (day === 'Day 3') columnIndex = 9; // Column J
        else {
          return { success: false, message: 'Invalid day specified' };
        }

        // Check if already attended on this day (prevent duplicates)
        if (rows[rowIndex][columnIndex]) {
          return { success: false, message: 'Already attended this event on ' + day };
        }

        // Update the specific day column with timestamp
        const columnLetter = String.fromCharCode(65 + columnIndex);
        await this.sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: `Events Participation!${columnLetter}${rowIndex + 1}`,
          valueInputOption: 'RAW',
          resource: {
            values: [[timestamp]] // Update single cell
          },
        });
        
        console.log(`✅ ${day} attendance marked for ${registrationId} in ${eventName}`);
        return { success: true };
      } else {
        return { success: false, message: 'Event record not found' };
      }

    } catch (error) {
      console.error('❌ Error updating attendance:', error);
      return { success: false, message: error.message };
    }
  }
}

// Export service instance
module.exports = new GoogleSheetsService();
