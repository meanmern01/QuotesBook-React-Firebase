import { useState, useEffect } from "react";

import { useTranslation } from "react-i18next";

import { CardActions, makeStyles } from "@material-ui/core";
import BorderColorIcon from "@material-ui/icons/BorderColor";
import {
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@material-ui/core";
import { db } from "../firebase/config";
import { Link } from "react-router-dom";
import { AuthorsSkeleton } from "./Skeletons";

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: "56ch",
    marginBottom: "10px",
    background: "transparent",
  },
}));

const Authors = () => {
  const classes = useStyles();

  const [users, setUsers] = useState();

  useEffect(() => {
    db.collection("users")
      // .where("createdCount", ">", 0)
      .orderBy("createdCount", "asc")
      .onSnapshot((snap) => {
        let data = [];
        snap.forEach((snap) => {
          data.push({ ...snap.data() });
        });
        setUsers(data);
      });
  }, []);

  const { t } = useTranslation();

  return (
    <div>
      {!users
        ? [1, 2, 3, 4].map((skeleton) => <AuthorsSkeleton />)
        : users.map((user) => (
            <Link
              to={`/author/${user.uid}`}
              style={{ color: "inherit", textDecoration: "none" }}
            >
              <List className={classes.root}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar alt={user.displayName} src={user.photoURL} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.displayName}
                    secondary={
                      <>
                        {user.favoriteQuote && (
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="textPrimary"
                            >
                              {`${t("favoriteQuote")} >> `}
                            </Typography>
                            {user.favoriteQuote}
                          </>
                        )}
                        <CardActions style={{ paddingLeft: "0" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginRight: "12px",
                            }}
                          >
                            <BorderColorIcon
                              style={{
                                fontSize: "18px",
                                marginRight: "10px",
                              }}
                            />
                            <Typography>{user.createdCount}</Typography>
                          </div>
                        </CardActions>
                      </>
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </List>
            </Link>
          ))}
    </div>
  );
};

export default Authors;
