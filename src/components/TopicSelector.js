/* eslint-disable no-use-before-define */
import { useState } from "react";

import { useTranslation } from "react-i18next";

import Autocomplete from "@material-ui/lab/Autocomplete";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    "& > * + *": {
      marginTop: theme.spacing(3),
    },
  },
}));

export default function TopicSelector({ loadTopics }) {
  const classes = useStyles();

  const [selectedTopics, setSelectedTopics] = useState("");
  console.log("topics", selectedTopics);
  loadTopics(selectedTopics);

  const { t } = useTranslation();

  return (
    <div className={classes.root}>
      <Autocomplete
        size="small"
        multiple
        id="tags-standard"
        options={topics}
        getOptionDisabled={(options) =>
          selectedTopics.length > 1 ? true : false
        }
        renderInput={(params) => (
          <TextField
            {...params}
            variant="standard"
            label={t("topic")}
            placeholder={t("selectUpTo2Topics")}
          />
        )}
        onChange={(e, val) => {
          setSelectedTopics(val);
        }}
      />
    </div>
  );
}

// Predefined topics by admin
const topics = ["Inspirational", "Positivity", "Motivational"];
