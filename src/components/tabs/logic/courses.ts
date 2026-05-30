import { createSlice, configureStore, PayloadAction } from "@reduxjs/toolkit";
import { ClassSection, Course, CourseMetaData, Schedule } from "../../../logic/definitions";
import { Time, TimeRange } from "../../../logic/time";

export type UISchedule = {
	name: string;
	courses: UICourse[];
	newSchedule: boolean;
};

export type UICourse = CourseMetaData & {
	sections: UISection[];
};

export type UISection = Omit<ClassSection, "time"> & {
	time: string;
};

export const EMPTY_SCHEDULE = "New Schedule";

type EditorState = {
	value: UISchedule;
	savedSnapshot: UICourse[] | null;
};

const initialState: EditorState = {
	value: {
		name: EMPTY_SCHEDULE,
		courses: [],
		newSchedule: true,
	},
	savedSnapshot: null,
};

const coursesSlice = createSlice({
	name: "courses",
	initialState,
	reducers: {
		setSchedule: (state, action: PayloadAction<UISchedule | undefined>) => {
			if (action.payload === undefined) {
				state.value = {
					name: EMPTY_SCHEDULE,
					courses: [],
					newSchedule: true,
				};
				state.savedSnapshot = null;
				return;
			}
			state.value.name = action.payload.name;
			state.value.courses = action.payload.courses;
			state.value.newSchedule = action.payload.newSchedule;
			state.savedSnapshot = JSON.parse(JSON.stringify(action.payload.courses));
		},

		commitSchedule: (state, action: PayloadAction<{ name: string }>) => {
			state.value.name = action.payload.name;
			state.value.newSchedule = false;
			state.savedSnapshot = JSON.parse(JSON.stringify(state.value.courses));
		},

		resetDraft: (state) => {
			state.value = {
				name: EMPTY_SCHEDULE,
				courses: [],
				newSchedule: true,
			};
			state.savedSnapshot = null;
		},

		revertDraft: (state) => {
			if (state.savedSnapshot === null) return;
			state.value.courses = JSON.parse(JSON.stringify(state.savedSnapshot));
		},

		addCourse: (state) => {
			state.value.courses.push({ id: "", name: undefined, sections: [] });
		},

		removeCourseByIndex: (state, action: PayloadAction<{ courseIndex: number }>) => {
			if (state.value.courses.length <= 1) return;
			state.value.courses.splice(action.payload.courseIndex, 1);
		},

		addCourseSection: (
			state,
			action: PayloadAction<{ courseIndex: number }>
		) => {
			const course = state.value.courses[action.payload.courseIndex];
			course?.sections.push({
				sectionId: "",
				prof: "",
				time: "",
				isOnline: false,
				isLab: false,
				days: [],
			});
		},

		removeSectionByIndex: (
			state,
			action: PayloadAction<{ courseIndex: number; sectionIndex: number }>
		) => {
			const course = state.value.courses[action.payload.courseIndex];
			if (!course || course.sections.length <= 1) return;
			course.sections.splice(action.payload.sectionIndex, 1);
		},

		editCourseId: (
			state,
			action: PayloadAction<{ courseIndex: number; newCourseId: string }>
		) => {
			const course = state.value.courses[action.payload.courseIndex];
			if (course) {
				course.id = action.payload.newCourseId;
			}
		},

		editSectionByIndex: (
			state,
			action: PayloadAction<{
				courseIndex: number;
				sectionIndex: number;
				newSection: Partial<UISection>;
			}>
		) => {
			const course = state.value.courses[action.payload.courseIndex];
			if (course) {
				const section = course.sections[action.payload.sectionIndex];
				if (section) {
					Object.assign(section, action.payload.newSection);
				}
			}
		},
	},
});

export const {
	setSchedule,
	commitSchedule,
	resetDraft,
	revertDraft,
	addCourse,
	removeCourseByIndex,
	addCourseSection,
	removeSectionByIndex,
	editCourseId,
	editSectionByIndex,
} = coursesSlice.actions;

export const coursesStore = configureStore({
	reducer: coursesSlice.reducer,
});

// Selectors
export const selectScheduleName = (state: EditorState) => state.value.name;
export const selectIsNewSchedule = (state: EditorState) => state.value.newSchedule;
export const selectCourses = (state: EditorState) => state.value.courses;
export const selectHasPendingChanges = (state: EditorState) => {
	if (state.savedSnapshot === null) {
		return state.value.courses.length > 0 &&
			!state.value.courses.every(
				(c) => c.id === "" && (!c.name || c.name === "") && c.sections.length === 0
			);
	}
	return JSON.stringify(state.value.courses) !== JSON.stringify(state.savedSnapshot);
};

export const selectHasSavedBaseline = (state: EditorState) => state.savedSnapshot !== null;

function arraysEqual<T>(a: T[], b: T[]): boolean {
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}

export function noUnsavedChanges(currentCourses: Course[], compareCourses?: Course[]): boolean {
	if (!compareCourses) {
		return currentCourses.every(course =>
			(!course.id || course.id === "") &&
			(!course.name || course.name === "") &&
			(!course.sections || course.sections.length === 0)
		);
	}
	if (currentCourses.length !== compareCourses.length) return false;
	for (let i = 0; i < currentCourses.length; i++) {
		const a = currentCourses[i];
		const b = compareCourses[i];
		if (a.id !== b.id || a.name !== b.name) return false;
		if ((a.sections?.length || 0) !== (b.sections?.length || 0)) return false;
		for (let j = 0; j < (a.sections?.length || 0); j++) {
			const sa = a.sections[j];
			const sb = b.sections[j];
			if (
				sa.sectionId !== sb.sectionId ||
				sa.prof !== sb.prof ||
				sa.time !== sb.time ||
				sa.isOnline !== sb.isOnline ||
				!arraysEqual(Array.isArray(sa.days) ? sa.days : [], Array.isArray(sb.days) ? sb.days : [])
			) {
				return false;
			}
		}
	}
	return true;
}
