import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase/config";

import { useTranslation } from "react-i18next";

import Quote from "./Quote";

import { Typography } from "@material-ui/core";
import { QuoteSkeleton } from "./Skeletons";

const Author = ({ currentUser, loadAuthorId }) => {
  const { authorId } = useParams();

  const [user, setUser] = useState(null);
  const [quotes, setQuotes] = useState(null);
  useEffect(() => {
    // Load authorId to App component
    authorId && loadAuthorId(authorId);

    db.collection("users")
      .doc(authorId)
      .onSnapshot((user) => {
        setUser(user.data());
      });

    db.collection("quotes")
      .orderBy("createdAt", "desc")
      .onSnapshot((quotes) => {
        let data = [];
        quotes.forEach((quote) => data.push({ ...quote.data(), id: quote.id }));
        setQuotes(data.filter((quote) => quote.uid === authorId));
      });
  }, [authorId, loadAuthorId]);

  const { t } = useTranslation();

  return !user ? (
    <div style={{ width: "100%" }}>
      {[1, 2, 3, 4].map((skeleton) => (
        <QuoteSkeleton key={skeleton} />
      ))}
    </div>
  ) : !quotes?.length ? (
    currentUser.uid ? (
      <Typography align="center" gutterBottom>
        {`
        ${user?.displayName?.split(" ")[0]}, ${t("youHaveNotCreatedAQuoteYet")}!
      `}
      </Typography>
    ) : (
      <Typography align="center" gutterBottom>
        {`
        ${user?.displayName.split(" ")[0]}, ${t("hasNotCreatedAQuoteYet")}
      `}
      </Typography>
    )
  ) : (
    <div style={{ width: "100%" }}>
      {quotes.map((doc) => (
        <Quote
          key={doc.id}
          currentUser={currentUser}
          authorId={authorId}
          quoteId={doc.id}
          quote={doc}
          quoteImage={doc.image}
          quoteAudio={doc.audio}
          topics={doc.topics}
          favoritesCount={doc.favoritesCount}
          starsCount={doc.starsCount}
          quoteCreatedAt={doc.createdAt}
        />
      ))}
    </div>
  );
};

export default Author;
