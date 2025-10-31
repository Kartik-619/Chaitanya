// src/components/events/eventData.js

export const mainEvents = [
  {
    id: 'main-1',
    title: "CODE FORGE HACKATHON",
    shortDesc: "36-hour coding marathon",
    fullDesc: "Join us for an intense 36-hour hackathon where teams compete to create groundbreaking applications. Work with cutting-edge technologies and showcase your skills.",
    time: "Day-1(9:00 AM) - Day-2(6:00 PM)",
    venue: "Conference Hall (3rd Floor)",
    participants: "-",
    
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800",
    color: "#FF6B9D",
    category: "Main Event",
    highlights: [{ "Team Structure": "Teams must have 2–5 members with diverse roles coding, design, presentation, etc." }, { "Project Requirements Originality": "Core code must be created during the 36-hour event; use of public libraries/frameworks is allowed" }, { " Pre-Built Components": "Open-source tools can be used, but no prior work or commercial code as the main submission." }, { "Submission": " Must include a live demo link, project description, and source code repository link submitted before the deadline." }, { " Code of Conduct": "Participants must maintain respect, fairness, and collaboration; any harassment, discrimination, or cheating leads to disqualification." }],
    schedule: [
      { time: "6/11/2025", activity: "Opening Ceremony" },
      { time: "7/11/2025", activity: "Project Submission" },
     
    ]
  },
  {
    id: 'main-2',
    title: "Datathons",
    shortDesc: "AI prediction challenge",
    fullDesc: "Test your data science and machine learning skills in this prediction competition. Build models to solve real-world problems with accuracy.",
    time: "10:00 AM - 6:00 PM",
    venue: "Data Science Lab",
    participants: "300+",
   
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
    color: "#C084FC",
    category: "Main Event",
    highlights: [
      {
        "Team Structure": "Individuals or teams up to 4"
      },
      {
        "Project Requirements": "Any technical domain with a functional prototype/simulation"
      },
      {
        "Originality": "Must be original work"
      },
      {
        "Submission": "Must be present at booth for judging"
      },
      {
        "Intellectual Property": "Participants retain intellectual property; organizers can use project info for promotion"
      },
      {
        "Code of Conduct": "Professionalism and safety are required"
      }
    ],
    schedule: [
      { time: "6/11/2025", activity: "Opening Ceremony" },
      { time: "7/11/2025", activity: "Model Submission" },
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
      
      participants: "100+ Teams",
      
      category: "Technical Event",
      highlights: [
        {
          "Team Structure": "Projects can be submitted by individuals or teams of up to 4 members"
        },
        {
          "Project Requirements": "Projects can be from any technical domain (software, hardware, IoT, AI/ML, robotics, etc.) and must have a functional prototype or comprehensive simulation"
        },
        {
          "Originality": "The project must be the original work of the participants"
        },
        {
          "Submission": "Participants must be present at their designated booth for the entire duration of the judging rounds"
        },
        {
          "Intellectual Property": "Participants retain full intellectual property rights but grant Techfest Chaitanya 2025 the right to use project descriptions and images for promotional purposes"
        },
        {
          "Code of Conduct": "Professionalism in presentation and interaction is expected; all projects must adhere to safety regulations and be safe for public viewing"
        }
      ],
      schedule: [
        { time: "8/11/2025", activity: "First and final Round" },
   
      ]
    },
    {
      id: 'pt2',
      title: "Integration Bee",
      desc: "Math integration speed contest",
      fullDesc: "Put your calculus skills to the test in this high-speed integration contest. Compete against other math enthusiasts for the title of Integration Master.",
      color: "#60A5FA",
      image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800",
      time: "2:00 PM - 5:00 PM",
      
      participants: "100+",
      
      category: "Technical Event",
      highlights: [
        {
          "Team Structure": "Individual Participation: This is a solo competition"
        },
        {
          "Project Requirements": "Qualifier Round: 20 integrals in 30 minutes; Regular Season: Head-to-head matches; Playoffs: Single-elimination bracket with 8 minutes per head-to-head round"
        },
        {
          "Originality": "All integrals are developed and verified by the Engineering Department to ensure they are fair, appropriately challenging, and academically sound"
        },
        {
           "Evaluation Method":"During knockout rounds, integrals presented one at a time; first participant to provide correct solution wins and advances"
        },
        {
           "Problem Integrity": "All integrals are developed and verified by the Engineering Department"
        },
        {
          "Code of Conduct": "High standard of academic integrity and sportsmanship expected; cheating or unprofessional behavior results in immediate disqualification; calculators, notes, textbooks, or electronic devices strictly prohibited"
        }
      ], schedule: [
        { time: "6/11/2025", activity: "First Round" },
        { time: "7/11/2025", activity: "Second Round" },
        { time: "8/11/2025", activity: "Final Round" },
      ]
    },
    {
      id: 'pt3',
      title: "Reverse Engineering (Under the Hood)",
      desc: "Analyze & decode systems",
      fullDesc: "Dive deep into software systems to uncover their inner workings. Decode, debug, and reverse engineer real-world codebases.",
      color: "#8B5CF6",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
      time: "10:00 AM - 1:00 PM",
     
      participants: "60+",
   
      category: "Technical Event",
      "highlights": [
        {
          "Team Structure": "1-3 members per team (solo participation allowed). All participants must be currently registered students with valid institutional identification"
        },
        {
          "Project Requirements": "Capture-the-flag style cybersecurity challenges requiring identification and submission of specific security flags. Participants must solve various security puzzles and vulnerabilities"
        },
        {
          "Originality": "All solutions must be independently developed by team members. No sharing of flags, solutions, or collaborative problem-solving between different teams allowed"
        },
        {
          "Submission": "All captured flags must be submitted in exact specified format: flag{example_text}. Incorrect formatting will result in non-acceptance of valid solutions"
        },
        {
          "Intellectual Property": "Participants may use static software tools, official documentation, and online tutorials. Infrastructure and challenge designs remain property of event organizers"
        },
        {
          "Code of Conduct": "Strictly prohibited: sharing flags/solutions between teams, attacking competition infrastructure, bribery, or any form of cheating. Event Head reserves final authority on all rulings and disqualifications"
        }
      ],
      schedule: [
        { time: "6/11/2025", activity: "First Round" },
        { time: "7/11/2025", activity: "Second Round" },
        { time: "8/11/2025", activity: "Final Round" },
      ]

      ,
    },
    {
      id: 'pt4',
      title: "Capture the Flag (Hack the Hacker)",
      desc: "Cybersecurity competition",
      fullDesc: "Engage in thrilling cybersecurity puzzles and CTF challenges. Showcase your hacking skills in a secure and fun environment.",
      color: "#EC4899",
      image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800",
      time: "2:00 PM - 6:00 PM",
      
      participants: "120+",
      
      category: "Technical Event",
      highlights: [
        {
          "Team Structure": "Individual or team participation (specific team size requirements would be listed in general competition rules)"
        },
        {
          "Project Requirements": "CTF encompasses five primary categories: Web Exploitation (4-5 challenges), Cryptography (3-4 challenges), OSINT (2-3 challenges), plus additional categories. Web challenges include SQL Injection, XSS, SSRF, LFI/RFI, authentication flaws. Cryptography covers classical ciphers, modern attacks, RSA/AES weaknesses, steganography. OSINT focuses on social media investigation, metadata analysis, geolocation, and digital forensics"
        },
        {
          "Originality": "Custom vulnerability injection for educational purposes. Realistic scenarios mimicking real-world applications with Dockerized web applications in isolated networks"
        },
        {
          "Submission": "Flag submission format and scoring mechanism would follow standard CTF rules (typically instant points for correct flags)"
        },
        {
          "Intellectual Property": "Use of authorized tools and resources for each category: web proxies, crypto analysis tools, OSINT frameworks as permitted by competition rules"
        },
        {
          "Code of Conduct": "Standard CTF ethics: no brute-forcing, no DoS attacks, no sharing solutions between teams, adherence to responsible disclosure principles"
        }
      ],
      schedule:[ { time: "6/11/2025", activity: "First and Final Round" }],
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
    
      participants: "50+",

      category: "Non-Technical Event",
      highlights: [
        {
          "Team Structure": "Individual participants or teams of up to 3 members allowed. Collaborative teamwork encouraged within the specified team size limit"
        },
        {
          "Project Requirements": "Redesign a provided mockup according to a revealed retro theme. Final submission must be a single image file showcasing the complete redesigned interface"
        },
        {
          "Originality": "All design work must be original and created during the event timeframe. No pre-made templates or previous works allowed. Fresh creative interpretation of the retro theme required"
        },
        {
          "Submission": "Single image file submission in specified format. Must clearly demonstrate the retro-themed redesign of the original mockup. All elements must be visible in the final image file"
        },
        {
          "Intellectual Property": "Participants retain full rights to their original design creations. Open-source fonts and basic icons permitted with proper attribution. No third-party complex assets or templates allowed"
        },
        {
          "Code of Conduct": "Strict prohibition of AI tools for any part of the design process. Content must be appropriate for general audiences. Participants must use their own design software. No complex pre-made assets permitted - only basic icons and open-source resources allowed"
        }
      ]

    },
    {
      id: 'pnt2',
      title: "Human vs AI",
      desc: "Challenge AI in creativity",
      fullDesc: "Compete with AI in creative and logical tasks. From writing to design, show that human imagination still reigns supreme!",
      color: "#A78BFA",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
      time: "06/11/2025",
      
      participants: "150+",
     
      category: "Non-Technical Event",
      highlights: [
        {
          "Team Structure": "Human-AI collaboration where human provides strategic direction and AI generates content. Human operates under internet restrictions for certain tasks"
        },
        {
          "Project Requirements": "Three competitive segments: Art (2D visual creation on assigned topics), Essay (200-700 words), and Poetry (40-120 words). Each segment has specific creative constraints and output requirements"
        },
        {
          "Originality": "All AI-generated content must be created from single, unrepeated prompts. No copying, tracing, or plagiarism allowed. Human research permitted in Essay and Poetry segments but must result in original composition. Art must be completely original without referenced images"
        },
        {
          "Submission": "Strict time limits enforced for each segment. Art submissions as digital image files, Essay and Poetry as text documents. All AI prompts limited to 300 characters maximum with no refinements or follow-up requests"
        },
        {
          "Intellectual Property": "Participants retain rights to their final creations. Competition organizers may showcase winning entries with attribution. All prompt strategies and human-AI collaboration methods remain contestants' proprietary approaches"
        },
        {
          "Code of Conduct": "No external human assistance permitted. Single AI model must be used throughout competition. No internet access during Art segment. AI limited to one prompt per task without modifications. Strict adherence to word counts and time limits enforced across all segments"
        }
      ]

    }, {
      id: 'pnt3',
      title: "E-sports",
      desc: "Competitive gaming tournaments",
      fullDesc: "Face off in popular titles like Valorant, CS:GO, and FIFA. Compete, strategize, and rise to the top of the leaderboard.",
      color: "#F97316",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800",
      venue: "Gaming Arena",
      schedule:[ { time: "6/11/2025", activity: "First Round" },
        {
        time: "7/11/2025", activity: "Final Round"
      }],

      category: "Other Activity"
    },
    {
      id: 'pnt4',
      title: "Prompt Engineering",
      desc: "Craft powerful AI prompts",
      fullDesc: "Showcase your skill in designing prompts that yield precise, creative AI outputs. Learn the emerging art of prompt crafting.",
      color: "#C026D3",
      image: "https://images.unsplash.com/photo-1677442136020-2d708cc3eac2?w=800",
      time: "07/11/2025",
      
      participants: "100+",
      
      category: "Non-Technical Event",

      highlights: [
        {
          "Team Structure": "Individual participation only - each competitor works independently throughout all competition rounds"
        },
        {
          "Project Requirements": "Preliminary Round (Two Stages): Text & Image Generation tasks using single-hit prompts only (one prompt per attempt). Final Round: Create a complete website with frontend code using maximum of three prompts with no word limitations"
        },
        {
          "Originality": "All generated content must be original work produced during the competition. No pre-written code, pre-generated images, or template-based solutions permitted. Each prompt submission must yield unique, competition-specific outputs"
        },
        {
          "Submission": "Preliminary submissions evaluated based on prompt effectiveness and output quality. Final round requires complete website deployment with functional frontend code. All submissions must be made within designated time frames for each round"
        },
        {
          "Intellectual Property": "All competition prompts and evaluation criteria remain proprietary. Participants retain ownership of their specific prompt strategies and generated outputs. Competition organizers reserve rights to showcase winning creations with proper attribution"
        },
        {
          "Code of Conduct": "Strict adherence to single-prompt rule in preliminary rounds. Maximum three prompts allowed in final round without word count restrictions. No external resources, pre-trained models, or collaborative assistance permitted. All work must be generated exclusively through competition-approved AI tools during event timeframe"
        }
      ]
    },
    {
      id: 'pnt5',
      title: "Jack oh Hearts",
      desc: "One Player is JOH and players must identify the JOH, the JOH must deceive players",
      fullDesc: "Showcase your skill in designing prompts that yield precise, creative AI outputs. Learn the emerging art of prompt crafting.",
      color: "#C026D3",
      image: "https://images.unsplash.com/photo-1677442136020-2d708cc3eac2?w=800",
      time: "07/11/2025",
      venue: "HPTU Campus",
      category: "Non-Technical Event",

      highlights: [
        {
          "Team Structure": "Individual participation for 10-14 students. One player is secretly assigned the special role of 'Jack of Hearts' (JOH), creating a hidden adversarial dynamic."
        },
        {
          "Project Requirements": "A social deduction game played in rounds. Each round has three phases: Setup (hidden symbol placement), Interaction (10-minute questioning period), and Judgment (symbol guessing). The core requirement is to deduce information while managing deception."
        },
        {
          "Originality": "Strategies for deduction (for players) and deception (for the JOH) must be developed in real-time based on social interactions. No pre-planned strategies or external aids are permitted."
        },
        {
          "Submission": "Two types of submissions: 1) A written guess of one's own symbol at the end of each round's Judgment phase. 2) A public accusation to identify the JOH, which serves as a final submission to end the game."
        },
        {
          "Intellectual Property": "The game concept and rules are the intellectual property of the event organizers. The emergent social strategies and player interactions are the contributions of the participants."
        },
        {
          "Code of Conduct": "The JOH is uniquely permitted to lie during interactions; all other players must tell the truth. Incorrect symbol guesses result in elimination. A false accusation of the JOH leads to the accuser's elimination, while a correct accusation ends the game with a win for the players."
        }
      ]

    },{
      id: 'pnt6',
      title: "Two Minute Manager",
      desc: "Create and Present your marketing strategy in a real time competetive environment. ",
      fullDesc: "Showcase your skill in designing prompts that yield precise, creative AI outputs. Learn the emerging art of prompt crafting.",
      color: "#C026D3",
      image: "https://images.unsplash.com/photo-1677442136020-2d708cc3eac2?w=800",
      time: "07/11/2025",
      venue: "HPTU Campus",
      category: "Non-Technical Event",

      
        "highlights":[
          {
            "Team Structure": "Teams of 2 members work together to solve real-world business scenarios under time constraints. Each team receives a unique situation and must collaborate efficiently to deliver a concise solution."
          },
          {
            "Project Requirements": "Participants engage in two rounds: 1) Solve an organizational problem from domains like HR, leadership, finance, or crisis management. 2) Develop a marketing strategy or idea for a product. Each round involves a 10-minute preparation followed by a 2-minute presentation."
          },
          {
            "Originality": "Each team receives a unique scenario and must craft original, on-the-spot solutions without external aids. Use of phones or laptops is strictly prohibited."
          },
          {
            "Submission": "Two-stage live presentation: 1) Organizational problem-solving. 2) Marketing strategy pitch. Teams present for 2 minutes with time signals at 1:30 and 1:55. Presentation order is randomly assigned by judges."
          },
          {
            "Intellectual Property": "All solutions and strategies developed during the event remain the intellectual property of the participants. The event format and evaluation criteria are owned by the organizers."
          },
          {
            "Code of Conduct": "No digital devices are allowed during preparation. Teams are judged on communication, body language, confidence, and feasibility of their solution. Exceeding the time limit results in negative marking."
          }
        ]
        
      
      
    },{
      id: 'pnt6',
      title: "Pitch High",
      desc: "Submit a 1-2 page executive summary covering the business concept, market need, target audience, revenue model, and competitive advantage.",
      color: "#C026D3",
      image: "https://images.unsplash.com/photo-1677442136020-2d708cc3eac2?w=800",
      time: "07/11/2025",
      venue: "HPTU Campus",
      category: "Non-Technical Event",

      
        "highlights": [
          {
            "Team Structure": "Teams of 2 to 5 members collaborate to develop and pitch an original business idea. All members must actively participate during the Q&A phase of the final round."
          },
          {
            "Project Requirements": "Participants submit a 1–2 page executive summary detailing their business concept, market need, target audience, revenue model, and competitive advantage. Shortlisted teams present their plan using PPT or PDF."
          },
          {
            "Originality": "All business ideas must be original and developed by the team. Plagiarized or previously published concepts will be disqualified."
          },
          {
            "Submission": "Two-stage submission: 1) Executive Summary for initial screening. 2) Final Presentation with a 7–10 minute pitch followed by a 3–5 minute Q&A session with judges."
          },
          {
            "Intellectual Property": "All submitted ideas remain the intellectual property of the participants. The event organizers retain rights to the event format and evaluation criteria."
          },
          {
            "Code of Conduct": "All presentations and documents must be in English. Use of videos, demos, or prototypes is allowed within the time limit. Exceeding time limits may result in point deductions."
          }
        ]
      
      
    }

  ],

  otherActivities: [
   
    {
      id: 'oa1',
      title: "PolyMath Escape Room",
      desc: "Solve puzzles to escape",
      fullDesc: "Use your logic, math, and teamwork to solve puzzles in a thrilling escape room challenge.",
      color: "#0EA5E9",
      image: "https://images.unsplash.com/photo-1505685296765-3a2736de412f?w=800",
      time: "07/11/2025",
      venue: "Puzzle Hall",

      category: "Other Activity",
      highlights: [
        {
          "Team Structure": "Team-based participation with a maximum of 3 students per team. Inter-team collaboration is strictly prohibited."
        },
        {
          "Project Requirements": "A multi-stage puzzle challenge comprising six sequential rounds (Rounds 1-5 and a Final Round 6). Teams must uncover a hidden clue in each of the initial five rounds. These individual clues must be logically combined to form a single access code, which grants entry to the Final Round, known as the 'Dark Room'."
        },
        {
          "Originality": "All solutions and the final access code must be the original work of the team, derived solely from the provided puzzles. No sharing of answers, clues, or strategies between different teams is allowed."
        },
        {
          "Submission": "Advancement is contingent upon successfully deciphering the hidden clues. Entry into the Final Round (Dark Room) is exclusively granted to the first teams that successfully form and submit the correct access code, synthesized from the clues gathered in Rounds 1-5."
        },
        {
          "Intellectual Property": "The design, puzzles, and all challenge materials are the exclusive intellectual property of the event organizers. The logical methods and problem-solving paths developed by teams are their own."
        },
        {
          "Code of Conduct": "The use of external electronic devices is strictly forbidden upon entry into the Dark Room (Final Round). Collaboration or communication between different teams is prohibited at all stages. The decisions made by the event organizers are absolute and final."
        }
      ]

    },
    {
      id: 'oa2',
      title: "Cultural Night",
      desc: "Music, dance & creativity",
      fullDesc: "Experience the cultural side of the fest — dance, music, art, and more! A celebration of creativity and expression.",
      color: "#06B6D4",
      image: "https://images.unsplash.com/photo-1515169067865-5387ec356754?w=800",
      category: "Other Activity",
      highlights: ["Coming Soon..."]
    },
    {
      id: 'oa3',
      title: "Expos / Workshops",
      desc: "Tech expos & workshops",
      fullDesc: "Participate in hands-on workshops and explore innovation expos hosted by industry professionals and startups.",
      color: "#22C55E",
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800",
      time: "10:00 AM - 5:00 PM",
      category: "Other Activity",
      highlights: ["Coming Soon..."]
    },
    {
      id: 'oa4',
      title: "Stand-Up Comedy Night",
      desc: "Laugh out loud performances",
      fullDesc: "Enjoy hilarious performances by talented comedians in an open-air theatre. A perfect way to unwind after technical events.",
      color: "#F43F5E",
      image: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800",
      time: "8:00 PM - 10:00 PM",
      venue: "Open-Air Theatre",
      participants: "Open to all",
      category: "Other Activity",
      highlights: ["Coming Soon..."]
    }
  ]
};

export const allScrollEvents = [
  ...mainEvents,
  ...prelimEvents.technical,
  ...prelimEvents.nonTechnical,
  ...prelimEvents.otherActivities
];
