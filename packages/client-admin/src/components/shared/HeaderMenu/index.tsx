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
            <ListItem button component={Link} to='/encode-presets'>
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
        </div>
      </Drawer>
    </>
  );
};
