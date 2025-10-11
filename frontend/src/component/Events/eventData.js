// src/components/events/eventData.js

export const mainEvents = [
  {
    id: 'main-1',
    title: "CODE FORGE HACKATHON",
    shortDesc: "36-hour coding marathon",
    fullDesc: "Join us for an intense 36-hour hackathon where teams compete to create groundbreaking applications. Work with cutting-edge technologies and showcase your skills.",
    time: "Day-1(9:00 AM) - Day-2(6:00 PM)",
    venue: "Tech Hall A",
    participants: "-",
    prize: "-",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800",
    color: "#FF6B9D",
    category: "Main Event",
    highlights: ["Work with latest technologies", "Mentorship from experts", "Networking opportunities", "Amazing prizes"],
    schedule: [
      { time: "9:00 AM", activity: "Registration & Team Formation" },
      { time: "11:00 AM", activity: "Opening Ceremony" },
      { time: "12:00 PM", activity: "Hacking Begins" },
      { time: "6:00 PM", activity: "Dinner Break" },
      { time: "12:00 AM", activity: "Midnight Snacks" },
      { time: "6:00 PM", activity: "Submissions Close" }
    ]
  },
  {
    id: 'main-2',
    title: "ACCURATE PREDICTIONS",
    shortDesc: "AI prediction challenge",
    fullDesc: "Test your data science and machine learning skills in this prediction competition. Build models to solve real-world problems with accuracy.",
    time: "10:00 AM - 6:00 PM",
    venue: "Data Science Lab",
    participants: "300+",
    prize: "$30,000",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
    color: "#C084FC",
    category: "Main Event",
    highlights: ["Real-world datasets", "Cloud computing resources", "Expert evaluation", "Industry recognition"],
    schedule: [
      { time: "10:00 AM", activity: "Problem Statement Release" },
      { time: "11:00 AM", activity: "Coding Begins" },
      { time: "2:00 PM", activity: "Lunch Break" },
      { time: "5:00 PM", activity: "Final Submissions" },
      { time: "6:00 PM", activity: "Results & Awards" }
    ]
  }
];

export const prelimEvents = {
  technical: [
    {
      id: 'pt1',
      title: "Project Bazaar",
      desc: "Showcase innovative projects",
      fullDesc: "Display your innovative projects to peers and professionals. Get valuable feedback and stand a chance to win recognition for your creativity.",
      color: "#10B981",
      image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800",
      time: "10:00 AM - 3:00 PM",
      venue: "Innovation Hall",
      participants: "100+ Teams",
      prize: "$8,000",
      category: "Technical Event"
    },
    {
      id: 'pt2',
      title: "Integration Bee",
      desc: "Math integration speed contest",
      fullDesc: "Put your calculus skills to the test in this high-speed integration contest. Compete against other math enthusiasts for the title of Integration Master.",
      color: "#60A5FA",
      image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800",
      time: "2:00 PM - 5:00 PM",
      venue: "Mathematics Hall",
      participants: "100+",
      prize: "$5,000",
      category: "Technical Event"
    },
    {
      id: 'pt3',
      title: "Reverse Engineering (Under the Hood)",
      desc: "Analyze & decode systems",
      fullDesc: "Dive deep into software systems to uncover their inner workings. Decode, debug, and reverse engineer real-world codebases.",
      color: "#8B5CF6",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
      time: "10:00 AM - 1:00 PM",
      venue: "Computer Lab 3",
      participants: "60+",
      prize: "$5,500",
      category: "Technical Event"
    },
    {
      id: 'pt4',
      title: "Capture the Flag (Hack the Hacker)",
      desc: "Cybersecurity competition",
      fullDesc: "Engage in thrilling cybersecurity puzzles and CTF challenges. Showcase your hacking skills in a secure and fun environment.",
      color: "#EC4899",
      image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800",
      time: "2:00 PM - 6:00 PM",
      venue: "Security Lab",
      participants: "120+",
      prize: "$6,000",
      category: "Technical Event"
    }
  ],

  nonTechnical: [
    {
      id: 'pnt1',
      title: "Retro Theming",
      desc: "Design inspired by the past",
      fullDesc: "Bring back the classic vibes! Participate in this creative design contest inspired by retro culture, art, and fashion.",
      color: "#F59E0B",
      image: "https://images.unsplash.com/photo-1511765224389-37f0e77cf0eb?w=800",
      time: "3:00 PM - 5:00 PM",
      venue: "Art Studio",
      participants: "50+",
      prize: "$3,000",
      category: "Non-Technical Event"
    },
    {
      id: 'pnt2',
      title: "Human vs AI",
      desc: "Challenge AI in creativity",
      fullDesc: "Compete with AI in creative and logical tasks. From writing to design, show that human imagination still reigns supreme!",
      color: "#A78BFA",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
      time: "3:00 PM - 4:00 PM",
      venue: "AI Lab",
      participants: "150+",
      prize: "$7,000",
      category: "Non-Technical Event"
    },
    {
      id: 'pnt3',
      title: "Prompt Engineering",
      desc: "Craft powerful AI prompts",
      fullDesc: "Showcase your skill in designing prompts that yield precise, creative AI outputs. Learn the emerging art of prompt crafting.",
      color: "#C026D3",
      image: "https://images.unsplash.com/photo-1677442136020-2d708cc3eac2?w=800",
      time: "11:00 AM - 1:00 PM",
      venue: "Innovation Lab",
      participants: "100+",
      prize: "$5,000",
      category: "Non-Technical Event"
    }
  ],

  otherActivities: [
    {
      id: 'oa1',
      title: "E-sports",
      desc: "Competitive gaming tournaments",
      fullDesc: "Face off in popular titles like Valorant, CS:GO, and FIFA. Compete, strategize, and rise to the top of the leaderboard.",
      color: "#F97316",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800",
      time: "10:00 AM - 8:00 PM",
      venue: "Gaming Arena",
      participants: "500+",
      prize: "$10,000",
      category: "Other Activity"
    },
    {
      id: 'oa2',
      title: "PolyMath – Escape Room",
      desc: "Solve puzzles to escape",
      fullDesc: "Use your logic, math, and teamwork to solve puzzles in a thrilling escape room challenge.",
      color: "#0EA5E9",
      image: "https://images.unsplash.com/photo-1505685296765-3a2736de412f?w=800",
      time: "10:00 AM - 2:00 PM",
      venue: "Puzzle Hall",
      participants: "100+",
      prize: "$4,000",
      category: "Other Activity"
    },
    {
      id: 'oa3',
      title: "Cultural Night",
      desc: "Music, dance & creativity",
      fullDesc: "Experience the cultural side of the fest — dance, music, art, and more! A celebration of creativity and expression.",
      color: "#06B6D4",
      image: "https://images.unsplash.com/photo-1515169067865-5387ec356754?w=800",
      time: "6:00 PM - 9:00 PM",
      venue: "Main Auditorium",
      participants: "1000+",
      prize: "Exciting Goodies",
      category: "Other Activity"
    },
    {
      id: 'oa4',
      title: "Expos / Workshops",
      desc: "Tech expos & workshops",
      fullDesc: "Participate in hands-on workshops and explore innovation expos hosted by industry professionals and startups.",
      color: "#22C55E",
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800",
      time: "10:00 AM - 5:00 PM",
      venue: "Expo Center",
      participants: "Open for all",
      prize: "Certificates",
      category: "Other Activity"
    },
    {
      id: 'oa5',
      title: "Stand-Up Comedy Night",
      desc: "Laugh out loud performances",
      fullDesc: "Enjoy hilarious performances by talented comedians in an open-air theatre. A perfect way to unwind after technical events.",
      color: "#F43F5E",
      image: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800",
      time: "8:00 PM - 10:00 PM",
      venue: "Open-Air Theatre",
      participants: "Open to all",
      prize: "Exciting Goodies",
      category: "Other Activity"
    }
  ]
};

export const allScrollEvents = [
  ...mainEvents,
  ...prelimEvents.technical,
  ...prelimEvents.nonTechnical,
  ...prelimEvents.otherActivities
];
