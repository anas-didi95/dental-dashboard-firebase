import * as functions from "firebase-functions/v2"
import * as functions1 from "firebase-functions"
import firebase from "firebase-admin"
import { defineString } from "firebase-functions/params"
import { TParamEnv } from "./utils/types"

const firebaseApp = firebase.initializeApp()
const paramEnv: TParamEnv = {
  appEnv: defineString("FUNCTION_APP_ENV").value(),
  isDevEnv: defineString("FUNCTION_APP_ENV").equals("dev").value(),
  emailDomain: defineString("FUNCTION_APP_EMAIL_DOMAIN").value()
}

import helloWorldHandler from "./hello-world"
import graphQLHandler from "./graphql"
import patientHandler from "./patient"
export const v1 = {
  helloWorld: functions.https.onRequest(helloWorldHandler()),
  graphql: functions.https.onRequest(graphQLHandler(firebaseApp.firestore(), paramEnv)),
  patients: functions.https.onRequest(patientHandler(firebaseApp.firestore()))
}

import authTrigger from "./auth"
export const authUser = {
  onCreate: functions1.auth.user().onCreate(authTrigger(firebaseApp.firestore(), firebaseApp.auth(), paramEnv).onCreate)
}
