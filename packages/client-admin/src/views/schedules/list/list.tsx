import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import { Edit, Warning } from '@material-ui/icons';
import { DatePicker } from '@material-ui/pickers';
import { NotFoundView, PageContainer } from '@mitei/client-common';
import clsx from 'clsx';
import { DateTime } from 'luxon';
import * as React from 'react';
import { Link } from 'react-router-dom';
import useRouter from 'use-react-router';
import { useGetScheduleListSimpleQuery } from '../../../api/generated/graphql';
import { ProgramListSimple } from '../../../components/schedules/ProgramListSimple';
import { toStringDate } from '../../../utils/datetime';

const useStyles = makeStyles({
  invalid: {
    backgroundColor: 'rgba(255, 0, 0, .1)',
  },
});

type Props = { channelId: string; day: string | null };
export const ScheduleList = ({ channelId, day }: Props) => {
  const dayDate = day ? DateTime.fromFormat(day, 'yyyyMMdd') : DateTime.local();
  const reqStartAt = dayDate.startOf('day');
  const reqEndAt = dayDate.endOf('day');
  const styles = useStyles();
  const param = {
    channel: channelId,
    start: reqStartAt.toISO(),
    end: reqEndAt.toISO(),
  };

  const { loading, data, error } = useGetScheduleListSimpleQuery({
    variables: {
      ...param,
      skip: 0,
      take: 10,
    },
    fetchPolicy: 'network-only',
  });
  const { history } = useRouter();

  if (loading) {
    return <CircularProgress />;
  }
  if (!data || !data.scheduleList || error) {
    return <NotFoundView error={error ? error.message : ''} />;
  }

  const handleDateChange = (value: unknown) => {
    const date = value as DateTime;
    history.push(`/schedules/${channelId}?day=${date.toFormat('yyyyMMdd')}`);
  };
  const { schedules, total } = data.scheduleList;

  return (
    <PageContainer title={`スケジュール一覧`} mini>
      <DatePicker
        label='日時選択'
        value={dayDate.toJSDate()}
        onChange={handleDateChange}
        format='yyyy/MM/dd'
      />
      <Typography>{total} 件</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>日時</TableCell>
            <TableCell>タイトル</TableCell>
            <TableCell>内容</TableCell>
            <TableCell align='right'>操作</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {schedules.map(schedule => (
            <TableRow
              key={schedule.id}
              className={clsx({ [styles.invalid]: !schedule.isValid })}
            >
              <TableCell>
                <Typography>
                  {schedule.isValid || <Warning />}
                  {`${toStringDate(
                    schedule.startAt,
                    'HH:mm:ss',
                  )} - ${toStringDate(schedule.endAt, 'HH:mm:ss')}`}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography>{schedule.title}</Typography>
              </TableCell>
              <TableCell>
                <ProgramListSimple schedule={schedule} />
              </TableCell>
              <TableCell>
                <IconButton component={Link} to={`/schedules/-/${schedule.id}`}>
                  <Edit />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button
        component={Link}
        to={`/schedules/${channelId}/new`}
        variant='contained'
        color='secondary'
      >
        新規作成
      </Button>
    </PageContainer>
  );
};
