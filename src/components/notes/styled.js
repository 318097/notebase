import styled from "styled-components";
import colors from "@codedrops/react-ui";
import { fadeInDownAnimation } from "../../lib/animations";

const StyledNoteCard = styled.div`
  height: ${(props) => (props.onlyTitleAndURL ? "180px" : "300px")};
  max-height: ${(props) => (props.onlyTitleAndURL ? "180px" : "300px")};
  display: flex;
  flex-direction: column;
  /* break-inside: avoid-column; */
  .card,
  .action-row {
    border: 1px solid ${colors.bg};
    box-shadow: ${colors.bg} 3px 3px 3px;
    position: relative;
    width: 100%;
    min-height: unset;
    overflow: visible;
    &:hover {
      background: ${colors.featherDark};
    }
  }
  .card {
    flex: 1 1 auto;
    overflow: hidden;
    margin: 0 0 2px 0;
    cursor: pointer;
    font-size: 1rem;
    padding: 24px 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .title {
      font-size: 1.2rem;
      text-align: center;
    }
    .post-title {
      font-size: 1.6rem;
    }
    .content {
      font-size: inherit;
      width: 100%;
      margin-top: 8px;
      overflow-x: auto;
      padding: 0;
      pre,
      code {
        font-size: 1rem;
      }
    }
  }
  .card.today,
  .action-row.today {
    background: ${colors.feather};
  }
  .action-row {
    padding: 6px;
    top: 0px;
    flex: 0 0 auto;
    &:hover {
      background: ${colors.white};
    }
    .status-row {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .status-tag {
        text-transform: capitalize;
      }
      .anticon {
        margin: 0 2px;
      }
    }
  }
`;

const StyledNoteView = styled.div`
  padding-top: 20px;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  column-gap: 8px;
  .controls.left {
    grid-column: 3/4;
  }
  .card {
    overflow: hidden;
    animation: 0.2s ${fadeInDownAnimation};
    height: 78vh;
    width: 100%;
    padding: 30px 0;
    grid-column: 4/10;
    display: flex;
    background: white;
    border-radius: 4px;
    flex-direction: column;
    border: 1px solid ${colors.bg};
    box-shadow: ${colors.bg} 3px 3px 3px;
    .card-content {
      overflow-y: auto;
      overflow-x: hidden;
    }
    .title {
      text-align: center;
      font-size: 1.8rem;
      line-height: 2.4rem;
      padding: 0 20px 20px;
      color: ${colors.steel};
    }
    .content {
      flex: 1 1 auto;
      overflow: auto;
      padding: 0 20px 20px;
    }
    .chain-wrapper {
      padding: 0 20px;
      .chain-item {
        display: flex;
        align-items: flex-start;
        margin-bottom: 16px;
        .chain-item-id {
          background: ${colors.strokeOne};
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          min-width: 22px;
          height: 22px;
          font-size: 1rem;
          cursor: pointer;
          transition: 0.4s;
          margin-right: 10px;
          position: relative;
          top: 3px;
        }
        .chain-item-title {
          cursor: pointer;
          &:hover {
            text-decoration: underline;
          }
        }
        .chain-item-subtext {
          font-size: 0.8rem;
          color: ${colors.bar};
        }
      }
    }
    .tags {
      padding: 0 20px;
    }
    .quiz-solution {
      background: ${colors.bg};
      border: 1px solid ${colors.strokeTwo};
      margin: 0 20px 20px;
      padding: 10px;
      border-radius: 2px;
      p {
        margin: 0;
      }
    }
    .url {
      text-align: center;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: block;
      font-size: 1rem;
      padding: 0 20px;
      a {
        color: ${colors.steel};
      }
      a:hover {
        text-decoration: underline;
      }
    }
    .back-icon {
      position: absolute;
      top: 4px;
      left: 4px;
      z-index: 10;
    }
    .edit-container {
      position: absolute;
      right: 10px;
      bottom: 3px;
    }
    .copy-icon {
      position: absolute;
      top: 4px;
      left: -10px;
      transition: 0.3s;
      &.url-copy-icon {
        top: -8px;
      }
      &:hover {
        left: -4px;
      }
    }
    .canonical-url {
      position: absolute;
      bottom: 8px;
      left: 20px;
      font-size: 0.9rem;
      max-width: 80%;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      cursor: pointer;
      transition: all 0.4s;
      &:hover {
        color: ${colors.orchid};
      }
    }
  }
  .controls.right {
    grid-column: 10/11;
  }
  .previous-icon {
    grid-column: 2;
    position: relative;
    .prev {
      left: 0px;
    }
  }
  .next-icon {
    grid-column: 11;
    position: relative;
    .next {
      transform: rotate(180deg);
      right: 0px;
    }
  }
  .prev,
  .next {
    color: ${colors.strokeTwo};
    top: 220px;
    position: absolute;
  }
  @media (max-width: 1024px) {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    height: 100%;
    padding: 20px 28px;
    overflow: auto;
    .card {
      order: -1;
      margin-bottom: 8px;
    }
    .controls.left,
    .controls.right {
      flex: 0 0 46%;
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-column-gap: 4px;
    }
    .previous-icon,
    .next-icon {
      display: none;
    }
  }
`;

const StyledCollection = styled.div`
  border: 2px solid ${colors.strokeOne};
  border-radius: 2px;
  background: ${colors.feather};
  margin-bottom: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  .collection-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    h3 {
      font-weight: bold;
      text-decoration: underline;
    }
  }
`;

export { StyledNoteCard, StyledNoteView, StyledCollection };
