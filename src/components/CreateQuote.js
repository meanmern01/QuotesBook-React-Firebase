import { useState } from "react";

import PostQuote from "./PostQuote";

import { useTranslation } from "react-i18next";

import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CreateIcon from "@material-ui/icons/Create";
import clsx from "clsx";
import {
  Avatar,
  CardHeader,
  Collapse,
  IconButton,
  Typography,
} from "@material-ui/core";

import "./CreateQuote.css";

const useStyles = makeStyles((theme) => ({
  icon: {
    cursor: "pointer",
  },
  card: {
    width: 445,
    [theme.breakpoints.down("sm")]: {
      maxWidth: 340,
    },
    marginBottom: "20px",
  },
}));

export default function CreateQuote({ currentUser }) {
  const classes = useStyles();
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const loadExpansion = (data) => {
    setExpanded(data);
  };

  const { t } = useTranslation();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Card className={classes.card}>
        <div className="createQuote">
          <CardHeader
            avatar={
              <Avatar className={classes.avatar}>
                {currentUser ? (
                  currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName}
                      style={{
                        height: "100%",
                        width: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    currentUser.displayName?.charAt(0)
                  )
                ) : (
                  "QB"
                )}
              </Avatar>
            }
          />
          <IconButton
            className={clsx(classes.expand, {
              [classes.expandOpen]: expanded,
            })}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <Typography>{t("createQuote")}</Typography>
            <CreateIcon />
          </IconButton>
        </div>
      </Card>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <PostQuote currentUser={currentUser} loadExpansion={loadExpansion} />
      </Collapse>
    </div>
  );
}
