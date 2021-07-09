const hasToken = () => !!getToken();

const getToken = () => getSessionFromStorage().token || "";

const setSessionInStorage = (data = {}) => {
  localStorage.clear();
  localStorage.setItem("notes-app", JSON.stringify(data));
};

const getSessionFromStorage = () =>
  JSON.parse(localStorage.getItem("notes-app") || "{}");

module.exports = {
  hasToken,
  getToken,
  setSessionInStorage,
  getSessionFromStorage,
};
