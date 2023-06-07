import * as functions from "firebase-functions"

import HelloWorldHandler from "./hello-world"
export const helloWorld = functions.https.onRequest(HelloWorldHandler)

import GraphQLHandler from "./graphql"
export const graphql = functions.https.onRequest(GraphQLHandler)
