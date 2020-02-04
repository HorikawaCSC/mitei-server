/*
 * This file is part of Mitei Server.
 * Copyright (c) 2019 f0reachARR <f0reach@f0reach.me>
 *
 * Mitei Server is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3 of the License.
 *
 * Mitei Server is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Mitei Server.  If not, see <http://www.gnu.org/licenses/>.
 */

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
import { useInView } from 'react-intersection-observer';
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
  const param = React.useMemo(
    () => ({
      channel: channelId,
      start: reqStartAt.toISO(),
      end: reqEndAt.toISO(),
    }),
    [channelId, reqStartAt, reqEndAt],
  );

  const { loading, data, error, fetchMore } = useGetScheduleListSimpleQuery({
    variables: {
      ...param,
      skip: 0,
      take: 10,
    },
    fetchPolicy: 'network-only',
  });
  const { history } = useRouter();
  const handleDateChange = React.useCallback(
    (value: unknown) => {
      const date = value as DateTime;
      history.push(`/schedules/${channelId}?day=${date.toFormat('yyyyMMdd')}`);
    },
    [channelId],
  );

  const [scrollRef, inView] = useInView();

  React.useEffect(() => {
    if (inView && !loading && data) {
      const { schedules } = data.scheduleList;
      fetchMore({
        variables: {
          skip: schedules.length,
          take: 10,
        },
        updateQuery(prev, { fetchMoreResult }) {
          if (!fetchMoreResult) return prev;
          return {
            scheduleList: {
              total: fetchMoreResult.scheduleList.total,
              schedules: [
                ...prev.scheduleList.schedules,
                ...fetchMoreResult.scheduleList.schedules,
              ],
              __typename: prev.scheduleList.__typename,
            },
          };
        },
      });
    }
  }, [inView]);

  if (loading) {
    return <CircularProgress />;
  }
  if (!data || !data.scheduleList || error) {
    return <NotFoundView error={error ? error.message : ''} />;
  }

  const { schedules, total } = data.scheduleList;
  const hasMore = total > schedules.length;
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
          {hasMore && (
            <TableRow ref={scrollRef}>
              <TableCell>Loading</TableCell>
            </TableRow>
          )}
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
