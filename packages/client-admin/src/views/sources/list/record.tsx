import CircularProgress from '@material-ui/core/CircularProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import { useErrorSnack } from '@mitei/client-common';
import * as React from 'react';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { useGetRecordSourcesSimpleQuery } from '../../../api/generated/graphql';
import { recordSourceSimpleDetailString } from '../../../utils/sources';

export const RecordSourceList = () => {
  const { loading, data, error, fetchMore } = useGetRecordSourcesSimpleQuery({
    variables: { skip: 0, take: 10 },
  });
  const openErrorMessage = useErrorSnack();
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

  if (loading) return <CircularProgress />;

  if (!data || error) {
    openErrorMessage(error ? error.message : 'ファイル一覧の取得に失敗');
    return null;
  }

  const { total, sources } = data.sourceList;
  const hasMore = total > sources.length;
  return (
    <>
      <Typography>{total} 件</Typography>
      <List>
        {sources.map(source => {
          return (
            <ListItem
              key={source.id}
              button
              component={Link}
              to={`/sources/record/${source.id}`}
            >
              <ListItemText
                primary={source.name}
                secondary={recordSourceSimpleDetailString(source)}
              />
            </ListItem>
          );
        })}
        {hasMore && <div ref={scrollRef} />}
      </List>
    </>
  );
};
