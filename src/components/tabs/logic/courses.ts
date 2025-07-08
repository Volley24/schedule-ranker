import { createSlice, configureStore, PayloadAction } from "@reduxjs/toolkit";
import { ClassSection, Course, CourseMetaData, Schedule } from "../../../logic/definitions";
import exp from "constants";
import { Time, TimeRange } from "../../../logic/time";

// export type UISchedule = {
// 	name: string;
// 	courses: UICourse[];
// }

// export type UICourseState = {
// 	courses: UICourse[];
// 	selectedCourse: UICourse | undefined;
// };
// export type UICourse = {
// 	id: string;
// 	sections: UISection[];
// };

// export type UISection = {
// 	crn: string;
// 	section: string;

// 	startTime: string;
// 	endTime: string;
// 	days: string;
// 	profName: string;

// 	isOnline: boolean;
// 	isLab: boolean;
// 	validSections: string;
// };

export type UISchedule = {
	name: string;
	courses: UICourse[];

	newSchedule: boolean;
	undoStack: UndoAction[]; 
};

export type UICourse = CourseMetaData & {
	sections: UISection[];
};

export type UISection = Omit<ClassSection, "time"> & {
	time: string;
}

type UndoAction =
  | { type: "editCourseName"; courseIndex: number; prevName: string }
  | { type: "addCourse"; courseIndex: number }
  | { type: "removeCourse"; course: UICourse; index: number }
  | { type: "editSection"; courseId: string; sectionIndex: number; prevSection: Partial<UISection> }
  | { type: "addSection"; courseIndex: number; section: UISection }
  | { type: "removeSection"; courseId: string; sectionIndex: number; section: UISection };

export const EMPTY_SCHEDULE = "New Schedule";

const coursesSlice = createSlice({
	name: "courses",
	initialState: {
		value: {
			name: EMPTY_SCHEDULE,
			courses: [] as UICourse[],
			newSchedule: true,
			undoStack: []
		} as UISchedule,
	},
	reducers: {
		setSchedule: (state, action: PayloadAction<UISchedule | undefined>) => {
			if (action.payload === undefined) {
				state.value = {
					name: EMPTY_SCHEDULE,
					courses: [],
					newSchedule: true,
					undoStack: []
				};
				return;
			}
			state.value.name = action.payload.name;
			state.value.courses = action.payload.courses;
			state.value.newSchedule = false;
			state.value.undoStack = []; // Reset undo stack when setting a new schedule

			console.log("Set schedule name:", action.payload.name);
		},
		noUnsavedChanges: (state, action: PayloadAction<UICourse[] | undefined>) => {
			// There are no unsaved changes if the current state.courses matches the provided courses.
			// If the provided courses are undefined, then there are no unsaved changes if every paramater
			// in the current state.courses is undefined, an empty string, or any other default.
		
		},
		addCourse: (state) => {
			state.value.courses.push({ id: "", name: undefined, sections: [] });
			// push to the undo stack
			state.value.undoStack.push({
				type: "addCourse",
				courseIndex: state.value.courses.length - 1,
			});
		},
		removeLastCourse: (state) => {
			// push to the undo stack
			state.value.undoStack.push({
				type: "removeCourse",
				course: state.value.courses[state.value.courses.length - 1],
				index: state.value.courses.length,
			});

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
				sectionId: "",
				prof: "",
				time: "",
				isOnline: false,
				isLab: false,
				days: [],
			});

			// push to the undo stack
			state.value.undoStack.push({
				type: "addSection",
				courseIndex: action.payload.courseIndex,
				section: course.sections[course.sections.length - 1],
			});
		},
		removeLastCourseSection: (state) => {
			// remove the last section of the last course if it exists
			const lastCourse = state.value.courses[state.value.courses.length - 1];

			// push to the undo stack
			if (lastCourse && lastCourse.sections.length > 0) {
				state.value.undoStack.push({
					type: "removeSection",
					courseId: lastCourse.id,
					sectionIndex: lastCourse.sections.length - 1,
					section: lastCourse.sections[lastCourse.sections.length - 1],
				});
			}

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

			// push to the undo stack
			state.value.undoStack.push({
				type: "editCourseName",
				courseIndex: action.payload.courseIndex,
				prevName: course?.name || "",
			});
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

			// push to the undo stack
			state.value.undoStack.push({
				type: "editSection",
				courseId: action.payload.courseId,
				sectionIndex: action.payload.sectionIndex,
				prevSection: {
					sectionId: course?.sections[action.payload.sectionIndex].sectionId || "",
					prof: course?.sections[action.payload.sectionIndex].prof || "",
					time: course?.sections[action.payload.sectionIndex].time,
					isOnline: course?.sections[action.payload.sectionIndex].isOnline || false,
					days: course?.sections[action.payload.sectionIndex].days || [],
				},
			});
		},
		// setSelectedCourse: (
		// 	state,
		// 	action: PayloadAction<Course | undefined>
		// ) => {
		// 	state.value.selectedCourse = action.payload;
		// },
	},
});

export const { setSchedule, addCourse, addCourseSection, removeLastCourse, editCourseId, editSectionByIndex, removeLastCourseSection } = coursesSlice.actions;

export const coursesStore = configureStore({
	reducer: coursesSlice.reducer,
});

// Compare arrays shallowly (order matters)
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
