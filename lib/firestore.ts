// lib/firestore.ts
// ─────────────────────────────────────────────────────────────────────────────
// Complete Firestore service for DonateConnect
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
// Utility: Remove undefined fields before writing to Firestore
// ─────────────────────────────────────────────
export function sanitizeData<T extends Record<string, unknown>>(data: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined && v !== null)
  ) as Partial<T>;
}

// ─────────────────────────────────────────────
// Types (matching Firestore collections)
// ─────────────────────────────────────────────

export type UserRole = "admin" | "donor" | "organization";

export interface UserDoc {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  city?: string;
  photoURL?: string;
  createdAt: Timestamp;
}

// Standardized organization document
export interface OrganizationDoc {
  uid: string;                   // document ID = Firebase Auth UID
  organizationName: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  category: string;
  status: "active" | "inactive" | "pending";
  createdAt?: Timestamp;
  // Extended profile fields (editable later via Settings)
  city?: string;
  state?: string;
  website?: string;
  beneficiaries?: number;
  founded?: number;
  verified?: boolean;
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
  date: string;
  mealType?: "Breakfast" | "Lunch" | "Dinner";
  totalNeeded: number;
  sponsored: number;
  status: "Available" | "Partially Filled" | "Full";
  pricePerUnit?: number;
  createdAt?: Timestamp;
}

export interface DonationDoc {
  id?: string;
  donorId: string;
  organizationId: string;
  slotId?: string;
  requirementId?: string;
  organizationName: string; // Added for denormalization
  amount: number; 
  occasion?: string;
  message?: string;
  status: "Pending" | "Approved" | "Completed" | "Rejected";
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  completedAt?: Timestamp;
  notes?: string;
}

export interface SponsorshipRequestDoc {
  id?: string;
  donorId: string;
  donorName: string;
  organizationId: string;
  organizationName: string;
  slotId?: string;
  slotTitle?: string;
  amount: number;
  meals?: number;
  occasion?: string;
  message?: string;
  status: "pending" | "approved" | "rejected";
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
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

// ─────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────

export async function getUser(uid: string): Promise<UserDoc | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? ({ uid: snap.id, ...snap.data() } as UserDoc) : null;
}

export async function updateUser(uid: string, data: Partial<UserDoc>) {
  await updateDoc(doc(db, "users", uid), sanitizeData(data as Record<string, unknown>));
}

// ─────────────────────────────────────────────
// ORGANIZATIONS
// ─────────────────────────────────────────────

/** Get all organizations */
export async function getOrganizations(): Promise<OrganizationDoc[]> {
  const snap = await getDocs(collection(db, "organizations"));
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() } as OrganizationDoc));
}

/** Get only active organizations (for public-facing listings) */
export async function getActiveOrganizations(): Promise<OrganizationDoc[]> {
  const q = query(
    collection(db, "organizations"),
    where("status", "==", "active"),
    orderBy("createdAt", "desc"),
    limit(20)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() } as OrganizationDoc));
}

/** Get a single organization by UID */
export async function getOrganization(uid: string): Promise<OrganizationDoc | null> {
  const snap = await getDoc(doc(db, "organizations", uid));
  return snap.exists() ? ({ uid: snap.id, ...snap.data() } as OrganizationDoc) : null;
}

/** Create or update an organization document */
export async function upsertOrganization(
  uid: string,
  data: Partial<OrganizationDoc>
) {
  await setDoc(doc(db, "organizations", uid), sanitizeData(data as Record<string, unknown>), { merge: true });
}

// ─────────────────────────────────────────────
// REQUIREMENTS
// ─────────────────────────────────────────────

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

export async function getMyRequirements(orgId: string): Promise<RequirementDoc[]> {
  return getRequirements({ organizationId: orgId });
}

export async function addRequirement(
  data: Omit<RequirementDoc, "id">
): Promise<string> {
  const ref = await addDoc(collection(db, "requirements"), {
    ...sanitizeData(data as unknown as Record<string, unknown>),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateRequirement(
  reqId: string,
  data: Partial<RequirementDoc>
) {
  await updateDoc(doc(db, "requirements", reqId), sanitizeData(data as Record<string, unknown>));
}

export async function deleteRequirement(reqId: string) {
  await deleteDoc(doc(db, "requirements", reqId));
}

// ─────────────────────────────────────────────
// SLOTS
// ─────────────────────────────────────────────

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

export async function getMySlots(orgId: string): Promise<SlotDoc[]> {
  return getSlots({ organizationId: orgId });
}

export async function addSlot(data: Omit<SlotDoc, "id">): Promise<string> {
  const ref = await addDoc(collection(db, "slots"), {
    ...sanitizeData(data as unknown as Record<string, unknown>),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateSlot(slotId: string, data: Partial<SlotDoc>) {
  await updateDoc(doc(db, "slots", slotId), sanitizeData(data as Record<string, unknown>));
}

export async function deleteSlot(slotId: string) {
  await deleteDoc(doc(db, "slots", slotId));
}

// ─────────────────────────────────────────────
// SPONSORSHIP REQUESTS
// ─────────────────────────────────────────────

/** Create a new sponsorship request (donor initiates sponsorship) */
export async function createSponsorshipRequest(
  data: Omit<SponsorshipRequestDoc, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const ref = await addDoc(collection(db, "sponsorshipRequests"), {
    ...sanitizeData(data as unknown as Record<string, unknown>),
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/** Get all sponsorship requests for an organization */
export async function getOrgSponsorshipRequests(
  organizationId: string
): Promise<SponsorshipRequestDoc[]> {
  const q = query(
    collection(db, "sponsorshipRequests"),
    where("organizationId", "==", organizationId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as SponsorshipRequestDoc));
}

/** Get all sponsorship requests from a donor */
export async function getDonorSponsorshipRequests(
  donorId: string
): Promise<SponsorshipRequestDoc[]> {
  const q = query(
    collection(db, "sponsorshipRequests"),
    where("donorId", "==", donorId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as SponsorshipRequestDoc));
}

/** Approve a sponsorship request — also creates a donation record */
export async function approveSponsorshipRequest(
  requestId: string,
  request: SponsorshipRequestDoc
): Promise<void> {
  // Update request status
  await updateDoc(doc(db, "sponsorshipRequests", requestId), {
    status: "approved",
    updatedAt: serverTimestamp(),
  });

  // Create a corresponding donation record
  await addDoc(collection(db, "donations"), sanitizeData({
    donorId: request.donorId,
    organizationId: request.organizationId,
    slotId: request.slotId,
    amount: request.amount,
    occasion: request.occasion,
    message: request.message,
    status: "Approved",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  } as Record<string, unknown>));

  // Update slot sponsored count if a slotId exists
  if (request.slotId) {
    const slotSnap = await getDoc(doc(db, "slots", request.slotId));
    if (slotSnap.exists()) {
      const slot = slotSnap.data() as SlotDoc;
      const meals = request.meals ?? 0;
      const newSponsored = (slot.sponsored || 0) + meals;
      const newStatus: SlotDoc["status"] =
        newSponsored >= slot.totalNeeded
          ? "Full"
          : newSponsored > 0
          ? "Partially Filled"
          : "Available";
      await updateDoc(doc(db, "slots", request.slotId), {
        sponsored: newSponsored,
        status: newStatus,
      });
    }
  }
}

/** Reject a sponsorship request */
export async function rejectSponsorshipRequest(requestId: string): Promise<void> {
  await updateDoc(doc(db, "sponsorshipRequests", requestId), {
    status: "rejected",
    updatedAt: serverTimestamp(),
  });
}

// ─────────────────────────────────────────────
// DONATIONS
// ─────────────────────────────────────────────

export async function getDonorDonations(donorId: string): Promise<DonationDoc[]> {
  const q = query(
    collection(db, "donations"),
    where("donorId", "==", donorId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as DonationDoc));
}

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

export async function createDonation(
  data: Omit<DonationDoc, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const ref = await addDoc(collection(db, "donations"), {
    ...sanitizeData(data as unknown as Record<string, unknown>),
    status: "Pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

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
  ];
  if (unreadOnly) constraints.splice(1, 0, where("read", "==", false));

  const q = query(collection(db, "notifications"), ...constraints);
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as NotificationDoc)));
  });
}

export async function markNotificationRead(notifId: string) {
  await updateDoc(doc(db, "notifications", notifId), {
    read: true,
    readAt: serverTimestamp(),
  });
}

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
