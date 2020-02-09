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
  AppBar,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Toolbar,
  Typography,
} from '@material-ui/core';
import {
  CalendarToday,
  ListAlt,
  Menu as MenuIcon,
  MovieCreation,
  SupervisorAccount,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import * as React from 'react';
import { Link } from 'react-router-dom';

const useStyles = makeStyles({
  list: {
    width: 350,
  },
  drawerTitle: {
    padding: '16px 8px',
  },
});

export const HeaderMenu = () => {
  const styles = useStyles();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };
  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  return (
    <>
      <AppBar>
        <Toolbar>
          <IconButton edge='start' color='inherit' onClick={handleDrawerOpen}>
            <MenuIcon />
          </IconButton>

          <Typography component='h1' variant='h6' color='inherit' noWrap>
            未定ちゃんコンソール
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer variant='temporary' open={drawerOpen} onClose={handleDrawerClose}>
        <div className={styles.list}>
          <Typography
            className={styles.drawerTitle}
            component='h1'
            variant='h6'
            color='inherit'
            noWrap
          >
            コンソール
          </Typography>

          <Divider />

          <List subheader={<ListSubheader>ソース管理</ListSubheader>}>
            <ListItem button component={Link} to='/sources'>
              <ListItemIcon>
                <ListAlt />
              </ListItemIcon>
              <ListItemText>ソース一覧</ListItemText>
            </ListItem>
            <ListItem button component={Link} to='/presets'>
              <ListItemIcon>
                <MovieCreation />
              </ListItemIcon>
              <ListItemText>エンコード設定</ListItemText>
            </ListItem>
          </List>

          <List subheader={<ListSubheader>配信管理</ListSubheader>}>
            <ListItem button component={Link} to='/channels'>
              <ListItemIcon>
                <ListAlt />
              </ListItemIcon>
              <ListItemText>チャンネル一覧</ListItemText>
            </ListItem>
            <ListItem button component={Link} to='/schedules'>
              <ListItemIcon>
                <CalendarToday />
              </ListItemIcon>
              <ListItemText>配信予定一覧</ListItemText>
            </ListItem>
          </List>

          <List subheader={<ListSubheader>サイネージ管理</ListSubheader>}>
            <ListItem button component={Link} to='/viewers/all'>
              <ListItemIcon>
                <ListAlt />
              </ListItemIcon>
              <ListItemText>サイネージ一覧</ListItemText>
            </ListItem>
          </List>

          <List subheader={<ListSubheader>ユーザ管理</ListSubheader>}>
            <ListItem button component={Link} to='/users/admin'>
              <ListItemIcon>
                <SupervisorAccount />
              </ListItemIcon>
              <ListItemText>管理者一覧</ListItemText>
            </ListItem>
          </List>
        </div>
      </Drawer>
    </>
  );
};
