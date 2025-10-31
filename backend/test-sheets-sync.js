/**
 * Test script to sync failed registrations to Google Sheets
 */

const BackupService = require('./services/backupService');

async function testSync() {
  console.log('🧪 Testing Google Sheets sync...\n');
  
  try {
    console.log('🔄 Attempting to retry failed registrations...');
    await BackupService.retryFailedRegistrations();
    
    console.log('\n✅ Test complete!');
    console.log('📊 Check your Google Spreadsheet for the data.');
    console.log('🔗 https://docs.google.com/spreadsheets/d/1wtmrbVRFW6pOj5bmEbQPFMiTpAlOpezFltS-yOfw7Zo');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    if (error.message.includes('permission') || error.message.includes('403')) {
      console.log('\n⚠️ PERMISSION ERROR!');
      console.log('You need to share the spreadsheet with:');
      console.log('chaitanya-techfest@chaitanya-techfest.iam.gserviceaccount.com');
    }
  }
  
  process.exit(0);
}

testSync();
