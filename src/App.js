/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, Fragment, useRef } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import axios from "axios";
import "./App.scss";
import {
  getChains,
  setKey,
  setModalMeta,
  setQuickAddModalMeta,
  fetchSession,
} from "./store/actions";
import { Loading } from "@codedrops/react-ui";
import Header from "./components/Header";
import Settings from "./components/Settings";
import AddNote from "./components/notes/AddNote";
import QuickAdd from "./components/notes/QuickAdd";
import Navigation from "./components/Navigation";
import Routes from "./routes";
import _ from "lodash";
import sessionManager from "./lib/sessionManager";
import config from "./config";

axios.defaults.baseURL = config.SERVER_URL;
axios.defaults.headers.common["authorization"] = sessionManager.getToken();
axios.defaults.headers.common["external-source"] = "NOTEBASE";

const App = ({
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
  viewNoteMeta,
  fetchSession,
}) => {
  const isAuthenticated = _.get(session, "isAuthenticated");

  const [initLoading, setInitLoading] = useState(true);
  const viewNoteMetaRef = useRef();
  const activePageRef = useRef();

  useEffect(() => {
    if (!viewNoteMeta) return;
    viewNoteMetaRef.current = viewNoteMeta;
  }, [viewNoteMeta]);

  useEffect(() => {
    const isAccountActive = async () => {
      if (sessionManager.hasToken()) {
        try {
          await fetchSession();
          await getChains();
          setActivePage();
        } catch (err) {
          console.log("Error:", err);
        } finally {
          setTimeout(() => setInitLoading(false), 100);
        }
      } else setInitLoading(false);
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
    <div className="container react-ui">
      <Navigation />
      <div className="contentWrapper">
        <Header />
        <div className="content">
          {!initLoading && (
            <Routes session={session} isAuthenticated={isAuthenticated} />
          )}
        </div>
      </div>
      {isAuthenticated && (
        <Fragment>
          {addModalVisibility && <AddNote />}
          {quickAddModalVisibility && <QuickAdd />}
          <Settings />
        </Fragment>
      )}
      {(appLoading || initLoading) && <Loading type="dot-loader" />}
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
  viewNoteMeta,
}) => ({
  session,
  settings,
  appLoading,
  quickAddModalVisibility: quickAddModalMeta.visibility,
  addModalVisibility: modalMeta.visibility,
  settingsDrawerVisibility,
  viewNoteMeta,
});

const mapActionToProps = {
  getChains,
  setKey,
  setModalMeta,
  setQuickAddModalMeta,
  fetchSession,
};

export default withRouter(connect(mapStateToProps, mapActionToProps)(App));
