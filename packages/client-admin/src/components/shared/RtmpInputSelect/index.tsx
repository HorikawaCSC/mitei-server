import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { makeStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { useInView } from 'react-intersection-observer';
import { useGetRtmpInputListSimpleQuery } from '../../../api/generated/graphql';
import { rtmpInputSimpleString } from '../../../utils/sources';

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
  disabled?: boolean;
};
export const RtmpInputSelect = (props: Props) => {
  const styles = useStyles();
  const { data, loading, fetchMore } = useGetRtmpInputListSimpleQuery({
    variables: { skip: 0, take: 10 },
  });
  const [scrollRef, inView] = useInView();

  React.useEffect(() => {
    if (inView && !loading && data) {
      const { inputs } = data.rtmpInputList;
      fetchMore({
        variables: {
          skip: inputs.length,
          take: 10,
        },
        updateQuery(prev, { fetchMoreResult }) {
          if (!fetchMoreResult) return prev;
          return {
            rtmpInputList: {
              total: fetchMoreResult.rtmpInputList.total,
              inputs: [
                ...prev.rtmpInputList.inputs,
                ...fetchMoreResult.rtmpInputList.inputs,
              ],
              __typename: prev.rtmpInputList.__typename,
            },
          };
        },
      });
    }
  }, [inView]);

  const handleChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    props.handleChange(e.target.value as string);
  };

  const total = data && data.rtmpInputList ? data.rtmpInputList.total : 0;
  const inputs = data && data.rtmpInputList ? data.rtmpInputList.inputs : [];
  const hasMore = total > inputs.length;
  return (
    <FormControl className={styles.root} disabled={props.disabled}>
      <InputLabel htmlFor='source'>ソース選択</InputLabel>
      <Select
        value={props.value}
        onChange={handleChange}
        inputProps={{
          id: 'source',
        }}
        disabled={(loading && total === 0) || props.disabled}
        MenuProps={{
          MenuListProps: {
            className: styles.list,
          },
        }}
      >
        {inputs.map(info => (
          <MenuItem value={info.id} key={info.id}>
            <ListItemText
              primary={info.name}
              secondary={rtmpInputSimpleString(info)}
            />
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
