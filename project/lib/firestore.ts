// lib/firestore.ts
// ─────────────────────────────────────────────────────────────────────────────
// Complete Firestore service
// All writes pass through sanitizeData() to strip undefined values.
// ─────────────────────────────────────────────────────────────────────────────

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  QueryConstraint,
  DocumentData,
} from "firebase/firestore"
import { db } from "./firebase"
import { sanitizeData } from "./sanitize"

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type UserRole = "admin" | "donor" | "organization"

export interface UserDoc {
  uid: string
  email: string
  name: string
  role: UserRole
  phone?: string
  photoURL?: string
  createdAt: Timestamp
}

export interface OrganizationDoc {
  uid: string
  organizationName: string
  email: string
  phone: string
  address: string
  description: string
  category: string
  createdAt?: Timestamp
  status: "pending" | "active" | "rejected"
  // Legacy / extended fields kept for compatibility
  orgId?: string
  name?: string
  city?: string
  state?: string
  verified?: boolean
  website?: string
  beneficiaries?: number
  founded?: number
}

export interface OrganizationBranchDoc {
  branchId?: string
  organizationId: string
  name: string
  city: string
  state: string
  address?: string
  contactPerson?: string
  phone?: string
  createdAt?: Timestamp
}

export interface RequirementDoc {
  id?: string
  organizationId: string
  title: string
  description: string
  unit: string
  totalQuantity: number
  fulfilledQuantity: number
  category?: string
  status: "Open" | "Partially Filled" | "Fulfilled"
  priority: "High" | "Medium" | "Low"
  createdAt?: Timestamp
}

export interface SlotDoc {
  id?: string
  organizationId: string
  title: string
  description?: string
  date: string
  mealType?: "Breakfast" | "Lunch" | "Dinner"
  totalNeeded: number
  sponsored: number
  status: "Available" | "Partially Filled" | "Full"
  pricePerUnit?: number
  createdAt?: Timestamp
}

export interface DonationDoc {
  id?: string
  donorId: string
  organizationId: string
  slotId?: string
  requirementId?: string
  amount: number
  occasion?: string
  message?: string
  status: "Pending" | "Approved" | "Completed" | "Rejected"
  createdAt?: Timestamp
  updatedAt?: Timestamp
  completedAt?: Timestamp
  notes?: string
}

export interface MessageDoc {
  id?: string
  senderId: string
  receiverId: string
  donationId?: string
  content: string
  read: boolean
  createdAt?: Timestamp
}

export interface NotificationDoc {
  id?: string
  userId: string
  title: string
  body: string
  type: "donation" | "message" | "requirement" | "system"
  read: boolean
  readAt?: Timestamp
  createdAt?: Timestamp
}

export interface SponsorshipEventDoc {
  id?: string
  organizationId?: string
  title: string
  description: string
  date: string
  targetAmount: number
  raisedAmount: number
  status: "Active" | "Completed" | "Upcoming"
  createdAt?: Timestamp
}

export interface ImpactAnalyticsDoc {
  id?: string
  organizationId?: string
  month: string
  mealsServed: number
  donationsCount: number
  totalAmount: number
  beneficiariesCount: number
  createdAt?: Timestamp
}

// ─────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────

export async function getUser(uid: string): Promise<UserDoc | null> {
  const snap = await getDoc(doc(db, "users", uid))
  return snap.exists() ? ({ uid: snap.id, ...snap.data() } as UserDoc) : null
}

export async function updateUser(uid: string, data: Partial<UserDoc>) {
  await updateDoc(doc(db, "users", uid), sanitizeData(data as Record<string, unknown>))
}

// ─────────────────────────────────────────────
// ORGANIZATIONS
// ─────────────────────────────────────────────

/** Get all organizations (public) */
export async function getOrganizations(): Promise<OrganizationDoc[]> {
  const snap = await getDocs(collection(db, "organizations"))
  return snap.docs.map((d) => ({ ...d.data(), uid: d.id, orgId: d.id } as OrganizationDoc))
}

/** Get only active/approved organizations — used by the landing page */
export async function getActiveOrganizations(): Promise<OrganizationDoc[]> {
  const q = query(
    collection(db, "organizations"),
    where("status", "==", "active"),
    orderBy("createdAt", "desc"),
    limit(6)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ ...d.data(), uid: d.id, orgId: d.id } as OrganizationDoc))
}

/** Get a single organization by id */
export async function getOrganization(orgId: string): Promise<OrganizationDoc | null> {
  const snap = await getDoc(doc(db, "organizations", orgId))
  return snap.exists()
    ? ({ ...snap.data(), uid: snap.id, orgId: snap.id } as OrganizationDoc)
    : null
}

/** Filter organizations by category */
export async function getOrganizationsByCategory(category: string): Promise<OrganizationDoc[]> {
  const q = query(
    collection(db, "organizations"),
    where("category", "==", category),
    where("status", "==", "active")
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ ...d.data(), uid: d.id, orgId: d.id } as OrganizationDoc))
}

/** Filter organizations by city */
export async function getOrganizationsByCity(city: string): Promise<OrganizationDoc[]> {
  const q = query(
    collection(db, "organizations"),
    where("city", "==", city),
    where("status", "==", "active")
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ ...d.data(), uid: d.id, orgId: d.id } as OrganizationDoc))
}

/** Create or update an organization document */
export async function upsertOrganization(orgId: string, data: Partial<OrganizationDoc>) {
  await setDoc(
    doc(db, "organizations", orgId),
    sanitizeData(data as Record<string, unknown>),
    { merge: true }
  )
}

// ─────────────────────────────────────────────
// ORGANIZATION BRANCHES
// ─────────────────────────────────────────────

export async function getBranches(organizationId: string): Promise<OrganizationBranchDoc[]> {
  const q = query(
    collection(db, "organizationBranches"),
    where("organizationId", "==", organizationId)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ branchId: d.id, ...d.data() } as OrganizationBranchDoc))
}

export async function addBranch(data: Omit<OrganizationBranchDoc, "branchId">) {
  return addDoc(
    collection(db, "organizationBranches"),
    sanitizeData({ ...data, createdAt: serverTimestamp() } as Record<string, unknown>)
  )
}

export async function updateBranch(branchId: string, data: Partial<OrganizationBranchDoc>) {
  await updateDoc(
    doc(db, "organizationBranches", branchId),
    sanitizeData(data as Record<string, unknown>)
  )
}

export async function deleteBranch(branchId: string) {
  await deleteDoc(doc(db, "organizationBranches", branchId))
}

// ─────────────────────────────────────────────
// REQUIREMENTS
// ─────────────────────────────────────────────

export async function getRequirements(filters?: {
  organizationId?: string
  status?: string
  category?: string
}): Promise<RequirementDoc[]> {
  const constraints: QueryConstraint[] = []
  if (filters?.organizationId)
    constraints.push(where("organizationId", "==", filters.organizationId))
  if (filters?.status) constraints.push(where("status", "==", filters.status))
  if (filters?.category) constraints.push(where("category", "==", filters.category))
  constraints.push(orderBy("createdAt", "desc"))

  const q = query(collection(db, "requirements"), ...constraints)
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as RequirementDoc))
}

export async function getMyRequirements(orgId: string): Promise<RequirementDoc[]> {
  return getRequirements({ organizationId: orgId })
}

export async function addRequirement(data: Omit<RequirementDoc, "id">): Promise<string> {
  const ref = await addDoc(
    collection(db, "requirements"),
    sanitizeData({ ...data, createdAt: serverTimestamp() } as Record<string, unknown>)
  )
  return ref.id
}

export async function updateRequirement(reqId: string, data: Partial<RequirementDoc>) {
  await updateDoc(doc(db, "requirements", reqId), sanitizeData(data as Record<string, unknown>))
}

export async function deleteRequirement(reqId: string) {
  await deleteDoc(doc(db, "requirements", reqId))
}

// ─────────────────────────────────────────────
// SLOTS
// ─────────────────────────────────────────────

export async function getSlots(filters?: {
  organizationId?: string
  status?: string
  date?: string
}): Promise<SlotDoc[]> {
  const constraints: QueryConstraint[] = []
  if (filters?.organizationId)
    constraints.push(where("organizationId", "==", filters.organizationId))
  if (filters?.status) constraints.push(where("status", "==", filters.status))
  if (filters?.date) constraints.push(where("date", "==", filters.date))
  constraints.push(orderBy("date", "asc"))

  const q = query(collection(db, "slots"), ...constraints)
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as SlotDoc))
}

export async function getMySlots(orgId: string): Promise<SlotDoc[]> {
  return getSlots({ organizationId: orgId })
}

export async function addSlot(data: Omit<SlotDoc, "id">): Promise<string> {
  const ref = await addDoc(
    collection(db, "slots"),
    sanitizeData({ ...data, createdAt: serverTimestamp() } as Record<string, unknown>)
  )
  return ref.id
}

export async function updateSlot(slotId: string, data: Partial<SlotDoc>) {
  await updateDoc(doc(db, "slots", slotId), sanitizeData(data as Record<string, unknown>))
}

export async function deleteSlot(slotId: string) {
  await deleteDoc(doc(db, "slots", slotId))
}

// ─────────────────────────────────────────────
// DONATIONS
// ─────────────────────────────────────────────

export async function getDonorDonations(donorId: string): Promise<DonationDoc[]> {
  const q = query(
    collection(db, "donations"),
    where("donorId", "==", donorId),
    orderBy("createdAt", "desc")
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as DonationDoc))
}

export async function getOrgDonations(
  organizationId: string,
  statusFilter?: string
): Promise<DonationDoc[]> {
  const constraints: QueryConstraint[] = [
    where("organizationId", "==", organizationId),
    orderBy("createdAt", "desc"),
  ]
  if (statusFilter) constraints.splice(1, 0, where("status", "==", statusFilter))

  const q = query(collection(db, "donations"), ...constraints)
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as DonationDoc))
}

export async function createDonation(
  data: Omit<DonationDoc, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const ref = await addDoc(
    collection(db, "donations"),
    sanitizeData({
      ...data,
      status: "Pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    } as Record<string, unknown>)
  )
  return ref.id
}

export async function updateDonationStatus(
  donationId: string,
  status: DonationDoc["status"],
  notes?: string
) {
  const update: DocumentData = sanitizeData({
    status,
    notes,
    updatedAt: serverTimestamp(),
    ...(status === "Completed" ? { completedAt: serverTimestamp() } : {}),
  } as Record<string, unknown>)
  await updateDoc(doc(db, "donations", donationId), update)
}

// ─────────────────────────────────────────────
// MESSAGES
// ─────────────────────────────────────────────

export function subscribeToConversation(
  userId: string,
  otherId: string,
  callback: (messages: MessageDoc[]) => void
) {
  const q = query(
    collection(db, "messages"),
    where("senderId", "in", [userId, otherId]),
    orderBy("createdAt", "asc")
  )

  return onSnapshot(q, (snap) => {
    const msgs = snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as MessageDoc))
      .filter(
        (m) =>
          (m.senderId === userId && m.receiverId === otherId) ||
          (m.senderId === otherId && m.receiverId === userId)
      )
    callback(msgs)
  })
}

export async function getDonationMessages(donationId: string): Promise<MessageDoc[]> {
  const q = query(
    collection(db, "messages"),
    where("donationId", "==", donationId),
    orderBy("createdAt", "asc")
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MessageDoc))
}

export async function sendMessage(
  data: Omit<MessageDoc, "id" | "createdAt" | "read">
): Promise<string> {
  const ref = await addDoc(
    collection(db, "messages"),
    sanitizeData({
      ...data,
      read: false,
      createdAt: serverTimestamp(),
    } as Record<string, unknown>)
  )
  return ref.id
}

// ─────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────

export function subscribeToNotifications(
  userId: string,
  callback: (notifs: NotificationDoc[]) => void,
  unreadOnly = false
) {
  const constraints: QueryConstraint[] = [
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(50),
  ]
  if (unreadOnly) constraints.splice(1, 0, where("read", "==", false))

  const q = query(collection(db, "notifications"), ...constraints)
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as NotificationDoc)))
  })
}

export async function markNotificationRead(notifId: string) {
  await updateDoc(doc(db, "notifications", notifId), {
    read: true,
    readAt: serverTimestamp(),
  })
}

export async function markAllNotificationsRead(userId: string) {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    where("read", "==", false)
  )
  const snap = await getDocs(q)
  await Promise.all(
    snap.docs.map((d) => updateDoc(d.ref, { read: true, readAt: serverTimestamp() }))
  )
}

// ─────────────────────────────────────────────
// SPONSORSHIP EVENTS
// ─────────────────────────────────────────────

export async function getSponsorshipEvents(filters?: {
  organizationId?: string
  status?: string
}): Promise<SponsorshipEventDoc[]> {
  const constraints: QueryConstraint[] = []
  if (filters?.organizationId)
    constraints.push(where("organizationId", "==", filters.organizationId))
  if (filters?.status) constraints.push(where("status", "==", filters.status))

  const q = query(collection(db, "sponsorshipEvents"), ...constraints)
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as SponsorshipEventDoc))
}

export async function addSponsorshipEvent(data: Omit<SponsorshipEventDoc, "id">): Promise<string> {
  const ref = await addDoc(
    collection(db, "sponsorshipEvents"),
    sanitizeData({ ...data, createdAt: serverTimestamp() } as Record<string, unknown>)
  )
  return ref.id
}

export async function updateSponsorshipEvent(
  eventId: string,
  data: Partial<SponsorshipEventDoc>
) {
  await updateDoc(
    doc(db, "sponsorshipEvents", eventId),
    sanitizeData(data as Record<string, unknown>)
  )
}

// ─────────────────────────────────────────────
// IMPACT ANALYTICS
// ─────────────────────────────────────────────

export async function getImpactAnalytics(organizationId?: string): Promise<ImpactAnalyticsDoc[]> {
  const constraints: QueryConstraint[] = [orderBy("month", "desc")]
  if (organizationId)
    constraints.unshift(where("organizationId", "==", organizationId))

  const q = query(collection(db, "impactAnalytics"), ...constraints)
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ImpactAnalyticsDoc))
}
