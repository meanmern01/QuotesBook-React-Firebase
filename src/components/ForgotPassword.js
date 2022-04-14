import { useState } from "react";

import { useHistory } from "react-router-dom";

import { auth } from "../firebase/config";

import { useTranslation } from "react-i18next";

import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
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

  const history = useHistory();

  const handleOnSubmit = (e) => {
    e.preventDefault();
    auth
      .sendPasswordResetEmail(email)
      .then(() => {
        alert(
          "Password reset email link sent to your email. Please check your email"
        );
        history.push("/signin");
      })
      .catch((error) => {
        console.log(error.message);
      });
  };

  const { t } = useTranslation();

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
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

          <Button
            onClick={handleOnSubmit}
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            {t("sendAResetEmailLink")}
          </Button>
        </form>
      </div>
    </Container>
  );
}
