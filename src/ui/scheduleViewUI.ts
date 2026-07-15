import { createSlice, createSelector, PayloadAction, current } from "@reduxjs/toolkit";
import { ClassSection, Course, RankedSchedule, ScheduledClass, WeightCategory, Weights } from "../logic/definitions";
import { computeValidSchedules, rankSchedules } from "../logic/ranker";
import { excludeStorage } from "../components/tabs/logic/excludeStorage";
import type { RootState } from "./store";

const defaultWeights: Weights = {
	[WeightCategory.NO_EARLY_CLASSES]: 6 / 2,
	[WeightCategory.NO_LATE_CLASSES]: 3 / 2,
	[WeightCategory.BREAK_AMOUNT]: 1 / 2,
	[WeightCategory.DAY_OFF]: 10 / 2,
};

export type CourseColorMap = {
	regular: Record<string, string>;
	lab: Record<string, string>;
};

export const availableCourseColors = [
	"#b3d2f0", // Blue
	"#b3f0d2", // Green
	"#f0e6b3", // Yellow
	"#f0b3b3", // Red
	"#d6b3f0", // Purple
	"#f0b3e6", // Pink
	"#f0cbb3", // Peach
	"#c7f0b3", // Light Lime
	"#b3c6f0", // Periwinkle
];

/** Stable unique key for a section: "<courseId>::<R|L>::<sectionId>" */
export const makeSectionKey = (courseId: string, section: ClassSection): string =>
	`${courseId}::${section.isLab ? "L" : "R"}::${section.sectionId}`;

type ScheduleViewState = {
	courses: Course[];
	excludedSectionKeys: string[];
	ignoreExcludes: boolean;
	scheduleName: string;
	classes: ScheduledClass[][];
	weights: Weights;
	scheduleIndex: number;
};

const initialState: ScheduleViewState = {
	courses: [],
	excludedSectionKeys: [],
	ignoreExcludes: false,
	scheduleName: "",
	classes: [],
	weights: defaultWeights,
	scheduleIndex: 1,
};

/**
 * Applies section exclusion filters and recomputes valid schedules.
 * A course with all sections excluded is dropped entirely so generateSchedules works correctly.
 * Mutates the draft state directly (for use inside Immer reducers).
 */
function applyFiltersAndRecompute(state: ScheduleViewState): void {
	const plain = current(state);
	const filteredCourses = plain.courses
		.map((course) => ({
			...course,
			sections: plain.ignoreExcludes
				? course.sections
				: course.sections.filter(
						(s) => !state.excludedSectionKeys.includes(makeSectionKey(course.id, s))
				  ),
		}))
		.filter((course) => course.sections.length > 0);
	const { validSchedules } = computeValidSchedules(filteredCourses);
	state.classes = validSchedules;
	state.scheduleIndex = 1;
}

const scheduleViewSlice = createSlice({
	name: "scheduleView",
	initialState,
	reducers: {
		activateSchedule: (
			state,
			action: PayloadAction<{ courses: Course[]; validSchedules: ScheduledClass[][]; scheduleName: string }>
		) => {
			const { courses, validSchedules, scheduleName } = action.payload;
			state.courses = courses;
			state.scheduleName = scheduleName;
			state.ignoreExcludes = false;
			state.excludedSectionKeys = excludeStorage.getExcludes(scheduleName);
			if (state.excludedSectionKeys.length === 0) {
				state.classes = validSchedules;
				state.scheduleIndex = 1;
			} else {
				applyFiltersAndRecompute(state);
			}
		},

		setScheduleIndex: (state, action: PayloadAction<number>) => {
			state.scheduleIndex = action.payload;
		},

		setWeight: (
			state,
			action: PayloadAction<{ category: WeightCategory; value: number }>
		) => {
			state.weights[action.payload.category] = action.payload.value;
		},

		toggleCourseInclusion: (
			state,
			action: PayloadAction<{ courseId: string; included: boolean }>
		) => {
			const { courseId, included } = action.payload;
			const plain = current(state);
			const course = plain.courses.find((c) => c.id === courseId);
			if (!course) return;
			if (included) {
				// Clear all section excludes for this course → fully ON
				state.excludedSectionKeys = state.excludedSectionKeys.filter(
					(k) => !k.startsWith(`${courseId}::`)
				);
			} else {
				// Add all sections to excludes → fully OFF
				for (const section of course.sections) {
					const key = makeSectionKey(courseId, section);
					if (!state.excludedSectionKeys.includes(key)) {
						state.excludedSectionKeys.push(key);
					}
				}
			}
			excludeStorage.putExcludes(state.scheduleName, current(state).excludedSectionKeys);
			applyFiltersAndRecompute(state);
		},

		toggleSectionExclusion: (
			state,
			action: PayloadAction<{ courseId: string; section: ClassSection; excluded: boolean }>
		) => {
			const { courseId, section, excluded } = action.payload;
			const key = makeSectionKey(courseId, section);
			if (excluded) {
				if (!state.excludedSectionKeys.includes(key)) {
					state.excludedSectionKeys.push(key);
				}
			} else {
				state.excludedSectionKeys = state.excludedSectionKeys.filter((k) => k !== key);
			}
			excludeStorage.putExcludes(state.scheduleName, current(state).excludedSectionKeys);
			applyFiltersAndRecompute(state);
		},

		setIgnoreExcludes: (state, action: PayloadAction<boolean>) => {
			state.ignoreExcludes = action.payload;
			applyFiltersAndRecompute(state);
		},

		clearExclusions: (state) => {
			state.excludedSectionKeys = [];
			excludeStorage.clearExcludes(state.scheduleName);
			applyFiltersAndRecompute(state);
		},

		clearCourseExclusions: (state, action: PayloadAction<{ courseId: string }>) => {
			const { courseId } = action.payload;
			state.excludedSectionKeys = state.excludedSectionKeys.filter(
				(k) => !k.startsWith(`${courseId}::`)
			);
			excludeStorage.putExcludes(state.scheduleName, current(state).excludedSectionKeys);
			applyFiltersAndRecompute(state);
		},

		loadExclusions: (state, action: PayloadAction<string[]>) => {
			state.excludedSectionKeys = action.payload;
			excludeStorage.putExcludes(state.scheduleName, action.payload);
			applyFiltersAndRecompute(state);
		},
	},
});

export const {
	activateSchedule,
	setScheduleIndex,
	setWeight,
	toggleCourseInclusion,
	toggleSectionExclusion,
	setIgnoreExcludes,
	clearExclusions,
	clearCourseExclusions,
	loadExclusions,
} = scheduleViewSlice.actions;

export const scheduleViewReducer = scheduleViewSlice.reducer;

// Base selectors
export const selectCourses = (state: RootState) => state.scheduleView.courses;
export const selectExcludedSectionKeys = (state: RootState) => state.scheduleView.excludedSectionKeys;
export const selectIgnoreExcludes = (state: RootState) => state.scheduleView.ignoreExcludes;
export const selectScheduleName = (state: RootState) => state.scheduleView.scheduleName;
export const selectWeights = (state: RootState) => state.scheduleView.weights;
export const selectScheduleIndex = (state: RootState) => state.scheduleView.scheduleIndex;
const selectClasses = (state: RootState) => state.scheduleView.classes;

// Memoized selectors
export const selectRankedSchedules = createSelector(
	selectClasses,
	selectWeights,
	(classes, weights): RankedSchedule[] => rankSchedules(classes, weights)
);

export const selectMaxSchedules = createSelector(
	selectRankedSchedules,
	(ranked) => ranked.length
);

export const selectSelectedSchedule = createSelector(
	selectRankedSchedules,
	selectScheduleIndex,
	(ranked, index): RankedSchedule | undefined => ranked[index - 1]
);

/** Course IDs that have at least one non-excluded section (i.e. will appear in generated schedules). */
export const selectIncludedCourseIds = createSelector(
	selectCourses,
	selectExcludedSectionKeys,
	(courses, excludedKeys) =>
		courses
			.filter((course) =>
				course.sections.some((s) => !excludedKeys.includes(makeSectionKey(course.id, s)))
			)
			.map((c) => c.id)
);

// Stable color per course - derived from the courses list order, not array position.
// Lives here so ScheduleView and ConfigTab share one consistent mapping.
export const selectCourseColorMap = createSelector(
	selectCourses,
	(courses): CourseColorMap => {
		const regular: Record<string, string> = {};
		const lab: Record<string, string> = {};
		courses.forEach((course, i) => {
			const color = availableCourseColors[i % availableCourseColors.length];
			regular[course.id] = color;
			lab[course.id] = color;
		});
		return { regular, lab };
	}
);

/** Returns a human-readable list of excluded sections for display in the UI. */
export const selectExcludedSectionsSummary = createSelector(
	selectCourses,
	selectExcludedSectionKeys,
	(courses, keys) => {
		if (keys.length === 0) return [];
		const results: { courseId: string; section: ClassSection }[] = [];
		for (const course of courses) {
			for (const section of course.sections) {
				if (keys.includes(makeSectionKey(course.id, section))) {
					results.push({ courseId: course.id, section });
				}
			}
		}
		return results;
	}
);
