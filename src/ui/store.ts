import { configureStore, isPlain } from "@reduxjs/toolkit";
import { Time, TimeRange } from "../logic/time";
import { scheduleEditorReducer } from "./scheduleEditorUI";
import { scheduleViewReducer } from "./scheduleViewUI";

const isSerializable = (value: unknown): boolean => {
	if (value instanceof TimeRange || value instanceof Time) return true;
	return isPlain(value);
};

export const store = configureStore({
	reducer: {
		scheduleEditor: scheduleEditorReducer,
		scheduleView: scheduleViewReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: { isSerializable },
		}),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
