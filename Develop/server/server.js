const express = require('express');
const path = require('path');
const db = require('./config/connection');
const routes = require('./routes');
const { ApolloServer, gql } = require('apollo-server-express');
const { authMiddleware } = require('./utils/auth'); // Import your auth middleware

// Sample data (you can replace this with database interaction)
const books = [
  { title: 'The Awakening', author: 'Kate Chopin' },
  { title: 'City of Glass', author: 'Paul Auster' }
];

// Define typeDefs for GraphQL
const typeDefs = gql`
  type Book {
    title: String
    author: String
  }

  type User {
    _id: ID
    username: String
    email: String
  }

  type Query {
    books: [Book]
    me: User
  }

  type Mutation {
    addBook(title: String!, author: String!): Book
  }
`;

// Define resolvers
const resolvers = {
  Query: {
    books: () => books,
    // Protected route: Access user info from the context
    me: (_, __, context) => {
      if (context.user) {
        return context.user; // Return user if authenticated
      }
      throw new AuthenticationError('You must be logged in!');
    }
  },
  Mutation: {
    addBook: (_, { title, author }, context) => {
      // You can also require authentication here if necessary
      const newBook = { title, author };
      books.push(newBook);
      return newBook;
    }
  }
};

// Set up Apollo Server with authentication context
const server = new ApolloServer({
  typeDefs,
  resolvers,
  // Add the authentication middleware to the context
  context: ({ req }) => authMiddleware({ req })
});

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve GraphQL endpoint
server.applyMiddleware({ app });

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.use(routes);

// Start the server
db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`🌍 Now listening on localhost:${PORT}`);
    console.log(`🚀 GraphQL Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
});
