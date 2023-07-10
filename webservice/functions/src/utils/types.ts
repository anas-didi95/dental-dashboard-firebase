import DataLoader from "dataloader";
import { DocumentData, Timestamp } from "firebase-admin/firestore";

type TRecord = {
  version: number;
  lastModifiedDate: Timestamp;
  lastModifiedBy: string;
};

export type TPatient = {
  fullName: string;
} & TRecord;

export type TAppointment = {
  patientId: string;
};

export type TUser = {
  userId: string
  fullName: string;
} & TRecord;

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

export type TRule = {
  [key: string]: {
    type: "string" | "number" | "date";
    mandatory?: boolean;
  };
};

export type TParamEnv = {
  appEnv: string;
  isDevEnv: boolean;
};
