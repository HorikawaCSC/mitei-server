import CircularProgress from '@material-ui/core/CircularProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { NotFoundView } from '@mitei/client-common';
import * as React from 'react';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { useGetRecordSourcesSimpleQuery } from '../../../api/generated/graphql';
import { TotalCount } from '../../../components/shared/TotalCount';
import { recordSourceSimpleDetailString } from '../../../utils/sources';

export const RecordSourceList = () => {
  const { loading, data, error, fetchMore } = useGetRecordSourcesSimpleQuery({
    variables: { skip: 0, take: 10 },
    fetchPolicy: 'network-only',
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

  if (loading) return <CircularProgress />;

  if (!data || error) {
    return <NotFoundView error={error ? error.message : ''} />;
  }

  const { total, sources } = data.sourceList;
  const hasMore = total > sources.length;
  return (
    <>
      <TotalCount count={total} />
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
