import { getServerURL } from "@codedrops/lib";

const { REACT_APP_NODE_ENV } = process.env;
const isProd = REACT_APP_NODE_ENV === "production";

const serverType = localStorage.getItem("serverType") || "heroku"; // lambda|heroku

const config = {
  LIMIT: 25,
  SERVER_URL: getServerURL({ isProd, serverType }),
};

export default config;
