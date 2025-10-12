const fs = require('fs');
const path = require('path');

class BackupService {
  constructor() {
    this.backupFile = path.join(__dirname, '../backups/sessions.json');
    this.backupInterval = 60000;
    this.startBackup();
  }

  startBackup() {
    setInterval(() => {
      this.saveSessionsToFile();
    }, this.backupInterval);
  }

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
}

module.exports = new BackupService();