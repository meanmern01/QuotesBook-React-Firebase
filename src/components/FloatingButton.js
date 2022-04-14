import { useState, useEffect } from "react";

import PostQuote from "./PostQuote";

import { Fab, Modal } from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles({
  main: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    display: "flex",
    alignItems: "center",
  },
  text: {
    marginRight: "10px",
  },
  modalForm: {
    display: "grid",
    placeItems: "center",
  },
});

const FloatingButton = ({ currentUser }) => {
  const classes = useStyles();

  const [offset, setOffset] = useState(0);

  useEffect(() => {
    window.onscroll = () => {
      setOffset(window.pageYOffset);
    };
  }, []);

  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const loadExpansion = (data) => {
    setOpenModal(false);
  };

  return offset >= 200 ? (
    <div className={classes.main}>
      {/* <Typography className={classes.text}>Quote something!</Typography> */}
      <Fab color="primary" onClick={handleOpenModal}>
        <EditIcon />
      </Fab>
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        className={classes.modalForm}
      >
        <PostQuote
          currentUser={currentUser}
          source={"floatingButton"}
          loadExpansion={loadExpansion}
        />
      </Modal>
    </div>
  ) : (
    <div></div>
  );
};

export default FloatingButton;
