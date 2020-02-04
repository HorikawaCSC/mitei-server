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

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import { HLSPlayer, PageContainer } from '@mitei/client-common';
import * as React from 'react';

const useStyles = makeStyles({
  video: {
    maxWidth: '100%',
    outline: 'none',
  },
});
type Props = {
  source: string;
};

export const PreviewSection = ({ source }: Props) => {
  const styles = useStyles();
  const [show, setShow] = React.useState(false);
  const toggleShow = React.useCallback(() => setShow(!show), [show]);

  return (
    <PageContainer title='プレビュー' mini>
      <Button onClick={toggleShow}>{show ? '非表示' : '表示'}</Button>
      {show && (
        <Box>
          <HLSPlayer
            source={source}
            controls
            className={styles.video}
            autoFix
          />
        </Box>
      )}
    </PageContainer>
  );
};
