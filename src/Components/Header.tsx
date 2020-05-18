import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import GitHubIcon from "../GitHubIcon";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme) => ({
  icon: {
    marginRight: theme.spacing(2),
  },
}));

export const Header = () => {
  const classes = useStyles();

  return (
    <AppBar position="relative">
      <Toolbar>
        <GitHubIcon className={classes.icon} viewBox="0 0 16 16" />
        <Typography variant="h6" color="inherit" noWrap>
          GitHub Release Viewer
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
