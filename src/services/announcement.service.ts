import { db } from "@/firebase/firestore";
import { isFirebaseConfigured } from "@/firebase/config";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    Timestamp,
} from "firebase/firestore";
import type { Announcement } from "@/types/announcement";

class AnnouncementService {
    private isFirebaseEnabled(): boolean {
        return isFirebaseConfigured && db !== null;
    }
    public toDate(
        ts: Timestamp | { seconds: number; nanoseconds: number } | string | Date | null | undefined
    ): Date {
        if (!ts) return new Date();
        if (ts instanceof Date) return ts;
        if (typeof ts === "string") return new Date(ts);

        const obj = ts as Record<string, unknown>;
        if (typeof obj.toDate === "function") {
            return (obj.toDate as () => Date)();
        }
        if (typeof obj.seconds === "number") {
            return new Date(obj.seconds * 1000);
        }
        return new Date(ts as unknown as string);
    }
    private createTimestamp(date: Date): Timestamp {
        if (this.isFirebaseEnabled()) {
            return Timestamp.fromDate(date);
        } else {
            const sec = Math.floor(date.getTime() / 1000);
            const mockTimestamp = {
                seconds: sec,
                nanoseconds: 0,
                toDate: () => date,
                isEqual: (other: unknown) => {
                    if (other && typeof other === "object" && "seconds" in other) {
                        return (other as Record<string, unknown>).seconds === sec;
                    }
                    return false;
                },
                valueOf: () => `${sec}`,
            };
            return mockTimestamp as unknown as Timestamp;
        }
    }


    /**
     * Retrieves all announcements, sorted newest first.
     */
    public async getAnnouncements(): Promise<Announcement[]> {
        if (this.isFirebaseEnabled()) {
            try {
                const q = query(collection(db!, "announcements"), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);
                const list: Announcement[] = [];
                querySnapshot.forEach((d) => {
                    list.push({
                        id: d.id,
                        ...d.data(),
                    } as Announcement);
                });
                return list;
            } catch (error) {
                console.error("Firestore getAnnouncements failed:", error);
                throw error;
            }
        } else {
            if (typeof window === "undefined") return [];
            this.ensureMockDataSeeded();
            const list: Announcement[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith("hrms_announcement_")) {
                    try {
                        const data = localStorage.getItem(key);
                        if (data) {
                            list.push(JSON.parse(data) as Announcement);
                        }
                    } catch (e) {
                        console.error("Failed to parse local announcement:", e);
                    }
                }
            }
            return list.sort((a, b) => {
                const dateA = this.toDate(a.createdAt).getTime();
                const dateB = this.toDate(b.createdAt).getTime();
                return dateB - dateA;
            });
        }
    }

    /**
     * Retrieves a single announcement by its ID.
     */
    public async getAnnouncementById(id: string): Promise<Announcement | null> {
        if (this.isFirebaseEnabled()) {
            try {
                const docRef = doc(db!, "announcements", id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    return { id: docSnap.id, ...docSnap.data() } as Announcement;
                }
                return null;
            } catch (error) {
                console.error("Firestore getAnnouncementById failed:", error);
                throw error;
            }
        } else {
            if (typeof window === "undefined") return null;
            const stored = localStorage.getItem(`hrms_announcement_${id}`);
            if (stored) {
                return JSON.parse(stored) as Announcement;
            }
            return null;
        }
    }

    /**
     * Creates a new announcement document.
     */
    public async createAnnouncement(
        title: string,
        content: string,
        createdBy: string,
        createdByName: string
    ): Promise<Announcement> {
        const docRef = doc(collection(db!, "announcements"));
        const id = docRef.id;
        const now = new Date();
        const createdAt = this.createTimestamp(now);
        const updatedAt = this.createTimestamp(now);

        const newAnn: Announcement = {
            id,
            title,
            content,
            createdBy,
            createdByName,
            createdAt,
            updatedAt,
        };

        if (this.isFirebaseEnabled()) {
            try {
                await setDoc(docRef, newAnn);
                return newAnn;
            } catch (error) {
                console.error("Firestore createAnnouncement failed:", error);
                throw error;
            }
        } else {
            if (typeof window !== "undefined") {
                localStorage.setItem(`hrms_announcement_${id}`, JSON.stringify(newAnn));
            }
            console.log(newAnn);
            return newAnn;
        }
    }

    /**
     * Updates an existing announcement document's title and content.
     */
    public async updateAnnouncement(
        id: string,
        data: { title: string; content: string }
    ): Promise<void> {
        const now = new Date();
        const updatedAt = this.createTimestamp(now);
        const updateData = {
            ...data,
            updatedAt,
        };

        if (this.isFirebaseEnabled()) {
            try {
                const docRef = doc(db!, "announcements", id);
                await updateDoc(docRef, updateData);
            } catch (error) {
                console.error("Firestore updateAnnouncement failed:", error);
                throw error;
            }
        } else {
            if (typeof window !== "undefined") {
                const existing = await this.getAnnouncementById(id);
                if (existing) {
                    const merged = { ...existing, ...updateData };
                    localStorage.setItem(`hrms_announcement_${id}`, JSON.stringify(merged));
                } else {
                    throw new Error("Announcement not found in local mock database");
                }
            }
        }
    }

    /**
     * Deletes an announcement.
     */
    public async deleteAnnouncement(id: string): Promise<void> {
        if (this.isFirebaseEnabled()) {
            try {
                const docRef = doc(db!, "announcements", id);
                await deleteDoc(docRef);
            } catch (error) {
                console.error("Firestore deleteAnnouncement failed:", error);
                throw error;
            }
        } else {
            if (typeof window !== "undefined") {
                localStorage.removeItem(`hrms_announcement_${id}`);
            }
        }
    }

    /**
     * Seeds default announcements in mock mode if none exist.
     */
    private ensureMockDataSeeded() {
        if (typeof window === "undefined") return;

        let hasAnnouncements = false;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith("hrms_announcement_")) {
                hasAnnouncements = true;
                break;
            }
        }

        if (!hasAnnouncements) {
            console.log("Seeding mock announcements into localStorage...");
            const mockList: Announcement[] = [
                {
                    id: "mock-ann-1",
                    title: "Office Closure — Republic Day",
                    content: "The office will remain closed on January 26th in observance of Republic Day. All employees should plan accordingly.",
                    createdBy: "mock-uid-hr",
                    createdByName: "HR Manager",
                    createdAt: this.createTimestamp(new Date(Date.now() - 1000 * 60 * 60 * 24 * 3)),
                    updatedAt: this.createTimestamp(new Date(Date.now() - 1000 * 60 * 60 * 24 * 3)),
                },
                {
                    id: "mock-ann-2",
                    title: "Annual Performance Review — June 2026",
                    content: "The annual performance review cycle begins June 15th. Managers are requested to schedule 1:1 sessions with their direct reports.",
                    createdBy: "mock-uid-hr",
                    createdByName: "HR Manager",
                    createdAt: this.createTimestamp(new Date(Date.now() - 1000 * 60 * 60 * 24 * 1)),
                    updatedAt: this.createTimestamp(new Date(Date.now() - 1000 * 60 * 60 * 24 * 1)),
                },
                {
                    id: "mock-ann-3",
                    title: "New Health Insurance Benefits",
                    content: "We are pleased to announce enhanced health insurance coverage starting July 2026. Details have been sent to your email.",
                    createdBy: "mock-uid-admin",
                    createdByName: "System Admin",
                    createdAt: this.createTimestamp(new Date()),
                    updatedAt: this.createTimestamp(new Date()),
                },
            ];

            mockList.forEach((ann) => {
                localStorage.setItem(`hrms_announcement_${ann.id}`, JSON.stringify(ann));
            });
        }
    }
}

export const announcementService = new AnnouncementService();
