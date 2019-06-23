import produce from 'immer';
import { Reducer } from 'redux';
import { isType } from 'typescript-fsa';
import { RootActions } from '../../../store/actions';
import { setFile } from './actions';

export interface SourcesUploadState {
  readonly sourceId: string;
  readonly fileSize: number;
  readonly uploadSize: number;
}

const initialSiate: SourcesUploadState = {
  sourceId: '',
  fileSize: 0,
  uploadSize: 0,
};

export const sourcesUpload: Reducer<SourcesUploadState, RootActions> = (
  state = initialSiate,
  action,
) =>
  produce(state, draft => {
    if (isType(action, setFile)) {
      draft.fileSize = action.payload.size;
      draft.sourceId = '';
      draft.uploadSize = 0;
    }
  });
