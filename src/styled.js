import { Icon } from 'antd';
import styled from 'styled-components';

const StyledIcon = styled(Icon)`
margin: 0 3px;
transition: .6s;
background: #e6e3e3;
border-radius: 50%;
padding: 5px;
  &:hover{
    background: lightgrey;
    transform: scale(1.1);
  }
`

const ProfileIcon = styled.div`
margin: 0 3px;
padding: 0;
cursor: pointer;
transition: .6s;
height: 24px;
width: 24px;
display: inline-block;
overflow: hidden;
border-radius: 50%;
position: absolute;
right: -8px;
  img{
    width: 100%;
  }
`

const StyledSection = styled.section`
margin: 0 auto;
max-width: 350px;
padding: 20px;
background: white;
border-radius: 5px;
border: 1px solid lightgrey;
box-shadow: 3px 3px 3px lightgrey;
position: relative;
top: 50px;
h3{
  text-align: center;
  font-weight: bold;
  font-family: LuckiestGuy;
  text-decoration: underline;
}
button{
  margin: 5px 5px 0 0;
}
`
const MessageWrapper = styled.div`
  font-size: 40px;
  text-align: center;
  color: lightgrey;
  font-weight: bold;
  text-transform: uppercase;
  font-family: LuckiestGuy;
`

export { StyledIcon, ProfileIcon, StyledSection, MessageWrapper };