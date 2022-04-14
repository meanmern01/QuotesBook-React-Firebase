import { useEffect, useState } from "react";

import { useHistory, Link as RouterLink, Link } from "react-router-dom";

import { auth } from "../firebase/config";

import { useTranslation } from "react-i18next";

import logo from "../assets/logo.png";

import { alpha, makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import Brightness7Icon from "@material-ui/icons/Brightness7";
import IconButton from "@material-ui/core/IconButton";
import InputBase from "@material-ui/core/InputBase";
// import Badge from '@material-ui/core/Badge';
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import SearchIcon from "@material-ui/icons/Search";
import AccountCircle from "@material-ui/icons/AccountCircle";
import FormatQuoteIcon from "@material-ui/icons/FormatQuote";
import BorderColorIcon from "@material-ui/icons/BorderColor";
import MicIcon from "@material-ui/icons/Mic";
import MoreIcon from "@material-ui/icons/MoreVert";
import { Avatar } from "@material-ui/core";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  appBar: {
    [theme.breakpoints.up("sm")]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
    [theme.breakpoints.up("md")]: {
      width: `calc(100% - ${drawerWidth}px)`,
    },
  },
  grow: {
    flexGrow: 1,
  },
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    // marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(3),
      width: "auto",
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inputRoot: {
    color: "inherit",
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "20ch",
    },
  },
  sectionDesktop: {
    display: "none",
    [theme.breakpoints.up("md")]: {
      display: "flex",
    },
  },
  sectionMobile: {
    display: "flex",
    [theme.breakpoints.up("md")]: {
      display: "none",
    },
  },
}));

export default function Navbar({ currentUser, loadDarkMode }) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  // Light/Dark Mode   =>   Need to fix local storage
  const [darkMode, setDarkMode] = useState(false);

  const handleToggleDarkMode = () => {
    if (darkMode === false) {
      setDarkMode(true);
      loadDarkMode(true);
      localStorage.setItem("theme", "dark");
    } else {
      setDarkMode(false);
      localStorage.setItem("theme", "light");
      loadDarkMode(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("theme")) {
      if (localStorage.getItem("theme") === "dark") setDarkMode(true);
      else setDarkMode(false);
    }
  }, []);

  // Sign out
  const history = useHistory();
  const handleSignOut = () => {
    auth
      .signOut()
      .then(() => {
        setAnchorEl(null);
        handleMobileMenuClose();
        history.push("/signin");
      })
      .catch((error) => console.log(error));
  };

  const { t } = useTranslation();

  const menuId = "primary-search-account-menu";

  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <Link
        to={`/author/${currentUser?.uid}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <MenuItem onClick={handleMenuClose}>
          {currentUser?.displayName}
        </MenuItem>
      </Link>
      <MenuItem onClick={handleSignOut}>
        {currentUser?.uid ? `${t("signOut")}` : `${t("signIn")}`}
      </MenuItem>
    </Menu>
  );

  const mobileMenuId = "primary-search-account-menu-mobile";
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem component={RouterLink} to={"/"}>
        <IconButton aria-label="show 4 new mails" color="inherit">
          {/* <Badge badgeContent={4} color="secondary"> */}
          <FormatQuoteIcon />
          {/* </Badge> */}
        </IconButton>
        <p>{t("quotes")}</p>
      </MenuItem>
      <MenuItem component={Link} to={"/authors"}>
        <IconButton aria-label="show 11 new notifications" color="inherit">
          {/* <Badge badgeContent={11} color="secondary"> */}
          <BorderColorIcon />
          {/* </Badge> */}
        </IconButton>
        <p>{t("authors")}</p>
      </MenuItem>
      <MenuItem>
        <IconButton aria-label="show 11 new notifications" color="inherit">
          {/* <Badge badgeContent={11} color="secondary"> */}
          <MicIcon />
          {/* </Badge> */}
        </IconButton>
        <p>{t("podcasts")}</p>
      </MenuItem>
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          {!currentUser?.photoURL ? (
            <AccountCircle />
          ) : (
            <Avatar src={currentUser.photoURL} />
          )}
        </IconButton>
        <p>{t("account")}</p>
      </MenuItem>
    </Menu>
  );

  return (
    <div className={classes.grow}>
      <AppBar
        className={classes.appBar}
        color={!darkMode ? "default" : "primary"}
      >
        <Toolbar>
          <IconButton component={RouterLink} to={"/"}>
            <img src={logo} alt="logo" width="30px" />
          </IconButton>
          <div className={classes.search}>
            <div className={classes.searchIcon}>
              <SearchIcon />
            </div>
            <InputBase
              placeholder={`${t("search")}...`}
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              inputProps={{ "aria-label": "search" }}
            />
          </div>

          <div className={classes.grow} />
          <div className={classes.sectionDesktop}>
            <IconButton onClick={handleToggleDarkMode}>
              {darkMode ? <Brightness4Icon /> : <Brightness7Icon />}
            </IconButton>
            <IconButton component={RouterLink} to={"/"} color="inherit">
              {/* <Badge badgeContent={4} color="secondary"> */}
              <FormatQuoteIcon />
              {/* </Badge> */}
            </IconButton>
            <IconButton color="inherit" component={Link} to={"/authors"}>
              {/* <Badge badgeContent={17} color="secondary"> */}
              <BorderColorIcon />
              {/* </Badge> */}
            </IconButton>
            <IconButton color="inherit">
              {/* <Badge badgeContent={17} color="secondary"> */}
              <MicIcon />
              {/* </Badge> */}
            </IconButton>
            <IconButton
              edge="end"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              {!currentUser?.photoURL ? (
                <AccountCircle />
              ) : (
                <Avatar src={currentUser?.photoURL} />
              )}
            </IconButton>
          </div>
          <div className={classes.sectionMobile}>
            <IconButton onClick={handleToggleDarkMode}>
              {darkMode ? <Brightness4Icon /> : <Brightness7Icon />}
            </IconButton>
            <IconButton
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>

      {renderMobileMenu}
      {renderMenu}
    </div>
  );
}
