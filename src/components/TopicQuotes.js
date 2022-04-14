import { useState, useEffect } from "react";
import { useParams, withRouter } from "react-router-dom";

import { db } from "../firebase/config";

import { useTranslation } from "react-i18next";

import Quote from "./Quote";

import { Typography } from "@material-ui/core";

const Quotes = ({ currentUser }) => {
  const topic = useParams();

  const [quotes, setQuotes] = useState([]);

  const [quoteIds, setQuoteIds] = useState([]);

  const filteredQuotes = quotes.filter((quote) => quoteIds.includes(quote.id));

  useEffect(() => {
    // Get quoteIds of topic
    db.collection("topics")
      .where("topics", "array-contains", topic.topic)
      .onSnapshot((snap) => {
        let data = [];
        snap.forEach((doc) => {
          data.push(doc.data().quoteId);
        });
        setQuoteIds(data);
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
  }, [topic]);

  const { t } = useTranslation();

  return !filteredQuotes.length ? (
    <Typography>{`${t("noQuotesToDisplay")}!`}</Typography>
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
