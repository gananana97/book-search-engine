// src/utils/ApolloClient.js
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Create an HTTP link to your Apollo Server
const httpLink = createHttpLink({
  uri: '/graphql', // Update the URI if your Apollo Server is hosted elsewhere
});

// Middleware to add the JWT token to every request (optional)
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('id_token'); // Retrieve token from localStorage or other storage
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '', // Set Authorization header if token exists
    },
  };
});

// Initialize Apollo Client with the auth link and HTTP link
const client = new ApolloClient({
  link: authLink.concat(httpLink), // Combine auth and HTTP links
  cache: new InMemoryCache(), // Use Apollo's in-memory cache
});

export default client;
