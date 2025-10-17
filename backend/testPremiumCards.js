const EmailService = require('./services/emailService');
const fs = require('fs');

async function testPremiumCards() {
    console.log('🎪 TESTING PREMIUM PACKAGE ID CARDS');
    console.log('====================================\n');

    // Test data for Team Leader WITH PREMIUM
    const premiumLeaderData = {
        registrationType: 'team',
        teamLeader: {
            name: 'Priya Patel',
            email: 'priya@example.com',
            phone: '9876543211',
            college: 'Himachal Pradesh Technical University, Hamirpur',
            prelimEvents: ['Code Forge', 'Robo Rampage']
        },
        teamName: 'Tech Warriors',
        teamId: 'CH2025-TEAM-456',
        teamMembers: [],
        registrationId: 'CH2025-TL-456',
        totalAmount: 2700,
        isPremium: true, // ✅ PREMIUM PACKAGE
        paymentDetails: {
            status: 'completed',
            amount: 2700
        }
    };

    // Test data for Team Leader WITHOUT PREMIUM
    const regularLeaderData = {
        registrationType: 'team',
        teamLeader: {
            name: 'Amit Verma',
            email: 'amit@example.com',
            phone: '9876543213',
            college: 'Himachal Pradesh Technical University, Hamirpur',
            prelimEvents: ['Code Forge']
        },
        teamName: 'Code Masters',
        teamId: 'CH2025-TEAM-789',
        teamMembers: [],
        registrationId: 'CH2025-TL-789',
        totalAmount: 2500,
        isPremium: false, // ❌ NO PREMIUM
        paymentDetails: {
            status: 'completed',
            amount: 2500
        }
    };

    // Test data for Team Member WITH PREMIUM
    const premiumMemberData = {
        registrationType: 'team_member',
        personalDetails: {
            name: 'Rahul Kumar',
            email: 'rahul@example.com',
            phone: '9876543212',
            college: 'Himachal Pradesh Technical University, Hamirpur',
            prelimEvents: ['Code Forge']
        },
        teamName: 'Tech Warriors',
        teamId: 'CH2025-TEAM-456',
        registrationId: 'CH2025-TEAM-456-M1',
        totalAmount: 2700,
        memberIndex: 1,
        isPremium: true, // ✅ PREMIUM PACKAGE
        paymentDetails: {
            status: 'completed',
            amount: 2700
        }
    };

    // Test data for Individual (should not show premium)
    const individualData = {
        registrationType: 'individual',
        personalDetails: {
            name: 'Aarav Sharma',
            email: 'aarav@example.com',
            phone: '9876543210',
            college: 'Himachal Pradesh Technical University, Hamirpur'
        },
        prelimEvents: ['Code Forge', 'Robo Rampage'],
        registrationId: 'CH2025-IND-789',
        totalAmount: 700,
        isPremium: true, // Should be ignored for individuals
        paymentDetails: {
            status: 'completed',
            amount: 700
        }
    };

    try {
        console.log('🌟 TEST 1: Premium Team Leader');
        console.log('--------------------------------');
        const premiumLeaderPdf = await EmailService.generateTeamLeaderIDCard(premiumLeaderData);
        fs.writeFileSync('test-premium-leader.pdf', premiumLeaderPdf);
        console.log('✅ Generated: test-premium-leader.pdf');
        console.log('📊 Size:', Math.round(premiumLeaderPdf.length / 1024) + ' KB');
        console.log('👤 Name:', premiumLeaderData.teamLeader.name);
        console.log('👥 Team:', premiumLeaderData.teamName);
        console.log('💰 Amount: ₹' + premiumLeaderData.totalAmount);
        console.log('🎯 Premium: YES ✅');
        console.log('💡 Should show: "Premium: YES ✅" in green\n');

        console.log('🔵 TEST 2: Regular Team Leader');
        console.log('--------------------------------');
        const regularLeaderPdf = await EmailService.generateTeamLeaderIDCard(regularLeaderData);
        fs.writeFileSync('test-regular-leader.pdf', regularLeaderPdf);
        console.log('✅ Generated: test-regular-leader.pdf');
        console.log('📊 Size:', Math.round(regularLeaderPdf.length / 1024) + ' KB');
        console.log('👤 Name:', regularLeaderData.teamLeader.name);
        console.log('👥 Team:', regularLeaderData.teamName);
        console.log('💰 Amount: ₹' + regularLeaderData.totalAmount);
        console.log('🎯 Premium: NO ❌');
        console.log('💡 Should show: "Premium: NO ❌" in red\n');

        console.log('🌟 TEST 3: Premium Team Member');
        console.log('--------------------------------');
        const premiumMemberPdf = await EmailService.generateTeamMemberIDCard(premiumMemberData);
        fs.writeFileSync('test-premium-member.pdf', premiumMemberPdf);
        console.log('✅ Generated: test-premium-member.pdf');
        console.log('📊 Size:', Math.round(premiumMemberPdf.length / 1024) + ' KB');
        console.log('👤 Name:', premiumMemberData.personalDetails.name);
        console.log('👥 Team:', premiumMemberData.teamName);
        console.log('💰 Amount: ₹' + premiumMemberData.totalAmount);
        console.log('🎯 Premium: YES ✅');
        console.log('💡 Should show: "Premium: YES ✅" in green\n');

        console.log('👤 TEST 4: Individual (Premium Ignored)');
        console.log('----------------------------------------');
        const individualPdf = await EmailService.generateIndividualIDCard(individualData);
        fs.writeFileSync('test-individual.pdf', individualPdf);
        console.log('✅ Generated: test-individual.pdf');
        console.log('📊 Size:', Math.round(individualPdf.length / 1024) + ' KB');
        console.log('👤 Name:', individualData.personalDetails.name);
        console.log('💰 Amount: ₹' + individualData.totalAmount);
        console.log('🎯 Premium: IGNORED (not available for individuals)');
        console.log('💡 Should NOT show premium line\n');

        console.log('🎯 TEST SUMMARY');
        console.log('================');
        console.log('📁 Generated Files:');
        console.log('1. test-premium-leader.pdf - Team Leader WITH Premium');
        console.log('2. test-regular-leader.pdf - Team Leader WITHOUT Premium');
        console.log('3. test-premium-member.pdf - Team Member WITH Premium');
        console.log('4. test-individual.pdf - Individual (no premium)');
        
        console.log('\n🔍 WHAT TO CHECK:');
        console.log('• Premium cards should show "Premium: YES ✅" in GREEN');
        console.log('• Regular cards should show "Premium: NO ❌" in RED');
        console.log('• Individual cards should NOT show premium line');
        console.log('• All cards should have same blue design');
        console.log('• No other design changes');

        console.log('\n🚀 HOW TO VIEW:');
        console.log('• Open folder and double-click PDF files');
        console.log('• Or run: open test-*.pdf (Mac) / start test-*.pdf (Windows)');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testPremiumCards().then(() => {
    console.log('\n✅ Premium card testing completed!');
}).catch(error => {
    console.error('❌ Test script failed:', error);
});