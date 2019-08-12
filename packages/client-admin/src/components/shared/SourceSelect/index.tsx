import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { makeStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { useInView } from 'react-intersection-observer';
import { useGetSourcesSimpleQuery } from '../../../api/generated/graphql';
import { sourceSimpleString } from '../../../utils/sources';

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
export const SourceSelect = (props: Props) => {
  const styles = useStyles();
  const { data, loading, fetchMore } = useGetSourcesSimpleQuery({
    variables: { skip: 0, take: 10 },
    errorPolicy: 'all',
  });
  const [scrollRef, inView] = useInView();

  React.useEffect(() => {
    if (inView && !loading && data) {
      const { sources } = data.sourceList;
      fetchMore({
        variables: {
          skip: sources.length,
          take: 10,
        },
        updateQuery(prev, { fetchMoreResult }) {
          if (!fetchMoreResult) return prev;
          return {
            sourceList: {
              total: fetchMoreResult.sourceList.total,
              sources: [
                ...prev.sourceList.sources,
                ...fetchMoreResult.sourceList.sources,
              ],
              __typename: prev.sourceList.__typename,
            },
          };
        },
      });
    }
  }, [inView]);

  const handleChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    props.handleChange(e.target.value as string);
  };

  const total = data && data.sourceList ? data.sourceList.total : 0;
  const sources = data && data.sourceList ? data.sourceList.sources : [];
  const hasMore = total > sources.length;
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
        {sources.map(info => (
          <MenuItem value={info.id} key={info.id}>
            <ListItemText
              primary={info.name}
              secondary={sourceSimpleString(info)}
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
