import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import reducer from "./reducer";

const persistConfig = {
  key: "root",
  storage,
  blacklist: [
    "appLoading",
    "notes",
    "session",
    "retainPage",
    "chains",
    // "selectedItems",
  ],
};

const persistedReducer = persistReducer(persistConfig, reducer);

const middlewares = [thunk];

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  persistedReducer,
  composeEnhancers(applyMiddleware(...middlewares))
);
const persistor = persistStore(store);

export { store, persistor };
