import { Firestore, Timestamp } from "firebase-admin/firestore";
import { GraphQLScalarType, Kind } from "graphql";
import { Collection } from "../utils/constants";
import { TAppointment, TGQLContext, TParamEnv, TRecord } from "../utils/types";

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  scalar Date

  interface Record {
    version: Int!
    lastModifiedDate: Date!
    lastModifiedBy: User!
    isDeleted: Boolean!
  }

  type ServerHealth {
    appEnv: String!
    isDevEnv: Boolean!
  }

  type Patient implements Record {
    fullName: String!
    version: Int!
    lastModifiedDate: Date!
    lastModifiedBy: User!
    isDeleted: Boolean!
  }

  type Appointment {
    patient: Patient!
    date: Date!
  }

  type User implements Record {
    userId: String!
    fullName: String
    version: Int!
    lastModifiedDate: Date!
    lastModifiedBy: User!
    isDeleted: Boolean!
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each.
  type Query {
    serverHealth: ServerHealth
    patients: [Patient]!
    appointments: [Appointment]!
    users: [User]!
  }
`;

// Resolvers define how to fetch the types defined in your schema.
const resolvers = (firestore: Firestore, paramEnv: TParamEnv) => ({
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
      return { ...paramEnv };
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
    users: async () => {
      const resultList = await firestore.collection(Collection.User).get();
      return resultList.docs.map((o) => o.data());
    },
  },
  Appointment: {
    patient: async (parent: TAppointment, _: unknown, context: TGQLContext) => {
      return context.patientLoader.load(parent.patientId);
    },
  },
  Patient: { lastModifiedBy },
  User: { lastModifiedBy },
});

export { resolvers, typeDefs };

const lastModifiedBy = async (
  parent: TRecord,
  _: unknown,
  context: TGQLContext
) => {
  return context.userLoader.load(parent.lastModifiedBy);
};
