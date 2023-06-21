import expressModule, { Response } from "express";
import { Firestore } from "firebase-admin/firestore";
import { Collection, ErrorCode } from "./constants";
import { TPatient, TRule } from "./types";

export const express = () => {
  const app = expressModule();

  return app;
};

export const getServerHealth = (firestore: Firestore) =>
  firestore.collection(Collection.Server).doc("health");

export const validator = (data: TPatient, res: Response, prop: TRule) => {
  prop = { ...prop, version: { type: "number", mandatory: true }, lastModifiedBy: { type: "string", mandatory: true }, lastModifiedDate: { type: "date", mandatory: true } }
  const errorList = Object.keys(prop)
    .map((key) => {
      const err = [];
      const rule = prop[key as keyof typeof prop];
      const type = rule["type"]
      const value = data[key as keyof typeof data]
      if (rule.mandatory) {
        let isError = false
        if (type === "number") {
          isError = isNaN(value as number)
        } else {
          isError = !value
        }
        if (isError) {
          err.push(`[${key}] is mandatory field!`)
        }
      }
      return err.filter((a) => !!a);
    })
    .reduce((prev, curr) => prev.concat(curr));

  if (errorList.length > 0) {
    res.status(400).send({ ...ErrorCode.ValidateError, errorList })
  }
};
