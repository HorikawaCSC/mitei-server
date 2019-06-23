import { ActionCreator, AsyncActionCreators } from 'typescript-fsa';
import * as sourcesUpload from '../features/sources/upload/actions';

// tslint:disable-next-line:no-any
type ExtractAction<A> = A extends AsyncActionCreators<any, any, any>
  ? ReturnType<A['started']> | ReturnType<A['done']> | ReturnType<A['failed']>
  : // tslint:disable-next-line:no-any
  A extends ActionCreator<any>
  ? ReturnType<A>
  : never;

// tslint:disable-next-line:no-any
type ScanActionsFromModule<M extends { [K: string]: any }> = ExtractAction<
  M[keyof M]
>;

export type RootActions = ScanActionsFromModule<typeof sourcesUpload>;
