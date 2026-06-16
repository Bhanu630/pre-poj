export type Organization = {
  id: string
  name: string
  cause: string
  location: string
  city: string
  state: string
  shortDescription: string
  description: string
  beneficiaries: number
  founded: number
  image: string
  cover: string
  email: string
  phone: string
  website: string
  registrationId: string
}

export const organizations: Organization[] = [
  {
    id: "hope-foundation",
    name: "Hope Foundation",
    cause: "Food & Nutrition",
    location: "Dharavi, Mumbai",
    city: "Mumbai",
    state: "Maharashtra",
    shortDescription:
      "Providing meals and essential supplies to underprivileged families in Mumbai's largest community.",
    description:
      "Hope Foundation runs a daily community kitchen in Dharavi, serving nutritious meals to children, daily-wage workers, and elderly residents. Beyond food, the foundation distributes monthly grocery kits, hygiene supplies, and runs after-school nutrition programs to fight childhood malnutrition.",
    beneficiaries: 4500,
    founded: 2012,
    image: "/images/hope-foundation.png",
    cover: "/images/hope-cover.png",
    email: "contact@hopefoundation.org",
    phone: "+91 98200 14512",
    website: "www.hopefoundation.org",
    registrationId: "MH/2012/0089451",
  },
  {
    id: "bright-future-ngo",
    name: "Bright Future NGO",
    cause: "Education",
    location: "Pune, Maharashtra",
    city: "Pune",
    state: "Maharashtra",
    shortDescription:
      "Education and skill development programs for first-generation learners and young women.",
    description:
      "Bright Future NGO operates learning centers across Pune offering free education, digital literacy, and vocational skill training. The organization sponsors mid-day meals so that no child has to learn on an empty stomach, and runs scholarship programs for high-performing students.",
    beneficiaries: 2800,
    founded: 2015,
    image: "/images/bright-future.png",
    cover: "/images/bright-future.png",
    email: "hello@brightfuturengo.org",
    phone: "+91 98220 33741",
    website: "www.brightfuturengo.org",
    registrationId: "MH/2015/0123987",
  },
  {
    id: "helping-hands",
    name: "Helping Hands",
    cause: "Healthcare",
    location: "Thane, Maharashtra",
    city: "Thane",
    state: "Maharashtra",
    shortDescription:
      "Supporting healthcare and basic needs for elderly citizens and low-income households.",
    description:
      "Helping Hands provides free health camps, medicine distribution, and nutritious meals for senior citizens and families below the poverty line in Thane. Their mobile clinic reaches remote settlements, while their meal program ensures patients recover with proper nutrition.",
    beneficiaries: 3800,
    founded: 2018,
    image: "/images/helping-hands.png",
    cover: "/images/helping-hands.png",
    email: "care@helpinghands.org",
    phone: "+91 98190 77820",
    website: "www.helpinghands.org",
    registrationId: "MH/2018/0201556",
  },
]

export function getOrganization(id: string) {
  return organizations.find((o) => o.id === id)
}

export type ActivityStatus = "Pending" | "Approved" | "Completed"

export type Activity = {
  id: string
  org: string
  slot: string
  date: string
  amount: number
  status: ActivityStatus
}

export const recentActivities: Activity[] = [
  {
    id: "a1",
    org: "Hope Foundation",
    slot: "Lunch Sponsorship",
    date: "18 May 2025",
    amount: 3500,
    status: "Pending",
  },
  {
    id: "a2",
    org: "Bright Future NGO",
    slot: "Grocery Support",
    date: "12 May 2025",
    amount: 5000,
    status: "Approved",
  },
  {
    id: "a3",
    org: "Helping Hands",
    slot: "Dinner Sponsorship",
    date: "04 May 2025",
    amount: 4200,
    status: "Completed",
  },
]

export const stats = [
  { label: "Total Donations", value: "₹24,500", sub: "Across 12 sponsorships", key: "donations" },
  { label: "Pending Requests", value: "5", sub: "Awaiting Response", key: "pending" },
  { label: "Approved Donations", value: "7", sub: "This Year", key: "approved" },
  { label: "Lives Impacted", value: "420+", sub: "Meals & support delivered", key: "impact" },
]

export const causes = [
  "All Causes",
  "Food & Nutrition",
  "Education",
  "Healthcare",
  "Disaster Relief",
  "Women Empowerment",
]

export const locations = [
  "All Locations",
  "Mumbai",
  "Pune",
  "Thane",
  "Nagpur",
  "Nashik",
]

export type SlotStatus = "Available" | "Partially Filled" | "Full"

export type MealSlot = {
  meal: "Breakfast" | "Lunch" | "Dinner"
  status: SlotStatus
  sponsored: number
  needed: number
}

export type DaySlots = {
  date: string
  day: string
  slots: MealSlot[]
}

export const sponsorshipWeek: DaySlots[] = [
  {
    date: "20 May",
    day: "Tue",
    slots: [
      { meal: "Breakfast", status: "Partially Filled", sponsored: 60, needed: 120 },
      { meal: "Lunch", status: "Available", sponsored: 0, needed: 150 },
      { meal: "Dinner", status: "Available", sponsored: 20, needed: 150 },
    ],
  },
  {
    date: "21 May",
    day: "Wed",
    slots: [
      { meal: "Breakfast", status: "Full", sponsored: 120, needed: 120 },
      { meal: "Lunch", status: "Partially Filled", sponsored: 90, needed: 150 },
      { meal: "Dinner", status: "Available", sponsored: 0, needed: 150 },
    ],
  },
  {
    date: "22 May",
    day: "Thu",
    slots: [
      { meal: "Breakfast", status: "Available", sponsored: 0, needed: 120 },
      { meal: "Lunch", status: "Available", sponsored: 30, needed: 150 },
      { meal: "Dinner", status: "Partially Filled", sponsored: 100, needed: 150 },
    ],
  },
  {
    date: "23 May",
    day: "Fri",
    slots: [
      { meal: "Breakfast", status: "Partially Filled", sponsored: 80, needed: 120 },
      { meal: "Lunch", status: "Available", sponsored: 0, needed: 150 },
      { meal: "Dinner", status: "Available", sponsored: 0, needed: 150 },
    ],
  },
  {
    date: "24 May",
    day: "Sat",
    slots: [
      { meal: "Breakfast", status: "Available", sponsored: 0, needed: 120 },
      { meal: "Lunch", status: "Full", sponsored: 150, needed: 150 },
      { meal: "Dinner", status: "Partially Filled", sponsored: 70, needed: 150 },
    ],
  },
  {
    date: "25 May",
    day: "Sun",
    slots: [
      { meal: "Breakfast", status: "Available", sponsored: 0, needed: 120 },
      { meal: "Lunch", status: "Available", sponsored: 40, needed: 150 },
      { meal: "Dinner", status: "Available", sponsored: 0, needed: 150 },
    ],
  },
  {
    date: "26 May",
    day: "Mon",
    slots: [
      { meal: "Breakfast", status: "Partially Filled", sponsored: 50, needed: 120 },
      { meal: "Lunch", status: "Available", sponsored: 0, needed: 150 },
      { meal: "Dinner", status: "Available", sponsored: 0, needed: 150 },
    ],
  },
]

export const orgRequirements = [
  {
    title: "Daily Lunch Meals",
    detail: "150 nutritious lunch plates needed every day for children and daily-wage workers.",
    priority: "High",
  },
  {
    title: "Monthly Grocery Kits",
    detail: "Rice, lentils, oil, and spices for 200 families. Each kit supports a family for 2 weeks.",
    priority: "Medium",
  },
  {
    title: "Hygiene Supplies",
    detail: "Soap, sanitary pads, and cleaning supplies for the community shelter.",
    priority: "Medium",
  },
  {
    title: "Festival Special Meals",
    detail: "Sponsor celebratory meals during Eid, Diwali, and Christmas for 300+ beneficiaries.",
    priority: "Low",
  },
]

export const impactChartData = [
  { month: "Dec", meals: 180 },
  { month: "Jan", meals: 240 },
  { month: "Feb", meals: 300 },
  { month: "Mar", meals: 280 },
  { month: "Apr", meals: 360 },
  { month: "May", meals: 420 },
]

export const occasions = [
  "Birthday",
  "Anniversary",
  "Corporate CSR",
  "Memorial",
  "Festival",
  "Other",
]

export const donor = {
  name: "Ramesh Kumar",
  email: "ramesh.kumar@gmail.com",
  initials: "RK",
}
