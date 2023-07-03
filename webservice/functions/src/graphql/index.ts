import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { express } from "../utils/helper";
import { Firestore } from "firebase-admin/firestore";
import { TGQLContext, TParamEnv } from "../utils/types";
import DataLoader from "dataloader";
import { typeDefs, resolvers } from "./scheme";
import { Collection } from "../utils/constants";

export default (firestore: Firestore, paramEnv: TParamEnv) => {
  const context: TGQLContext = {
    patientLoader: new DataLoader(async (keys) => {
      return keys.map(async (key) => {
        const result = await firestore
          .collection(Collection.Patient)
          .doc(key)
          .get();
        if (!result.exists) return null;
        return result.data();
      });
    }),
  };

  // The ApolloServer constructor requires two parameters: your schema
  // definition and your set of resolvers.
  const server = new ApolloServer({
    typeDefs,
    resolvers: resolvers(firestore, paramEnv),
  });

  const app = express(paramEnv.isDevEnv);
  server.start().then(() =>
    app.use(
      "/",
      expressMiddleware(server, {
        context: async () => context,
      })
    )
  );
  return app;
};
