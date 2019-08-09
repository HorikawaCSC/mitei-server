import CircularProgress from '@material-ui/core/CircularProgress';
import Fab from '@material-ui/core/Fab';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import { Publish } from '@material-ui/icons';
import { useErrorSnack } from '@mitei/client-common';
import * as React from 'react';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { useGetFileSourcesSimpleQuery } from '../../../api/generated/graphql';
import { useCommonStyles } from '../../../styles/common';
import { fileSourceSimpleDetailString } from '../../../utils/sources';

export const FileSourceList = () => {
  const commonStyles = useCommonStyles();
  const { loading, data, error, fetchMore } = useGetFileSourcesSimpleQuery({
    variables: { skip: 0, take: 10 },
  });
  const openErrorMessage = useErrorSnack();
  const [scrollRef, inView] = useInView();

  React.useEffect(() => {
    if (inView && !loading && data) {
      const { sources } = data.fileSourceList;
      fetchMore({
        variables: {
          skip: sources.length,
          take: 10,
        },
        updateQuery(prev, { fetchMoreResult }) {
          if (!fetchMoreResult) return prev;
          return {
            fileSourceList: {
              total: fetchMoreResult.fileSourceList.total,
              sources: [
                ...prev.fileSourceList.sources,
                ...fetchMoreResult.fileSourceList.sources,
              ],
              __typename: prev.fileSourceList.__typename,
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

  const { total, sources } = data.fileSourceList;
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
              to={`/sources/file/${source.id}`}
            >
              <ListItemText
                primary={source.name}
                secondary={fileSourceSimpleDetailString(source)}
              />
            </ListItem>
          );
        })}
        {hasMore && <div ref={scrollRef} />}
      </List>
      <Fab
        component={Link}
        to='/sources/file/upload'
        className={commonStyles.fab}
        color='primary'
      >
        <Publish />
      </Fab>
    </>
  );
};
