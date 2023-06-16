import * as functions from "firebase-functions/v2"
import firebase from "firebase-admin"

const firebaseApp = firebase.initializeApp()

import helloWorldHandler from "./hello-world"
export const helloWorld = functions.https.onRequest(helloWorldHandler())

import graphQLHandler from "./graphql"
export const graphql = functions.https.onRequest(graphQLHandler(firebaseApp.firestore()))

const healthData = {
  deployDate: firebase.firestore.Timestamp.now(),
  isOnline: true
}
const doc = firebaseApp.firestore().collection("server").doc("health")
doc.get().then(record => {
  if (record.exists) return doc.update(healthData)
  return doc.create(healthData)
}).then(result => console.log("[init] Functions deployed.", { ...healthData, ...result }))
