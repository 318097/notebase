const STATUS_OPTIONS = [
  { label: "QUICK ADD", value: "QUICK_ADD" },
  { label: "DRAFT", value: "DRAFT" },
  { label: "READY", value: "READY" },
  { label: "POSTED", value: "POSTED" },
];

const SOCIAL_STATUS_OPTIONS = [
  { label: "READY", value: "READY" },
  { label: "POSTED", value: "POSTED" },
];

const POST_TYPE_OPTIONS = [
  { label: "DROP", value: "DROP" },
  { label: "POST", value: "POST" },
  { label: "QUIZ", value: "QUIZ" },
  { label: "CHAIN", value: "CHAIN" },
];

const SORT_OPTIONS = [
  { label: "INDEX", value: "index" },
  { label: "RATING", value: "rating" },
  { label: "LIVE ID", value: "liveId" },
  { label: "CREATED", value: "createdAt" },
];

const VISIBILITY_OPTIONS = [
  { label: "VISIBLE", value: "visible" },
  { label: "INVISIBLE", value: "invisible" },
];

const RATING_OPTIONS = [
  { label: "5", value: "5" },
  { label: "4", value: "4" },
  { label: "3", value: "3" },
  { label: "2", value: "2" },
  { label: "1", value: "1" },
];

const DEFAULT_SETTING_STATE = {
  name: "Untitled",
  caption: "",
  index: 1,
  liveId: 1,
  tags: [],
  postTypes: [
    {
      label: "POST",
      value: "POST",
      fields: ["TITLE", "CONTENT"],
      required: ["TITLE", "CONTENT"],
    },
    {
      label: "DROP",
      value: "DROP",
      required: ["TITLE"],
    },
  ],
  fields: [
    {
      label: "TITLE",
      value: "TITLE",
      type: "TEXT",
      defaultValue: "",
    },
    {
      label: "CONTENT",
      value: "CONTENT",
      type: "RICH_TEXT",
      defaultValue: "",
    },
    {
      label: "URL",
      value: "URL",
      type: "TEXT",
      defaultValue: "",
    },
  ],
  socialPlatforms: [
    {
      label: "FB",
      value: "facebook",
    },
    {
      label: "Instagram",
      value: "instagram",
    },
    {
      label: "Twitter",
      value: "twitter",
    },
    {
      label: "Dev.to",
      value: "dev",
    },
    {
      label: "Hashnode",
      value: "hashnode",
    },
    {
      label: "Linkedin",
      value: "linkedin",
    },
  ],
  pageLimit: 25,
  cardSmStyles: {},
  defaultDisplayType: "CARD",
  defaultCollectionId: "", // collection to load on siginin
};

export {
  STATUS_OPTIONS,
  SOCIAL_STATUS_OPTIONS,
  POST_TYPE_OPTIONS,
  SORT_OPTIONS,
  VISIBILITY_OPTIONS,
  RATING_OPTIONS,
  DEFAULT_SETTING_STATE,
};
