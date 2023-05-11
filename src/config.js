import { getServerURL } from "@codedrops/lib";

const { REACT_APP_NODE_ENV } = process.env;

const serverType = localStorage.getItem("serverType") || "render"; // lambda|render
const config = {
  LIMIT: 25,
  SERVER_URL: getServerURL({ env: REACT_APP_NODE_ENV, serverType }),
};

export default config;
