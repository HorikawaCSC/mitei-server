import {
  GraphQLResolveInfo,
  GraphQLScalarType,
  GraphQLScalarTypeConfig,
} from 'graphql';
import { FileSource } from '../models/FileSource';
import { TranscodedSource } from '../models/TranscodedSource';
import { GqlContext } from '../api/context';
export type Maybe<T> = T | null;
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: string;
};

export type FileSource = SourceBase & {
  __typename?: 'FileSource';
  id: Scalars['ID'];
  status: TranscodeStatus;
  duration: Scalars['Float'];
  thumbnailUrl?: Maybe<Scalars['String']>;
  width: Scalars['Int'];
  height: Scalars['Int'];
  createdAt: Scalars['Date'];
  updatedAt: Scalars['Date'];
  createdBy: Scalars['ID'];
  name: Scalars['String'];
  sourceExtension: Scalars['String'];
  sourceStatus: SourceStatus;
  error?: Maybe<Scalars['String']>;
  sourceWidth: Scalars['Int'];
  sourceHeight: Scalars['Int'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createFileSourceUpload: FileSource;
  transcodeFileSource: Scalars['Boolean'];
};

export type MutationCreateFileSourceUploadArgs = {
  fileInfo: UploadFileInfo;
};

export type MutationTranscodeFileSourceArgs = {
  sourceId: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  getFileSource?: Maybe<FileSource>;
};

export type QueryGetFileSourceArgs = {
  sourceId: Scalars['String'];
};

export type SourceBase = {
  __typename?: 'SourceBase';
  id: Scalars['ID'];
  status: TranscodeStatus;
  duration: Scalars['Float'];
  thumbnailUrl?: Maybe<Scalars['String']>;
  width: Scalars['Int'];
  height: Scalars['Int'];
  createdAt: Scalars['Date'];
  updatedAt: Scalars['Date'];
  createdBy: Scalars['ID'];
};

export enum SourceStatus {
  Uploading = 'uploading',
  Avail = 'avail',
  Deleted = 'deleted',
}

export enum TranscodeStatus {
  Pending = 'pending',
  Running = 'running',
  Success = 'success',
  Failed = 'failed',
}

export type UploadFileInfo = {
  filename: Scalars['String'];
  size: Scalars['Int'];
};

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => Promise<TResult> | TResult;

export type StitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => TResult | Promise<TResult>;

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, TParent, TContext, TArgs>;
}

export type SubscriptionResolver<
  TResult,
  TParent = {},
  TContext = {},
  TArgs = {}
> =
  | ((
      ...args: any[]
    ) => SubscriptionResolverObject<TResult, TParent, TContext, TArgs>)
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo,
) => Maybe<TTypes>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<
  TResult = {},
  TParent = {},
  TContext = {},
  TArgs = {}
> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Query: {};
  String: Scalars['String'];
  FileSource: FileSource;
  SourceBase: TranscodedSource;
  ID: Scalars['ID'];
  TranscodeStatus: TranscodeStatus;
  Float: Scalars['Float'];
  Int: Scalars['Int'];
  Date: Scalars['Date'];
  SourceStatus: SourceStatus;
  Mutation: {};
  UploadFileInfo: UploadFileInfo;
  Boolean: Scalars['Boolean'];
};

export interface DateScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export type FileSourceResolvers<
  ContextType = GqlContext,
  ParentType = ResolversTypes['FileSource']
> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['TranscodeStatus'], ParentType, ContextType>;
  duration?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  thumbnailUrl?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  width?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  height?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  createdBy?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  sourceExtension?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  sourceStatus?: Resolver<
    ResolversTypes['SourceStatus'],
    ParentType,
    ContextType
  >;
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sourceWidth?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  sourceHeight?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
};

export type MutationResolvers<
  ContextType = GqlContext,
  ParentType = ResolversTypes['Mutation']
> = {
  createFileSourceUpload?: Resolver<
    ResolversTypes['FileSource'],
    ParentType,
    ContextType,
    MutationCreateFileSourceUploadArgs
  >;
  transcodeFileSource?: Resolver<
    ResolversTypes['Boolean'],
    ParentType,
    ContextType,
    MutationTranscodeFileSourceArgs
  >;
};

export type QueryResolvers<
  ContextType = GqlContext,
  ParentType = ResolversTypes['Query']
> = {
  getFileSource?: Resolver<
    Maybe<ResolversTypes['FileSource']>,
    ParentType,
    ContextType,
    QueryGetFileSourceArgs
  >;
};

export type SourceBaseResolvers<
  ContextType = GqlContext,
  ParentType = ResolversTypes['SourceBase']
> = {
  __resolveType: TypeResolveFn<'FileSource', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['TranscodeStatus'], ParentType, ContextType>;
  duration?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  thumbnailUrl?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  width?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  height?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  createdBy?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
};

export type Resolvers<ContextType = GqlContext> = {
  Date?: GraphQLScalarType;
  FileSource?: FileSourceResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  SourceBase?: SourceBaseResolvers;
};

/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = GqlContext> = Resolvers<ContextType>;
