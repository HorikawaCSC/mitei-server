import actionCreatorFactory from 'typescript-fsa';

const actionCreator = actionCreatorFactory('Sources/Upload');

export const setUploadedSize = actionCreator<number>('SET_UPLOADED_SIZE');
export const setFile = actionCreator<File>('SET_FILE');
