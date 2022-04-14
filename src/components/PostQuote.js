import { useState } from "react";

import firebase from "firebase";
import { db, firebaseStorage, increment, timeStamp } from "../firebase/config";

import { useTranslation } from "react-i18next";

import TopicSelector from "./TopicSelector";

import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import ImageIcon from "@material-ui/icons/Image";
import AudiotrackIcon from "@material-ui/icons/Audiotrack";
import AddIcon from "@material-ui/icons/Add";
import { Delete } from "@material-ui/icons";
import {
  Avatar,
  Button,
  CardContent,
  CircularProgress,
  Snackbar,
} from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert";

import "./CreateQuote.css";

const useStyles = makeStyles((theme) => ({
  icon: {
    cursor: "pointer",
  },
  card: {
    background: (props) =>
      props.source === "floatingButton" ? theme.palette.info.light : "",
    width: 445,
    [theme.breakpoints.down("sm")]: {
      maxWidth: 340,
    },
    marginBottom: "20px",
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
}));

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function PostQuote({ currentUser, source, loadExpansion }) {
  const classes = useStyles({ source });

  // Posted quote successfully - Snackbar
  const [postAlert, setPostAlert] = useState(false);

  const handlePostAlertClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setPostAlert(false);
  };

  // Topics Upload
  const [topics, setTopics] = useState([]);

  const loadTopics = (data) => {
    setTopics(data);
  };

  // Quote Upload
  const [quote, setQuote] = useState("");
  const [quoteColor, setQuoteColor] = useState("");

  // Image Upload
  const imageTypes = ["image/png", "image/jpeg"];
  const [imageError, setImageError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageProgress, setImageProgress] = useState(0);

  // onChange image input
  const handleImageChange = (e) => {
    let selected = e.target.files[0];
    if (selected && imageTypes.includes(selected.type)) {
      setImageError(null);
      setSelectedImage(selected);
    } else {
      setSelectedImage(null);
      setImageError(`${t("pleaseSelectAValidImageFile")}(png, jpeg).`);
    }
  };

  // Audio Upload
  const audioTypes = ["audio/mpeg"];
  const [audioError, setAudioError] = useState(null);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [audioProgress, setAudioProgress] = useState(0);

  // onChange audio input
  const handleAudioChange = (e) => {
    let selected = e.target.files[0];
    if (selected && audioTypes.includes(selected.type)) {
      setAudioError(null);
      setSelectedAudio(selected);
    } else {
      setSelectedAudio(null);
      setAudioError(`${t("pleaseSelectAValidAudioFile")}(mpeg).`);
    }
  };

  // Get image url from firebase storage
  async function getImageUrl() {
    return new Promise((resolve, reject) => {
      const imageStorageRef = firebaseStorage.ref(
        `images/${Date.now() + selectedImage?.name}`
      );
      // Put image to the storage
      imageStorageRef.put(selectedImage).on(
        "state_changed",
        (snap) => {
          let percentage = (snap.bytesTransferred / snap.totalBytes) * 100;
          setImageProgress(percentage);
        },
        (error) => {
          console.log(error.message);
        },
        () => {
          // Get the image download url
          imageStorageRef.getDownloadURL().then((url) => {
            resolve(url);
          });
        }
      );
    });
  }

  // Get audio url from firebase storage
  async function getAudioUrl() {
    return new Promise((resolve, reject) => {
      const audioStorageRef = firebaseStorage.ref(
        `audio/${Date.now() + selectedAudio?.name}`
      );
      audioStorageRef.put(selectedAudio).on(
        "state_changed",
        (snap) => {
          let percentage = (snap.bytesTransferred / snap.totalBytes) * 100;
          setAudioProgress(percentage);
        },
        (error) => {
          console.log(error);
        },
        () => {
          // Get the audio download url
          audioStorageRef.getDownloadURL().then((url) => {
            resolve(url);
          });
        }
      );
    });
  }
  const handleQuoteSubmit = async () => {
    if (!quote.length && !selectedImage && !selectedAudio) {
      return;
    }

    if (quote || selectedImage || selectedAudio) {
      // Put all datas to the firestore
      db.collection("quotes")
        .add({
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          text: quote ? quote : "",
          textBackgroundColor: !selectedImage ? quoteColor : "",
          image: selectedImage ? await getImageUrl() : null,
          audio: selectedAudio ? await getAudioUrl() : null,
          favoritesCount: 0,
          starsCount: 0,
          createdAt: timeStamp,
          topics,
        })
        .then((ref) => {
          // Update the user in users collection
          db.collection("users")
            .doc(currentUser.uid)
            .update({
              created: firebase.firestore.FieldValue.arrayUnion(ref.id),
              favoritedCount: 0,
              starredCount: 0,
              createdCount: increment,
            });

          // Add quote ref to topics collection
          topics.length &&
            db.collection("topics").add({
              quoteId: ref.id,
              uid: currentUser.uid,
              topics,
            });
        });
    }

    // Reset all states after submit a quote
    setQuote("");

    setTopics([]);

    setSelectedImage(null);
    setImageError(null);
    setImageProgress(0);

    setSelectedAudio(null);
    setAudioError(null);
    setAudioProgress(0);

    // Post Alert Snackbar
    setPostAlert(true);

    // Load CreateQuote Expansion false
    loadExpansion(false);
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
        <CardContent>
          <div style={{ marginBottom: "20px" }}>
            <Avatar className={classes.avatar}>
              {currentUser?.photoURL ? (
                <img
                  src={currentUser?.photoURL}
                  alt={currentUser?.displayName}
                  style={{
                    height: "100%",
                    width: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                currentUser?.displayName?.charAt(0)
              )}
            </Avatar>
          </div>
          <TopicSelector loadTopics={loadTopics} />
          <textarea
            onChange={(e) => setQuote(e.target.value)}
            value={quote}
            name="quote-text"
            id="quote-text"
            maxLength="250"
            cols="30"
            rows="5"
            placeholder={`${t("whatDoYouWantToQuoteAbout")}?`}
          ></textarea>
          {!selectedImage && (
            <div>
              <label>{t("chooseBackgroundColor")} : </label>
              <input
                onChange={(e) => setQuoteColor(e.target.value)}
                type="color"
              />
            </div>
          )}
          <div style={{ display: "flex" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <label>
                  <ImageIcon className={classes.icon} />
                  <input type="file" onChange={handleImageChange} />
                </label>
                <div onClick={() => setSelectedImage(null)}>
                  {selectedImage && (
                    <Button>
                      <div>{selectedImage.name}</div>
                      <Delete />
                    </Button>
                  )}
                </div>
              </div>
              {imageError && <div>{imageError}</div>}
              {imageProgress > 0 && (
                <CircularProgress variant="static" value={imageProgress} />
              )}
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <label>
                  <AudiotrackIcon className={classes.icon} />
                  <input type="file" onChange={handleAudioChange} />
                </label>

                <div onClick={() => setSelectedAudio(null)}>
                  {selectedAudio && (
                    <Button>
                      <div>{selectedAudio.name}</div>
                      <Delete />
                    </Button>
                  )}
                </div>
              </div>
              {audioError && <div>{audioError}</div>}
              {audioProgress > 0 && (
                <CircularProgress variant="static" value={audioProgress} />
              )}
            </div>
          </div>
          <label>
            <div
              onClick={handleQuoteSubmit}
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <input type="submit" value="Quote" style={{ padding: "0" }} />
              <Button
                variant={
                  !quote.length && !selectedImage && !selectedAudio
                    ? "disabled"
                    : "contained"
                }
                color="primary"
                size="small"
                style={{ marginTop: "8px" }}
              >
                <AddIcon className={classes.icon} />
                {t("postQuote")}
              </Button>
            </div>
          </label>
        </CardContent>
      </Card>
      <Snackbar
        open={postAlert}
        autoHideDuration={6000}
        onClose={handlePostAlertClose}
      >
        <Alert onClose={handlePostAlertClose} severity="success">
          {`${t("quotePostedSuccessfully")}!`}
        </Alert>
      </Snackbar>
    </div>
  );
}
