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

import CircularProgress from '@material-ui/core/CircularProgress';
import { NotFoundView, routes } from '@mitei/client-common';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import {
  TranscodeStatus,
  useGetRecordSourceQuery,
} from '../../../api/generated/graphql';
import { PreviewSection } from '../../../components/shared/PreviewSection';
import { SourceDetails } from '../../../components/sources/SourceDetails';

export const RecordSourceDetails = ({
  match,
}: RouteComponentProps<{ id: string }>) => {
  const sourceId = match.params.id;
  const { data, loading, error } = useGetRecordSourceQuery({
    variables: { id: sourceId },
    fetchPolicy: 'network-only',
  });

  if (loading) {
    return <CircularProgress />;
  }
  if (
    !data ||
    !data.source ||
    data.source.__typename !== 'RecordSource' ||
    error
  ) {
    return <NotFoundView error={error ? error.message : ''} />;
  }

  const { source } = data;

  return (
    <>
      <SourceDetails source={source} />
      {(source.status === TranscodeStatus.Success ||
        source.status === TranscodeStatus.Running) && (
        <PreviewSection source={routes.media.source(source.id)} />
      )}
    </>
  );
};
