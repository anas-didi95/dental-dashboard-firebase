import { Firestore, Timestamp } from "firebase-admin/firestore";
import { express, validator } from "../utils/helper";
import { Collection } from "../utils/constants";
import { TPatient, TRule } from "../utils/types";
import { Response } from "express";

export default (firestore: Firestore) => {
  const app = express();

  app.post("", async (req, res) => {
    const body: TPatient = {
      ...req.body,
      version: 0,
      lastModifiedDate: Timestamp.now(),
      lastModifiedBy: "SYSTEM",
    };
    validate(body, res);

    const doc = await (
      await firestore.collection(Collection.Patient).add(body)
    ).get();
    res.send(doc.data());
  });

  return app;
};

const validate = (data: TPatient, res: Response) => {
  const prop: TRule = {
    fullName: {
      type: "string",
      mandatory: true,
    },
  };
  return validator(data, res, prop);
};
