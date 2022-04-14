import { useEffect, useState } from "react";
import { useHistory, Link as RouterLink } from "react-router-dom";

import { auth, db, facebookProvider, googleProvider } from "../firebase/config";

import { useTranslation } from "react-i18next";

import { makeStyles } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import FacebookIcon from "@material-ui/icons/Facebook";
import { MailOutline } from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  paper: {
    // marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
    cursor: "pointer",
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function Signin() {
  const classes = useStyles();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const history = useHistory();

  // Email Login
  const handleOnSubmit = (e) => {
    e.preventDefault();
    auth.signInWithEmailAndPassword(email, password).then((cred) => {
      history.push("/");
    });
  };

  // Fetch existing users
  const [existingUsers, setExistingUsers] = useState([]);

  useEffect(() => {
    db.collection("users")
      .get()
      .then((doc) => {
        let data = [];
        doc.forEach((doc) => {
          data.push(doc.data());
        });
        setExistingUsers(data);
      })
      .catch((error) => {
        console.log("Error getting document:", error);
      });
  }, []);

  // Gmail Login
  const handleLoginWithGmail = () => {
    auth
      .signInWithPopup(googleProvider)
      .then((cred) => {
        if (
          existingUsers.find(
            (existingUser) => existingUser.uid === cred.user.uid
          )
        ) {
          history.push("/");
        } else {
          db.collection("users")
            .doc(cred.user.uid)
            .set({
              displayName: cred.user.displayName,
              photoURL: cred.user.photoURL,
              favoritedCount: 0,
              starredCount: 0,
              created: [],
              createdCount: 0,
              uid: cred.user.uid,
            })
            .then(() => {
              history.push("/");
            })
            .catch((error) => console.log(error.message));
        }
      })
      .catch((error) => console.log(error.message));
  };

  // Facebook Login
  const handleLoginWithFacebook = () => {
    auth
      .signInWithPopup(facebookProvider)
      .then((cred) => {
        if (
          existingUsers.find(
            (existingUser) => existingUser.uid === cred.user.uid
          )
        ) {
          history.push("/");
        } else {
          db.collection("users")
            .doc(cred.user.uid)
            .set({
              displayName: cred.user.displayName,
              photoURL: cred.user.photoURL,
              favorited: [],
              favoritedCount: 0,
              starred: [],
              starredCount: 0,
              created: [],
              createdCount: 0,
              uid: cred.user.uid,
            })
            .then(() => {
              history.push("/");
            })
            .catch((error) => console.log(error.message));
        }
      })
      .catch((error) => console.log(error.message));
  };

  const { t } = useTranslation();

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Typography component="p">{t("signInWith")}</Typography>
          <Avatar onClick={handleLoginWithGmail} className={classes.avatar}>
            <MailOutline />
          </Avatar>
          <Avatar onClick={handleLoginWithFacebook} className={classes.avatar}>
            <FacebookIcon />
          </Avatar>
        </div>
        <Typography component="p" variant="h6">
          {t("or")}
        </Typography>
        <form className={classes.form} noValidate>
          <TextField
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label={t("emailAddress")}
            name="email"
            autoComplete="email"
            autoFocus
          />
          <TextField
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label={t("password")}
            type="password"
            id="password"
            autoComplete="current-password"
          />
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label={t("rememberMe")}
          />
          <Button
            onClick={handleOnSubmit}
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            {t("signIn")}
          </Button>
          <Grid container>
            <Grid item xs>
              <Link href="/forgot-password" variant="body2">
                {t("forgotPassword")}?
              </Link>
            </Grid>
            <Grid item>
              <RouterLink
                to="/signup"
                variant="body2"
                style={{ color: "inherit" }}
              >
                {t("newToQuotesBook")}? {t("signUp")}
              </RouterLink>
            </Grid>
          </Grid>
        </form>
      </div>
    </Container>
  );
}
