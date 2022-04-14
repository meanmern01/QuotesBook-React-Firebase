import React, { useState, useEffect, useMemo } from "react";
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";

import { auth } from "./firebase/config";

import Navbar from "./components/Navbar";
import Signin from "./components/Signin";
import Signup from "./components/Signup";
import ForgotPassword from "./components/ForgotPassword";
import CreateQuote from "./components/CreateQuote";
import Quotes from "./components/Quotes";
import Authors from "./components/Authors";
import Author from "./components/Author";
import RandomAuthors from "./components/RandomAuthors";
import Topics from "./components/Topics";
import FavoriteQuotes from "./components/FavoriteQuotes";
import TopicQuotes from "./components/TopicQuotes";
import GuestUser from "./components/GuestUser";
import ProfileStatus from "./components/ProfileStatus";
import FloatingButton from "./components/FloatingButton";
// import About from "./components/About";

import Translator from "./components/Translator";

import {
  makeStyles,
  ThemeProvider,
  createTheme,
} from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { blue } from "@material-ui/core/colors";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  drawer: {
    [theme.breakpoints.up("sm")]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  appBar: {
    [theme.breakpoints.up("sm")]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      display: "none",
    },
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    width: `calc(100% - ${drawerWidth}px)`,
    display: "grid",
    placeItems: "center",
  },
}));

function App() {
  const classes = useStyles();

  // Light/Dark Mode   =>   Need to fix local storage
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme"));
  let prefersDarkMode = useMediaQuery(`(prefers-color-scheme: ${darkMode})`);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          primary: blue,
          type: prefersDarkMode ? "dark" : "light",
        },
        typography: {
          fontFamily: "Quicksand",
          fontWeightLight: 400,
          fontWeightRegular: 500,
          fontWeightMedium: 600,
          fontWeightBold: 700,
        },
      }),
    [prefersDarkMode]
  );

  useEffect(() => {
    if (localStorage.getItem("theme") !== null) {
      localStorage.getItem("theme") === "dark"
        ? setDarkMode("dark")
        : setDarkMode("light");
    } else {
      setDarkMode("light");
    }
  }, []);

  const handleDarkMode = (data) => {
    if (data === true) setDarkMode("dark");
    else setDarkMode("light");
  };

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });
  }, []);

  const [authorId, setAuthorId] = useState(null);
  const handleLoadAuthorId = (data) => {
    setAuthorId(data);
  };

  const drawer = (
    <div>
      <div className={classes.toolbar} />
      <Switch>
        <Route exact path="/">
          {!currentUser ? <GuestUser /> : <RandomAuthors />}
          <Topics />
        </Route>
        <Route path={`/author/:authorId`}>
          {authorId && (
            <ProfileStatus authorId={authorId} currentUser={currentUser} />
          )}
          {!currentUser && <GuestUser />}
        </Route>
        <Route path="/authors">
          <RandomAuthors />
        </Route>
      </Switch>
      {/* <Route path="/">
        <About />
      </Route> */}
      <Translator currentUser={currentUser} />
    </div>
  );

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <div className={classes.root}>
          <CssBaseline />
          <Route path="/">
            <Navbar currentUser={currentUser} loadDarkMode={handleDarkMode} />

            <nav className={classes.drawer}>
              <Hidden xsDown implementation="css">
                <Drawer
                  classes={{
                    paper: classes.drawerPaper,
                  }}
                  variant="permanent"
                  open
                >
                  {drawer}
                </Drawer>
              </Hidden>
            </nav>
          </Route>
          <main className={classes.content}>
            <div className={classes.toolbar} />
            <Route exact path="/signin">
              <Signin />
            </Route>
            <Route exact path="/forgot-password">
              <ForgotPassword />
            </Route>
            <Route path="/signup">
              <Signup currentUser={currentUser} />
            </Route>
            <div>
              <Switch>
                <Route exact path="/">
                  {currentUser?.uid && (
                    <CreateQuote currentUser={currentUser} />
                  )}
                  <Quotes currentUser={currentUser} />
                  <FloatingButton currentUser={currentUser} />
                </Route>
                <Route path={`/author/:authorId/favorite-quotes`}>
                  <FavoriteQuotes currentUser={currentUser} />
                </Route>
                <Route path={"/quotes/:topic"}>
                  <TopicQuotes currentUser={currentUser} />
                </Route>
                <Route exact path={`/author/:authorId`}>
                  {currentUser?.uid === authorId && (
                    <CreateQuote currentUser={currentUser} />
                  )}
                  <Author
                    loadAuthorId={handleLoadAuthorId}
                    currentUser={currentUser}
                  />
                  {currentUser?.uid === authorId && <FloatingButton />}
                </Route>
                <Route path={"/authors"}>
                  <Authors />
                </Route>
              </Switch>
            </div>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
