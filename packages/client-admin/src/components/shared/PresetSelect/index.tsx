import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { makeStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { useGetTranscodePresetListQuery } from '../../../api/generated/graphql';
import { useInView } from 'react-intersection-observer';

const useStyles = makeStyles({
  root: {
    width: 300,
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
export const PresetSelect = (props: Props) => {
  const styles = useStyles();
  const { data, loading, fetchMore } = useGetTranscodePresetListQuery({
    variables: { skip: 0, take: 10 },
    errorPolicy: 'all',
  });
  const [scrollRef, inView] = useInView();

  React.useEffect(() => {
    if (inView && !loading && data) {
      const { presets } = data.transcodePresetList;
      fetchMore({
        variables: {
          skip: presets.length,
          take: 10,
        },
        updateQuery(prev, { fetchMoreResult }) {
          if (!fetchMoreResult) return prev;
          return {
            transcodePresetList: {
              total: fetchMoreResult.transcodePresetList.total,
              presets: [
                ...prev.transcodePresetList.presets,
                ...fetchMoreResult.transcodePresetList.presets,
              ],
              __typename: prev.transcodePresetList.__typename,
            },
          };
        },
      });
    }
  }, [inView]);

  const handleChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    props.handleChange(e.target.value as string);
  };

  const total =
    data && data.transcodePresetList ? data.transcodePresetList.total : 0;
  const presets =
    data && data.transcodePresetList ? data.transcodePresetList.presets : [];
  const hasMore = total > presets.length;
  return (
    <FormControl className={styles.root} disabled={props.disabled}>
      <InputLabel htmlFor='preset'>プリセット選択</InputLabel>
      <Select
        value={props.value}
        onChange={handleChange}
        inputProps={{
          id: 'preset',
        }}
        disabled={(loading && total === 0) || props.disabled}
        MenuProps={{
          MenuListProps: {
            className: styles.list,
          },
        }}
      >
        {presets.map(({ id, name }) => (
          <MenuItem value={id} key={id}>
            {name}
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
