import * as functions from "firebase-functions"

import helloWorldHandler from "./hello-world"
export const helloWorld = functions.https.onRequest(helloWorldHandler())

import graphQLHandler from "./graphql"
export const graphql = functions.https.onRequest(graphQLHandler())
