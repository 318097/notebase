import _ from "lodash";
import config from "../config";
import { getNextNote, getSettingsById } from "../lib/utils";
import {
  SET_SESSION,
  SET_APP_LOADING,
  TOGGLE_SETTINGS_DRAWER,
  UPDATE_FILTER,
  LOAD_NOTES,
  GET_NOTE_BY_ID,
  SET_NOTE_TO_EDIT,
  SET_MODAL_META,
  UPDATE_NOTE,
  DELETE_NOTE,
  SET_UPLOADING_DATA,
  UPDATE_UPLOAD_NOTE,
  SET_ACTIVE_COLLECTION,
  FETCH_STATS,
  LOGOUT,
  SET_QUICK_ADD_MODAL_META,
  SET_KEY,
  FETCH_CHAINS,
  TOGGLE_SELECTED_ITEMS,
} from "./constants";

const INITIAL_UPLOADING_DATA_STATE = {
  rawData: null,
  data: [],
  dataType: "POST",
  status: "DEFAULT",
  fileName: null,
  tags: [],
};

const INITIAL_STATE = {
  modalMeta: {
    visibility: false,
    mode: undefined,
    selectedNote: undefined,
  },
  filters: {
    tags: undefined,
    socialStatus: undefined,
    status: [],
    search: undefined,
    rating: undefined,
    type: undefined,
    visible: "true",
    sortOrder: "DESC",
    sortFilter: "index",
    page: 1,
    limit: config.LIMIT,
  },
  quickaddModalMeta: {
    visibility: false,
  },
  settings: {},
  stats: {},
  notes: [],
  chains: [],
  appLoading: false,
  settingsDrawerVisibility: false,
  retainPage: false,
  showAllFilters: false,
  activeCollectionId: undefined,
  meta: undefined,
  session: undefined,
  viewNote: undefined,
  activePage: undefined,
  viewNoteMeta: undefined,
  displayType: "CARD",
  uploadingData: INITIAL_UPLOADING_DATA_STATE,
  selectedItems: [],
};

const reducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SET_SESSION:
      const { activeCollectionId, session } = state;
      const updatedSession = { ...(session || {}), ...action.payload };
      const newActiveCollectionId =
        activeCollectionId || _.get(updatedSession, "notebase.0._id", "");

      const settings = getSettingsById(
        updatedSession.notebase,
        newActiveCollectionId
      );
      return {
        ...state,
        session: updatedSession,
        activeCollectionId: newActiveCollectionId,
        settings,
        filters: { ...state.filters, ...(settings.defaultFilters || {}) },
      };
    case SET_APP_LOADING:
      return {
        ...state,
        appLoading: action.payload,
      };
    case LOGOUT:
      sessionStorage.clear();
      localStorage.clear();
      return INITIAL_STATE;
    case SET_ACTIVE_COLLECTION:
      return {
        ...state,
        activeCollectionId: action.payload,
        settings: getSettingsById(state.session.notebase, action.payload),
      };
    case TOGGLE_SETTINGS_DRAWER:
      return {
        ...state,
        settingsDrawerVisibility: action.payload,
      };
    case FETCH_STATS:
      return {
        ...state,
        stats: action.payload,
      };
    case UPDATE_FILTER:
      return {
        ...state,
        filters: action.payload,
      };
    case LOAD_NOTES:
      return {
        ...state,
        notes: [...action.payload.notes],
        meta: action.payload.meta,
      };
    case GET_NOTE_BY_ID: {
      const { notes = [] } = state;
      const nextNote = getNextNote({
        data: notes,
        id: _.get(action, "payload._id"),
        increment: 1,
      });
      const previousNote = getNextNote({
        data: notes,
        id: _.get(action, "payload._id"),
        increment: -1,
      });
      return {
        ...state,
        viewNote: action.payload,
        viewNoteMeta: {
          nextNote: nextNote ? nextNote._id : null,
          previousNote: previousNote ? previousNote._id : null,
        },
      };
    }
    case SET_NOTE_TO_EDIT: {
      const { selectedNote, mode } = action.payload;
      return {
        ...state,
        modalMeta: {
          ...state.modalMeta,
          mode,
          visibility: true,
          selectedNote,
        },
      };
    }
    case SET_MODAL_META:
      return {
        ...state,
        modalMeta: {
          ...state.modalMeta,
          ...action.payload,
        },
      };
    case UPDATE_NOTE: {
      return {
        ...state,
        viewNote: state.viewNote
          ? { ...state.viewNote, ...action.payload }
          : null,
        notes: state.notes.map((note) => {
          if (note._id === action.payload._id)
            return { ...note, ...action.payload };
          return note;
        }),
      };
    }
    case DELETE_NOTE:
      return {
        ...state,
        notes: state.notes.filter((note) => note._id !== action.payload),
      };
    case SET_UPLOADING_DATA:
      return {
        ...state,
        uploadingData: { ...state.uploadingData, ...action.payload },
      };
    case UPDATE_UPLOAD_NOTE: {
      const {
        uploadingData: { data },
      } = state;
      const { payload: selectedNote } = action;
      const updatedData = data.map((item) =>
        item.tempId === selectedNote.tempId ? selectedNote : item
      );
      return {
        ...state,
        uploadingData: {
          ...state.uploadingData,
          data: updatedData,
          shouldProcessData: false,
        },
      };
    }
    case SET_QUICK_ADD_MODAL_META:
      return {
        ...state,
        quickAddModalMeta: {
          ...state.quickAddModalMeta,
          ...action.payload,
        },
      };
    case SET_KEY:
      return {
        ...state,
        ...action.payload,
      };
    case FETCH_CHAINS:
      return {
        ...state,
        chains: [...action.payload],
      };
    case TOGGLE_SELECTED_ITEMS: {
      const { _id } = action.payload;
      const { selectedItems = [] } = state;
      return {
        ...state,
        selectedItems: _.includes(selectedItems, _id)
          ? _.filter(selectedItems, (id) => id !== _id)
          : [...selectedItems, _id],
      };
    }
    default:
      return state;
  }
};

export default reducer;

export { INITIAL_STATE, INITIAL_UPLOADING_DATA_STATE };
