import Box from '@material-ui/core/Box';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { CheckCircle, Error } from '@material-ui/icons';
import { PageContainer } from '@mitei/client-common';
import clsx from 'clsx';
import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { GetScheduleQuery } from '../../../api/generated/graphql';
import { useCommonStyles } from '../../../styles/common';
import { dateDiffText, toStringDate } from '../../../utils/datetime';

const useStyles = makeStyles({
  invalid: {
    backgroundColor: 'rgba(255, 0, 0, .1)',
  },
  valid: {
    backgroundColor: 'rgba(0, 255, 0, .1)',
  },
});

type Props = {
  schedule: NonNullable<GetScheduleQuery['schedule']>;
};
export const ScheduleInfoSection = ({ schedule }: Props) => {
  const styles = useStyles();
  const commonStyles = useCommonStyles();

  const { startAt, endAt, channel, isValid } = schedule;
  const dateTimeText = `日時: ${toStringDate(startAt)} - ${toStringDate(
    endAt,
    'HH:mm:ss',
  )} (長さ: ${dateDiffText(endAt, startAt)})`;
  const channelUrl = `/channels/${channel.id}`;
  return (
    <PageContainer title='スケジュール詳細'>
      <Typography variant='h6'>{schedule.title}</Typography>
      <Typography>{dateTimeText}</Typography>
      <Typography>
        チャンネル:{' '}
        <Link component={RouterLink} to={channelUrl}>
          {channel.displayName}
        </Link>
      </Typography>
      <Box
        className={clsx(
          { [styles.invalid]: !isValid, [styles.valid]: isValid },
          commonStyles.centerBox,
        )}
      >
        {isValid ? <CheckCircle /> : <Error />}
        <Typography>
          {isValid ? '有効です' : '不正なスケジュールのため、放送されません'}
        </Typography>
      </Box>
    </PageContainer>
  );
};
