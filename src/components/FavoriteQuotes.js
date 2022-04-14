import { useState, useEffect } from "react";
import { useParams, withRouter } from "react-router-dom";

import { db } from "../firebase/config";

import { useTranslation } from "react-i18next";

import Quote from "./Quote";

import { Typography } from "@material-ui/core";

const Quotes = ({ currentUser }) => {
  const { authorId } = useParams();
  const [user, setUser] = useState([]);

  const [favoritedQuotes, setFavoritedQuotes] = useState([]);
  const [quotes, setQuotes] = useState([]);

  const filteredQuotes = quotes.filter((quote) =>
    favoritedQuotes.includes(quote.id)
  );

  useEffect(() => {
    // Get quoteId from author's favorit's collection
    db.collection("favorites")
      .where("uid", "==", authorId)
      .onSnapshot((snap) => {
        let data = [];
        snap.forEach((doc) => {
          data.push(doc.data().quoteId);
        });
        setFavoritedQuotes(data);
      });

    // Get all quotes
    db.collection("quotes")
      .orderBy("createdAt", "desc")
      .onSnapshot((snap) => {
        let data = [];
        snap.docs.forEach((doc) => {
          data.push({ ...doc.data(), id: doc.id });
        });
        setQuotes(data);
      });

    // Get user
    db.collection("users")
      .doc(authorId)
      .get()
      .then((doc) => {
        if (doc.exists) {
          setUser(doc.data());
        }
      })
      .catch((error) => console.error(error));
  }, [authorId]);

  const { t } = useTranslation();

  return !filteredQuotes.length ? (
    <Typography>
      {`${user.displayName} ${t("hasNotFavoritedAnyQuotesYet")}!`}
    </Typography>
  ) : (
    <div>
      {filteredQuotes.map((doc) => (
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
          quoteStars={doc.stars}
          quoteCreatedAt={doc.createdAt}
        />
      ))}
    </div>
  );
};

export default withRouter(Quotes);
