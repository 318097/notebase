import styled from "styled-components";
import colors from "@codedrops/react-ui";

const StyledSection = styled.section`
  margin: 40px auto;
  max-width: 275px;
  padding: 50px 15px;
  text-align: center;
  background: ${colors.bg};
  border: 1px solid ${colors.strokeOne};
  h3 {
    font-size: 1.4rem;
    text-align: center;
    margin-bottom: 30px;
  }
  button {
    margin: 5px 5px 0 0;
  }
`;

export { StyledSection };
