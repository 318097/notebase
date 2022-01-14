import { message } from "antd";
import _ from "lodash";
import colors from "@codedrops/react-ui";
import hljs from "highlight.js";
import markdown from "markdown-it";
import { copyToClipboard as _copyToClipboard } from "@codedrops/lib";

export const md = markdown({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value;
      } catch (__) {}
    }

    return ""; // use external default escaping
  },
});

export const getDomain = (url) => {
  try {
    const { host } = new URL(url);
    return host;
  } catch (err) {
    return "Invalid URL";
  }
};

export const copyToClipboard = (text) => {
  _copyToClipboard(text);
  message.info(`Copied - ${text}`);
};

export const getNextNote = ({
  data,
  id,
  increment = 1,
  matchKey = "_id",
} = {}) => {
  const currentNoteIndex = data.findIndex((note) => note[matchKey] === id);
  const newIndex = currentNoteIndex + increment;
  return newIndex >= 0 && newIndex < data.length ? data[newIndex] : null;
};

export const extractTagCodes = (tags = []) =>
  _.reduce(
    tags,
    (acc, { label, color }) => ({
      ...acc,
      [label]: color,
    }),
    { uncategorized: colors.red }
  );

export const readFileContent = (event, { onFileRead } = {}) => {
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

export const generateFormData = (data) => {
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

export const getSettingsById = (list, _id) => _.find(list, { _id }) || {};
