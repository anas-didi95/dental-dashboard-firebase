import DataLoader from "dataloader";
import { DocumentData, Timestamp } from "firebase-admin/firestore";

export type TAppointment = {
  patientId: string;
};

export type TGQLContext = {
  patientLoader: DataLoader<
    string,
    Promise<DocumentData | null | undefined>,
    string
  >;
};

export type TServerHealth = {
  deployDate: Timestamp;
  isOnline: boolean;
};
