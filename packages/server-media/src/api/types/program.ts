import { ProgramType, RtmpInput, TranscodedSource } from '@mitei/server-models';
import { ProgramResolvers } from '../../generated/graphql';

export const programResolvers: ProgramResolvers = {
  // @ts-ignore
  source: async parent => {
    if (parent.type === ProgramType.Empty) {
      return null;
    } else if (parent.type === ProgramType.Rtmp && parent.sourceId) {
      return await RtmpInput.findById(parent.sourceId);
    } else if (parent.type === ProgramType.Transcoded && parent.sourceId) {
      return await TranscodedSource.findById(parent.sourceId);
    } else {
      throw new Error('invalid source');
    }
  },
};
