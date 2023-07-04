import { UserRecord } from "firebase-admin/auth";
import { Firestore } from "firebase-admin/firestore";

export default (firestore: Firestore) => {
  return async (user: UserRecord) => {
    await firestore.collection("users").doc(user.uid).create({
      fullName: user.displayName
    })
  }
}
