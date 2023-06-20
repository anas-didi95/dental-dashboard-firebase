import { Firestore, Timestamp } from "firebase-admin/firestore";
import { express, validator } from "../utils/helper";
import { Collection, ErrorCode } from "../utils/constants";
import { TPatient, TRule } from "../utils/types";

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
      res.status(400).send({ ...ErrorCode.ValidateError, errorList })
    }

    const doc = await (
      await firestore.collection(Collection.Patient).add(body)
    ).get();
    res.send(doc.data());
  });

  return app;
};

const validate = (data: TPatient) => {
  const prop: { [key: string]: TRule } = {
    fullName: {
      mandatory: true
    }
  }
  return validator(data, prop)
}
