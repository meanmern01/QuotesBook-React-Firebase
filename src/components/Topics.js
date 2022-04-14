import { Link } from "react-router-dom";

import { useTranslation } from "react-i18next";

import { AuthorSkeleton } from "./Skeletons";

// import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { Divider, List, ListItem } from "@material-ui/core";
import ListItemText from "@material-ui/core/ListItemText";

// const useStyles = makeStyles((theme) => ({
//   necessary for content to be below app bar
//   toolbar: theme.mixins.toolbar,
// }));

export default function Topics() {
  //   const classes = useStyles();

  const { t } = useTranslation();

  const topics = ["Inspirational", "Positivity", "Motivational"];

  return (
    <div>
      <Divider />
      <Typography align="center" color="textSecondary" variant="subtitle1">
        {t("topics")}
      </Typography>
      {!topics.length ? (
        [1, 2, 3, 4].map((skeleton) => <AuthorSkeleton key={skeleton} />)
      ) : (
        <List>
          {topics.map((topic) => (
            <Link
              to={`/quotes/${topic}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <ListItem button className={listItem}>
                <ListItemText primary={topic} />
              </ListItem>
            </Link>
          ))}
        </List>
      )}
      <Divider />
    </div>
  );
}
