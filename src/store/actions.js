import axios from "axios";
import _ from "lodash";
import { message } from "antd";
import { getNextNote, getSettingsById } from "../lib/utils";
import {
  SET_SESSION,
  SET_APP_LOADING,
  UPDATE_FILTER,
  LOAD_NOTES,
  GET_NOTE_BY_ID,
  SET_NOTE_TO_EDIT,
  SET_MODAL_META,
  UPDATE_NOTE,
  DELETE_NOTE,
  TOGGLE_SETTINGS_DRAWER,
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
import { INITIAL_STATE } from "./reducer";
import sessionManager from "../lib/sessionManager";

export const setAppLoading = (status) => ({
  type: SET_APP_LOADING,
  payload: status,
});

export const toggleSelectedItems = (payload) => ({
  type: TOGGLE_SELECTED_ITEMS,
  payload,
});

export const setKey = (obj) => ({
  type: SET_KEY,
  payload: obj,
});

export const fetchNotes = () => async (dispatch, getState) => {
  try {
    dispatch(setAppLoading(true));
    const { filters, notes = [], activeCollectionId, displayType } = getState();

    const data =
      filters && filters.page > 1 && displayType === "CARD" ? [...notes] : [];

    const {
      data: { posts, meta },
    } = await axios.get(`/posts?collectionId=${activeCollectionId}`, {
      params: filters,
    });
    data.push(...posts);

    dispatch({ type: LOAD_NOTES, payload: { notes: data, meta } });
  } catch (err) {
    console.log(err);
  } finally {
    dispatch(setAppLoading(false));
  }
};

export const getNoteById = (noteId) => async (dispatch, getState) => {
  try {
    dispatch(setAppLoading(true));
    const { notes, activeCollectionId } = getState();

    let viewPost = _.find(notes, { _id: noteId });

    if (!viewPost) {
      const {
        data: { post },
      } = await axios.get(
        `/posts/${noteId}?collectionId=${activeCollectionId}`
      );
      viewPost = post;
    }

    dispatch({ type: GET_NOTE_BY_ID, payload: viewPost });
  } catch (err) {
    console.log(err);
  } finally {
    dispatch(setAppLoading(false));
  }
};

export const addNote =
  (notes, { collectionId, sourceInfo } = {}) =>
  async (dispatch, getState) => {
    try {
      dispatch(setAppLoading(true));
      const { activeCollectionId, filters } = getState();
      const addToCollection = collectionId || activeCollectionId;

      const data = [].concat(notes);
      await axios.post(`/posts?collectionId=${addToCollection}`, {
        data,
        sourceInfo,
      });
      dispatch({
        type: UPDATE_FILTER,
        payload: filters,
      });
      refetch(dispatch);
      if (_.get(data, "0.type") === "CHAIN") dispatch(getChains());
      message.success(`Success.`);
    } catch (err) {
      console.log(err);
    } finally {
      dispatch(setAppLoading(false));
    }
  };

export const setNoteToEdit =
  (noteId, mode = "edit") =>
  async (dispatch, getState) => {
    const { notes = [], uploadingData: { data: uploadingNotes = [] } = {} } =
      getState();
    const data = mode === "edit" ? notes : uploadingNotes;
    const selectedNote = data.find((note) => note._id === noteId);
    dispatch({
      type: SET_NOTE_TO_EDIT,
      payload: { selectedNote, mode },
    });
  };

export const updateNote = (note, action) => async (dispatch, getState) => {
  try {
    dispatch(setAppLoading(true));
    const { activeCollectionId } = getState();
    const {
      data: { result },
    } = await axios.put(
      `/posts/${note._id}?collectionId=${activeCollectionId}&action=${action}`,
      note
    );

    dispatch({ type: UPDATE_NOTE, payload: result });
    message.success(`Updated.`);
  } catch (err) {
    console.log(err);
  } finally {
    dispatch(setAppLoading(false));
  }
};

export const bulkUpdate = (data, action) => async (dispatch, getState) => {
  try {
    dispatch(setAppLoading(true));
    const { activeCollectionId } = getState();
    await axios.put(
      `/posts?collectionId=${activeCollectionId}&action=${action}`,
      data
    );

    dispatch({ type: SET_KEY, payload: { selectedItems: [] } });
    refetch(dispatch);
    message.success(`Updated.`);
  } catch (err) {
    console.log(err);
  } finally {
    dispatch(setAppLoading(false));
  }
};

export const deleteNote = (noteId) => async (dispatch, getState) => {
  try {
    dispatch(setAppLoading(true));

    await axios.delete(`/posts/${noteId}`);

    dispatch({ type: DELETE_NOTE, payload: noteId });
    message.success(`Deleted.`);
  } catch (err) {
    console.log(err);
  } finally {
    dispatch(setAppLoading(false));
  }
};

export const setModalMeta = ({
  visibility = false,
  mode = "add",
  selectedNote = null,
} = {}) => ({
  type: SET_MODAL_META,
  payload: { visibility, mode, selectedNote },
});

export const setUploadingData = (uploadingContent) => ({
  type: SET_UPLOADING_DATA,
  payload: uploadingContent,
});

export const updateUploadNote = (note) => async (dispatch, getState) => {
  dispatch({ type: UPDATE_UPLOAD_NOTE, payload: note });
};

export const setNextNoteForEditing =
  (currentNote) => async (dispatch, getState) => {
    const {
      notes = [],
      modalMeta: { mode },
      uploadingData: { data: uploadingNotes = [] } = {},
    } = getState();

    let nextNote;
    if (mode === "edit") {
      nextNote = getNextNote({ data: notes, id: currentNote._id });
      await dispatch(updateNote({ ...currentNote }));
    } else {
      nextNote = getNextNote({
        data: uploadingNotes,
        id: currentNote.tempId,
        matchKey: "tempId",
      });
      await dispatch(updateUploadNote({ ...currentNote }));
    }
    dispatch(
      setModalMeta({
        selectedNote: nextNote || {},
        mode,
        visibility: !!nextNote,
      })
    );
  };

export const setQuickAddModalMeta = ({ visibility = false } = {}) => ({
  type: SET_QUICK_ADD_MODAL_META,
  payload: { visibility },
});

export const logout = () => ({
  type: LOGOUT,
});

export const fetchStats = () => async (dispatch, getState) => {
  try {
    dispatch(setAppLoading(true));
    const { activeCollectionId, filters } = getState();
    const {
      data: { stats },
    } = await axios.get(`/posts/stats?collectionId=${activeCollectionId}`, {
      params: filters,
    });

    dispatch({ type: FETCH_STATS, payload: stats });
  } catch (err) {
    console.log(err);
  } finally {
    dispatch(setAppLoading(false));
  }
};

export const setSession = (session) => ({
  type: SET_SESSION,
  payload: session,
});

export const fetchSession = () => async (dispatch) => {
  const token = sessionManager.getToken();
  const { data } = await axios.post(`/auth/account-status`, { token });
  dispatch(setSession({ isAuthenticated: true, info: "ON_LOAD", ...data }));
};

export const setActiveCollection =
  (_id, resetFilters = false) =>
  async (dispatch, getState) => {
    dispatch({
      type: SET_ACTIVE_COLLECTION,
      payload: _id,
    });

    const { session } = getState();
    const collection = getSettingsById(session.notebase, _id);
    const defaultFilters = _.get(collection, "defaultFilters", {});

    if (resetFilters)
      dispatch({ type: LOAD_NOTES, payload: { notes: [], meta: {} } }); // empty the screen on switching collections

    dispatch(
      setFilter(
        resetFilters ? { ...INITIAL_STATE.filters, ...defaultFilters } : {}
      )
    );
  };

export const toggleSettingsDrawer = (status) => ({
  type: TOGGLE_SETTINGS_DRAWER,
  payload: status,
});

const refetch = _.debounce(
  (dispatch) =>
    dispatch(
      window.location.pathname === "/stats" ? fetchStats() : fetchNotes()
    ),
  500
);

export const setFilter =
  (filterUpdate = {}, resetPage = true) =>
  async (dispatch, getState) => {
    const { filters, retainPage } = getState();
    if (retainPage)
      return dispatch({ type: SET_KEY, payload: { retainPage: false } });

    const updatedFiters = { ...filters, ...filterUpdate };
    if (resetPage) updatedFiters["page"] = 1;
    dispatch({ type: UPDATE_FILTER, payload: updatedFiters });
    refetch(dispatch);
  };

export const getChains = () => async (dispatch, getState) => {
  try {
    dispatch(setAppLoading(true));
    const { activeCollectionId } = getState();
    const {
      data: { chains },
    } = await axios.get(`/posts/chains?collectionId=${activeCollectionId}`);

    dispatch({ type: FETCH_CHAINS, payload: chains });
  } catch (err) {
    console.log(err);
  } finally {
    dispatch(setAppLoading(false));
  }
};

export const saveSettings = (updatedSettings) => async (dispatch) => {
  try {
    dispatch(setAppLoading(true));
    delete updatedSettings.tags; // tags is in a seperate collection

    if (updatedSettings._id === "NEW_COLLECTION") {
      delete updatedSettings._id;
      await axios.post(`/modules`, {
        ...updatedSettings,
        moduleType: "COLLECTION",
      });
    } else {
      await axios.put(`/modules/${updatedSettings._id}`, updatedSettings);
    }
    await dispatch(fetchSession());
    message.success(`Settings updated.`);
  } catch (err) {
    console.log(err);
  } finally {
    dispatch(setAppLoading(false));
  }
};

export const updateTagSettings =
  (data, { action }, collectionId) =>
  async (dispatch) => {
    try {
      dispatch(setAppLoading(true));
      await axios.post(
        `/tags/operations`,
        { ...data, moduleName: "COLLECTION", moduleId: collectionId },
        {
          params: { action },
        }
      );
      await dispatch(fetchSession());
    } catch (err) {
      console.log(err);
    } finally {
      dispatch(setAppLoading(false));
    }
  };
