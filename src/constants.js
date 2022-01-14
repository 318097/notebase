const STATUS_OPTIONS = [
  { label: "Quick add", value: "QUICK_ADD" },
  { label: "Draft", value: "DRAFT" },
  { label: "Ready", value: "READY" },
  { label: "Posted", value: "POSTED" },
];

const SOCIAL_STATUS_OPTIONS = [
  { label: "Ready", value: "READY" },
  { label: "Posted", value: "POSTED" },
];

const POST_TYPE_OPTIONS = [
  { label: "Drop", value: "DROP" },
  { label: "Post", value: "POST" },
  { label: "Quiz", value: "QUIZ" },
  { label: "Chain", value: "CHAIN" },
];

const SORT_OPTIONS = [
  { label: "Index", value: "index" },
  { label: "Rating", value: "rating" },
  { label: "Live id", value: "liveId" },
  { label: "Created", value: "createdAt" },
];

const VISIBILITY_OPTIONS = [
  { label: "Visible", value: true },
  { label: "Hidden", value: false },
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
      label: "Post",
      value: "POST",
      fields: ["TITLE", "CONTENT"],
      required: ["TITLE", "CONTENT"],
    },
    {
      label: "Drop",
      value: "DROP",
      required: ["TITLE"],
    },
  ],
  // fields: [
  //   {
  //     label: "TITLE",
  //     value: "TITLE",
  //     type: "TEXT",
  //     defaultValue: "",
  //   },
  //   {
  //     label: "CONTENT",
  //     value: "CONTENT",
  //     type: "RICH_TEXT",
  //     defaultValue: "",
  //   },
  //   {
  //     label: "URL",
  //     value: "URL",
  //     type: "TEXT",
  //     defaultValue: "",
  //   },
  // ],
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
  // cardSmStyles: {},
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
