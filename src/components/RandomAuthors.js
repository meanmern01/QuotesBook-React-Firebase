import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { Link } from "react-router-dom";

import { useTranslation } from "react-i18next";

import { AuthorSkeleton } from "./Skeletons";

import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { Avatar, Divider, List, ListItem } from "@material-ui/core";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";

const useStyles = makeStyles((theme) => ({
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  listItem: {
    padding: 4,
    fontSize: "10px",
  },
  listItemIcon: {
    minWidth: "40px",
  },
  avatar: {
    width: "30px",
    height: "30px",
  },
}));

export default function RandomAuthors() {
  const classes = useStyles();

  const [randomAuthors, setRandomAuthors] = useState([]);

  useEffect(() => {
    const unsub = db
      .collection("users")
      .where("createdCount", ">=", 1)
      .orderBy("createdCount", "asc")
      .limit(8)
      .onSnapshot((users) => {
        let usersData = [];
        users.forEach((user) => {
          usersData.push(user.data());
        });
        setRandomAuthors(usersData);
      });
    return () => unsub();
  }, []);

  const { t } = useTranslation();

  return (
    <div>
      <Divider />
      <Typography align="center" color="textSecondary" variant="subtitle1">
        {t("topAuthors")}
      </Typography>
      {!randomAuthors.length ? (
        [1, 2, 3, 4].map((skeleton) => <AuthorSkeleton key={skeleton} />)
      ) : (
        <List>
          {randomAuthors.map((randomAuthor) => (
            <Link
              to={`/author/${randomAuthor.uid}`}
              style={{ textDecoration: "none", color: "inherit" }}
              key={randomAuthor.uid}
            >
              <ListItem
                button
                key={randomAuthor.uid}
                className={classes.listItem}
              >
                <ListItemIcon className={classes.listItemIcon}>
                  <Avatar className={classes.avatar}>
                    {randomAuthor.photoURL ? (
                      <img
                        src={randomAuthor.photoURL}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        alt={randomAuthor.displayName}
                      />
                    ) : (
                      randomAuthor.displayName?.charAt(0)
                    )}
                  </Avatar>
                </ListItemIcon>
                <ListItemText primary={randomAuthor.displayName} />
              </ListItem>
            </Link>
          ))}
        </List>
      )}
      <Divider />
    </div>
  );
}
