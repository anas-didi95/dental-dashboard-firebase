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

export const validator = (data: TPatient, res: Response, prop: { [key: string]: TRule }) => {
  const errorList = Object.keys(prop)
    .map((key) => {
      const err = [];
      const rule = prop[key as keyof typeof prop];
      if (rule.mandatory) {
        err.push(
          !data[key as keyof typeof data] ? `[${key}] is mandatory field!` : ""
        );
      }
      return err.filter((a) => !!a);
    })
    .reduce((prev, curr) => prev.concat(curr));

  if (errorList.length > 0) {
    res.status(400).send({ ...ErrorCode.ValidateError, errorList })
  }
};
