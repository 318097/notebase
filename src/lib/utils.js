import { message } from "antd";
import _ from "lodash";
import colors from "@codedrops/react-ui";
import hljs from "highlight.js";
import markdown from "markdown-it";
import { copyToClipboard as _copyToClipboard } from "@codedrops/lib";

const md = markdown({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value;
      } catch (__) {}
    }

    return ""; // use external default escaping
  },
});

const getDomain = (url) => {
  try {
    const { host } = new URL(url);
    return host;
  } catch (err) {
    return "Invalid URL";
  }
};

const copyToClipboard = (text) => {
  _copyToClipboard(text);
  message.info(`Copied - ${text}`);
};

const getNextNote = ({ data, id, increment = 1, matchKey = "_id" } = {}) => {
  const currentNoteIndex = data.findIndex((note) => note[matchKey] === id);
  const newIndex = currentNoteIndex + increment;
  return newIndex >= 0 && newIndex < data.length ? data[newIndex] : null;
};

const readFileContent = (event, { onFileRead } = {}) => {
  const { files } = event.target;
  const isImage = _.get(files, "0.type", "").startsWith("image/");

  if (isImage) {
    const sourceFiles = Object.values(files);

    Promise.all(
      sourceFiles.map((file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve({ file, raw: reader.result });
        });
      })
    ).then((result) =>
      onFileRead({
        data: result,
        sourceFiles,
      })
    );
  } else {
    const [document] = files;

    if (!document) return;

    const reader = new FileReader();
    reader.readAsText(document);

    reader.onload = () =>
      onFileRead({
        rawData: reader.result,
        fileName: document.name,
        sourceFiles: [document],
      });
  }
  event.target.value = null;
};

const generateFormData = (data) => {
  const formData = new FormData();

  for (const key in data) {
    if (key === "files") {
      for (let i = 0; i < data.files.length; i++)
        formData.append(`files`, data.files[i]);
    } else {
      formData.append(key, data[key]);
    }
  }

  return formData;
};

const getSettingsById = (list, _id) => _.find(list, { _id }) || {};

const parseTags = (settings) => {
  const tagsList = _.get(settings, "tags", []);
  return _.sortBy(
    _.map(tagsList, (tag) => {
      const obj = _.pick(tag, ["label", "value", "_id"]);
      const color = _.get(tag, "color", getRandomColor());

      return { ...obj, color };
    }),
    "label"
  );
};

const getTagsMap = (settings) => {
  const tags = parseTags(settings);
  return _.keyBy(tags, "value");
};

const scrollToPosition = (ref, offset) => {
  let position = 0;
  const increment = offset / 10;
  const interval = setInterval(() => {
    ref.scrollTop = position;
    position += increment;
    if (position >= offset) clearInterval(interval);
  }, 50);
};

const getRandomElement = (size) => {
  const randomElement = Math.floor(Math.random() * 100) % size;
  return randomElement;
};

const getRandomColor = () => {
  const colorList = [
    "primary",
    "red",
    "watermelon",
    "blue",
    "orchid",
    "yellow",
    "orange",
    "green",
    "coffee",
    "nbOrange",
    "nbPink",
    "foBlue",
    "cdBlue",
    "cdGreen",
    "purple",
  ];

  const position = getRandomElement(colorList.length);
  const color = colorList[position];

  return _.get(colors, color);
};

export {
  md,
  getDomain,
  copyToClipboard,
  getNextNote,
  readFileContent,
  generateFormData,
  getSettingsById,
  parseTags,
  scrollToPosition,
  getTagsMap,
  getRandomColor,
};
