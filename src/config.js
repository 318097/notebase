import { getServerURL } from "@codedrops/lib";

const { REACT_APP_NODE_ENV, REACT_APP_SERVER_TYPE } = process.env;
const isProd = REACT_APP_NODE_ENV === "production";

const config = {
  LIMIT: 25,
  SERVER_URL: getServerURL({ isProd, serverType: REACT_APP_SERVER_TYPE }),
};

export default config;
