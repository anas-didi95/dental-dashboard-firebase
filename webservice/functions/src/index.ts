import * as functions from "firebase-functions/v2"
import firebase from "firebase-admin"

const firebaseApp = firebase.initializeApp()

import helloWorldHandler from "./hello-world"
export const helloWorld = functions.https.onRequest(helloWorldHandler())

import graphQLHandler from "./graphql"
export const graphql = functions.https.onRequest(graphQLHandler(firebaseApp.firestore()))

import patientHandler from "./patient"
export const patients = functions.https.onRequest(patientHandler(firebase.firestore()))

import { TServerHealth } from "./utils/types"
import { getServerHealth } from "./utils/helper"
const healthData: TServerHealth = {
  deployDate: firebase.firestore.Timestamp.now(),
  isOnline: true
}
const doc = getServerHealth(firebaseApp.firestore())
doc.get().then(record => {
  if (record.exists) return doc.update(healthData)
  return doc.create(healthData)
}).then(result => console.log("[init] Functions deployed.", { ...healthData, ...result }))
