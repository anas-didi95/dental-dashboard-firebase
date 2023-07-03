import * as functions from "firebase-functions/v2"
import firebase from "firebase-admin"
import { defineString } from "firebase-functions/params"
import { TParamEnv, TServerHealth } from "./utils/types"

const firebaseApp = firebase.initializeApp()
const paramEnv: TParamEnv = {
  appEnv: defineString("FUNCTION_APP_ENV").value(),
  isDevEnv: defineString("FUNCTION_APP_ENV").equals("dev").value()
}

import helloWorldHandler from "./hello-world"
import graphQLHandler from "./graphql"
import patientHandler from "./patient"
export const v1 = {
  helloWorld: functions.https.onRequest(helloWorldHandler()),
  graphql: functions.https.onRequest(graphQLHandler(firebaseApp.firestore(), paramEnv)),
  patients: functions.https.onRequest(patientHandler(firebase.firestore()))
}

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
