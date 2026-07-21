// ============================================================
// PORTFOLIO DATA FILE
// ============================================================
// Update your personal information, projects, skills, etc. here.
// All sections of the website read from this file.
// ============================================================

// -----------------------------------------------------------
// PERSONAL INFO
// -----------------------------------------------------------
// TODO: Replace placeholder values with your actual information
export const personalInfo = {
  name: "Atharva Anil Meshram",
  initials: "AM",
  title: "B.Tech Computer Technology Student",
  tagline: "Aspiring Software Developer | Python Learner | Technical Community Member",
  introduction:
    "I am a Computer Technology student passionate about programming, software development, modern web technologies, and continuous learning.",
  location: "Nagpur, Maharashtra",

  // TODO: Replace with your actual links
  linkedin: "https://www.linkedin.com/in/atharva-meshram-66ab302a5",
  github: "https://github.com/YOUR_USERNAME", // <-- Replace YOUR_USERNAME
  email: "YOUR_EMAIL@example.com", // <-- Replace with your actual email

  // TODO: Add your profile image to /public/profile-placeholder.png
  profileImage: "/profile-placeholder.png",

  // TODO: Add your resume PDF to /public/resume.pdf
  resumeLink: "/resume.pdf",
};

// -----------------------------------------------------------
// ABOUT SECTION
// -----------------------------------------------------------
export const aboutContent = {
  description:
    "I am a B.Tech Computer Technology student at Priyadarshini College of Engineering, Nagpur. I am interested in programming, software development, web technologies, artificial intelligence, and problem-solving. I actively participate in technical communities and student organizations to improve my technical, communication, teamwork, leadership, public relations, and event-management skills.",
  highlights: [
    {
      title: "Computer Technology Student",
      icon: "GraduationCap" as const,
    },
    {
      title: "Python Learner",
      icon: "Code2" as const,
    },
    {
      title: "Web Development Enthusiast",
      icon: "Globe" as const,
    },
    {
      title: "Active Community Member",
      icon: "Users" as const,
    },
  ],
};

// -----------------------------------------------------------
// EDUCATION SECTION
// -----------------------------------------------------------
export const educationData = [
  {
    degree: "B.Tech in Computer Technology",
    institution: "Priyadarshini College of Engineering, Nagpur",
    period: "2025–2029",
    description: "Currently pursuing Bachelor of Technology in Computer Technology.",
    icon: "GraduationCap" as const,
  },
  {
    degree: "Class 12 HSC",
    institution: "Completed in 2025",
    period: "2025",
    description: "Percentage: 69%",
    icon: "School" as const,
  },
  {
    degree: "MHT-CET 2025",
    institution: "Maharashtra Common Entrance Test",
    period: "2025",
    description: "Percentile: 85.90",
    icon: "Award" as const,
  },
];

// -----------------------------------------------------------
// SKILLS SECTION
// -----------------------------------------------------------
export const skillsData = [
  {
    category: "Programming",
    icon: "Terminal" as const,
    skills: ["Python", "HTML", "CSS", "JavaScript"],
  },
  {
    category: "Tools",
    icon: "Wrench" as const,
    skills: ["Git", "GitHub", "Visual Studio Code", "AI Development Tools"],
  },
  {
    category: "Learning Areas",
    icon: "BookOpen" as const,
    skills: [
      "Web Development",
      "Problem Solving",
      "Software Development",
      "Artificial Intelligence",
    ],
  },
  {
    category: "Professional Skills",
    icon: "Briefcase" as const,
    skills: [
      "Communication",
      "Teamwork",
      "Event Coordination",
      "Public Relations",
      "Technical Learning",
    ],
  },
];

// -----------------------------------------------------------
// PROJECTS SECTION
// -----------------------------------------------------------
// TODO: Update project links when available
export const projectsData = [
  {
    title: "Personal Portfolio Website",
    description:
      "A responsive personal portfolio website created to showcase education, skills, projects, achievements, and organizational roles.",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
    status: "In Development",
    // TODO: Replace with your actual GitHub repo URL
    githubLink: "",
    // TODO: Replace with your deployed portfolio URL
    liveLink: "",
  },
  {
    title: "Python Mini Projects",
    description:
      "A growing collection of beginner Python programs created to strengthen programming fundamentals and problem-solving skills.",
    technologies: ["Python"],
    examples: [
      "Calculator",
      "Number guessing game",
      "Quiz application",
      "Student marks calculator",
      "To-do list",
    ],
    status: "Learning Project",
    githubLink: "",
    liveLink: "",
  },
  {
    title: "Interactive Parallax Web Page",
    description:
      "An interactive webpage featuring responsive layouts, scrolling effects, animations, and modern visual design.",
    technologies: ["HTML", "CSS", "JavaScript"],
    status: "Project Concept",
    githubLink: "",
    liveLink: "",
  },
];

// -----------------------------------------------------------
// ROLES / POSITIONS OF RESPONSIBILITY
// -----------------------------------------------------------
export const rolesData = [
  {
    title: "Technical Member",
    organization: "SCOOP Forum",
    institution: "Priyadarshini College of Engineering",
    icon: "Monitor" as const,
    responsibilities: [
      "Supporting technical activities and workshops",
      "Assisting with technical requirements during events",
      "Helping prepare digital content, presentations, forms, or technical material",
      "Coordinating with team members during departmental activities",
    ],
  },
  {
    title: "Event Management Member",
    organization: "PCE ACM Student Chapter",
    institution: "",
    icon: "CalendarDays" as const,
    responsibilities: [
      "Supporting the planning and execution of events",
      "Coordinating registrations, schedules, venues, and participants",
      "Assisting during workshops, competitions, and seminars",
      "Collaborating with different teams during ACM activities",
    ],
  },
  {
    title: "Public Relations Member",
    organization: "PCE ACM-W Student Chapter",
    institution: "",
    icon: "Megaphone" as const,
    responsibilities: [
      "Promoting events through social media and student communities",
      "Preparing announcements, captions, and promotional content",
      "Communicating event information clearly",
      "Supporting outreach and collaboration activities",
    ],
  },
];

// -----------------------------------------------------------
// ACHIEVEMENTS & CERTIFICATIONS
// -----------------------------------------------------------
// TODO: Replace placeholder entries with your actual achievements
export const achievementsData = [
  {
    title: "Add Certificate",
    category: "Python Certification",
    organization: "",
    date: "",
    description: "Add your Python certification details here.",
    credentialLink: "",
    isPlaceholder: true,
  },
  {
    title: "Add Certificate",
    category: "Workshop Participation",
    organization: "",
    date: "",
    description: "Add your workshop participation details here.",
    credentialLink: "",
    isPlaceholder: true,
  },
  {
    title: "Add Certificate",
    category: "Hackathon Participation",
    organization: "",
    date: "",
    description: "Add your hackathon participation details here.",
    credentialLink: "",
    isPlaceholder: true,
  },
  {
    title: "Add Certificate",
    category: "College Competition",
    organization: "",
    date: "",
    description: "Add your college competition details here.",
    credentialLink: "",
    isPlaceholder: true,
  },
  {
    title: "Add Certificate",
    category: "Technical Seminar",
    organization: "",
    date: "",
    description: "Add your technical seminar details here.",
    credentialLink: "",
    isPlaceholder: true,
  },
  {
    title: "Add Certificate",
    category: "Campus Ambassador",
    organization: "",
    date: "",
    description: "Add your campus ambassador activity details here.",
    credentialLink: "",
    isPlaceholder: true,
  },
];

// -----------------------------------------------------------
// NAVIGATION LINKS
// -----------------------------------------------------------
export const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Education", href: "#education" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Roles", href: "#roles" },
  { label: "Achievements", href: "#achievements" },
  { label: "Contact", href: "#contact" },
];
