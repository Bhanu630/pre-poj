// lib/firestore.ts
// ─────────────────────────────────────────────────────────────────────────────
// Complete Firestore service — drop this into your project at lib/firestore.ts
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
} from "firebase/firestore";
import { db } from "./firebase";

// ─────────────────────────────────────────────
// Types (matching your Firestore collections)
// ─────────────────────────────────────────────

export type UserRole = "admin" | "donor" | "organization";

export interface UserDoc {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  photoURL?: string;
  createdAt: Timestamp;
}

export interface OrganizationDoc {
  orgId: string;
  name: string;
  category: string; // e.g. "Orphanage", "Food & Nutrition"
  city: string;
  state: string;
  description: string;
  verified: boolean;
  email?: string;
  phone?: string;
  website?: string;
  beneficiaries?: number;
  founded?: number;
  createdAt?: Timestamp;
}

export interface OrganizationBranchDoc {
  branchId?: string;
  organizationId: string;
  name: string;
  city: string;
  state: string;
  address?: string;
  contactPerson?: string;
  phone?: string;
  createdAt?: Timestamp;
}

export interface RequirementDoc {
  id?: string;
  organizationId: string;
  title: string;
  description: string;
  unit: string;
  totalQuantity: number;
  fulfilledQuantity: number;
  category?: string;
  status: "Open" | "Partially Filled" | "Fulfilled";
  priority: "High" | "Medium" | "Low";
  createdAt?: Timestamp;
}

export interface SlotDoc {
  id?: string;
  organizationId: string;
  title: string;
  description?: string;
  date: string; // ISO date string e.g. "2025-06-20"
  mealType?: "Breakfast" | "Lunch" | "Dinner";
  totalNeeded: number;
  sponsored: number;
  status: "Available" | "Partially Filled" | "Full";
  pricePerUnit?: number;
  amountRequired?: number;
  mealsCount?: number;
  createdAt?: Timestamp;
}

export interface DonationDoc {
  id?: string;
  donorId: string;
  organizationId: string;
  slotId?: string;
  requirementId?: string;
  amount: number;
  occasion?: string;
  message?: string;
  status: "Pending" | "Approved" | "Completed" | "Rejected";
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  completedAt?: Timestamp;
  notes?: string;
}

export interface MessageDoc {
  id?: string;
  senderId: string;
  receiverId: string;
  donationId?: string;
  content: string;
  read: boolean;
  createdAt?: Timestamp;
}

export interface NotificationDoc {
  id?: string;
  userId: string;
  title: string;
  body: string;
  type: "donation" | "message" | "requirement" | "system";
  read: boolean;
  readAt?: Timestamp;
  createdAt?: Timestamp;
}

export interface SponsorshipEventDoc {
  id?: string;
  organizationId?: string;
  title: string;
  description: string;
  date: string;
  targetAmount: number;
  raisedAmount: number;
  status: "Active" | "Completed" | "Upcoming";
  createdAt?: Timestamp;
}

export interface ImpactAnalyticsDoc {
  id?: string;
  organizationId?: string;
  month: string; // "2025-05"
  mealsServed: number;
  donationsCount: number;
  totalAmount: number;
  beneficiariesCount: number;
  createdAt?: Timestamp;
}

// ─────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────

/** Get a user document by uid */
export async function getUser(uid: string): Promise<UserDoc | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? ({ uid: snap.id, ...snap.data() } as UserDoc) : null;
}

/** Update user profile fields */
export async function updateUser(uid: string, data: Partial<UserDoc>) {
  await updateDoc(doc(db, "users", uid), { ...data });
}

// ─────────────────────────────────────────────
// ORGANIZATIONS
// ─────────────────────────────────────────────

/** Get all organizations (public) */
export async function getOrganizations(): Promise<OrganizationDoc[]> {
  const snap = await getDocs(collection(db, "organizations"));
  return snap.docs.map((d) => ({ orgId: d.id, ...d.data() } as OrganizationDoc));
}

/** Get a single organization by id */
export async function getOrganization(orgId: string): Promise<OrganizationDoc | null> {
  const snap = await getDoc(doc(db, "organizations", orgId));
  return snap.exists() ? ({ orgId: snap.id, ...snap.data() } as OrganizationDoc) : null;
}

/** Filter organizations by category */
export async function getOrganizationsByCategory(
  category: string
): Promise<OrganizationDoc[]> {
  const q = query(
    collection(db, "organizations"),
    where("category", "==", category)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ orgId: d.id, ...d.data() } as OrganizationDoc));
}

/** Filter organizations by city */
export async function getOrganizationsByCity(city: string): Promise<OrganizationDoc[]> {
  const q = query(collection(db, "organizations"), where("city", "==", city));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ orgId: d.id, ...d.data() } as OrganizationDoc));
}

/** Create or update an organization (org role only — enforced by Firestore rules) */
export async function upsertOrganization(
  orgId: string,
  data: Partial<OrganizationDoc>
) {
  await setDoc(doc(db, "organizations", orgId), data, { merge: true });
}

// ─────────────────────────────────────────────
// ORGANIZATION BRANCHES
// ─────────────────────────────────────────────

/** Get branches for a specific organization */
export async function getBranches(organizationId: string): Promise<OrganizationBranchDoc[]> {
  const q = query(
    collection(db, "organizationBranches"),
    where("organizationId", "==", organizationId)
  );
  const snap = await getDocs(q);
  return snap.docs.map(
    (d) => ({ branchId: d.id, ...d.data() } as OrganizationBranchDoc)
  );
}

/** Add a new branch */
export async function addBranch(data: Omit<OrganizationBranchDoc, "branchId">) {
  return addDoc(collection(db, "organizationBranches"), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

/** Update a branch */
export async function updateBranch(
  branchId: string,
  data: Partial<OrganizationBranchDoc>
) {
  await updateDoc(doc(db, "organizationBranches", branchId), data);
}

/** Delete a branch */
export async function deleteBranch(branchId: string) {
  await deleteDoc(doc(db, "organizationBranches", branchId));
}

// ─────────────────────────────────────────────
// REQUIREMENTS
// ─────────────────────────────────────────────

/** Get all requirements (public) */
export async function getRequirements(filters?: {
  organizationId?: string;
  status?: string;
  category?: string;
}): Promise<RequirementDoc[]> {
  const constraints: QueryConstraint[] = [];
  if (filters?.organizationId)
    constraints.push(where("organizationId", "==", filters.organizationId));
  if (filters?.status)
    constraints.push(where("status", "==", filters.status));
  if (filters?.category)
    constraints.push(where("category", "==", filters.category));
  constraints.push(orderBy("createdAt", "desc"));

  const q = query(collection(db, "requirements"), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as RequirementDoc));
}

/** Get requirements for logged-in org */
export async function getMyRequirements(orgId: string): Promise<RequirementDoc[]> {
  return getRequirements({ organizationId: orgId });
}

/** Add a new requirement (org must be logged in) */
export async function addRequirement(
  data: Omit<RequirementDoc, "id">
): Promise<string> {
  const ref = await addDoc(collection(db, "requirements"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** Update a requirement */
export async function updateRequirement(
  reqId: string,
  data: Partial<RequirementDoc>
) {
  await updateDoc(doc(db, "requirements", reqId), data);
}

/** Delete a requirement */
export async function deleteRequirement(reqId: string) {
  await deleteDoc(doc(db, "requirements", reqId));
}

// ─────────────────────────────────────────────
// SLOTS
// ─────────────────────────────────────────────

/** Get available slots (optionally filtered) */
export async function getSlots(filters?: {
  organizationId?: string;
  status?: string;
  date?: string;
}): Promise<SlotDoc[]> {
  const constraints: QueryConstraint[] = [];
  if (filters?.organizationId)
    constraints.push(where("organizationId", "==", filters.organizationId));
  if (filters?.status)
    constraints.push(where("status", "==", filters.status));
  if (filters?.date)
    constraints.push(where("date", "==", filters.date));
  constraints.push(orderBy("date", "asc"));

  const q = query(collection(db, "slots"), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as SlotDoc));
}

/** Get slots for logged-in org */
export async function getMySlots(orgId: string): Promise<SlotDoc[]> {
  return getSlots({ organizationId: orgId });
}

/** Add a slot (org role only) */
export async function addSlot(data: Omit<SlotDoc, "id">): Promise<string> {
  const ref = await addDoc(collection(db, "slots"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** Update a slot */
export async function updateSlot(slotId: string, data: Partial<SlotDoc>) {
  await updateDoc(doc(db, "slots", slotId), data);
}

/** Delete a slot */
export async function deleteSlot(slotId: string) {
  await deleteDoc(doc(db, "slots", slotId));
}

// ─────────────────────────────────────────────
// DONATIONS
// ─────────────────────────────────────────────

/** Get donations for a donor */
export async function getDonorDonations(donorId: string): Promise<DonationDoc[]> {
  const q = query(
    collection(db, "donations"),
    where("donorId", "==", donorId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as DonationDoc));
}

/** Get donations received by an organization */
export async function getOrgDonations(
  organizationId: string,
  statusFilter?: string
): Promise<DonationDoc[]> {
  const constraints: QueryConstraint[] = [
    where("organizationId", "==", organizationId),
    orderBy("createdAt", "desc"),
  ];
  if (statusFilter) constraints.splice(1, 0, where("status", "==", statusFilter));

  const q = query(collection(db, "donations"), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as DonationDoc));
}

/** Create a new donation (donor role only) */
export async function createDonation(
  data: Omit<DonationDoc, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const ref = await addDoc(collection(db, "donations"), {
    ...data,
    status: "Pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/** Update donation status (org role only — limited fields enforced by rules) */
export async function updateDonationStatus(
  donationId: string,
  status: DonationDoc["status"],
  notes?: string
) {
  const update: DocumentData = {
    status,
    updatedAt: serverTimestamp(),
  };
  if (notes) update.notes = notes;
  if (status === "Completed") update.completedAt = serverTimestamp();
  await updateDoc(doc(db, "donations", donationId), update);
}

// ─────────────────────────────────────────────
// MESSAGES
// ─────────────────────────────────────────────

/** Get conversation between two users (real-time listener) */
export function subscribeToConversation(
  userId: string,
  otherId: string,
  callback: (messages: MessageDoc[]) => void
) {
  // Fetch messages where current user is sender or receiver with the other party
  const q = query(
    collection(db, "messages"),
    where("senderId", "in", [userId, otherId]),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(q, (snap) => {
    const msgs = snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as MessageDoc))
      .filter(
        (m) =>
          (m.senderId === userId && m.receiverId === otherId) ||
          (m.senderId === otherId && m.receiverId === userId)
      );
    callback(msgs);
  });
}

/** Get messages related to a specific donation */
export async function getDonationMessages(donationId: string): Promise<MessageDoc[]> {
  const q = query(
    collection(db, "messages"),
    where("donationId", "==", donationId),
    orderBy("createdAt", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MessageDoc));
}

/** Send a message */
export async function sendMessage(
  data: Omit<MessageDoc, "id" | "createdAt" | "read">
): Promise<string> {
  const ref = await addDoc(collection(db, "messages"), {
    ...data,
    read: false,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

// ─────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────

/** Get notifications for current user (real-time) */
export function subscribeToNotifications(
  userId: string,
  callback: (notifs: NotificationDoc[]) => void,
  unreadOnly = false
) {
  const constraints: QueryConstraint[] = [
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(50),
  ];
  if (unreadOnly) constraints.splice(1, 0, where("read", "==", false));

  const q = query(collection(db, "notifications"), ...constraints);
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as NotificationDoc)));
  });
}

/** Mark a notification as read */
export async function markNotificationRead(notifId: string) {
  await updateDoc(doc(db, "notifications", notifId), {
    read: true,
    readAt: serverTimestamp(),
  });
}

/** Mark all notifications as read for a user */
export async function markAllNotificationsRead(userId: string) {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    where("read", "==", false)
  );
  const snap = await getDocs(q);
  const updates = snap.docs.map((d) =>
    updateDoc(d.ref, { read: true, readAt: serverTimestamp() })
  );
  await Promise.all(updates);
}

// ─────────────────────────────────────────────
// SPONSORSHIP EVENTS
// ─────────────────────────────────────────────

/** Get all sponsorship events */
export async function getSponsorshipEvents(filters?: {
  organizationId?: string;
  status?: string;
}): Promise<SponsorshipEventDoc[]> {
  const constraints: QueryConstraint[] = [];
  if (filters?.organizationId)
    constraints.push(where("organizationId", "==", filters.organizationId));
  if (filters?.status)
    constraints.push(where("status", "==", filters.status));

  const q = query(collection(db, "sponsorshipEvents"), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as SponsorshipEventDoc));
}

/** Add a sponsorship event */
export async function addSponsorshipEvent(
  data: Omit<SponsorshipEventDoc, "id">
): Promise<string> {
  const ref = await addDoc(collection(db, "sponsorshipEvents"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** Update a sponsorship event */
export async function updateSponsorshipEvent(
  eventId: string,
  data: Partial<SponsorshipEventDoc>
) {
  await updateDoc(doc(db, "sponsorshipEvents", eventId), data);
}

// ─────────────────────────────────────────────
// IMPACT ANALYTICS
// ─────────────────────────────────────────────

/** Get all impact analytics (public read) */
export async function getImpactAnalytics(
  organizationId?: string
): Promise<ImpactAnalyticsDoc[]> {
  const constraints: QueryConstraint[] = [orderBy("month", "desc")];
  if (organizationId)
    constraints.unshift(where("organizationId", "==", organizationId));

  const q = query(collection(db, "impactAnalytics"), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ImpactAnalyticsDoc));
}

// ─────────────────────────────────────────────
// UTILITY HOOKS (use these in your components)
// ─────────────────────────────────────────────
//
// Example usage in a component:
//
// import { useEffect, useState } from "react"
// import { getOrganizations, OrganizationDoc } from "@/lib/firestore"
//
// export function OrgList() {
//   const [orgs, setOrgs] = useState<OrganizationDoc[]>([])
//   const [loading, setLoading] = useState(true)
//
//   useEffect(() => {
//     getOrganizations()
//       .then(setOrgs)
//       .finally(() => setLoading(false))
//   }, [])
//
//   if (loading) return <Spinner />
//   return orgs.map(org => <OrgCard key={org.orgId} org={org} />)
// }
//
// ─────────────────────────────────────────────
// For real-time subscriptions (notifications / messages):
//
//   useEffect(() => {
//     const unsub = subscribeToNotifications(uid, setNotifications)
//     return () => unsub() // cleanup on unmount
//   }, [uid])
// ─────────────────────────────────────────────
