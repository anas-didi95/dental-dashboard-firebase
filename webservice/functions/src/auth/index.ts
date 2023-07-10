import { UserRecord, Auth } from "firebase-admin/auth";
import { Firestore, Timestamp } from "firebase-admin/firestore";
import { TParamEnv, TUser } from "../utils/types";

export default (firestore: Firestore, auth: Auth, paramEnv: TParamEnv) => {
  const onCreate = async (user: UserRecord) => {
    const [userId, domain] = user.email?.split("@") ?? []
    if (domain !== paramEnv.emailDomain) {
      await auth.deleteUser(user.uid)
      throw new Error("Incorrect domain!")
    }
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
