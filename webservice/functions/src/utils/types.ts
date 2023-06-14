import DataLoader from "dataloader"
import firebase from "firebase-admin";

export type TAppointment = {
  patientId: string;
};

export type TGQLContext = {
  patientLoader: DataLoader<string, Promise<firebase.firestore.DocumentData | null | undefined>, string>
}
