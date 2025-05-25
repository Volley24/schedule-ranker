import { createSlice, configureStore, PayloadAction } from "@reduxjs/toolkit";

export type CourseState = {
	courses: Course[];
	selectedCourse: Course | undefined;
};
export type Course = {
	id: string;
	sections: Section[];
};

export type Section = {
	crn: string;
	section: string;

	startTime: string;
	endTime: string;
	days: string;
	profName: string;

	isOnline: boolean;
	isLab: boolean;
	validSections?: string[];
};

const coursesSlice = createSlice({
	name: "courses",
	initialState: {
		value: {
			courses: [] as Course[],
			selectedCourse: undefined,
		} as CourseState,
	},
	reducers: {
		addCourse: (state, action: PayloadAction<string>) => {
			state.value.courses.push({ id: action.payload, sections: [] });
		},
		removeCourse: (state, action: PayloadAction<string>) => {
			// todo
		},

		addCourseSection: (
			state,
			action: PayloadAction<{
				courseId: string;
			}>
		) => {
			const course = state.value.courses.find((course) => course.id === action.payload.courseId);
			course?.sections.push({
				crn: "",
				section: "",
				startTime: "",
				endTime: "",
				days: "",
				profName: "",
				isOnline: false,
				isLab: false,
			});
		},
		removeCourseSection: () => {},

		editCourseId: (
			state,
			action: PayloadAction<{
				courseId: string;
				newCourseId: string;
			}>
		) => {
			const course = state.value.courses.find((course) => course.id === action.payload.courseId);
			if (course) {
				course.id = action.payload.newCourseId;
			}
		},
		editSection: (
			state,
			action: PayloadAction<{
				courseId: string;
				sectionCrn: string;
				newSection: Partial<Section>;
			}>
		) => {
			const courseIndex = state.value.courses.findIndex((course) => course.id === action.payload.courseId);
			if (courseIndex !== -1) {
				const course = state.value.courses[courseIndex];
				course.sections = {
					...course.sections,
					[courseIndex]: {
						...course.sections[courseIndex],
						...action.payload.newSection,
					},
				};
			}
		},
	},
});

export const { addCourse, addCourseSection, editCourseId, editSection } = coursesSlice.actions;

export const coursesStore = configureStore({
	reducer: coursesSlice.reducer,
});

// const store = configureStore({
// 	reducer: counterSlice.reducer,
// });

// // Can still subscribe to the store
// store.subscribe(() => console.log(store.getState()));

// // Still pass action objects to `dispatch`, but they're created for us
// store.dispatch(incremented());
// // {value: 1}
// store.dispatch(incremented());
// // {value: 2}
// store.dispatch(decremented());
// // {value: 1}
