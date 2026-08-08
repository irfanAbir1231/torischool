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
} as const;
