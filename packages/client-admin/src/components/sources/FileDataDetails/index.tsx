import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import * as React from 'react';
import {
  GetFileSourceQuery,
  SourceStatus,
} from '../../../api/generated/graphql';
import { convertFileSize } from '../../../utils/filesize';
import { fileStatusText } from '../../../utils/sources';

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      padding: theme.spacing(3, 2),
      margin: theme.spacing(1, 0),
    },
  }),
);

export const FileDataDetails = ({
  data,
  handleProbeFile,
}: {
  data: NonNullable<GetFileSourceQuery['fileSource']>;
  handleProbeFile: () => unknown;
}) => {
  const styles = useStyles();

  const probable =
    !data.source.width && data.source.status === SourceStatus.Available;
  const fileSize = convertFileSize(data.source.fileSize);

  return (
    <Paper className={styles.paper}>
      <Typography variant='h6'>元データ</Typography>
      <Typography>ステータス: {fileStatusText[data.source.status]}</Typography>
      <Typography>
        解像度:{' '}
        {data.source.width
          ? `${data.source.width}x${data.source.height}`
          : '不明'}
      </Typography>
      <Typography>
        ファイル情報: {data.source.extension} / {fileSize}
      </Typography>
      {probable ? (
        <Button color='primary' onClick={handleProbeFile}>
          <Typography component='span'>ファイル内容の読み取り</Typography>
        </Button>
      ) : null}
    </Paper>
  );
};
