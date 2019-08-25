import {
  InMemoryCache,
  IntrospectionFragmentMatcher,
} from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import { from, split } from 'apollo-link';
import { onError } from 'apollo-link-error';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import introspectionQueryResultData from '../api/generated/introspection-result';
import { storage } from './storage';

const getHeaders = (): Record<string, string> => {
  const token = storage.get('devToken');
  if (token)
    return {
      'x-device-token': token,
    };
  return {};
};

const httpEndpoint = `${location.origin}/gql`;
const httpLink = new HttpLink({
  uri: httpEndpoint,
  credentials: 'include',
  fetch: (input: RequestInfo, init?: RequestInit) => {
    if (init) {
      const { headers = {} } = init;
      init.headers = {
        ...getHeaders(),
        ...headers,
      };
    }
    return fetch(input, init);
  },
});

const wsEndpoint = `${location.origin.replace(/^http/, 'ws')}/gql/ws`;
const wsLink = new WebSocketLink({
  uri: wsEndpoint,
  options: {
    reconnect: true,
    lazy: true,
    connectionParams: () => getHeaders(),
  },
});

const link = from([
  onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors)
      graphQLErrors.map(({ message, locations, path }) =>
        console.log(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
        ),
      );
    if (networkError) console.log(`[Network error]: ${networkError}`);
  }),
  split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    wsLink,
    httpLink,
  ),
]);

const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData,
});

const cache = new InMemoryCache({ fragmentMatcher });

export const apolloClient = new ApolloClient({
  link,
  cache,
  defaultOptions: {
    query: {
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});
