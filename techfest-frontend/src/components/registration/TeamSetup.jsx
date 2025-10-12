import React, { useState } from 'react';
import toast from 'react-hot-toast';

const TeamSetup = ({ data, updateData, nextStep, prevStep }) => {
  const [teamData, setTeamData] = useState({
    teamName: '',
    mainEvent: '',
    teamMembers: [
      { name: '', email: '', phone: '', college: '', prelimEvents: [] }
    ],
    leaderPrelimEvents: [] // Team leader's prelim events
  });

  const mainEvents = [
    "Hackathon",
    "Accurate Predictions"
  ];

  const prelimEvents = [
    "Code Forge",
    "Robo Rampage", 
    "Integration Bee",
    "Encryption/Decryption",
    "Reverse Engineering",
    "Bug Bounty / CTF",
    "Data Analysis Challenge",
    "Stock Prediction",
    "Sports Analytics"
  ];

  const handleTeamChange = (field, value) => {
    setTeamData(prev => ({
      ...prev,
      [field]: value
    }));
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

  const handleMemberEventsChange = (index, eventName) => {
    const updatedMembers = [...teamData.teamMembers];
    const currentEvents = updatedMembers[index].prelimEvents || [];
    
    if (currentEvents.includes(eventName)) {
      updatedMembers[index].prelimEvents = currentEvents.filter(name => name !== eventName);
    } else {
      updatedMembers[index].prelimEvents = [...currentEvents, eventName];
    }
    
    setTeamData(prev => ({
      ...prev,
      teamMembers: updatedMembers
    }));
  };

  // Handle team leader prelim events
  const handleLeaderEventsChange = (eventName) => {
    const currentEvents = teamData.leaderPrelimEvents || [];
    
    if (currentEvents.includes(eventName)) {
      setTeamData(prev => ({
        ...prev,
        leaderPrelimEvents: currentEvents.filter(name => name !== eventName)
      }));
    } else {
      setTeamData(prev => ({
        ...prev,
        leaderPrelimEvents: [...currentEvents, eventName]
      }));
    }
  };

  const addMember = () => {
    if (teamData.teamMembers.length >= 3) { // 3 members + 1 leader = 4 total
      toast.error('Maximum team size is 4 (including team leader)');
      return;
    }
    
    setTeamData(prev => ({
      ...prev,
      teamMembers: [
        ...prev.teamMembers,
        { name: '', email: '', phone: '', college: '', prelimEvents: [] }
      ]
    }));
  };

  const removeMember = (index) => {
    if (teamData.teamMembers.length <= 1) return;
    
    setTeamData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== index)
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

    for (let i = 0; i < teamData.teamMembers.length; i++) {
      const member = teamData.teamMembers[i];
      if (!member.name || !member.email || !member.phone || !member.college) {
        toast.error(`Please fill all details for member ${i + 1}`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const response = await fetch('http://localhost:5000/api/register/setup-team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: data.sessionId,
          teamName: teamData.teamName,
          mainEvent: teamData.mainEvent,
          teamMembers: teamData.teamMembers,
          leaderPrelimEvents: teamData.leaderPrelimEvents // Send leader's prelim events
        }),
      });

      const result = await response.json();

      if (result.success) {
        updateData({
          teamData: result.teamData
        });
        nextStep();
      } else {
        toast.error(result.message || 'Failed to setup team');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    }
  };

  return (
    <div className="glass-card p-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent mb-2">
          Team Setup
        </h2>
        <p className="text-gray-300">Create your team for main events</p>
      </div>

      <div className="space-y-6">
        {/* Team Basic Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Team Name *
            </label>
            <input
              type="text"
              value={teamData.teamName}
              onChange={(e) => handleTeamChange('teamName', e.target.value)}
              className="glass-input w-full px-4 py-3 text-white"
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
              className="glass-input w-full px-4 py-3 text-white bg-transparent"
            >
              <option value="" className="text-gray-500">Select Main Event</option>
              {mainEvents.map(event => (
                <option key={event} value={event} className="text-gray-800">
                  {event}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Team Leader Section - AUTO FILLED */}
        <div className="glass-card p-6 border border-yellow-500/20 bg-yellow-500/5">
          <h3 className="text-xl font-semibold text-yellow-400 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
            </svg>
            Team Leader (You)
          </h3>
          
          {/* Team Leader Details - Auto filled */}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Full Name *</label>
              <div className="text-white font-medium bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                {data.personalDetails?.name}
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Email *</label>
              <div className="text-white font-medium bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                {data.personalDetails?.email}
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Phone *</label>
              <div className="text-white font-medium bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                {data.personalDetails?.phone}
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">College *</label>
              <div className="text-white font-medium bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                {data.personalDetails?.college}
              </div>
            </div>
          </div>

          {/* Team Leader Prelim Events */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Prelim Events (Optional) - FREE for Team Members
            </label>
            <div className="flex flex-wrap gap-2">
              {prelimEvents.map(event => (
                <label
                  key={event}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm border transition-colors cursor-pointer ${
                    teamData.leaderPrelimEvents?.includes(event)
                      ? 'bg-green-500/20 border-green-500 text-green-400'
                      : 'bg-white/5 border-white/20 text-gray-300 hover:border-green-500/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={teamData.leaderPrelimEvents?.includes(event) || false}
                    onChange={() => handleLeaderEventsChange(event)}
                    className="hidden"
                  />
                  {event}
                </label>
              ))}
            </div>
            {teamData.leaderPrelimEvents?.length > 0 && (
              <p className="text-green-400 text-xs mt-2">
                Selected: {teamData.leaderPrelimEvents.join(', ')} - FREE!
              </p>
            )}
          </div>
        </div>

        {/* Team Members Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-200">
              Team Members ({teamData.teamMembers.length}/3)
            </label>
            <button
              type="button"
              onClick={addMember}
              className="glass-button px-4 py-2 text-sm"
            >
              + Add Member
            </button>
          </div>

          <div className="space-y-4">
            {teamData.teamMembers.map((member, index) => (
              <div key={index} className="glass-card p-4 relative">
                {teamData.teamMembers.length > 1 && (
                  <button
                    onClick={() => removeMember(index)}
                    className="absolute top-4 right-4 text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-red-500/10 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}

                <h4 className="text-lg font-semibold text-white mb-3">Team Member {index + 1}</h4>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Full Name *"
                    value={member.name}
                    onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                    className="glass-input px-3 py-2 text-white"
                  />
                  <input
                    type="email"
                    placeholder="Email *"
                    value={member.email}
                    onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                    className="glass-input px-3 py-2 text-white"
                  />
                  <input
                    type="tel"
                    placeholder="Phone *"
                    value={member.phone}
                    onChange={(e) => handleMemberChange(index, 'phone', e.target.value)}
                    className="glass-input px-3 py-2 text-white"
                  />
                  <input
                    type="text"
                    placeholder="College *"
                    value={member.college}
                    onChange={(e) => handleMemberChange(index, 'college', e.target.value)}
                    className="glass-input px-3 py-2 text-white"
                  />
                </div>

                {/* Prelim Events for Member */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Prelim Events (Optional) - FREE for Team Members
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {prelimEvents.map(event => (
                      <label
                        key={event}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm border transition-colors cursor-pointer ${
                          member.prelimEvents?.includes(event)
                            ? 'bg-green-500/20 border-green-500 text-green-400'
                            : 'bg-white/5 border-white/20 text-gray-300 hover:border-green-500/50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={member.prelimEvents?.includes(event) || false}
                          onChange={() => handleMemberEventsChange(index, event)}
                          className="hidden"
                        />
                        {event}
                      </label>
                    ))}
                  </div>
                  {member.prelimEvents?.length > 0 && (
                    <p className="text-green-400 text-xs mt-2">
                      Selected: {member.prelimEvents.join(', ')} - FREE!
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Summary */}
        <div className="glass-card p-4 bg-red-500/10 border-red-500/30">
          <div className="text-center">
            <div className="text-red-400 font-semibold">Team Registration Fee: ₹2500</div>
            <div className="text-sm text-gray-300 mt-1">
              Includes {teamData.teamMembers.length + 1} members • {teamData.mainEvent || 'Main Event'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={prevStep}
            className="flex-1 glass-input py-3 font-medium hover:bg-white/10 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 glass-button py-3 font-medium"
          >
            Continue to Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamSetup;