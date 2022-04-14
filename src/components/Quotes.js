import { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";

import { db } from "../firebase/config";

import { useTranslation } from "react-i18next";

import Quote from "./Quote";

import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const Quotes = ({ currentUser }) => {
  // Deleted quote successfully - Snackbar
  const [deleteAlert, setDeleteAlert] = useState(false);
  const handleDeleteAlertClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setDeleteAlert(false);
  };
  const loadDeleteAlert = (data) => {
    setDeleteAlert(data);
  };

  const [content, setContent] = useState([]);

  // TODO: Need to remove current user's favorited quotes from homepage
  const filteredContent = content;

  useEffect(() => {
    // Get quotes
    const unsub = db
      .collection("quotes")
      .orderBy("createdAt", "desc")
      .onSnapshot((snap) => {
        let data = [];
        snap.docs.forEach((doc) => {
          data.push({ ...doc.data(), id: doc.id });
        });
        setContent(data);
      });
    return () => unsub();
  }, []);

  const { t } = useTranslation();

  return !filteredContent ? (
    <h1>No quotes to display</h1>
  ) : (
    <div>
      {filteredContent.map((doc) => (
        <Quote
          key={doc.id}
          quoteId={doc.id}
          quote={doc}
          currentUser={currentUser}
          quoteImage={doc.image}
          quoteAudio={doc.audio}
          topics={doc.topics}
          favoritesCount={doc.favoritesCount}
          starsCount={doc.starsCount}
          quoteCreatedAt={doc.createdAt}
          loadDeleteAlert={loadDeleteAlert}
        />
      ))}
      <Snackbar
        open={deleteAlert}
        autoHideDuration={6000}
        onClose={handleDeleteAlertClose}
      >
        <Alert onClose={handleDeleteAlertClose} severity="error">
          {`${t("quoteDeletedSuccessfully")}!`}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default withRouter(Quotes);
