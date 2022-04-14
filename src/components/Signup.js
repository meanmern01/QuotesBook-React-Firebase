import { useState } from "react";
import { useHistory, Link as RouterLink } from "react-router-dom";

import { auth, db } from "../firebase/config";

import { useTranslation } from "react-i18next";

import { makeStyles } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Grid from "@material-ui/core/Grid";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";

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
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function Signup() {
  const classes = useStyles();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const history = useHistory();

  // Signup with Email
  const handleOnSignup = (e) => {
    e.preventDefault();
    auth
      .createUserWithEmailAndPassword(email, password)
      .then((cred) => {
        db.collection("users")
          .doc(cred.user.uid)
          .set({
            displayName: fullName,
            photoURL: cred.user.photoURL,
            favoritedCount: 0,
            starredCount: 0,
            created: [],
            createdCount: 0,
            uid: cred.user.uid,
          })
          .then(() => {
            cred.user
              .updateProfile({ displayName: fullName })
              .then(() => {
                console.log("updated...");

                history.push("/");

                // Firebase onAuthStateChanged listener cannot be triggered by updateProfile method!
                // So window reload is a temporary solution!
                window.location.reload();
              })
              .catch((error) => console.log(error));
          });
      })
      .catch((error) => alert(error.message));
  };

  const { t } = useTranslation();

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          {t("signUp")}
        </Typography>
        <form className={classes.form} noValidate>
          <TextField
            onChange={(e) => {
              setFullName(e.target.value);
            }}
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="fullname"
            label={t("fullName")}
            name="fullname"
            autoComplete="fullname"
            autoFocus
          />
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
            onClick={handleOnSignup}
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            {t("signUp")}
          </Button>
          <Grid item>
            <RouterLink
              to="/signin"
              variant="body2"
              style={{ color: "inherit" }}
            >
              {t("alreadyHaveAnAccount")}? {t("signIn")}
            </RouterLink>
          </Grid>
        </form>
      </div>
    </Container>
  );
}
