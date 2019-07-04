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
  Add,
  CloudUpload,
  ListAlt,
  Menu as MenuIcon,
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
            <ListItem button component={Link} to='/sources/file/upload'>
              <ListItemIcon>
                <CloudUpload />
              </ListItemIcon>
              <ListItemText
                primary='アップロード'
                secondary='動画ファイルのアップロード'
              />
            </ListItem>

            <ListItem button component={Link} to='/sources/rtmp-input'>
              <ListItemIcon>
                <Add />
              </ListItemIcon>
              <ListItemText
                primary='生配信元追加'
                secondary='RTMPソースの追加'
              />
            </ListItem>

            <ListItem button component={Link} to='/sources'>
              <ListItemIcon>
                <ListAlt />
              </ListItemIcon>
              <ListItemText>ソース一覧</ListItemText>
            </ListItem>
          </List>
        </div>
      </Drawer>
    </>
  );
};
