import { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import config from "../config";

import _ from "lodash";

import { db, decrement, firebaseStorage, increment } from "../firebase/config";
import firebase from "firebase";

import { useTranslation } from "react-i18next";

import { QuoteSkeleton } from "./Skeletons";
import {
  FacebookIcon,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton,
} from "react-share";

import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import FavoriteIcon from "@material-ui/icons/Favorite";
import StarIcon from "@material-ui/icons/Star";
import ShareIcon from "@material-ui/icons/Share";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { Button, CardMedia, Chip, Modal } from "@material-ui/core";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Fade from "@material-ui/core/Fade";
import { Equalizer } from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  root: {
    width: 445,
    [theme.breakpoints.down("sm")]: {
      maxWidth: 340,
    },
    marginBottom: "20px",
    textAlign: "left",
  },
  media: {
    width: "100%",
    margin: "0 auto",
    paddingTop: "56.25%", // 16:9
  },
  audio: {
    marginTop: "10px",
  },
  equalizer: {
    cursor: "pointer",
    float: "right",
  },
  textBackground: {
    width: "100%",
    height: "200px",
    display: "grid",
    placeItems: "center",
    padding: "20px",
  },
  modalForm: {
    "& > *": {
      margin: theme.spacing(1),
      // width: "25ch",
    },
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: theme.palette.info.light,
    padding: "50px",
  },
  chip: {
    marginRight: "5px",
  },
}));

export default function Quote({
  currentUser,
  quote,
  quoteImage,
  quoteAudio,
  topics,
  favoritesCount,
  starsCount,
  quoteId,
  quoteCreatedAt,
  loadDeleteAlert,
}) {
  const classes = useStyles();
  const history = useHistory();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const [signInModal, setSignInModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [shareModal, setShareModal] = useState(false);

  // Delete Quote from firestore & files from firebase storage
  const handleDelete = async () => {
    // callable function test <----------Working fine
    // const deleteQuote = firebase.functions().httpsCallable("deleteQuote");
    // deleteQuote({ uid: currentUser.uid, quoteId }).then((result) => {
    //   console.log(result);
    // });

    const batch = db.batch();
    // Delete quote from quotes collection
    const quoteRef = db.collection("quotes").doc(quoteId);
    batch.delete(quoteRef);

    // Remove created quoteId and Decrese createdCount of currentUser
    const userRef = db.collection("users").doc(currentUser.uid);
    batch.update(userRef, {
      created: firebase.firestore.FieldValue.arrayRemove(quoteId),
      createdCount: decrement,
    });

    // Remove from favorites collection
    // Decrese favoritedCount from current and other users
    db.collection("favorites")
      .where("quoteId", "==", quoteId)
      .get()
      .then((doc) => {
        doc.forEach((quote) => {
          db.collection("users").doc(quote.data().uid).update({
            favoritedCount: decrement,
          });
          quote.ref.delete();
        });
      });

    // Remove from stars collection
    // Decrese starredCount from current and other users
    db.collection("stars")
      .where("quoteId", "==", quoteId)
      .get()
      .then((doc) => {
        doc.forEach((quote) => {
          db.collection("users").doc(quote.data().uid).update({
            starredCount: decrement,
          });
          quote.ref.delete();
        });
      });

    // Remove from topics collection
    const topicRef = db
      .collection("topics")
      .where("quoteId", "==", quoteId)
      .get();
    const batches = _.chunk((await topicRef).docs, 500).forEach((topics) => {
      topics.forEach((topic) => {
        batch.delete(topic.ref);
      });
    });

    await Promise.all(batches);

    await batch
      .commit()
      .then(() => {
        console.log("batch delete successfull!");
        loadDeleteAlert(true);
      })
      .catch((error) => console.log("error while batch delete ", error));

    // Delete image from firebase storage
    quoteImage &&
      firebaseStorage
        .refFromURL(quoteImage)
        .delete()
        .then(() => {
          console.log("Image successfully deleted!");
        })
        .catch((error) => {
          console.error("Error removing image: ", error);
        });

    // Delete audio from firebase storage
    quoteAudio &&
      firebaseStorage
        .refFromURL(quoteAudio)
        .delete()
        .then(() => {
          console.log("Audio successfully deleted!");
        })
        .catch((error) => {
          console.error("Error removing audio: ", error);
        });
  };

  // Favorite
  const [favoritedQuotes, setFavoritedQuotes] = useState([]);

  useEffect(() => {
    currentUser &&
      db
        .collection("favorites")
        .where("uid", "==", currentUser?.uid)
        .where("quoteId", "==", quoteId)
        .onSnapshot((snap) => {
          let data = [];
          snap.forEach((doc) => {
            data.push({ ...doc.data(), id: doc.id });
          });
          setFavoritedQuotes(data);
        });
  }, [currentUser, quoteId]);

  // Check whether currentUser has already favorited the quote
  const [isFavorited, setIsFavorited] = useState(false);
  useEffect(() => {
    if (
      favoritedQuotes.find(
        (favoritedUser) => favoritedUser.uid === currentUser?.uid
      )
    ) {
      setIsFavorited(true);
    }
  }, [favoritedQuotes, currentUser?.uid]);

  const handleFavoriteClick = () => {
    if (!currentUser) {
      setSignInModal(true);
      return;
    }
    setIsFavorited(!isFavorited);

    const foundUser = favoritedQuotes.find(
      (quote) => quote.quoteId === quoteId
    );
    if (foundUser) {
      db.collection("favorites")
        .doc(foundUser.id)
        .delete()
        .then((doc) => {
          db.collection("users").doc(currentUser.uid).update({
            favoritedCount: decrement,
          });
          db.collection("quotes").doc(quoteId).update({
            favoritesCount: decrement,
          });
        });
    } else {
      db.collection("favorites")
        .add({
          uid: currentUser.uid,
          quoteId: quoteId,
        })
        .then((doc) => {
          db.collection("users").doc(currentUser.uid).update({
            favoritedCount: increment,
          });
          db.collection("quotes").doc(quoteId).update({
            favoritesCount: increment,
          });
        });
    }
  };

  // Star
  const [starredQuotes, setStarredQuotes] = useState([]);
  useEffect(() => {
    currentUser &&
      db
        .collection("stars")
        .where("uid", "==", currentUser?.uid)
        .where("quoteId", "==", quoteId)
        .onSnapshot((snap) => {
          let data = [];
          snap.forEach((doc) => {
            data.push({ ...doc.data(), id: doc.id });
          });
          setStarredQuotes(data);
        });
  }, [currentUser, quoteId]);

  // Check whether currentUser has already starred the quote
  const [isStarred, setIsStarred] = useState(false);
  useEffect(() => {
    if (
      starredQuotes.find(
        (starredQuote) => starredQuote.uid === currentUser?.uid
      )
    ) {
      setIsStarred(true);
    }
  }, [starredQuotes, currentUser?.uid]);

  const handleStarClick = () => {
    if (!currentUser) {
      setSignInModal(true);
      return;
    }
    setIsStarred(!isStarred);

    const foundUser = starredQuotes.find((quote) => quote.quoteId === quoteId);
    if (foundUser) {
      db.collection("stars")
        .doc(foundUser.id)
        .delete()
        .then((doc) => {
          db.collection("users").doc(currentUser.uid).update({
            starredCount: decrement,
          });
          db.collection("quotes").doc(quoteId).update({
            starsCount: decrement,
          });
        });
    } else {
      db.collection("stars")
        .add({
          uid: currentUser.uid,
          quoteId: quoteId,
        })
        .then((doc) => {
          db.collection("users").doc(currentUser.uid).update({
            starredCount: increment,
          });
          db.collection("quotes").doc(quoteId).update({
            starsCount: increment,
          });
        });
    }
  };

  // Text color
  // var darkOrLight = (red, green, blue) => {
  //   var brightness;
  //   brightness = red * 299 + green * 587 + blue * 114;
  //   brightness = brightness / 255000;

  //   // values range from 0 to 1
  //   // anything greater than 0.5 should be bright enough for dark text
  //   if (brightness >= 0.5) {
  //     return "black";
  //   } else {
  //     return "white";
  //   }
  // };

  // Text-To-Speech

  // Initialize new SpeechSynthesisUtterance object
  let speech = new SpeechSynthesisUtterance();

  const handleSpeech = () => {
    // Set the text property with the value of the textarea
    speech.text = quote.text;

    // Start Speaking
    window.speechSynthesis.speak(speech);
  };

  const { t } = useTranslation();

  return !quoteId ? (
    <QuoteSkeleton />
  ) : (
    <div>
      <Card className={classes.root} id={quoteId}>
        <CardHeader
          avatar={
            <Link
              to={`/author/${quote.uid}`}
              style={{ textDecoration: "none" }}
            >
              <Avatar className={classes.avatar}>
                {quote ? (
                  <img
                    src={quote.photoURL}
                    alt={quote.displayName}
                    style={{
                      height: "100%",
                      width: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  "QB"
                )}
              </Avatar>
            </Link>
          }
          action={
            currentUser?.uid === quote?.uid ? (
              <IconButton>
                <MoreVertIcon
                  aria-controls="fade-menu"
                  aria-haspopup="true"
                  onClick={handleClick}
                />

                <Menu
                  id="fade-menu"
                  anchorEl={anchorEl}
                  keepMounted
                  open={open}
                  onClose={handleClose}
                  TransitionComponent={Fade}
                >
                  <MenuItem
                    onClick={() => {
                      setDeleteModal(true);
                    }}
                  >
                    {t("delete")}
                  </MenuItem>
                  <Modal
                    open={deleteModal}
                    onClose={() => setDeleteModal(false)}
                  >
                    <div className={classes.modalForm}>
                      <Typography gutterBottom>
                        {t("areYouSureYouWantToDeleteThisQuote")}?
                      </Typography>
                      <Button
                        type="button"
                        onClick={handleDelete}
                        variant="contained"
                        color="secondary"
                      >
                        {t("delete")}
                      </Button>
                    </div>
                  </Modal>
                </Menu>
              </IconButton>
            ) : null
          }
          title={`${quote.displayName?.split(" ")[0]} ${
            quote.displayName?.split(" ")[1]
              ? quote.displayName.split(" ")[1]?.charAt(0)
              : ""
          }`}
          subheader={new Date(quoteCreatedAt?.seconds * 1000).toDateString()}
        />
        <CardContent>
          {quote.text && (
            <Equalizer className={classes.equalizer} onClick={handleSpeech} />
          )}
          {quote.image ? (
            <Typography variant="body2" color="textSecondary" component="p">
              {quote.text}
            </Typography>
          ) : (
            <div
              className={classes.textBackground}
              style={{
                backgroundColor: `${quote.textBackgroundColor}`,
              }}
            >
              <Typography
                align="center"
                variant="subtitle2"
                color="textSecondary"
                // style={{
                //   color: { darkOrLight },
                // }}
              >
                {quote.text}
              </Typography>
            </div>
          )}
        </CardContent>
        {quote.image ? (
          <CardMedia className={classes.media} image={quote.image} />
        ) : (
          ""
        )}
        <div style={{ padding: "0 16px" }}>
          {quote.audio && (
            <audio className={classes.audio} controls src={quote.audio} />
          )}{" "}
        </div>
        <br />
        <div style={{ padding: "0 16px" }}>
          {topics && topics.length
            ? topics.map((topic) => (
                <Link
                  to={`/quotes/${topic}`}
                  style={{ textDecoration: "none" }}
                >
                  <Chip className={classes.chip} label={topic} size="small" />
                </Link>
              ))
            : ""}
        </div>
        <CardActions disableSpacing>
          <IconButton onClick={handleFavoriteClick}>
            <FavoriteIcon style={{ color: isFavorited && "red" }} />
          </IconButton>
          <span>{favoritesCount}</span>
          <Modal open={signInModal} onClose={() => setSignInModal(false)}>
            <div className={classes.modalForm}>
              <Typography gutterBottom>{t("signInToUseTheApp")}!</Typography>

              <Button
                onClick={() => history.push("/signin")}
                variant="contained"
                color="secondary"
              >
                {t("signIn")}
              </Button>
            </div>
          </Modal>
          <IconButton>
            <StarIcon
              onClick={handleStarClick}
              style={{ color: isStarred && "gold" }}
            />
          </IconButton>
          <span>{starsCount}</span>
          <IconButton>
            <ShareIcon
              onClick={() => {
                setShareModal(true);
              }}
            />
          </IconButton>
          <Modal open={shareModal} onClose={() => setShareModal(false)}>
            <div style={{ position: "absolute", top: "45vh", left: "45vw" }}>
              <FacebookShareButton
                url={`${config.app_url}/#${quoteId}`}
                quote={quote.text}
              >
                <FacebookIcon />
              </FacebookShareButton>
              <LinkedinShareButton url={`${config.app_url}/#${quoteId}`}>
                <LinkedinIcon />
              </LinkedinShareButton>
            </div>
          </Modal>
        </CardActions>
      </Card>
    </div>
  );
}
