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
    const errorList = validate(body)
    if (errorList.length > 0) {
      res.status(400).send(errorList)
    }

    const doc = await (
      await firestore.collection(Collection.Patient).add(body)
    ).get();
    res.send(doc.data());
  });

  return app;
};

const validate = (data: TPatient) => {
  const prop = {
    name: {
      mandatory: true
    }
  }

  return Object.keys(prop).map(key => {
    const err = []
    const rule = (prop)[key as keyof typeof prop]
    if (rule.mandatory) {
      const error = !data[key as keyof TPatient] ? `${key} is mandatory field!` : ''
      err.push(error)
    }
    return err.filter(a => !!a);
  }).reduce((prev, curr) => prev.concat(curr))
}
