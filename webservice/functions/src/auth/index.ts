import { UserRecord, Auth } from "firebase-admin/auth";
import { Firestore, Timestamp } from "firebase-admin/firestore";
import { TParamEnv, TUser } from "../utils/types";

export default (firestore: Firestore, auth: Auth, paramEnv: TParamEnv) => {
  const onCreate = async (user: UserRecord) => {
    const [userId, domain] = user.email?.split("@") ?? [];
    if (domain !== paramEnv.emailDomain) {
      await auth.deleteUser(user.uid);
      throw new Error("Incorrect domain!");
    }
    const data: TUser = {
      userId,
      fullName: user.displayName ?? "",
      lastModifiedBy: "SYSTEM",
      lastModifiedDate: Timestamp.now(),
      version: 0,
      isDeleted: user.disabled,
    };
    await firestore.collection("users").doc(user.uid).create(data);
  };

  const onDelete = async (user: UserRecord) => {
    const record = firestore.collection("users").doc(user.uid);
    const result = (await record.get()).data();
    if (!result) {
      throw new Error(`Record[${user.uid}] not found!`);
    }
    await record.update({
      lastModifiedBy: "SYSTEM",
      lastModifiedDate: Timestamp.now(),
      version: result.version + 1,
      isDeleted: true,
    });
  };

  return { onCreate, onDelete };
};
