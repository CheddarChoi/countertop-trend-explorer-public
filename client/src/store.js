import { createStore } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const initialState = {
  generatedImages: [],
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "ADD_GENERATED_IMAGE":
      return {
        ...state,
        generatedImages: [...state.generatedImages, action.payload],
      };
    case "CLEAR_GENERATED_IMAGES":
      return {
        ...state,
        generatedImages: [],
      };
    case "UPDATE_LAST_GENERATED_IMAGE":
      return {
        ...state,
        generatedImages: [...state.generatedImages.slice(0, -1), action.payload],
      };

    default:
      return state;
  }
};

const persistConfig = {
  key: "root",
  storage,
};

const persistedReducer = persistReducer(persistConfig, reducer);

const store = createStore(persistedReducer);
const persistor = persistStore(store);

export { store, persistor };
