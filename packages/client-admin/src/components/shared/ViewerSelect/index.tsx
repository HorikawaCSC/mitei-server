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

import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { makeStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { useInView } from 'react-intersection-observer';
import {
  GetViewerDevicesQuery,
  useGetViewerDevicesQuery,
} from '../../../api/generated/graphql';

const useStyles = makeStyles({
  root: {
    minWidth: 300,
  },
  list: {
    maxHeight: 300,
  },
});

type Props = {
  value: string;
  handleChange: (value: string) => void;
  filterItem?: (
    value: GetViewerDevicesQuery['viewerDevices']['devices'][0],
  ) => boolean;
  disabled?: boolean;
  defaultValue?: GetViewerDevicesQuery['viewerDevices']['devices'][0] | null;
};
export const ViewerSelect = (props: Props) => {
  const styles = useStyles();
  const { data, loading, fetchMore } = useGetViewerDevicesQuery({
    variables: { skip: 0, take: 10 },
  });
  const [scrollRef, inView] = useInView();

  React.useEffect(() => {
    if (inView && !loading && data) {
      const { devices } = data.viewerDevices;
      fetchMore({
        variables: {
          skip: devices.length,
          take: 10,
        },
        updateQuery(prev, { fetchMoreResult }) {
          if (!fetchMoreResult) return prev;
          return {
            viewerDevices: {
              total: fetchMoreResult.viewerDevices.total,
              devices: [
                ...prev.viewerDevices.devices,
                ...fetchMoreResult.viewerDevices.devices,
              ],
              __typename: prev.viewerDevices.__typename,
            },
          };
        },
      });
    }
  }, [inView]);

  const handleChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    props.handleChange(e.target.value as string);
  };

  const total = React.useMemo(
    () => (data && data.viewerDevices ? data.viewerDevices.total : 0),
    [data, props.defaultValue],
  );
  const devices = React.useMemo(() => {
    const fetched =
      data && data.viewerDevices ? data.viewerDevices.devices : [];
    const defaultValue = props.defaultValue;
    if (defaultValue && !fetched.some(({ id }) => id === defaultValue.id)) {
      return [...fetched, defaultValue];
    } else {
      return fetched;
    }
  }, [data, props.defaultValue]);
  const hasMore = total > devices.length;
  return (
    <FormControl className={styles.root} disabled={props.disabled}>
      <InputLabel htmlFor='device'>サイネージ選択</InputLabel>
      <Select
        value={props.value}
        onChange={handleChange}
        inputProps={{
          id: 'device',
        }}
        disabled={(loading && total === 0) || props.disabled}
        MenuProps={{
          MenuListProps: {
            className: styles.list,
          },
        }}
      >
        {devices.filter(props.filterItem || (() => true)).map(info => (
          <MenuItem value={info.id} key={info.id}>
            <ListItemText primary={info.displayName} />
          </MenuItem>
        ))}
        {hasMore && (
          <MenuItem disabled innerRef={scrollRef}>
            Loading
          </MenuItem>
        )}
      </Select>
    </FormControl>
  );
};
