import type { Category, ClassBlock } from "./types";

// Raw example data for the demo, kept as one row per record so it reads like a table.
// Every person is fictional. Event days are offsets from "today" in New York, so the
// demo always shows the next two weeks.

export const STUDENT_ID = "u-student";
export const MANAGER_ID = "u-manager";
export const CODERS_ORG = "org-coders";

/** Marker for days computed from the weekday (so they line up with the sample classes). */
export const NEXT_MON = -1;
export const NEXT_TUE = -2;

// [id, name, email, role]
// prettier-ignore
export const PEOPLE_ROWS: [string, string, string, "student" | "org_manager"][] = [
  [STUDENT_ID, "Jordan Ellis", "jordan.ellis@bison.howard.edu", "student"],
  [MANAGER_ID, "Taylor Reed", "taylor.reed@bison.howard.edu", "org_manager"],
  ["u-aaliyah", "Aaliyah Brooks", "aaliyah.brooks@bison.howard.edu", "student"],
  ["u-marcus", "Marcus Bell", "marcus.bell@bison.howard.edu", "student"],
  ["u-simone", "Simone Carter", "simone.carter@bison.howard.edu", "student"],
  ["u-devin", "Devin Price", "devin.price@bison.howard.edu", "student"],
];

// [id, name, category, instagram handle, followers before the demo, verified, tags, description]
// prettier-ignore
export const ORG_ROWS: [string, string, Category, string, number, boolean, string[], string][] = [
  ["org-council", "Bison Student Council", "professional", "bisoncouncil", 1840, true, ["leadership", "service", "career"], "Student government: town halls, campus advocacy and Homecoming planning."],
  ["org-caribbean", "Caribbean Students Association", "cultural", "hu_csa", 1320, true, ["culture", "music", "food"], "Celebrating Caribbean culture, food, music and community at the Mecca."],
  [CODERS_ORG, "Bison Coders", "academic", "bisoncoders", 640, true, ["tech", "career", "learning"], "Hackathons, workshops and study nights for students who build software."],
  ["org-poetry", "Howard Poetry Society", "cultural", "hupoetry", 410, true, ["arts", "culture", "chill"], "Open mics, writing circles and spoken word showcases."],
  ["org-prelaw", "Pre-Law Society", "professional", "hu_prelaw", 520, true, ["career", "leadership"], "LSAT prep, attorney panels and law school visits."],
  ["org-gaming", "Bison Gaming League", "social", "bisongaming", 760, true, ["games", "fun", "chill"], "Tournaments, game nights and esports for every skill level."],
  ["org-business", "Bison Business Network", "professional", "bisonbiz", 905, true, ["career", "money", "leadership"], "Resume reviews, recruiter mixers and case competitions."],
  ["org-wellness", "Wellness Collective", "social", "hu_wellness", 380, true, ["wellness", "chill", "fun"], "Yoga on the Yard, mental-health check-ins and run club."],
  ["org-premed", "Pre-Med Society", "academic", "hu_premed", 690, true, ["health", "learning", "career"], "MCAT study groups, shadowing tips and medical school panels."],
  ["org-step", "Bison Step & Dance", "cultural", "bisonstep", 1100, false, ["arts", "music", "fun"], "Step, dance and performance crews: no experience needed for workshops."],
];

// [org, title, category, location, day offset, hour, minute, length in hours, free, tags, RSVPs before the demo, description]
// prettier-ignore
export const EVENT_ROWS: [string, string, Category, string, number, number, number, number, boolean, string[], number, string][] = [
  ["org-gaming", "Late-Night Game Night", "social", "Blackburn Game Room", 0, 20, 0, 3, true, ["games", "fun"], 34, "Switch, PS5 and board games. Snacks while they last."],
  [CODERS_ORG, "Intro to React Workshop", "academic", "Douglass Hall 116", 1, 18, 0, 1.5, true, ["tech", "learning"], 41, "Build your first web app in 90 minutes. Laptops required."],
  ["org-council", "Yardfest Planning Town Hall", "social", "Blackburn Center Ballroom", 2, 18, 30, 2, true, ["leadership", "music"], 96, "Help shape this year's Yardfest lineup and activities."],
  ["org-poetry", "Open Mic: Voices of the Mecca", "cultural", "Cramton Auditorium", 2, 19, 0, 3, true, ["arts", "chill"], 58, "Sign up at the door to perform poetry, music or comedy."],
  ["org-caribbean", "Caribbean Night Market", "cultural", "The Yard", 3, 17, 0, 4, true, ["food", "music", "culture"], 212, "Food, vendors and soca all night on the Yard."],
  ["org-wellness", "Sunrise Yoga on the Yard", "social", "The Yard", 4, 8, 0, 1, true, ["wellness", "chill"], 27, "Bring a mat or borrow one. All levels welcome."],
  ["org-gaming", "Smash Bros Tournament", "social", "Blackburn Game Room", 5, 18, 0, 4, false, ["games", "fun"], 73, "Bracket play, prizes for top 3. $5 entry."],
  ["org-prelaw", "Attorney Panel & Networking", "professional", "School of Business Auditorium", 6, 18, 0, 2, true, ["career", "leadership"], 49, "Meet Howard Law alumni practicing in DC."],
  ["org-business", "Resume Review Drop-in", "professional", "Career Center, Room 210", NEXT_TUE, 14, 30, 1.5, true, ["career", "money"], 38, "Bring a printed resume. Recruiters from three DC firms."],
  ["org-premed", "Lunch & Learn: MCAT Strategy", "academic", "Annex III Lounge", NEXT_MON, 12, 15, 1, true, ["health", "learning"], 31, "Free lunch while upperclassmen break down their study plans."],
  [CODERS_ORG, "Fall Hack Night", "academic", "iLab, Founders Library", 7, 19, 0, 6, true, ["tech", "career"], 64, "Overnight build session with pizza and mentors."],
  ["org-step", "Step Workshop for Beginners", "cultural", "Burr Gymnasium", 7, 17, 30, 2, true, ["arts", "music", "fun"], 88, "Learn a full routine in one night. Wear sneakers."],
  ["org-council", "Homecoming Volunteer Info Session", "social", "Blackburn 148", 8, 17, 0, 1, true, ["service", "leadership"], 45, "Learn how to get involved with Homecoming week."],
  ["org-business", "Recruiter Mixer: Finance & Consulting", "professional", "School of Business Atrium", 9, 18, 0, 2, true, ["career", "money"], 120, "Business casual. Eight firms recruiting for summer internships."],
  ["org-wellness", "Stress-Less Finals Fair", "social", "Founders Library Lawn", 10, 12, 0, 3, true, ["wellness", "fun"], 66, "Therapy dogs, massages and study snacks before finals."],
  [CODERS_ORG, "Interview Prep: Data Structures", "academic", "Douglass Hall 116", 11, 18, 30, 1.5, true, ["tech", "career", "learning"], 29, "Whiteboard practice with engineers from local tech companies."],
  ["org-caribbean", "Carnival Fete Dance Class", "cultural", "Blackburn Ballroom", 12, 19, 0, 2, false, ["music", "culture", "fun"], 54, "$3 at the door. Soca, dancehall and good vibes."],
  ["org-premed", "Medical School Admissions Panel", "academic", "College of Medicine, Seeley Mudd 1", 13, 17, 30, 1.5, true, ["health", "career"], 37, "Admissions officers answer your questions about applying."],
];

// The student's classes. "Resume Review" (next Tue) and "MCAT" (next Mon) overlap on purpose.
// prettier-ignore
export const SAMPLE_CLASSES: ClassBlock[] = [
  { id: "c-1", name: "CSCI 351 Data Structures", days: [1, 3, 5], start: "10:00", end: "10:50" },
  { id: "c-2", name: "MATH 156 Calculus II", days: [1, 3], start: "12:10", end: "13:00" },
  { id: "c-3", name: "ENGL 205 Writing Seminar", days: [2, 4], start: "14:10", end: "15:30" },
];

/** Friends' RSVPs (event ids are ev-01 … ev-18 in EVENT_ROWS order). */
export const FRIEND_RSVPS: Record<string, string[]> = {
  "u-aaliyah": ["ev-05", "ev-04", "ev-12"],
  "u-marcus": ["ev-02", "ev-11", "ev-07"],
  "u-simone": ["ev-05", "ev-14", "ev-08"],
  "u-devin": ["ev-02", "ev-05"],
};
