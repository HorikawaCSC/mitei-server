import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { Edit } from '@material-ui/icons';
import { PageContainer } from '@mitei/client-common';
import { Duration } from 'luxon';
import * as React from 'react';
import { TranscodeStatus } from '../../../api/generated/graphql';
import { toStringDate } from '../../../utils/datetime';
import { transcodeStatusText } from '../../../utils/sources';

type Props = {
  source: {
    status: TranscodeStatus;
    width?: number | null;
    height?: number | null;
    name: string;
    createdAt: string;
    duration?: number | null;
  };
};

export const SourceDetails = (props: Props) => {
  const { source } = props;
  return (
    <PageContainer title={`ソース: ${source.name}`}>
      <Typography>ステータス: {transcodeStatusText[source.status]}</Typography>
      <Typography>
        解像度: {source.width ? `${source.width}x${source.height}` : '不明'}
      </Typography>
      <Typography>
        長さ:{' '}
        {source.duration
          ? Duration.fromMillis(source.duration * 1000).toFormat('hh:mm:ss')
          : '不明'}
      </Typography>
      <Typography>作成日時: {toStringDate(source.createdAt)}</Typography>
      <Button color='secondary'>
        <Edit />
        <Typography component='span'>名前の変更</Typography>
      </Button>
    </PageContainer>
  );
};
