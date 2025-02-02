import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Register from "./components/Register";
import Login from "./components/Login";
import Notes from "./components/notes/Notes";
import NoteView from "./components/notes/NoteView";
import UploadContent from "./components/notes/UploadContent";
import Stats from "./components/Stats";

const routes = ({ isAuthenticated }) => {
  return (
    <Switch>
      <Route path="/register" exact component={Register} />
      <Route path="/login" exact component={Login} />
      <Route path="/" exact render={() => <Redirect to="/home" />} />
      <ProtectedRoute isAuthenticated={isAuthenticated}>
        <Route path="/home" exact component={Notes} />
        <Route path="/note/:id" exact component={NoteView} />
        <Route path="/upload" exact component={UploadContent} />
        <Route path="/stats" exact component={Stats} />
      </ProtectedRoute>
    </Switch>
  );
};

export default routes;
