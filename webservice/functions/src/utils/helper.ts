import expressModule from "express";
import { Firestore } from "firebase-admin/firestore"
import { Collection } from "./constants";

export const express = () => {
  const app = expressModule();

  return app;
};

export const getServerHealth = (firestore: Firestore) => firestore.collection(Collection.Server).doc("health")
