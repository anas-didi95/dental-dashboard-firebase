import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { express } from "../utils/helper";
import firebase from "firebase-admin";
import { TAppointment } from "../utils/types";
import { GraphQLScalarType, Kind } from "graphql";
import DataLoader from "dataloader"

firebase.initializeApp();
export default () => {
  // A schema is a collection of type definitions (hence "typeDefs")
  // that together define the "shape" of queries that are executed against
  // your data.
  const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    title: String
    author: String
  }

  type Patient {
    name: String!
  }

  type Appointment {
    patient: Patient!
    date: Date!
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    books: [Book]
    patients: [Patient]!
    appointments: [Appointment]!
  }

  scalar Date
`;

  const dateScalar = new GraphQLScalarType({
    name: "Date",
    description: "Date custom scalar type",
    serialize(value) {
      if (value instanceof Date) {
        return value.getTime(); // Convert outgoing Date to integer for JSON
      } else if (value instanceof firebase.firestore.Timestamp) {
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
  });

  const books = [
    {
      title: "The Awakening",
      author: "Kate Chopin",
    },
    {
      title: "City of Glass",
      author: "Paul Auster",
    },
  ];

  // Resolvers define how to fetch the types defined in your schema.
  // This resolver retrieves books from the "books" array above.
  const resolvers = {
    Date: dateScalar,
    Query: {
      books: async () => books,
      patients: async () => {
        const resultList = await firebase
          .firestore()
          .collection("patients")
          .get();
        return resultList.docs.map((o) => o.data());
      },
      appointments: async () => {
        const resultList = await firebase
          .firestore()
          .collection("appointments")
          .get();
        return resultList.docs.map((o) => o.data());
      },
    },
    Appointment: {
      patient: async (parent: TAppointment, _: any, context: any) => {
        console.log("[patient] get dataloder")
        return context.patientDataLoader.load(parent.patientId)
      },
    },
  };

  const patientDataLoader = new DataLoader(async (keys) => {
    console.log("[dataloader] keys", keys)
    return await Promise.all(keys.map(async (key) => {
      return (await firebase.firestore().collection("patients").doc(key as string).get()).data()
    }))
  })

  // The ApolloServer constructor requires two parameters: your schema
  // definition and your set of resolvers.
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const app = express();
  server.start().then(() => app.use("/", expressMiddleware(server, {
    context: async () => {
      return {
        patientDataLoader
      }
    }
  })));
  return app;
};
