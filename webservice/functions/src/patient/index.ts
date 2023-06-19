import { Firestore, Timestamp } from "firebase-admin/firestore";
import { express } from "../utils/helper";
import { Collection } from "../utils/constants";
import { TPatient } from "../utils/types";

export default (firestore: Firestore) => {
  const app = express();

  app.post("", async (req, res) => {
    const body: TPatient = {
      ...req.body,
      version: 0,
      lastModifiedDate: Timestamp.now(),
      lastModifiedBy: "SYSTEM",
    };
    const doc = await (
      await firestore.collection(Collection.Patient).add(body)
    ).get();
    res.send(doc.data());
  });

  return app;
};
