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
