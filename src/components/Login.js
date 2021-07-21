import React, { useState, useEffect } from "react";
import { Input, Button, message } from "antd";
import { withRouter } from "react-router-dom";
import axios from "axios";
import sessionManager from "../lib/sessionManager";
import { StyledSection } from "../lib/styled";
import { setSession } from "../store/actions";
import { connect } from "react-redux";

const initialState = {
  password: "",
  username: "",
};

const Login = ({ history, setSession, session }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (session && session.loggedIn) history.push("/");
  }, []);

  const handleInput =
    (key) =>
    ({ target: { value } }) =>
      setForm((data) => ({ ...data, [key]: value }));

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post("/auth/login", form);

      sessionManager.set(data);
      await setSession({
        loggedIn: true,
        info: "LOGIN",
        ...data,
      });
      axios.defaults.headers.common["authorization"] = data.token;
      history.push("/home");
    } catch (err) {
      const { response: { data: errorMessage = "Error." } = {} } = err;
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledSection id="login" className="curve-border-1">
      <h3>Login</h3>
      <form>
        <Input
          className="mb"
          value={form.username}
          onChange={handleInput("username")}
          placeholder="Username"
        />
        <Input.Password
          className="mb"
          value={form.password}
          onChange={handleInput("password")}
          placeholder="Password"
          onPressEnter={handleLogin}
        />
        <br />
        <Button onClick={handleLogin} loading={loading}>
          Login
        </Button>

        <Button onClick={() => history.push("/register")}>Register</Button>
      </form>
    </StyledSection>
  );
};

const mapStateToProps = ({ session }) => ({
  session,
});

export default connect(mapStateToProps, { setSession })(withRouter(Login));
