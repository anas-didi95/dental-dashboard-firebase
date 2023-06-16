import { Firestore, Timestamp } from "firebase-admin/firestore";
import { GraphQLScalarType, Kind } from "graphql";
import { TAppointment, TGQLContext } from "../utils/types";
import { Collection } from "../utils/constants";

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  scalar Date

  type ServerHealth {
    deployDate: Date!
    isOnline: Boolean!
  }

  type Patient {
    name: String!
  }

  type Appointment {
    patient: Patient!
    date: Date!
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each.
  type Query {
    serverHealth: ServerHealth
    patients: [Patient]!
    appointments: [Appointment]!
  }
`;

// Resolvers define how to fetch the types defined in your schema.
const resolvers = (firestore: Firestore) => ({
  Date: new GraphQLScalarType({
    name: "Date",
    description: "Date custom scalar type",
    serialize(value) {
      if (value instanceof Date) {
        return value.getTime(); // Convert outgoing Date to integer for JSON
      } else if (value instanceof Timestamp) {
        return value.toDate().getTime();
      }
      throw Error("GraphQL Date Scalar serializer expected a `Date` object");
    },
    parseValue(value) {
      if (typeof value === "number") {
        return new Date(value); // Convert incoming integer to Date
      }
      throw new Error("GraphQL Date Scalar parser expected a `number`");
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        // Convert hard-coded AST string to integer and then to Date
        return new Date(parseInt(ast.value, 10));
      }
      // Invalid hard-coded value (not an integer)
      return null;
    },
  }),
  Query: {
    serverHealth: async () => {
      const result = await firestore.collection("server").doc("health").get()
      return result.data()
    },
    patients: async () => {
      const resultList = await firestore.collection(Collection.Patient).get();
      return resultList.docs.map((o) => o.data());
    },
    appointments: async () => {
      const resultList = await firestore
        .collection(Collection.Appointment)
        .get();
      return resultList.docs.map((o) => o.data());
    },
  },
  Appointment: {
    patient: async (parent: TAppointment, _: unknown, context: TGQLContext) => {
      return context.patientLoader.load(parent.patientId);
    },
  },
});

export { typeDefs, resolvers };
