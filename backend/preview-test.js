const EmailService = require('./services/emailService');

async function previewAllIDCards() {
    console.log('🔄 Generating All ID Card Previews...');
    
    // Test data for Individual
    const individualData = {
        registrationType: 'individual',
        personalDetails: {
            name: 'Aarav Sharma',
            email: 'aarav@example.com',
            phone: '9876543210',
            college: 'Himachal Pradesh Technical University, Hamirpur'
        },
        prelimEvents: ['Code Forge', 'Robo Rampage', 'Bug Bounty'],
        registrationId: 'CH2025-IND-789',
        totalAmount: 700,
        paymentDetails: {
            status: 'completed',
            amount: 700
        }
    };

    // Test data for Team Leader
    const teamLeaderData = {
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
        teamMembers: [
            {
                name: 'Rahul Kumar',
                email: 'rahul@example.com',
                phone: '9876543212',
                college: 'Himachal Pradesh Technical University, Hamirpur',
                prelimEvents: ['Code Forge']
            },
            {
                name: 'Neha Singh',
                email: 'neha@example.com',
                phone: '9876543213',
                college: 'Himachal Pradesh Technical University, Hamirpur',
                prelimEvents: ['Robo Rampage']
            }
        ],
        registrationId: 'CH2025-TL-456',
        totalAmount: 2500,
        paymentDetails: {
            status: 'completed',
            amount: 2500
        }
    };

    // Test data for Team Member
    const teamMemberData = {
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
        totalAmount: 2500,
        memberIndex: 1,
        paymentDetails: {
            status: 'completed',
            amount: 2500
        }
    };

    try {
        console.log('\n🎨 ====================================');
        console.log('🎨 GENERATING INDIVIDUAL ID CARD...');
        console.log('🎨 ====================================');
        const individualPdfBuffer = await EmailService.generateIndividualIDCard(individualData);
        const individualFilename = 'preview-individual-id-card.pdf';
        require('fs').writeFileSync(individualFilename, individualPdfBuffer);
        
        console.log('✅ Individual PDF Generated Successfully!');
        console.log('📁 File saved as: ' + individualFilename);
        console.log('📊 File size: ' + Math.round(individualPdfBuffer.length / 1024) + ' KB');
        console.log('👤 Name: ' + individualData.personalDetails.name);
        console.log('🎯 Type: Individual Participant');
        console.log('💰 Amount: ₹' + individualData.totalAmount);

        console.log('\n🎨 ====================================');
        console.log('🎨 GENERATING TEAM LEADER ID CARD...');
        console.log('🎨 ====================================');
        const teamLeaderPdfBuffer = await EmailService.generateTeamLeaderIDCard(teamLeaderData);
        const teamLeaderFilename = 'preview-team-leader-id-card.pdf';
        require('fs').writeFileSync(teamLeaderFilename, teamLeaderPdfBuffer);
        
        console.log('✅ Team Leader PDF Generated Successfully!');
        console.log('📁 File saved as: ' + teamLeaderFilename);
        console.log('📊 File size: ' + Math.round(teamLeaderPdfBuffer.length / 1024) + ' KB');
        console.log('👤 Name: ' + teamLeaderData.teamLeader.name);
        console.log('🎯 Type: Team Leader');
        console.log('👥 Team: ' + teamLeaderData.teamName);
        console.log('💰 Amount: ₹' + teamLeaderData.totalAmount);

        console.log('\n🎨 ====================================');
        console.log('🎨 GENERATING TEAM MEMBER ID CARD...');
        console.log('🎨 ====================================');
        const teamMemberPdfBuffer = await EmailService.generateTeamMemberIDCard(teamMemberData);
        const teamMemberFilename = 'preview-team-member-id-card.pdf';
        require('fs').writeFileSync(teamMemberFilename, teamMemberPdfBuffer);
        
        console.log('✅ Team Member PDF Generated Successfully!');
        console.log('📁 File saved as: ' + teamMemberFilename);
        console.log('📊 File size: ' + Math.round(teamMemberPdfBuffer.length / 1024) + ' KB');
        console.log('👤 Name: ' + teamMemberData.personalDetails.name);
        console.log('🎯 Type: Team Member');
        console.log('👥 Team: ' + teamMemberData.teamName);
        console.log('💰 Amount: ₹' + teamMemberData.totalAmount);

        console.log('\n🎯 ====================================');
        console.log('🎯 PREVIEW GENERATION COMPLETE!');
        console.log('🎯 ====================================');
        console.log('\n📁 GENERATED FILES:');
        console.log('1. 📄 ' + individualFilename + ' - Individual Participant');
        console.log('2. 📄 ' + teamLeaderFilename + ' - Team Leader'); 
        console.log('3. 📄 ' + teamMemberFilename + ' - Team Member');
        
        console.log('\n🔍 HOW TO VIEW:');
        console.log('• Open folder and double-click any PDF file');
        console.log('• Or drag files into your web browser');
        console.log('• Or use command:');
        console.log('  - Mac: open preview-*.pdf');
        console.log('  - Windows: start preview-*.pdf');
        console.log('  - Linux: xdg-open preview-*.pdf');
        
        console.log('\n🎨 DESIGN FEATURES:');
        console.log('• Individual: Gold badge for Participant');
        console.log('• Team Leader: Orange badge for Team Leader');
        console.log('• Team Member: Teal badge for Team Member');
        console.log('• Consistent spacing and layout across all cards');
        console.log('• Proper amount formatting (₹ symbol)');
        console.log('• QR codes for verification');

    } catch (error) {
        console.error('❌ Generation failed:', error);
    }
}

// Also provide individual preview functions if needed
async function previewIndividualCard() {
    console.log('🔄 Generating Individual ID Card Preview...');
    
    const testData = {
        registrationType: 'individual',
        personalDetails: {
            name: 'Aarav Sharma',
            email: 'aarav@example.com',
            phone: '9876543210',
            college: 'Himachal Pradesh Technical University, Hamirpur'
        },
        prelimEvents: ['Code Forge', 'Robo Rampage', 'Bug Bounty'],
        registrationId: 'CH2025-IND-789',
        totalAmount: 700,
        paymentDetails: {
            status: 'completed',
            amount: 700
        }
    };

    try {
        console.log('🎨 Generating Individual PDF...');
        const pdfBuffer = await EmailService.generateIndividualIDCard(testData);
        
        const fs = require('fs');
        const filename = 'preview-individual-only.pdf';
        fs.writeFileSync(filename, pdfBuffer);
        
        console.log('✅ Individual PDF Generated Successfully!');
        console.log('📁 File saved as: ' + filename);
        console.log('📊 File size: ' + Math.round(pdfBuffer.length / 1024) + ' KB');
        console.log('👤 Name: ' + testData.personalDetails.name);
        console.log('🎯 Type: Individual Participant');
        console.log('💰 Amount: ₹' + testData.totalAmount);
        
    } catch (error) {
        console.error('❌ Individual generation failed:', error);
    }
}

async function previewTeamLeaderCard() {
    console.log('🔄 Generating Team Leader ID Card Preview...');
    
    const testData = {
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
        teamMembers: [
            {
                name: 'Rahul Kumar',
                email: 'rahul@example.com',
                phone: '9876543212',
                college: 'Himachal Pradesh Technical University, Hamirpur',
                prelimEvents: ['Code Forge']
            }
        ],
        registrationId: 'CH2025-TL-456',
        totalAmount: 2500,
        paymentDetails: {
            status: 'completed',
            amount: 2500
        }
    };

    try {
        console.log('🎨 Generating Team Leader PDF...');
        const pdfBuffer = await EmailService.generateTeamLeaderIDCard(testData);
        
        const fs = require('fs');
        const filename = 'preview-team-leader-only.pdf';
        fs.writeFileSync(filename, pdfBuffer);
        
        console.log('✅ Team Leader PDF Generated Successfully!');
        console.log('📁 File saved as: ' + filename);
        console.log('📊 File size: ' + Math.round(pdfBuffer.length / 1024) + ' KB');
        console.log('👤 Name: ' + testData.teamLeader.name);
        console.log('🎯 Type: Team Leader');
        console.log('👥 Team: ' + testData.teamName);
        console.log('💰 Amount: ₹' + testData.totalAmount);
        
    } catch (error) {
        console.error('❌ Team Leader generation failed:', error);
    }
}

async function previewTeamMemberCard() {
    console.log('🔄 Generating Team Member ID Card Preview...');
    
    const testData = {
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
        totalAmount: 2500,
        memberIndex: 1,
        paymentDetails: {
            status: 'completed',
            amount: 2500
        }
    };

    try {
        console.log('🎨 Generating Team Member PDF...');
        const pdfBuffer = await EmailService.generateTeamMemberIDCard(testData);
        
        const fs = require('fs');
        const filename = 'preview-team-member-only.pdf';
        fs.writeFileSync(filename, pdfBuffer);
        
        console.log('✅ Team Member PDF Generated Successfully!');
        console.log('📁 File saved as: ' + filename);
        console.log('📊 File size: ' + Math.round(pdfBuffer.length / 1024) + ' KB');
        console.log('👤 Name: ' + testData.personalDetails.name);
        console.log('🎯 Type: Team Member');
        console.log('👥 Team: ' + testData.teamName);
        console.log('💰 Amount: ₹' + testData.totalAmount);
        
    } catch (error) {
        console.error('❌ Team Member generation failed:', error);
    }
}

// Export all functions
module.exports = {
    previewAllIDCards,
    previewIndividualCard,
    previewTeamLeaderCard,
    previewTeamMemberCard
};

// Run the main preview if this file is executed directly
if (require.main === module) {
    console.log('🎪 CHAITANYA 2025 - ID CARD PREVIEW GENERATOR');
    console.log('============================================\n');
    
    // Get command line arguments
    const args = process.argv.slice(2);
    const cardType = args[0]?.toLowerCase();

    switch(cardType) {
        case 'individual':
            previewIndividualCard();
            break;
        case 'teamleader':
        case 'team_leader':
            previewTeamLeaderCard();
            break;
        case 'teammember':
        case 'team_member':
            previewTeamMemberCard();
            break;
        case 'all':
        default:
            previewAllIDCards();
            break;
    }
}