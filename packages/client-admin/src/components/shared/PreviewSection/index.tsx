import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
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
  const [show, setShow] = React.useState(false);
  const toggleShow = React.useCallback(() => setShow(!show), [show]);

  return (
    <PageContainer title='プレビュー' mini>
      <Button onClick={toggleShow}>{show ? '非表示' : '表示'}</Button>
      {show && (
        <Box>
          <HLSPlayer
            source={source}
            controls
            className={styles.video}
            autoFix
          />
        </Box>
      )}
    </PageContainer>
  );
};
