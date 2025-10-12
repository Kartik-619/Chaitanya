import React from 'react';

const SponsorCard = ({ sponsor, index }) => {
  const getTierColor = (tier) => {
    switch (tier) {
      case 'Platinum': return 'from-gray-300 to-white text-gray-900';
      case 'Gold': return 'from-yellow-400 to-yellow-200 text-yellow-900';
      case 'Silver': return 'from-gray-400 to-gray-200 text-gray-800';
      case 'Bronze': return 'from-amber-700 to-amber-500 text-amber-100';
      default: return 'from-blue-400 to-blue-200 text-blue-900';
    }
  };

  const getTierGlow = (tier) => {
    switch (tier) {
      case 'Platinum': return 'hover:shadow-gray-300/50';
      case 'Gold': return 'hover:shadow-yellow-400/50';
      case 'Silver': return 'hover:shadow-gray-400/50';
      case 'Bronze': return 'hover:shadow-amber-600/50';
      default: return 'hover:shadow-blue-400/50';
    }
  };

  return (
    <div
      className={`sponsor-card group relative glass-effect rounded-3xl p-6 transform transition-all duration-500 sponsor-card-hover hover:shadow-2xl ${getTierGlow(sponsor.tier)}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Tier Badge */}
      <div className={`absolute -top-3 -right-3 px-4 py-1 rounded-full bg-gradient-to-r ${getTierColor(sponsor.tier)} font-bold text-sm shadow-lg z-10`}>
        {sponsor.tier}
      </div>

      {/* Sponsor Logo */}
      <div className="relative mb-6">
        <div className="w-32 h-32 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-1 transform group-hover:rotate-3 transition-transform duration-300">
          <img
            src={sponsor.logo}
            alt={sponsor.name}
            className="w-full h-full object-cover rounded-2xl"
          />
        </div>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Sponsor Details */}
      <h3 className="text-2xl font-bold text-white text-center mb-3 group-hover:text-purple-300 transition-colors duration-300">
        {sponsor.name}
      </h3>
      
      <p className="text-purple-200 text-center mb-4 leading-relaxed">
        {sponsor.description}
      </p>

      <div className="text-center text-sm text-purple-300 mb-2">
        Partner since {sponsor.since}
      </div>

      {sponsor.contribution && (
        <div className="text-center text-xs text-purple-400">
          {sponsor.contribution}
        </div>
      )}

      {/* Hover Effect Glow */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
    </div>
  );
};

export default SponsorCard;