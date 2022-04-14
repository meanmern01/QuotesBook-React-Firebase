import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { db, firebaseStorage } from "../firebase/config";

import { auth } from "../firebase/config";

import { useTranslation } from "react-i18next";

import _ from "lodash";

import { ProfileStatusSkeleton } from "./Skeletons";

import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import {
  Avatar,
  Button,
  ButtonGroup,
  CircularProgress,
  Divider,
  Grid,
  ListItem,
  ListItemIcon,
  Modal,
  Snackbar,
  TextField,
  Tooltip,
} from "@material-ui/core";
import ListItemText from "@material-ui/core/ListItemText";
import LinkedInIcon from "@material-ui/icons/LinkedIn";
import FacebookIcon from "@material-ui/icons/Facebook";
import CreateIcon from "@material-ui/icons/Create";
import StarBorderIcon from "@material-ui/icons/StarBorder";
import MuiAlert from "@material-ui/lab/Alert";

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 300,
  },
  bullet: {
    display: "inline-block",
    margin: "0 2px",
    transform: "scale(0.8)",
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
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
  large: {
    width: theme.spacing(7),
    height: theme.spacing(7),
    margin: theme.spacing(1),
    cursor: "pointer",
  },
  avatar: {
    objectFit: "cover",
  },
}));

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function ProfileStatus({ authorId, currentUser }) {
  const classes = useStyles();

  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  // Updated profile successfully - Snackbar
  const [saveAlert, setSaveAlert] = useState(false);

  const handleSaveAlertClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSaveAlert(false);
  };

  const [author, setAuthor] = useState(null);
  const [linkedinLink, setLinkedinLink] = useState("");
  const [facebookLink, setFacebookLink] = useState("");
  const [favoriteQuote, setFavoriteQuote] = useState("");
  const [fullName, setFullName] = useState("");
  const [photoURL, setPhotoURL] = useState("");

  useEffect(() => {
    db.collection("users")
      .doc(authorId)
      .onSnapshot((author) => {
        setAuthor(author.data());
        setLinkedinLink(author.data()?.linkedinLink);
        setFacebookLink(author.data()?.facebookLink);
        setFavoriteQuote(author.data()?.favoriteQuote);
        setFullName(author.data().displayName);
        setPhotoURL(author.data().photoURL);
      });
  }, [authorId]);

  // New Avatar Upload
  const avatarTypes = ["image/png", "image/jpeg"];
  const [avatarError, setAvatarError] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [avatarProgress, setAvatarProgress] = useState(0);

  // onChange Avatar input
  const handleAvatarChange = (e) => {
    let selected = e.target.files[0];
    if (selected && avatarTypes.includes(selected.type)) {
      setAvatarError(null);
      setSelectedAvatar(selected);
    } else {
      setSelectedAvatar(null);
      setAvatarError("Please select a valid image file(png, jpeg).");
    }
  };

  // Get Avatar url from firebase storage
  const getAvatarURL = async () => {
    return new Promise((resolve, reject) => {
      const photoURLRef = firebaseStorage.ref(
        `photoURL/${Date.now() + selectedAvatar.name}`
      );
      // Put avatar to the storage
      photoURLRef.put(selectedAvatar).on(
        "state_changed",
        (snap) => {
          let percentage = (snap.bytesTransferred / snap.totalBytes) * 100;
          setAvatarProgress(percentage);
        },
        (error) => {
          console.log("error: ", error.message);
        },
        () => {
          // Get the avatar download url
          photoURLRef.getDownloadURL().then((url) => {
            resolve(url);
          });
        }
      );
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const batch = db.batch();

    // update userProfile
    auth.currentUser
      .updateProfile({
        photoURL: selectedAvatar ? await getAvatarURL() : photoURL,
        displayName: fullName,
      })
      .then(async () => {
        // Batch

        // Update a user in 'users' collection
        const userRef = db.collection("users").doc(currentUser.uid);
        batch.update(userRef, {
          displayName: auth.currentUser.displayName,
          photoURL: auth.currentUser.photoURL,
          linkedinLink: linkedinLink ? linkedinLink : "",
          facebookLink: facebookLink ? facebookLink : "",
          favoriteQuote: favoriteQuote ? favoriteQuote : "",
        });

        // Update quotes in 'quotes' collection
        const quotesRef = db
          .collection("quotes")
          .where("uid", "==", currentUser.uid)
          .get();
        const batches = _.chunk((await quotesRef).docs, 500).map((quotes) =>
          quotes.forEach((quote) => {
            batch.update(quote.ref, {
              displayName: auth.currentUser.displayName,
              photoURL: auth.currentUser.photoURL,
            });
          })
        );

        await Promise.all(batches);

        await batch
          .commit()
          .then(() => {
            console.log("batch write successfull!");
          })
          .catch((e) => console.log("error while batch update ", e));

        // Delete old Avatar
        selectedAvatar &&
          firebaseStorage
            .refFromURL(currentUser.photoURL)
            .delete()
            .then(() => console.log("Old Avatar deleted successfully!"))
            .catch((error) =>
              console.log("Error deleting old Avatar: ", error)
            );

        setAvatarProgress(0);
        handleCloseModal();
        // setTimeout(() => window.location.reload(), 2000);
      });
    setSaveAlert(true);
  };

  const { t } = useTranslation();

  return !author ? (
    <ProfileStatusSkeleton />
  ) : (
    <div>
      <Divider />
      <ListItem
        component={Link}
        to={`/author/${author.uid}`}
        button
        key={author.uid}
      >
        <ListItemIcon>
          <Avatar>
            {author.photoURL ? (
              <img
                src={author.photoURL}
                style={{
                  height: "100%",
                  width: "100%",
                  objectFit: "cover",
                }}
                alt={author.displayName}
              />
            ) : (
              author.displayName?.charAt(0)
            )}
          </Avatar>
        </ListItemIcon>
        <ListItemText primary={author.displayName} />
      </ListItem>
      <ListItem>
        <LinkedInIcon
          onClick={() =>
            window.open(
              linkedinLink
                ? `https://${author.linkedinLink}`
                : "http://linkedin.com"
            )
          }
        />
        <FacebookIcon
          onClick={() =>
            window.open(
              facebookLink
                ? `https://${author.facebookLink}`
                : "http://facebook.com"
            )
          }
        />
      </ListItem>
      <ListItem>
        <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <CreateIcon />
            <span>{author.created?.length}</span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <StarBorderIcon />
            <span>{author.starred?.length}</span>
          </div>
        </div>
      </ListItem>
      <ListItem button divider>
        <Typography
          component={Link}
          to={`/author/${authorId}/favorite-quotes`}
          style={{ textDecoration: "none" }}
          color="inherit"
        >{`${t("favoriteQuotes")} (${author.favoritedCount})`}</Typography>
      </ListItem>
      {currentUser.uid === authorId && (
        <ListItem button autoFocus onClick={handleOpenModal}>
          <Typography>{t("editProfile")}</Typography>
        </ListItem>
      )}
      <Modal open={openModal} onClose={handleCloseModal}>
        <form
          className={classes.modalForm}
          noValidate
          autoComplete="off"
          onSubmit={handleSave}
        >
          <label style={{ display: "flex", alignItems: "center" }}>
            <Tooltip title={t("editYourAvatar")} placement="right-end">
              <Avatar
                src={
                  selectedAvatar
                    ? URL.createObjectURL(selectedAvatar)
                    : auth.currentUser?.photoURL
                }
                variant="square"
                className={classes.large}
              />
            </Tooltip>
            <input type="file" onChange={handleAvatarChange} />

            {avatarProgress > 0 && (
              <CircularProgress variant="static" value={avatarProgress} />
            )}
          </label>
          {avatarError && <div>{avatarError}</div>}

          <TextField
            onChange={(e) => {
              setFullName(e.target.value);
            }}
            defaultValue={currentUser.displayName}
            label={t("fullName")}
          />
          <TextField
            onChange={(e) => {
              setFavoriteQuote(e.target.value);
            }}
            defaultValue={favoriteQuote}
            label={t("favoriteQuote")}
          />
          <div className={classes.margin}>
            <Grid container spacing={1} alignItems="flex-end">
              <Grid item>
                <LinkedInIcon />
              </Grid>
              <Grid item>
                <TextField
                  onChange={(e) => {
                    setLinkedinLink(e.target.value);
                  }}
                  defaultValue={linkedinLink}
                  label={`Linkedin ${t("link")}`}
                />
              </Grid>
            </Grid>
          </div>
          <div className={classes.margin}>
            <Grid container spacing={1} alignItems="flex-end">
              <Grid item>
                <FacebookIcon />
              </Grid>
              <Grid item>
                <TextField
                  onChange={(e) => {
                    setFacebookLink(e.target.value);
                  }}
                  defaultValue={facebookLink}
                  label={`Facebook ${t("link")}`}
                />
              </Grid>
            </Grid>
          </div>

          <ButtonGroup>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="small"
            >
              {t("save")}
            </Button>
            <Button
              onClick={handleCloseModal}
              variant="contained"
              color="primary"
              size="small"
            >
              {t("cancel")}
            </Button>
          </ButtonGroup>
        </form>
      </Modal>
      <Snackbar
        open={saveAlert}
        autoHideDuration={6000}
        onClose={handleSaveAlertClose}
      >
        <Alert onClose={handleSaveAlertClose} severity="success">
          {`${t("profileUpdatedSuccessfully")}!`}
        </Alert>
      </Snackbar>
    </div>
  );
}
