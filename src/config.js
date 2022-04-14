const dev = {
  app_url: "http://localhost:3000",
};

const prod = {
  app_url: "http://localhost:3000",
};

const config = process.env.REACT_APP_STAGE === "dev" ? dev : prod;

export default config;
