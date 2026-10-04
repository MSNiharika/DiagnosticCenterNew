import type { Centre, Doctor, Referral, Staff } from "./types"

export const photos = {
  lab: "/photos/scene-lab.jpg",
  bench: "/photos/scene-bench.jpg",
  vials: "/photos/scene-vials.jpg",
  mri: "/photos/scene-ultrasound.jpg",
  consult: "/photos/scene-ecg.jpg",
  corridor: "/photos/scene-reception.jpg",
  xray: "/photos/scene-xray.jpg",
  woman: "/photos/doctor-meera.jpg",
  man: "/photos/doctor-arjun.jpg",
  woman2: "/photos/doctor-leela.jpg",
  man2: "/photos/doctor-sameer.jpg",
}

export const centrePhone = "0884 232 4500"
export const centrePhoneTel = "08842324500"

export const centres: Centre[] = [
  {
    id: "yanam",
    name: "Yanam",
    city: "Yanam",
    address: "D. No. 8-2-14, Ferry Road, Yanam, Puducherry 533464",
    hours: "7:00 AM – 8:00 PM",
    phone: centrePhone,
    services: ["Pathology", "Ultrasound", "Digital X-ray", "ECG", "Home collection"],
    image: photos.lab,
    note: "The new centre. Blood tests, ultrasound, digital X-ray, and ECG on Ferry Road. Home collection covers Yanam town.",
  },
  {
    id: "mettakuru",
    name: "Mettakuru",
    city: "Yanam",
    address: "Main Road, Mettakuru, Yanam 533464",
    hours: "7:00 AM – 1:00 PM",
    phone: centrePhone,
    services: ["Sample collection", "Home collection"],
    image: photos.corridor,
    note: "Morning collection desk. Samples are logged and sent to the Ferry Road lab the same day.",
  },
]

export const cities = [...new Set(centres.map((centre) => centre.city))]

export const doctors: Doctor[] = [
  {
    id: "meera",
    name: "Dr. Meera Iyer",
    role: "Chief pathologist",
    cred: "MD Pathology · 18 years",
    focus: "Haematology and report validation",
    centre: "Yanam",
    photo: photos.woman,
  },
  {
    id: "arjun",
    name: "Dr. Arjun Mehta",
    role: "Consultant radiologist",
    cred: "MD Radio-diagnosis · 14 years",
    focus: "Ultrasound and digital X-ray",
    centre: "Yanam",
    photo: photos.man,
  },
  {
    id: "leela",
    name: "Dr. Leela Krishnan",
    role: "Consultant cardiologist",
    cred: "DM Cardiology · 12 years",
    focus: "ECG and echo",
    centre: "Yanam",
    photo: photos.woman2,
  },
  {
    id: "sameer",
    name: "Dr. Sameer Qureshi",
    role: "Biochemist",
    cred: "MD Biochemistry · 11 years",
    focus: "Quality control and special chemistry",
    centre: "Yanam",
    photo: photos.man2,
  },
]

export const staff: Staff[] = [
  { name: "Dr. Meera Iyer", role: "Pathologist", centre: "Yanam", shift: "8:00 – 4:00", state: "On floor" },
  { name: "Farah Sheikh", role: "Front desk lead", centre: "Yanam", shift: "7:00 – 2:00", state: "On floor" },
  { name: "Kiran Rao", role: "Phlebotomy", centre: "Yanam routes", shift: "7:00 – 1:00", state: "On floor" },
  { name: "Naveen Paul", role: "Biochemistry", centre: "Yanam", shift: "7:00 – 3:00", state: "On floor" },
  { name: "Dr. Arjun Mehta", role: "Radiologist", centre: "Yanam", shift: "10:00 – 6:00", state: "On floor" },
  { name: "Anita D'Souza", role: "Quality officer", centre: "Yanam", shift: "9:00 – 6:00", state: "On floor" },
  { name: "Rohit Banerjee", role: "Inventory", centre: "Yanam", shift: "9:00 – 6:00", state: "Off" },
  { name: "Sana Iqbal", role: "Patient care", centre: "Mettakuru", shift: "7:00 – 1:00", state: "Leave" },
]

export const referrals: Referral[] = [
  { name: "Dr. Nandini Rao", clinic: "Godavari Clinic", city: "Yanam", orders: 28, revenue: 64000, payout: 6400 },
  { name: "Dr. Vivek Shah", clinic: "Ferry Road Family Clinic", city: "Yanam", orders: 19, revenue: 41200, payout: 4120 },
  { name: "Dr. Pooja Menon", clinic: "Mettakuru Care", city: "Yanam", orders: 14, revenue: 28600, payout: 2860 },
  { name: "Dr. Imran Ali", clinic: "Dariyalatippa Desk", city: "Yanam", orders: 11, revenue: 19800, payout: 1980 },
  { name: "Dr. Shalini Gupta", clinic: "Farampeta Clinic", city: "Yanam", orders: 9, revenue: 16400, payout: 1640 },
]

export function centreById(id: string) {
  return centres.find((centre) => centre.id === id)
}
