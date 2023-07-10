import { UserRecord } from "firebase-admin/auth";
import { Firestore, Timestamp } from "firebase-admin/firestore";
import { TUser } from "../utils/types";

export default (firestore: Firestore) => {
  const onCreate = async (user: UserRecord) => {
    const [userId, domain] = user.email?.split("@") ?? []
    const data: TUser = {
      userId,
      fullName: user.displayName ?? "",
      lastModifiedBy: "SYSTEM",
      lastModifiedDate: Timestamp.now(),
      version: 0,
    };
    await firestore.collection("users").doc(user.uid).create(data);
  };

  return { onCreate };
};
