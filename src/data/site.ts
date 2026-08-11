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
    subtitle: "University of Dhaka",
    location: "University of Dhaka, Bangladesh",
    logo: null as string | null,
  },
  navigation: [
    { label: "About", href: "#about" },
    { label: "Get Involved", href: "#volunteer" },
    { label: "Support ↗", href: "#support" },
  ] satisfies SiteLink[],
  hero: {
    headline: "Learning beyond the classroom.",
    paragraphs: [
      "Tori School provides free weekend classes for children from low-income campus staff families and surrounding campus communities.",
      "Monthly education camps provide street-connected children with basic literacy, numeracy, and essential life skills.",
    ],
    image: "/images/photo_academic_support_hero.jpg",
  },
  stats: [
    { value: "100", label: "Student Volunteers" },
    { value: "60", label: "Children Supported" },
    { value: "2", label: "Programs" },
  ] satisfies Stat[],
  tracks: [
    {
      title: "Academic Support",
      description:
        "Free weekend learning support for 45–60 children aged 5–13 from campus staff families and surrounding communities. We provide quality teaching, homework support, and close mentoring to help children stay engaged with their education.",
      where: "Curzon Hall & Mal Chattar",
      when: "Weekends",
    },
    {
      title: "Education Camps",
      description:
        "Monthly education camps near the University of Dhaka campus for street-connected children. Sessions focus on basic literacy, numeracy, practical skills, safety, and personal hygiene.",
      where: "Near University of Dhaka campus",
      when: "Monthly",
    },
  ] satisfies ProgramTrack[],
  links: {
    facebook: "https://www.facebook.com/torischooldu",
    youtube: "https://www.youtube.com/@ToriSchoolDU",
    linkedin: "https://www.linkedin.com/company/tori-school-in-du/",
    email: "torischooldu@gmail.com",
    volunteerForm: "https://forms.gle/zxEck1UQzLAvgrLC9",
    heroVideo: "https://youtu.be/hRDS9RDO1ss",
    academicRescueAcademyVideo: "https://youtu.be/hRDS9RDO1ss",
    popUpWelfareCampsVideo: "https://youtu.be/6h_WjO5SyWI",
  },
  videoContent: {
    hero: {
      title: "Academic Support",
      status: "Free weekend learning support at Curzon Hall and Mal Chattar",
    },
    academicRescueAcademy: {
      title: "Academic Support — session reel",
      status: "A regular weekend class",
    },
    popUpWelfareCamps: {
      title: "Education Camps — session reel",
      status: "A monthly education camp",
    },
  },
  leadership: [
    { role: "President", name: "Details coming soon", image: null },
    { role: "Secretary", name: "Details coming soon", image: null },
  ] satisfies PersonPlaceholder[],
  organization: {
    introduction: "Tori School is a student-led initiative at the University of Dhaka, bringing volunteers together to make consistent learning support possible for children in campus communities.",
    teamPhoto: "/images/photo_volunteers_group.jpg",
    teamPhotoCaption: "Tori School volunteers and children at the University of Dhaka.",
  },
  volunteerGallery: [
    { subject: "Children in a learning session", image: "/images/photo_children_session.jpg" },
    { subject: "Volunteers teaching and participating", image: "/images/photo_volunteering.jpg" },
    { subject: "Academic support in the campus community", image: "/images/photo_academic_support_hero.jpg" },
    { subject: "Education camp activity", image: "/images/photo_education_camp_hero.jpg" },
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
      "Gain hands-on teaching experience.",
      "Create memories together as part of a returning team.",
    ],
  },
  safeguarding: {
    heading: "Safeguarding matters",
    copy: "Volunteers are expected to follow Tori School's child-safety and responsible-conduct guidelines while working with children.",
  },
  support: {
    heading: "Help keep learning within reach",
    description: "Your support helps Tori School continue free weekend classes and monthly education camps for children in campus communities.",
    bkashNumber: "+8801880384226",
  },
  volunteerCta: {
    eyebrow: "Ready to show up?",
    heading: "Register as a volunteer",
    description: "Join the team behind Tori School's weekend classes and monthly education camps.",
    unavailableMessage: "Open volunteer registration form",
  },
} as const;
