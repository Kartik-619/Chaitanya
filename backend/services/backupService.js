/**
 * 💾 BACKUP SERVICE
 * 
 * This service handles data backup and recovery operations:
 * - Automatic session backup to prevent data loss
 * - Failed registration recovery system
 * - Session restoration on server restart
 * - Data integrity protection
 * 
 * 🛡️ DATA PROTECTION FEATURES:
 * - Automatic backup every 60 seconds
 * - Failed registration retry mechanism
 * - Session persistence across server restarts
 * - Backup file management
 */

const fs = require('fs');
const path = require('path');

class BackupService {
  constructor() {
    this.backupFile = path.join(__dirname, '../backups/sessions.json');
    this.failedRegistrationsFile = path.join(__dirname, '../backups/failed-registrations.json');
    this.backupInterval = 30000;
    this.maxBackupFiles = 5;
    this.startBackup();
  }

  /**
   * Start automatic backup interval
   */
  startBackup() {
    setInterval(() => {
      this.saveSessionsToFile();
    }, this.backupInterval);
  }

  /**
   * Save current sessions and completed registrations to backup file
   */
  saveSessionsToFile() {
    try {
      const RegistrationService = require('./registrationService');
      const sessions = Array.from(RegistrationService.registrationSessions.entries());
      const completed = Array.from(RegistrationService.completedRegistrations.entries());
      
      const backupData = {
        timestamp: new Date().toISOString(),
        sessions: sessions,
        completed: completed
      };
      
      const backupDir = path.dirname(this.backupFile);
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      
      fs.writeFileSync(this.backupFile, JSON.stringify(backupData, null, 2));
      console.log('💾 Sessions backed up to file');
    } catch (error) {
      console.error('Backup failed:', error);
    }
  }

  /**
   * Restore sessions from backup file after server restart
   */
  restoreSessions() {
    try {
      if (fs.existsSync(this.backupFile)) {
        const backupData = JSON.parse(fs.readFileSync(this.backupFile, 'utf8'));
        const RegistrationService = require('./registrationService');
        
        RegistrationService.registrationSessions = new Map(backupData.sessions);
        RegistrationService.completedRegistrations = new Map(backupData.completed);
        
        console.log('🔄 Sessions restored from backup');
        return true;
      }
    } catch (error) {
      console.error('Restore failed:', error);
    }
    return false;
  }

  /**
   * Setup backup directory for failed registrations
   */
  setupFailedRegistrationsBackup() {
    const backupDir = path.dirname(this.failedRegistrationsFile);
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
  }

  /**
   * Save registration data when Google Sheets save fails
   */
  async saveFailedRegistration(registrationData, reason) {
    try {
      let failedRegistrations = [];
      
      if (fs.existsSync(this.failedRegistrationsFile)) {
        failedRegistrations = JSON.parse(fs.readFileSync(this.failedRegistrationsFile, 'utf8'));
      }
      
      failedRegistrations.push({
        ...registrationData,
        backupTime: new Date().toISOString(),
        reason: reason,
        attempts: 0
      });
      
      fs.writeFileSync(this.failedRegistrationsFile, JSON.stringify(failedRegistrations, null, 2));
      console.log('📦 Failed registration backed up:', registrationData.registrationId, 'Reason:', reason);
    } catch (error) {
      console.error('❌ Failed registration backup error:', error);
    }
  }

  /**
   * Retry saving failed registrations to Google Sheets
   */
  async retryFailedRegistrations() {
    if (!fs.existsSync(this.failedRegistrationsFile)) {
      console.log('📊 No failed registrations to retry');
      return;
    }
    
    try {
      const failedRegistrations = JSON.parse(fs.readFileSync(this.failedRegistrationsFile, 'utf8'));
      const successful = [];
      const stillFailed = [];
      
      console.log(`🔄 Retrying ${failedRegistrations.length} failed registrations...`);
      
      for (const failedReg of failedRegistrations) {
        try {
          const GoogleSheetsService = require('./googleSheetsService');
          await GoogleSheetsService.saveRegistration(failedReg);
          successful.push(failedReg.registrationId);
        } catch (error) {
          failedReg.attempts = (failedReg.attempts || 0) + 1;
          if (failedReg.attempts < 5) { // Max 5 attempts
            stillFailed.push(failedReg);
          } else {
            console.log('❌ Giving up on registration after 5 attempts:', failedReg.registrationId);
          }
        }
      }
      
      // Update backup file
      fs.writeFileSync(this.failedRegistrationsFile, JSON.stringify(stillFailed, null, 2));
      
      if (successful.length > 0) {
        console.log('✅ Successfully retried registrations:', successful);
      }
    } catch (error) {
      console.error('❌ Failed registrations retry error:', error);
    }
  }
}

// Export service instance
module.exports = new BackupService();
