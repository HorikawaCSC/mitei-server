import CircularProgress from '@material-ui/core/CircularProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import { NotFoundView, PageContainer } from '@mitei/client-common';
import * as React from 'react';
import { useInView } from 'react-intersection-observer';
import { useGetTranscodePresetListQuery } from '../../api/generated/graphql';
import { AddPresetSection } from '../../components/presets/AddPresetSection';
import { parameterString } from '../../utils/parameter';

export const PresetsList = () => {
  const {
    data,
    error,
    loading,
    refetch,
    fetchMore,
  } = useGetTranscodePresetListQuery({
    variables: { skip: 0, take: 10 },
    fetchPolicy: 'network-only',
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

  if (loading) {
    return <CircularProgress />;
  }
  if (!data || !data.transcodePresetList || error) {
    return <NotFoundView error={error ? error.message : ''} />;
  }

  const { total, presets } = data.transcodePresetList;
  const hasMore = total > presets.length;
  return (
    <>
      <AddPresetSection refetch={refetch} />
      <PageContainer title='プリセット一覧' mini>
        <Typography>{total} 件</Typography>
        <List>
          {presets.map(preset => {
            return (
              <ListItem key={preset.id} button>
                <ListItemText
                  primary={preset.name}
                  secondary={parameterString(preset.parameter)}
                />
              </ListItem>
            );
          })}
          {hasMore && <div ref={scrollRef} />}
        </List>
      </PageContainer>
    </>
  );
};
