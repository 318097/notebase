import React, { useState } from "react";
import { Input, Button, message } from "antd";
import { withRouter } from "react-router-dom";
import { StyledSection } from "../lib/styled";
import axios from "axios";
// import sessionManager from "../sessionManager";
// import { setSession } from "../store/actions";
// import { connect } from "react-redux";

const INITIAL_STATE = {
  name: "",
  username: "",
  password: "",
  email: "",
};

const Register = ({ history }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(INITIAL_STATE);

  const handleInput =
    (key) =>
    ({ target: { value } }) =>
      setForm((data) => ({ ...data, [key]: value }));

  const handleRegister = async () => {
    setLoading(true);
    try {
      await axios.post("/auth/register", form);
      history.push("/login");
    } catch (err) {
      const { response: { data: errorMessage = "Error." } = {} } = err;
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledSection id="register" className="curve-border-1">
      <h3>Register</h3>
      <form>
        <Input
          className="mb"
          value={form.name}
          onChange={handleInput("name")}
          placeholder="Name"
        />
        <Input
          className="mb"
          value={form.username}
          onChange={handleInput("username")}
          placeholder="Username"
        />
        <Input
          className="mb"
          value={form.email}
          onChange={handleInput("email")}
          placeholder="Email"
        />
        <Input.Password
          className="mb"
          value={form.password}
          onChange={handleInput("password")}
          placeholder="Password"
          onPressEnter={handleRegister}
        />
        <br />
        <Button onClick={handleRegister} loading={loading}>
          Register
        </Button>
      </form>
    </StyledSection>
  );
};

export default withRouter(Register);
