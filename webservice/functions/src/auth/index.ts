import { UserRecord } from "firebase-admin/auth";
import { Firestore, Timestamp } from "firebase-admin/firestore";
import { TUser } from "../utils/types";

export default (firestore: Firestore) => {
  return async (user: UserRecord) => {
    const data: TUser = {
      fullName: user.displayName ?? "",
      lastModifiedBy: "SYSTEM",
      lastModifiedDate: Timestamp.now(),
      version: 0,
    };
    await firestore.collection("users").doc(user.uid).create(data);
  };
};
