import { Firestore } from "firebase-admin/firestore";
import { express } from "../utils/helper"
import { Collection } from "../utils/constants";

export default (firestore: Firestore) => {
  const app = express()

  app.post("", async (req, res) => {
    const doc = await (await firestore.collection(Collection.Patient).add(req.body)).get()
    res.send(doc.data())
  });

  return app
}
