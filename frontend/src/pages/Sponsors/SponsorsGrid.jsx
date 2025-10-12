import React from 'react';
import SponsorCard from './SponsorCard';

const SponsorsGrid = ({ sponsors = [] }) => {
  // 🟣 Empty sponsors state
  if (!sponsors.length) {
    return (
      <div className="text-center py-24">
        <div className="text-7xl mb-6 floating">🤝</div>
        <h3 className="text-3xl font-bold text-white mb-3">
          No Sponsors Yet
        </h3>
        <p className="text-purple-200 text-lg">
          Be the first to sponsor our amazing event!
        </p>
      </div>
    );
  }

  // 🟢 Display sponsor cards
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto px-4">
      {sponsors.map((sponsor, index) => (
        <SponsorCard
          key={sponsor.id || index}
          sponsor={sponsor}
          index={index}
        />
      ))}
    </div>
  );
};

export default SponsorsGrid;
