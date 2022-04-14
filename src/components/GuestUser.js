import { Link } from "react-router-dom";

import { useTranslation } from "react-i18next";

import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import { Divider, ListItem, ListItemText } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 300,
  },
  bullet: {
    display: "inline-block",
    margin: "0 2px",
    transform: "scale(0.8)",
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
}));

export default function GuestUser() {
  const classes = useStyles();

  const { t } = useTranslation();
  return (
    <div>
      <div className={classes.toolbar} />
      <Divider />
      <ListItem>
        <ListItemText>
          {t("youAreUnique")}. <br />
          <Link to="/signin" style={{ color: "inherit" }}>
            {t("signIn")}
          </Link>{" "}
          {t("toCreateYourAwesomeQuotes")}.
        </ListItemText>
      </ListItem>
      <ListItem>
        <Button variant="contained" color="primary" size="small">
          {t("share")}
        </Button>
      </ListItem>
    </div>
  );
}
