declare module 'apollo-upload-client' {
  import { ApolloLink } from 'apollo-link';
  import { HttpOptions } from 'apollo-link-http-common';

  /**
   * `createUploadLink` options match `createHttpLink` options
   * @param linkOptions `HttpOptions`
   */
  export function createUploadLink(linkOptions?: HttpOptions): ApolloLink;
}
