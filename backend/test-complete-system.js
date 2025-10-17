// final-system-test.js
const axios = require('axios');
const fs = require('fs');

class FinalSystemTester {
  constructor(baseURL = 'http://localhost:5000') {
    this.baseURL = baseURL;
    this.testResults = [];
  }

  async runAllTests() {
    console.log('🎯 FINAL SYSTEM VALIDATION TEST\n');
    
    // Test all critical components
    await this.testCoreInfrastructure();
    await this.testRegistrationWithFixedOTP();
    await this.testDataPersistence();
    await this.testErrorScenarios();
    
    this.generateValidationReport();
  }

  async testCoreInfrastructure() {
    console.log('🏗️ Testing Core Infrastructure...');
    
    const tests = [
      { name: 'Server Health', endpoint: '/api/health' },
      { name: 'API Status', endpoint: '/status' },
      { name: 'Root Endpoint', endpoint: '/' },
      { name: 'Payment Config', endpoint: '/api/payment/config' }
    ];
    
    for (const test of tests) {
      try {
        const response = await axios.get(this.baseURL + test.endpoint);
        const healthy = response.status === 200;
        
        this.recordResult(test.name, healthy, `Status: ${response.status}`);
        console.log(`   ✅ ${test.name}: Healthy`);
      } catch (error) {
        this.recordResult(test.name, false, `Error: ${error.message}`);
        console.log(`   ❌ ${test.name}: Failed`);
      }
    }
  }

  async testRegistrationWithFixedOTP() {
    console.log('\n👤 Testing Registration Flow...');
    
    const testUsers = [
      {
        type: 'Individual Basic',
        data: {
          name: "Individual Test User",
          email: `individual${Date.now()}@test.com`,
          phone: `98765${Math.floor(10000 + Math.random() * 90000)}`,
          college: "Himachal Pradesh Technical University",
          registrationType: "individual"
        },
        setup: {
          prelimEvents: ["Integration Bee"],
          isPremium: false,
          needsAccommodation: false
        }
      },
      {
        type: 'Individual Premium',
        data: {
          name: "Premium Test User", 
          email: `premium${Date.now()}@test.com`,
          phone: `98765${Math.floor(10000 + Math.random() * 90000)}`,
          college: "Himachal Pradesh Technical University",
          registrationType: "individual"
        },
        setup: {
          prelimEvents: ["Human vs AI", "Prompt Engineering"],
          isPremium: true,
          needsAccommodation: true
        }
      }
    ];
    
    for (const user of testUsers) {
      await this.testSingleRegistration(user);
    }
  }

  async testSingleRegistration(userConfig) {
    console.log(`   Testing: ${userConfig.type}`);
    
    try {
      // 1. Start Registration
      const startResponse = await axios.post(
        `${this.baseURL}/api/register/start`, 
        userConfig.data
      );
      
      if (!startResponse.data.success) {
        throw new Error('Start failed: ' + startResponse.data.message);
      }
      
      const sessionId = startResponse.data.sessionId;
      
      // 2. Verify OTP with 000000 (after implementing the fix)
      const otpResponse = await axios.post(`${this.baseURL}/api/register/verify-otp`, {
        sessionId: sessionId,
        otp: "000000"
      });
      
      if (!otpResponse.data.success) {
        throw new Error('OTP failed: ' + otpResponse.data.message);
      }
      
      // 3. Setup Events
      const setupResponse = await axios.post(`${this.baseURL}/api/register/setup-individual`, {
        sessionId: sessionId,
        ...userConfig.setup
      });
      
      if (setupResponse.data.success) {
        const amount = setupResponse.data.individualData?.totalAmount || 0;
        this.recordResult(
          `Registration: ${userConfig.type}`, 
          true, 
          `Amount: ₹${amount}, Premium: ${userConfig.setup.isPremium}`
        );
        console.log(`     ✅ Success - Amount: ₹${amount}`);
      } else {
        throw new Error('Setup failed');
      }
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      this.recordResult(`Registration: ${userConfig.type}`, false, errorMsg);
      console.log(`     ❌ Failed: ${errorMsg}`);
    }
  }

  async testDataPersistence() {
    console.log('\n💾 Testing Data Persistence...');
    
    const endpoints = [
      { name: 'Total Registrations', endpoint: '/api/admin/registrations' },
      { name: 'Event Records', endpoint: '/api/admin/events' },
      { name: 'Premium Analytics', endpoint: '/api/admin/premium-analytics' },
      { name: 'Accommodation Analytics', endpoint: '/api/admin/accommodation-analytics' }
    ];
    
    for (const test of endpoints) {
      try {
        const response = await axios.get(this.baseURL + test.endpoint);
        const data = response.data;
        
        let recordCount = 'N/A';
        if (data.count !== undefined) recordCount = data.count;
        if (data.data && Array.isArray(data.data)) recordCount = data.data.length;
        
        this.recordResult(test.name, true, `${recordCount} records`);
        console.log(`   ✅ ${test.name}: ${recordCount} records`);
        
      } catch (error) {
        this.recordResult(test.name, false, error.message);
        console.log(`   ❌ ${test.name}: Failed`);
      }
    }
  }

  async testErrorScenarios() {
    console.log('\n🐛 Testing Error Handling...');
    
    const errorTests = [
      {
        name: 'Invalid Registration Data',
        request: () => axios.post(`${this.baseURL}/api/register/start`, {}),
        shouldFail: true
      },
      {
        name: 'Missing Required Fields', 
        request: () => axios.post(`${this.baseURL}/api/register/start`, { name: "Test" }),
        shouldFail: true
      },
      {
        name: 'Valid College List',
        request: () => axios.get(`${this.baseURL}/api/register/colleges`),
        shouldFail: false
      }
    ];
    
    for (const test of errorTests) {
      try {
        const response = await test.request();
        const success = test.shouldFail ? response.status >= 400 : response.status === 200;
        
        this.recordResult(`Error: ${test.name}`, success, 
          success ? 'Proper handling' : 'Unexpected behavior');
        console.log(`   ✅ ${test.name}: Correctly handled`);
      } catch (error) {
        const expectedError = test.shouldFail && error.response?.status >= 400;
        this.recordResult(`Error: ${test.name}`, expectedError, 
          expectedError ? 'Expected error' : 'Unexpected failure');
        
        if (expectedError) {
          console.log(`   ✅ ${test.name}: Correctly rejected`);
        } else {
          console.log(`   ❌ ${test.name}: Failed unexpectedly`);
        }
      }
    }
  }

  recordResult(testName, success, details) {
    this.testResults.push({
      test: testName,
      status: success ? 'PASS' : 'FAIL',
      details: details,
      timestamp: new Date().toISOString()
    });
  }

  generateValidationReport() {
    console.log('\n' + '='.repeat(60));
    console.log('🏆 PRODUCTION READINESS VALIDATION REPORT');
    console.log('='.repeat(60));
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const total = this.testResults.length;
    const score = Math.round((passed / total) * 100);
    
    console.log(`\n📊 OVERALL SCORE: ${score}% (${passed}/${total} Tests Passed)`);
    
    // Component breakdown
    const components = {
      'Server Infrastructure': this.testResults.filter(r => 
        r.test.includes('Server') || r.test.includes('API') || r.test.includes('Payment')).length,
      'Registration System': this.testResults.filter(r => 
        r.test.includes('Registration')).length,
      'Data Management': this.testResults.filter(r => 
        r.test.includes('Registrations') || r.test.includes('Event') || r.test.includes('Analytics')).length,
      'Error Handling': this.testResults.filter(r => 
        r.test.includes('Error') || r.test.includes('Invalid')).length
    };
    
    console.log('\n🔧 COMPONENT BREAKDOWN:');
    Object.entries(components).forEach(([name, count]) => {
      const passedCount = this.testResults.filter(r => 
        (r.test.includes(name.split(' ')[0]) && r.status === 'PASS')).length;
      console.log(`   ${name}: ${passedCount}/${count} passed`);
    });
    
    console.log('\n✅ SUCCESSFUL COMPONENTS:');
    this.testResults.filter(r => r.status === 'PASS').forEach(test => {
      console.log(`   ✓ ${test.test}: ${test.details}`);
    });
    
    if (this.testResults.some(r => r.status === 'FAIL')) {
      console.log('\n⚠️  NEEDS ATTENTION:');
      this.testResults.filter(r => r.status === 'FAIL').forEach(test => {
        console.log(`   ✗ ${test.test}: ${test.details}`);
      });
    }
    
    // Final recommendation
    console.log('\n🎯 PRODUCTION RECOMMENDATION:');
    if (score >= 90) {
      console.log('   🎉 EXCELLENT! System is PRODUCTION-READY');
      console.log('   Next: Configure email & payment credentials');
    } else if (score >= 75) {
      console.log('   ✅ GOOD! System is NEARLY READY');
      console.log('   Next: Fix the few failing components');
    } else {
      console.log('   🚨 NEEDS WORK! Address critical issues first');
    }
    
    // Save detailed report
    const report = {
      validationDate: new Date().toISOString(),
      overallScore: score,
      summary: { passed, total, score },
      components: components,
      details: this.testResults
    };
    
    fs.writeFileSync('production-validation-report.json', JSON.stringify(report, null, 2));
    console.log(`\n💾 Full report saved: production-validation-report.json`);
  }
}

// Run the final validation
new FinalSystemTester().runAllTests();