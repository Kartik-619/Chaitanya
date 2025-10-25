import React, { useState } from 'react';
import toast from 'react-hot-toast';

const TeamSetup = ({ data, updateData, nextStep, prevStep }) => {
  const [teamData, setTeamData] = useState({
    teamName: '',
    mainEvent: '',
    teamSize: 2,
    teamMembers: [],
    isPremium: false 
  });
  
  const [esportsGame, setEsportsGame] = useState('');
  const [projectBazaar, setProjectBazaar] = useState(false);
  
  const mainEvents = [
    "Singing",
    "Dance", 
    "Hackathon",
    "Accurate Prediction",
    "E-sports",
    "Polymath",
    "Debate",
    "Two Minute Manager"
  ];

  // Team size rules
  const teamSizeRules = {
    "Singing": { min: 2, max: 10 },
    "Dance": { min: 2, max: 10 },
    "Hackathon": { min: 2, max: 4 },
    "Accurate Prediction": { min: 2, max: 4 },
    "E-sports": { min: 4, max: 4 },
    "Polymath": { min: 2, max: 4 },
    "Debate": { min: 2, max: 2 },
    "Two Minute Manager": { min: 2, max: 2 }
  };

  const handleTeamChange = (field, value) => {
    setTeamData(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'mainEvent' && value) {
      const rules = teamSizeRules[value];
      if (rules) {
        // Create member forms: if teamSize is 5, create 4 forms (excluding leader)
        const memberCount = rules.min - 1;
        setTeamData(prev => ({
          ...prev,
          teamSize: rules.min,
          teamMembers: Array(memberCount).fill().map(() => ({ 
            name: '', email: '', phone: '', college: '' 
          }))
        }));
      }
    }

    if (field === 'mainEvent' && value !== 'E-sports') {
      setEsportsGame('');
    }
  };

  const handleTeamSizeChange = (size) => {
    // Calculate how many member forms needed: size - 1 (excluding leader)
    const memberCount = size - 1;
    const currentMembers = teamData.teamMembers;
    
    // If increasing size, add empty forms
    if (memberCount > currentMembers.length) {
      const newMembers = Array(memberCount - currentMembers.length).fill().map(() => ({
        name: '', email: '', phone: '', college: ''
      }));
      setTeamData(prev => ({
        ...prev,
        teamSize: size,
        teamMembers: [...currentMembers, ...newMembers]
      }));
    } 
    // If decreasing size, remove from end
    else if (memberCount < currentMembers.length) {
      setTeamData(prev => ({
        ...prev,
        teamSize: size,
        teamMembers: currentMembers.slice(0, memberCount)
      }));
    }
  };

  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...teamData.teamMembers];
    updatedMembers[index] = {
      ...updatedMembers[index],
      [field]: value
    };
    setTeamData(prev => ({
      ...prev,
      teamMembers: updatedMembers
    }));
  };

  const validateForm = () => {
    if (!teamData.teamName.trim()) {
      toast.error('Please enter team name');
      return false;
    }
    
    if (!teamData.mainEvent) {
      toast.error('Please select main event');
      return false;
    }

    // Validate team size rules
    const currentRules = teamSizeRules[teamData.mainEvent];
    const totalTeamSize = teamData.teamMembers.length + 1;
    
    if (currentRules && (totalTeamSize < currentRules.min || totalTeamSize > currentRules.max)) {
      toast.error(`${teamData.mainEvent} requires ${currentRules.min}-${currentRules.max} members (including team leader)`);
      return false;
    }

    // Validate team members
    for (let i = 0; i < teamData.teamMembers.length; i++) {
      const member = teamData.teamMembers[i];
      if (!member.name?.trim() || !member.email?.trim() || !member.phone?.trim() || !member.college?.trim()) {
        toast.error(`Please fill all details for team member ${i + 1}`);
        return false;
      }
    }

    // Validate E-sports game selection
    if (teamData.mainEvent === 'E-sports' && !esportsGame) {
      toast.error('Please select an E-sports game');
      return false;
    }

    return true;
  };

  const calculateTeamTotal = () => {
    let total = 0;
    
    // Base pricing logic
    switch (teamData.mainEvent) {
    case 'Hackathon':
      total = 199 * teamData.teamSize; // WAS: 999 + additional fees
      break;
    case 'Accurate Prediction':
      total = 199 * teamData.teamSize; // WAS: 999 + additional fees
      break;
    case 'Polymath':
      total = 149 * teamData.teamSize; // WAS: 499 + additional fees
      break;
    case 'E-sports':
      total = 149 * teamData.teamSize; // WAS: 799 fixed
      break;
    case 'Singing':
    case 'Dance':
      total = 99 * teamData.teamSize; // SAME but per person
      break;
    case 'Debate':
      total = 99 * teamData.teamSize; // WAS: 199 per person
      break;
    case 'Two Minute Manager':
      total = 149 * teamData.teamSize; // SAME but per person
      break;
    default:
      total = 0;
  }

    // Add accommodation (compulsory)
    total += 600 * teamData.teamSize;

    // Add premium if selected
    if (teamData.isPremium) {
      total += 200;
    }
    
    return total;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const totalAmount = calculateTeamTotal();
    
    // ✅ ADDED: Enhanced debug logs
    console.log('🎯 Final Team Amount Breakdown:', {
      teamName: teamData.teamName,
      teamSize: teamData.teamSize,
      mainEvent: teamData.mainEvent,
      isPremium: teamData.isPremium,
      premiumAmount: teamData.isPremium ? 200 : 0,
      accommodation: 600 * teamData.teamSize,
      projectBazaar: projectBazaar,
      totalAmount: totalAmount
    });

    try {
      const response = await fetch('https://chaitanya-4r5f.onrender.com/api/register/setup-team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: data.sessionId,
          teamName: teamData.teamName,
          mainEvent: teamData.mainEvent,
          teamMembers: teamData.teamMembers,
          teamSize: teamData.teamSize,
          esportsGame: esportsGame,
          needsAccommodation: true,
          isPremium: teamData.isPremium, // ✅ CRITICAL: Send premium flag to backend
          projectBazaar: projectBazaar,
          totalAmount: totalAmount
        }),
      });

      const result = await response.json();

      if (result.success) {
        updateData({
          teamData: {
            ...result.teamData,
            totalAmount: totalAmount,
            isPremium: teamData.isPremium, // ✅ Ensure premium flag is stored
            needsAccommodation: true
          }
        });
        nextStep();
      } else {
        toast.error(result.message || 'Failed to setup team');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    }
  };

  const getTeamSizeOptions = () => {
    const currentRules = teamSizeRules[teamData.mainEvent];
    if (!currentRules) return [];
    
    const options = [];
    for (let i = currentRules.min; i <= currentRules.max; i++) {
      options.push(i);
    }
    return options;
  };

  return (
    <div className="glass-card p-4 sm:p-6 md:p-8 animate-fade-in">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent mb-2">
          Team Setup
        </h2>
        <p className="text-sm sm:text-base text-gray-300">Create your team for main events</p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Team Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Team Name *
            </label>
            <input
              type="text"
              value={teamData.teamName}
              onChange={(e) => handleTeamChange('teamName', e.target.value)}
              className="glass-input w-full px-3 sm:px-4 py-2 sm:py-3 text-white text-sm sm:text-base"
              placeholder="Enter your team name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Main Event *
            </label>
            <select
              value={teamData.mainEvent}
              onChange={(e) => handleTeamChange('mainEvent', e.target.value)}
              className="glass-input w-full px-3 sm:px-4 py-2 sm:py-3 text-white bg-transparent text-sm sm:text-base"
            >
              <option value="" className="text-gray-500">Select Main Event</option>
              {mainEvents.map(event => (
                <option key={event} value={event} className="text-gray-800">
                  {event} ({teamSizeRules[event]?.min}-{teamSizeRules[event]?.max} members)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Team Size Selection */}
        {teamData.mainEvent && (
          <div className="glass-card p-3 sm:p-4 bg-green-500/10 border-green-500/30">
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Team Size *
            </label>
            <div className="flex flex-wrap gap-2">
              {getTeamSizeOptions().map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleTeamSizeChange(size)}
                  className={`px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 text-sm sm:text-base ${
                    teamData.teamSize === size
                      ? 'bg-green-500 text-white'
                      : 'glass-input text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {size} Members
                </button>
              ))}
            </div>
            <div className="text-xs text-green-400 mt-2">
              Selected: {teamData.teamSize} members total ({teamData.teamMembers.length} team members + 1 team leader)
            </div>
          </div>
        )}

        {/* E-sports Game Selection */}
        {teamData.mainEvent === 'E-sports' && (
          <div className="glass-card p-3 sm:p-4 bg-blue-500/10 border-blue-500/30">
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Select E-sports Game *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              {['BGMI', 'FF Max', 'Valorant'].map(game => (
                <div
                  key={game}
                  onClick={() => setEsportsGame(game)}
                  className={`glass-card p-3 rounded-lg cursor-pointer transition-all duration-300 border-2 ${
                    esportsGame === game
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-transparent hover:border-blue-500/50'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold text-white text-sm sm:text-base">{game}</div>
                    <div className="text-xs text-gray-300">₹149 per person</div>
                  </div>
                </div>
              ))}
            </div>
            {esportsGame && (
              <div className="text-green-400 text-sm mt-2">
                Selected: {esportsGame}
              </div>
            )}
          </div>
        )}
    
        {/* Project Bazaar - Free Team Event */}
        <div className="glass-card p-4 sm:p-6 border-2 border-purple-500/30 bg-purple-500/5">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={projectBazaar}
              onChange={(e) => setProjectBazaar(e.target.checked)}
              className="w-5 h-5 mt-1 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🎨</span>
                  <div>
                    <div className="font-bold text-white text-lg">Project Bazaar</div>
                    <div className="text-purple-300 font-medium">Free Team Event</div>
                  </div>
                </div>
                <div className="text-green-400 font-bold text-lg">FREE</div>
              </div>
              <div className="text-purple-200 text-sm">
                Showcase your innovative projects and compete for prizes. Perfect for tech enthusiasts and creators!
              </div>
            </div>
          </label>
        </div>    

        {/* Team Leader Section */}
        <div className="glass-card p-4 sm:p-6 border border-yellow-500/20 bg-yellow-500/5">
          <h3 className="text-lg sm:text-xl font-semibold text-yellow-400 mb-3 sm:mb-4 flex items-center">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
            </svg>
            Team Leader (You)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm text-gray-300 mb-1">Full Name *</label>
              <div className="text-white font-medium bg-white/5 rounded-lg px-3 py-2 border border-white/10 text-sm sm:text-base">
                {data.personalDetails?.name}
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm text-gray-300 mb-1">Email *</label>
              <div className="text-white font-medium bg-white/5 rounded-lg px-3 py-2 border border-white/10 text-sm sm:text-base break-all">
                {data.personalDetails?.email}
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm text-gray-300 mb-1">Phone *</label>
              <div className="text-white font-medium bg-white/5 rounded-lg px-3 py-2 border border-white/10 text-sm sm:text-base">
                {data.personalDetails?.phone}
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm text-gray-300 mb-1">College *</label>
              <div className="text-white font-medium bg-white/5 rounded-lg px-3 py-2 border border-white/10 text-sm sm:text-base">
                {data.personalDetails?.college}
              </div>
            </div>
          </div>
        </div>

        {/* Team Members Section */}
        {teamData.teamMembers.length > 0 && (
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">
              Team Members ({teamData.teamMembers.length})
            </h3>

            <div className="space-y-3 sm:space-y-4">
              {teamData.teamMembers.map((member, index) => (
                <div key={index} className="glass-card p-4 sm:p-6 border border-blue-500/20">
                  <h4 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center">
                    <span className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs mr-2">
                      {index + 1}
                    </span>
                    Team Member {index + 1}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Enter full name"
                        value={member.name}
                        onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                        className="glass-input w-full px-3 py-2 text-white text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        placeholder="Enter email"
                        value={member.email}
                        onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                        className="glass-input w-full px-3 py-2 text-white text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        placeholder="10-digit number"
                        value={member.phone}
                        onChange={(e) => handleMemberChange(index, 'phone', e.target.value)}
                        className="glass-input w-full px-3 py-2 text-white text-sm sm:text-base"
                        maxLength="10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        College *
                      </label>
                      <input
                        type="text"
                        placeholder="Enter college name"
                        value={member.college}
                        onChange={(e) => handleMemberChange(index, 'college', e.target.value)}
                        className="glass-input w-full px-3 py-2 text-white text-sm sm:text-base"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Premium Package Option - MOBILE FIXED */}
        <div className="glass-card p-4 sm:p-6 border-2 border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
          <label className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 cursor-pointer group">
            <div className="flex items-center sm:items-start space-x-3 sm:space-x-0 sm:flex-col sm:space-y-2">
              <input
                type="checkbox"
                checked={teamData.isPremium}
                onChange={(e) => setTeamData(prev => ({ ...prev, isPremium: e.target.checked }))}
                className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 flex-shrink-0 transform scale-110 sm:scale-125 group-hover:scale-125 sm:group-hover:scale-150 transition-transform"
              />
              <div className="sm:text-center">
                <div className="text-yellow-400 font-bold text-lg sm:text-xl">₹200</div>
                <div className="text-yellow-300 text-xs">Premium Pass</div>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 space-y-2 sm:space-y-0">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🌟</span>
                  <div className="min-w-0">
                    <div className="font-bold text-white text-base sm:text-xl leading-tight">
                      Premium Access Pass
                    </div>
                    <div className="text-yellow-300 font-medium text-xs sm:text-sm leading-tight">
                      UNLOCK ALL INDIVIDUAL EVENTS FOR YOUR ENTIRE TEAM!
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-black/20 rounded-lg p-3 sm:p-4 border border-yellow-500/30">
                <div className="text-yellow-200 font-semibold mb-2 text-sm sm:text-base">🎯 WHAT YOU GET:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm text-yellow-100">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400">✓</span>
                    <span className="truncate">Access to ALL 8 individual events</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400">✓</span>
                    <span className="truncate">For entire team ({teamData.teamSize} members)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400">✓</span>
                    <span className="truncate">Integration Bee, Human vs AI</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400">✓</span>
                    <span className="truncate">Prompt Engineering, Reverse Engineering</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400">✓</span>
                    <span className="truncate">Jack of Hearts, Singing, Dancing</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400">✓</span>
                    <span className="truncate">No additional event fees</span>
                  </div>
                </div>
                <div className="text-yellow-300 text-xs mt-2 sm:mt-3 font-semibold leading-tight">
                  💡 Perfect for teams who want to participate in multiple individual competitions alongside their main team event!
                </div>
              </div>
            </div>
          </label>
        </div>

        {/* COMPULSORY Accommodation - MOBILE FIXED */}
        <div className="glass-card p-4 sm:p-6 border-2 border-green-500/30 bg-green-500/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-400 text-lg sm:text-xl">🏨</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-white text-base sm:text-lg">
                  Accommodation - ₹600 per person
                </div>
                <div className="text-xs sm:text-sm text-gray-300 leading-tight">
                  3 days comfortable stay for all {teamData.teamSize} team members 
                </div>
              </div>
            </div>
            <div className="text-green-400 font-bold text-lg sm:text-xl text-right sm:text-left">
              ₹{600 * teamData.teamSize}
            </div>
          </div>
        </div>

        {/* Team Summary */}
        <div className="glass-card p-4 sm:p-6 bg-gradient-to-r from-red-500/10 to-red-600/10 border-red-500/30">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 text-center">Team Registration Summary</h3>
          <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Main Event:</span>
              <span className="text-white text-right">{teamData.mainEvent || 'Not selected'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Team Size:</span>
              <span className="text-white">{teamData.teamSize} members</span>
            </div>
            {esportsGame && (
              <div className="flex justify-between">
                <span className="text-gray-300">E-sports Game:</span>
                <span className="text-white">{esportsGame}</span>
              </div>
            )}
            {teamData.mainEvent && (
              <div className="flex justify-between border-t border-white/20 pt-2">
                <span className="text-gray-300">
                  {teamData.mainEvent} ({teamData.teamSize} members)
                </span>
                <span className="text-white font-medium">
                  ₹{calculateTeamTotal() - (600 * teamData.teamSize) - (teamData.isPremium ? 200 : 0)}
                </span>
              </div>
            )}
            {teamData.isPremium && (
              <div className="flex justify-between bg-yellow-500/10 p-2 sm:p-3 rounded border border-yellow-500/30">
                <span className="text-yellow-300 font-semibold">Premium Access Pass</span>
                <span className="text-yellow-400 font-bold">₹200</span>
              </div>
            )}
            <div className="flex justify-between border-t border-white/20 pt-2">
              <span className="text-gray-300">Accommodation ({teamData.teamSize} × ₹600):</span>
              <span className="text-white font-medium">₹{600 * teamData.teamSize}</span>
            </div>
            <div className="border-t border-white/20 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-base sm:text-lg text-white font-semibold">Total Amount</span>
                <span className="text-xl sm:text-2xl text-red-400 font-bold">₹{calculateTeamTotal()}</span>
              </div>
              {teamData.isPremium && (
                <div className="text-xs text-green-400 mt-2 text-center">
                  ✅ Premium package included - Access to all individual events
                </div>
              )}
              {projectBazaar && (
                <div className="flex justify-between bg-purple-500/10 p-2 sm:p-3 rounded border border-purple-500/30">
                  <span className="text-purple-300 font-semibold">Project Bazaar</span>
                  <span className="text-green-400 font-bold">FREE</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={prevStep}
            className="flex-1 glass-input py-3 font-medium hover:bg-white/10 transition-colors text-sm sm:text-base"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 glass-button py-3 font-medium text-sm sm:text-base"
          >
            Continue to Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamSetup;
