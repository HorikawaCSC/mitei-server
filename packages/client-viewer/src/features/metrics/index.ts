import {
  ReportMetricsDocument,
  ViewerMetricsParam,
  ViewerMetricsType,
} from '../../api/generated/graphql';
import { apolloClient } from '../../utils/gql-client';

const report = async (data: ViewerMetricsParam) => {
  const result = await apolloClient.mutate({
    mutation: ReportMetricsDocument,
    errorPolicy: 'all',
    variables: {
      data,
    },
  });
  return !result.errors || result.errors.length === 0;
};

export const metricsReporter = {
  ping: () =>
    report({
      type: ViewerMetricsType.Ping,
    }),
  elapsed: (elapsed: number) =>
    report({
      type: ViewerMetricsType.Elapsed,
      elapsed,
    }),
  error: (message: string) =>
    report({
      type: ViewerMetricsType.Error,
      message,
    }),
  ended: () =>
    report({
      type: ViewerMetricsType.Ended,
    }),
};
