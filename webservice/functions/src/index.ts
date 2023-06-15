import * as functions from "firebase-functions"
import firebase from "firebase-admin"

const firebaseApp = firebase.initializeApp()

import helloWorldHandler from "./hello-world"
export const helloWorld = functions.https.onRequest(helloWorldHandler())

import graphQLHandler from "./graphql"
export const graphql = functions.https.onRequest(graphQLHandler(firebaseApp.firestore()))
