export type SectionKey = "profile" | "education" | "experience";

export type Profile = {
  fullName: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  summary: string;
};

export type Education = {
  id: string;
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
};

export type Experience = {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  responsibilities: string;
};
