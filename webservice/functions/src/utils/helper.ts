import expressModule, { Response, Request, NextFunction } from "express";
import { Firestore } from "firebase-admin/firestore";
import { Collection, ErrorCode } from "./constants";
import { TPatient, TRule } from "./types";
import * as functions from "firebase-functions";
import admin from "firebase-admin";
import cookieParser from "cookie-parser";

export const express = (isDevEnv = false) => {
  const app = expressModule();
  // Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
  // The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
  // `Authorization: Bearer <Firebase ID Token>`.
  // when decoded successfully, the ID Token content will be added as `req.user`.
  const validateFirebaseIdToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    functions.logger.log(
      "Check if request is authorized with Firebase ID token"
    );

    if (
      (!req.headers.authorization ||
        !req.headers.authorization.startsWith("Bearer ")) &&
      !(req.cookies && req.cookies.__session)
    ) {
      functions.logger.error(
        "No Firebase ID token was passed as a Bearer token in the Authorization header.",
        "Make sure you authorize your request by providing the following HTTP header:",
        "Authorization: Bearer <Firebase ID Token>",
        'or by passing a "__session" cookie.'
      );
      res.status(403).send("Unauthorized");
      return;
    }

    let idToken;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      functions.logger.log('Found "Authorization" header');
      // Read the ID Token from the Authorization header.
      idToken = req.headers.authorization.split("Bearer ")[1];
    } else if (req.cookies) {
      functions.logger.log('Found "__session" cookie');
      // Read the ID Token from cookie.
      idToken = req.cookies.__session;
    } else {
      // No cookie
      res.status(403).send("Unauthorized");
      return;
    }

    try {
      const decodedIdToken = await admin.auth().verifyIdToken(idToken);
      functions.logger.log("ID Token correctly decoded", decodedIdToken);
      req.app.locals.user = decodedIdToken;
      next();
      return;
    } catch (error) {
      functions.logger.error("Error while verifying Firebase ID token:", error);
      res.status(403).send("Unauthorized");
      return;
    }
  };

  app.use(cookieParser());
  if (!isDevEnv) {
    app.use(validateFirebaseIdToken);
  }

  return app;
};

export const getServerHealth = (firestore: Firestore) =>
  firestore.collection(Collection.Server).doc("health");

export const validator = (data: TPatient, res: Response, prop: TRule) => {
  prop = {
    ...prop,
    version: { type: "number", mandatory: true },
    lastModifiedBy: { type: "string", mandatory: true },
    lastModifiedDate: { type: "date", mandatory: true },
  };
  const errorList = Object.keys(prop)
    .map((key) => {
      const err = [];
      const rule = prop[key as keyof typeof prop];
      const type = rule["type"];
      const value = data[key as keyof typeof data];
      if (rule.mandatory) {
        let isError = false;
        if (type === "number") {
          isError = isNaN(value as number);
        } else {
          isError = !value;
        }
        if (isError) {
          err.push(`[${key}] is mandatory field!`);
        }
      }
      return err.filter((a) => !!a);
    })
    .reduce((prev, curr) => prev.concat(curr));

  if (errorList.length > 0) {
    res.status(400).send({ ...ErrorCode.ValidateError, errorList });
  }
};
