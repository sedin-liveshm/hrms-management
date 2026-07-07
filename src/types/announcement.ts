import { Timestamp } from "firebase/firestore";
export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdBy: string;
  createdByName: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
