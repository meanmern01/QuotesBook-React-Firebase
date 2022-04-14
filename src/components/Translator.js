import i18next from "i18next";

import { Button, ButtonGroup } from "@material-ui/core";

const Translator = () => {
  return (
    <ButtonGroup style={{ position: "absolute", left: "20px", bottom: "20px" }}>
      <Button
        onClick={() => {
          i18next.changeLanguage("vi");
          localStorage.setItem("language", "vi");
        }}
      >
        vi
      </Button>
      <Button
        onClick={() => {
          i18next.changeLanguage("en");
          localStorage.setItem("language", "en");
        }}
      >
        en
      </Button>
    </ButtonGroup>
  );
};

export default Translator;
