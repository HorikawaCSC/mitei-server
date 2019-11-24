import { makeStyles } from '@material-ui/core/styles';
import { HLSPlayer, PageContainer } from '@mitei/client-common';
import * as React from 'react';

const useStyles = makeStyles({
  video: {
    maxWidth: '100%',
    outline: 'none',
  },
});
type Props = {
  source: string;
};

export const PreviewSection = ({ source }: Props) => {
  const styles = useStyles();

  return (
    <PageContainer title='プレビュー' mini>
      <HLSPlayer source={source} controls className={styles.video} />
    </PageContainer>
  );
};
