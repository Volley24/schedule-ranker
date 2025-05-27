import { createSlice, configureStore, PayloadAction } from "@reduxjs/toolkit";

export type UICourseState = {
	courses: UICourse[];
	selectedCourse: UICourse | undefined;
};
export type UICourse = {
	id: string;
	sections: UISection[];
};

export type UISection = {
	crn: string;
	section: string;

	startTime: string;
	endTime: string;
	days: string;
	profName: string;

	isOnline: boolean;
	isLab: boolean;
	validSections: string;
};

const coursesSlice = createSlice({
	name: "courses",
	initialState: {
		value: {
			courses: [] as UICourse[],
			selectedCourse: undefined,
		} as UICourseState,
	},
	reducers: {
		addCourse: (state) => {
			state.value.courses.push({ id: "", sections: [] });
		},
		removeLastCourse: (state) => {
			// remove the last course if it exists
			if (state.value.courses.length > 0) {
				state.value.courses.pop();
			}
		},

		addCourseSection: (
			state,
			action: PayloadAction<{
				courseIndex: number;
			}>
		) => {
			const course = state.value.courses[action.payload.courseIndex];
			course?.sections.push({
				crn: "",
				section: "",
				startTime: "",
				endTime: "",
				days: "",
				profName: "",
				isOnline: false,
				isLab: false,
				validSections: "",
			});
		},
		removeLastCourseSection: (state) => {
			// remove the last section of the last course if it exists
			const lastCourse = state.value.courses[state.value.courses.length - 1];
			if (lastCourse && lastCourse.sections.length > 0) {
				lastCourse.sections.pop();
			}
		},

		editCourseId: (
			state,
			action: PayloadAction<{
				courseIndex: number;
				newCourseId: string;
			}>
		) => {
			const course = state.value.courses[action.payload.courseIndex];
			if (course) {
				course.id = action.payload.newCourseId;
			}
		},
		editSectionByIndex: (
			state,
			action: PayloadAction<{
				courseId: string;
				sectionIndex: number;
				newSection: Partial<UISection>;
			}>
		) => {
			const course = state.value.courses.find((course) => course.id === action.payload.courseId);
			if (course) {
				const section = course.sections[action.payload.sectionIndex]
				if (section) {
					Object.assign(section, action.payload.newSection);
				}
			}
		},
		setSelectedCourse: (
			state,
			action: PayloadAction<UICourse | undefined>
		) => {
			state.value.selectedCourse = action.payload;
		},
	},
});

export const { addCourse, addCourseSection, removeLastCourse, editCourseId, editSectionByIndex, setSelectedCourse, removeLastCourseSection } = coursesSlice.actions;

export const coursesStore = configureStore({
	reducer: coursesSlice.reducer,
});