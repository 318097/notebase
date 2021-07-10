import React, { useState, useEffect, Fragment, useRef } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import axios from "axios";
import "./App.scss";
import {
  setSession,
  getChains,
  setKey,
  setModalMeta,
  setQuickAddModalMeta,
} from "./store/actions";
import { Loading } from "@codedrops/react-ui";
import Header from "./components/Header";
import Settings from "./components/Settings";
import AddNote from "./components/notes/AddNote";
import QuickAdd from "./components/notes/QuickAdd";
import Navigation from "./components/Navigation";
import Routes from "./routes";
import _ from "lodash";
import { getToken, hasToken } from "./lib/authService";
import config from "./config";

axios.defaults.baseURL = config.SERVER_URL;
axios.defaults.headers.common["authorization"] = getToken();
axios.defaults.headers.common["external-source"] = "NOTES_APP";

const App = ({
  setSession,
  session,
  appLoading,
  quickAddModalVisibility,
  addModalVisibility,
  getChains,
  settingsDrawerVisibility,
  setKey,
  setModalMeta,
  setQuickAddModalMeta,
  history,
  activePage,
  viewNoteMeta,
}) => {
  const hasAccess = _.get(session, "loggedIn");

  const [loading, setLoading] = useState(true);
  const viewNoteMetaRef = useRef();
  const activePageRef = useRef();

  useEffect(() => {
    if (!viewNoteMeta) return;
    viewNoteMetaRef.current = viewNoteMeta;
  }, [viewNoteMeta]);

  useEffect(() => {
    const isAccountActive = async () => {
      if (hasToken()) {
        try {
          const token = getToken();
          const { data } = await axios.post(`/auth/account-status`, { token });
          setSession({ loggedIn: true, info: "ON_LOAD", ...data });
          getChains();
          setActivePage();
        } catch (err) {
          console.log("Error:", err);
        } finally {
          setTimeout(() => setLoading(false), 100);
        }
      } else setLoading(false);
    };
    isAccountActive();
    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, []);

  useEffect(() => {
    setActivePage();
  }, [
    quickAddModalVisibility,
    addModalVisibility,
    settingsDrawerVisibility,
    window.location.pathname,
  ]);

  const handleShortcut = (e) => {
    try {
      // console.log(e.code, e.target.nodeName, e.shiftKey, activePageRef);
      const { code, shiftKey, target } = e;
      const { nodeName } = target;

      if (nodeName !== "BODY" || !shiftKey) return;

      if (code === "KeyA") setModalMeta({ visibility: true });
      else if (code === "KeyQ") setQuickAddModalMeta({ visibility: true });
      else if (code === "KeyS") history.push("/stats");

      if (activePageRef.current.startsWith("note")) {
        const { nextNote, previousNote } = viewNoteMetaRef.current || {};
        if (code === "ArrowRight" && nextNote)
          history.push(`/note/${nextNote}`);
        else if (code === "ArrowLeft" && previousNote)
          history.push(`/note/${previousNote}`);
      }

      e.preventDefault();
    } catch (err) {
      console.log(err);
    }
  };

  const setActivePage = async () => {
    let activePage;

    if (quickAddModalVisibility) activePage = "quick-add";
    else if (addModalVisibility) activePage = "add";
    else if (settingsDrawerVisibility) activePage = "setting";
    else activePage = window.location.pathname.slice(1);

    activePageRef.current = activePage;
    setKey({ activePage });
  };

  return (
    <div className="container" id="react-ui">
      <Navigation />
      <div className="contentWrapper">
        <Header />
        <div className="content">
          {!loading && <Routes session={session} hasAccess={hasAccess} />}
        </div>
      </div>
      {hasAccess && (
        <Fragment>
          {addModalVisibility && <AddNote />}
          {quickAddModalVisibility && <QuickAdd />}
          <Settings />
        </Fragment>
      )}
      {(appLoading || loading) && <Loading type="dot-loader" />}
    </div>
  );
};

const mapStateToProps = ({
  session,
  settings,
  appLoading,
  quickAddModalMeta = {},
  modalMeta = {},
  settingsDrawerVisibility,
  activePage,
  viewNoteMeta,
}) => ({
  session,
  settings,
  appLoading,
  quickAddModalVisibility: quickAddModalMeta.visibility,
  addModalVisibility: modalMeta.visibility,
  settingsDrawerVisibility,
  activePage,
  viewNoteMeta,
});

const mapActionToProps = {
  setSession,
  getChains,
  setKey,
  setModalMeta,
  setQuickAddModalMeta,
};

export default withRouter(connect(mapStateToProps, mapActionToProps)(App));
