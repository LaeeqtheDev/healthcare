/**
 * Provider and facility directory.
 *
 * WHY THIS EXISTS
 * ---------------
 * The booking form offered nine names and nothing else. A patient choosing
 * a physician had no specialty, no location, no languages, and no idea
 * whether that person treats what is wrong with them. In practice that
 * means patients pick the first name in the list or the one with a
 * friendly photo, and the practice spends its time re-routing people to
 * the right clinician. Directory data is not decoration; it is what makes
 * self-booking work without a receptionist triaging every request.
 *
 * ON DATA SOURCES
 * ---------------
 * For US deployments the authoritative source is the NPI Registry, run by
 * CMS: a free public API, no key, no rate-limit registration. It returns
 * legal name, credential, taxonomy (specialty), and practice address for
 * every enrolled provider. See lib/actions/npi.actions.ts, which looks up
 * providers so staff do not type specialties by hand.
 *
 * What is below is the LOCAL directory: the providers and facilities this
 * practice actually books into. That has to be local, because the NPI
 * Registry knows a clinician exists, not that they work here on Tuesdays.
 * Treat this file as seed data to be replaced by an Appwrite collection
 * once the directory needs to be editable by staff.
 */

export type Weekday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export type Provider = {
  id: string;
  name: string;
  credential: string;
  image: string;
  specialty: string;
  /** Sub-interests, used for the "who treats what" filter. */
  focus: string[];
  facilityId: string;
  languages: string[];
  /** National Provider Identifier. Empty until looked up via the NPI
   * Registry. Real deployments should populate this: it is the key that
   * links a provider to claims, e-prescribing and directory verification. */
  npi?: string;
  acceptingNewPatients: boolean;
  availability: Partial<Record<Weekday, string>>;
  /** Typical wait to the next open slot. Shown to patients because the
   * honest version of "book now" includes how long the wait is. */
  nextAvailable: string;
};

export type Facility = {
  id: string;
  name: string;
  kind: "Hospital" | "Clinic" | "Diagnostic centre";
  address: string;
  phone: string;
  hours: string;
  /** Map pin. Set by geocoding the address once, then corrected by hand:
   * geocoders routinely place a hospital pin on the wrong side of a
   * campus, and "which entrance" is exactly what a patient needs. */
  lat: number;
  lng: number;
  /** Service lines offered on site. Drives the "where do I go for X"
   * question, which is most of what a practice's phone line answers. */
  services: string[];
  emergency: boolean;
};

export const facilities: Facility[] = [
  {
    id: "northside-general",
    lat: 31.5497,
    lng: 74.3436,
    name: "Northside General Hospital",
    kind: "Hospital",
    address: "412 Meridian Avenue, Northside",
    phone: "+1 (555) 0140-2200",
    hours: "Open 24 hours",
    services: [
      "Emergency & trauma",
      "Internal medicine",
      "Cardiology",
      "Diabetes & endocrinology",
      "Imaging & radiology",
      "Inpatient surgery",
      "Maternity",
    ],
    emergency: true,
  },
  {
    id: "meridian-family",
    lat: 31.5204,
    lng: 74.3587,
    name: "Meridian Family Practice",
    kind: "Clinic",
    address: "88 Halstead Road, Meridian",
    phone: "+1 (555) 0140-3311",
    hours: "Mon to Fri, 8:00 AM to 6:00 PM",
    services: [
      "Family medicine",
      "Paediatrics",
      "Diabetes & endocrinology",
      "Vaccinations",
      "Women's health",
      "Minor procedures",
    ],
    emergency: false,
  },
  {
    id: "lakeside-specialist",
    lat: 31.4697,
    lng: 74.2728,
    name: "Lakeside Specialist Centre",
    kind: "Clinic",
    address: "7 Lakeside Parade, Eastbrook",
    phone: "+1 (555) 0140-5570",
    hours: "Mon to Sat, 9:00 AM to 5:00 PM",
    services: [
      "Dermatology",
      "Orthopaedics",
      "Diabetes & endocrinology",
      "Physiotherapy",
      "Nutrition & weight management",
    ],
    emergency: false,
  },
  {
    id: "harbour-diagnostics",
    lat: 31.5656,
    lng: 74.3142,
    name: "Harbour Diagnostics",
    kind: "Diagnostic centre",
    address: "230 Harbour Way, Southport",
    phone: "+1 (555) 0140-7788",
    hours: "Mon to Sat, 7:00 AM to 7:00 PM",
    services: [
      "Blood work & HbA1c",
      "Imaging & radiology",
      "ECG & cardiac testing",
      "Ultrasound",
      "Allergy testing",
    ],
    emergency: false,
  },
];

export const providers: Provider[] = [
  {
    id: "john-green",
    name: "John Green",
    credential: "MD",
    image: "/assets/images/dr-green.png",
    specialty: "Family medicine",
    focus: ["Annual physicals", "Preventive care", "Chronic disease review"],
    facilityId: "meridian-family",
    languages: ["English"],
    acceptingNewPatients: true,
    availability: { Mon: "9:00 AM – 4:00 PM", Wed: "9:00 AM – 4:00 PM", Fri: "9:00 AM – 1:00 PM" },
    nextAvailable: "Within 3 days",
  },
  {
    id: "leila-cameron",
    name: "Leila Cameron",
    credential: "MD, FACE",
    image: "/assets/images/dr-cameron.png",
    specialty: "Diabetes & endocrinology",
    focus: ["Type 1 & type 2 diabetes", "Insulin management", "Thyroid disorders"],
    facilityId: "northside-general",
    languages: ["English", "French"],
    acceptingNewPatients: true,
    availability: { Tue: "8:30 AM – 3:00 PM", Thu: "8:30 AM – 3:00 PM" },
    nextAvailable: "Within 1 week",
  },
  {
    id: "david-livingston",
    name: "David Livingston",
    credential: "MD",
    image: "/assets/images/dr-livingston.png",
    specialty: "Cardiology",
    focus: ["Hypertension", "Arrhythmia", "Post-cardiac follow-up"],
    facilityId: "northside-general",
    languages: ["English"],
    acceptingNewPatients: false,
    availability: { Mon: "10:00 AM – 5:00 PM", Thu: "10:00 AM – 5:00 PM" },
    nextAvailable: "Referral required",
  },
  {
    id: "evan-peter",
    name: "Evan Peter",
    credential: "MD",
    image: "/assets/images/dr-peter.png",
    specialty: "Internal medicine",
    focus: ["Complex chronic illness", "Medication review"],
    facilityId: "northside-general",
    languages: ["English", "Spanish"],
    acceptingNewPatients: true,
    availability: { Tue: "9:00 AM – 5:00 PM", Wed: "9:00 AM – 5:00 PM", Fri: "9:00 AM – 3:00 PM" },
    nextAvailable: "Within 5 days",
  },
  {
    id: "jane-powell",
    name: "Jane Powell",
    credential: "MD, FAAP",
    image: "/assets/images/dr-powell.png",
    specialty: "Paediatrics",
    focus: ["Newborn checks", "Childhood vaccinations", "Development reviews"],
    facilityId: "meridian-family",
    languages: ["English"],
    acceptingNewPatients: true,
    availability: { Mon: "8:00 AM – 2:00 PM", Tue: "8:00 AM – 2:00 PM", Thu: "8:00 AM – 2:00 PM" },
    nextAvailable: "Within 2 days",
  },
  {
    id: "alex-ramirez",
    name: "Alex Ramirez",
    credential: "MD",
    image: "/assets/images/dr-remirez.png",
    specialty: "Dermatology",
    focus: ["Skin lesion review", "Eczema & psoriasis", "Mole checks"],
    facilityId: "lakeside-specialist",
    languages: ["English", "Spanish"],
    acceptingNewPatients: true,
    availability: { Wed: "9:00 AM – 5:00 PM", Sat: "9:00 AM – 1:00 PM" },
    nextAvailable: "Within 2 weeks",
  },
  {
    id: "jasmine-lee",
    name: "Jasmine Lee",
    credential: "MD",
    image: "/assets/images/dr-lee.png",
    specialty: "Women's health",
    focus: ["Contraception", "Menopause care", "Cervical screening"],
    facilityId: "meridian-family",
    languages: ["English", "Mandarin"],
    acceptingNewPatients: true,
    availability: { Mon: "9:00 AM – 5:00 PM", Thu: "9:00 AM – 5:00 PM" },
    nextAvailable: "Within 4 days",
  },
  {
    id: "alyana-cruz",
    name: "Alyana Cruz",
    credential: "MD",
    image: "/assets/images/dr-cruz.png",
    specialty: "Nutrition & weight management",
    focus: ["Pre-diabetes", "Dietary planning", "Metabolic health"],
    facilityId: "lakeside-specialist",
    languages: ["English", "Tagalog"],
    acceptingNewPatients: true,
    availability: { Tue: "10:00 AM – 4:00 PM", Fri: "10:00 AM – 4:00 PM" },
    nextAvailable: "Within 1 week",
  },
  {
    id: "hardik-sharma",
    name: "Hardik Sharma",
    credential: "MD, MS",
    image: "/assets/images/dr-sharma.png",
    specialty: "Orthopaedics",
    focus: ["Joint pain", "Sports injury", "Post-operative review"],
    facilityId: "lakeside-specialist",
    languages: ["English", "Hindi", "Urdu"],
    acceptingNewPatients: true,
    availability: { Wed: "8:00 AM – 4:00 PM", Sat: "8:00 AM – 12:00 PM" },
    nextAvailable: "Within 10 days",
  },
];

/**
 * Default map centre and zoom, used before the browser has a location and
 * as the fallback when a visitor declines the location prompt.
 *
 * Override per deployment with NEXT_PUBLIC_MAP_CENTER="lat,lng".
 */
export const mapDefaults = (() => {
  const raw = process.env.NEXT_PUBLIC_MAP_CENTER;
  if (raw) {
    const [lat, lng] = raw.split(",").map((v) => Number(v.trim()));
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return { lat, lng, zoom: 12 };
    }
  }
  // Centroid of the seed facilities, so the default view always frames
  // the practice's own sites.
  const lat =
    facilities.reduce((a, f) => a + f.lat, 0) / Math.max(facilities.length, 1);
  const lng =
    facilities.reduce((a, f) => a + f.lng, 0) / Math.max(facilities.length, 1);
  return { lat, lng, zoom: 12 };
})();

export const specialties = Array.from(
  new Set(providers.map((p) => p.specialty))
).sort();

export function facilityById(id: string) {
  return facilities.find((f) => f.id === id);
}

export function providerByName(name: string) {
  return providers.find((p) => p.name === name);
}
