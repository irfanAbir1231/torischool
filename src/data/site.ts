export type SiteLink = {
  label: string;
  href: string;
};

export type Stat = {
  value: string;
  label: string;
};

export type ProgramTrack = {
  title: string;
  description: string;
  where: string;
  when: string;
};

export type PersonPlaceholder = {
  role: string;
  name: string;
  image: string | null;
};

export type GalleryPlaceholder = {
  subject: string;
  image: string | null;
};

export type EditorialStep = {
  number: string;
  title: string;
  description: string;
};

export const site = {
  identity: {
    name: "Tori School",
    subtitle: "Pilot · University of Dhaka",
    location: "University of Dhaka, Bangladesh",
  },
  navigation: [
    { label: "Tracks", href: "#tracks" },
    { label: "Team / Organization", href: "#team" },
    { label: "Get Involved", href: "#volunteer" },
  ] satisfies SiteLink[],
  hero: {
    headline: "Learning support for Dhaka's children who school forgets first.",
    paragraphs: [
      "Tori School is a volunteer-run program started by University of Dhaka undergraduates.",
      "We provide free academic support and life-skills education to children of low-income campus staff and street-connected youth around the city.",
      "Currently in pilot phase, built by students who show up week after week.",
    ],
  },
  stats: [
    { value: "~65", label: "Student Volunteers" },
    { value: "2", label: "Program Tracks" },
    { value: "1:2", label: "Teacher–Student Ratio (Weekend)" },
  ] satisfies Stat[],
  tracks: [
    {
      title: "Academic Rescue Academy",
      description:
        "Free weekend homework and exam support at Curzon Hall & Mal Chattar for 35–50 children (ages 5–13) of campus support staff and rickshaw pullers. We reinforce what they already learn in school, rather than adding a new curriculum.",
      where: "Curzon Hall & Mal Chattar",
      when: "Weekends",
    },
    {
      title: "Pop-Up Welfare Camps",
      description:
        "Twice-monthly pop-up sessions near TSC and Suhrawardy Udyan for transient and street-connected youth. We teach practical math to prevent exploitation, safety basics, and health hygiene, in a format that doesn't assume stable attendance.",
      where: "TSC & Suhrawardy Udyan",
      when: "Twice monthly",
    },
  ] satisfies ProgramTrack[],
  links: {
    facebook: "https://www.facebook.com/torischooldu",
    volunteerForm: "#",
    heroVideo: null as string | null,
    academicRescueAcademyVideo: null as string | null,
    popUpWelfareCampsVideo: null as string | null,
  },
  videoContent: {
    hero: {
      title: "1 minute introduction",
      status: "Video coming soon",
    },
    academicRescueAcademy: {
      title: "Academic Rescue Academy — 1 minute session reel",
      status: "Video coming soon",
    },
    popUpWelfareCamps: {
      title: "Pop-Up Welfare Camps — 1 minute session reel",
      status: "Video coming soon",
    },
  },
  leadership: [
    { role: "President", name: "Name to be supplied", image: null },
    { role: "Secretary", name: "Name to be supplied", image: null },
  ] satisfies PersonPlaceholder[],
  volunteerGallery: [
    { subject: "Volunteers with children", image: null },
    { subject: "Memory or activity moment", image: null },
    { subject: "Volunteer networking or team bonding", image: null },
    { subject: "Tour or outing", image: null },
  ] satisfies GalleryPlaceholder[],
  howItWorks: [
    { number: "01", title: "Show up", description: "University students volunteer their time." },
    { number: "02", title: "Support", description: "Academic and practical learning is delivered." },
    { number: "03", title: "Stay consistent", description: "Children see familiar volunteers who return regularly." },
  ] satisfies EditorialStep[],
  volunteerJourney: [
    { number: "01", title: "Register", description: "Submit the volunteer form." },
    { number: "02", title: "Meet the team", description: "Join a short orientation / introduction." },
    { number: "03", title: "Join a session", description: "Start volunteering with the field team." },
  ] satisfies EditorialStep[],
  volunteerExperience: {
    heading: "Why join Tori School?",
    introduction: "Volunteering here is a chance to learn alongside children, build practical teaching experience, and become part of a team that consistently shows up.",
    points: [
      "Connect with children through patient, everyday learning.",
      "Gain hands-on experience in teaching and field work.",
      "Create memories together as part of a returning team.",
    ],
  },
  safeguarding: {
    heading: "Safeguarding matters",
    copy: "Volunteers are expected to follow Tori School's child-safety and responsible-conduct guidelines while working with children.",
  },
  volunteerCta: {
    eyebrow: "Ready to show up?",
    heading: "Register as a volunteer",
    description: "The volunteer registration form will be available here soon.",
    unavailableMessage: "Registration link coming soon",
  },
} as const;
