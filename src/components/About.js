import { useTranslation } from "react-i18next";

// import { AuthorSkeleton } from "./Skeletons";

import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { Button, Divider, Grid } from "@material-ui/core";

// const useStyles = makeStyles((theme) => ({
//   // necessary for content to be below app bar
//   toolbar: theme.mixins.toolbar,
// }));

export default function About() {
  //   const classes = useStyles();

  const { t } = useTranslation();

  //   const array = ["About", "Contact", "Terms", "Privacy Policy", "Disclaimer"];
  return (
    <div style={{ position: "absolute", bottom: "80px" }}>
      <Divider />
      <Typography align="center" color="textSecondary" variant="subtitle1">
        {t("quotesBook")}
      </Typography>

      <Grid container spacing={1} justifyContent="center">
        {/* {array.map((gridItem) => (
          <Grid item xs={4}>
            <Button>{gridItem}</Button>
          </Grid>
        ))} */}
        <Grid item xs={4}>
          <Button>About</Button>
        </Grid>
        <Grid item xs={4}>
          <Button>Contact</Button>
        </Grid>
        <Grid item xs={4}>
          <Button>Terms</Button>
        </Grid>
        <Grid item xs={7}>
          <Button>Privacy Policy</Button>
        </Grid>
        <Grid item xs={5}>
          <Button>Disclaimer</Button>
        </Grid>
      </Grid>

      <Divider />
    </div>
  );
}
