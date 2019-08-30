import { makeStyles } from '@material-ui/core/styles';
import { HLSPlayer, PageContainer } from '@mitei/client-common';
import * as React from 'react';
import { TranscodeStatus } from '../../../api/generated/graphql';

const useStyles = makeStyles({
  video: {
    maxWidth: '100%',
    outline: 'none',
  },
});
type Props = {
  source: {
    id: string;
    status: TranscodeStatus;
  };
};

export const PreviewSection = ({ source }: Props) => {
  const sourceUrl = `/api/source/${source.id}/manifest.m3u8`;
  const styles = useStyles();

  if (source.status !== TranscodeStatus.Success) return null;

  return (
    <PageContainer title='プレビュー' mini>
      <HLSPlayer source={sourceUrl} controls className={styles.video} />
    </PageContainer>
  );
};
