import { TimeRange } from "./time";

export enum Frequency {
	EVEN = "even",
	ODD = "odd",
}

export const computeFrequency = (sectionId: string): Frequency | undefined => {
	if (/L\d{1,2}E/.test(sectionId)) return Frequency.EVEN;
	if (/L\d{1,2}O/.test(sectionId)) return Frequency.ODD;
	return undefined;
};

export enum WeekDay {
	MONDAY,
	TUESDAY,
	WEDNESDAY,
	THURSDAY,
	FRIDAY,
}

export const WeekDayName = {
	[WeekDay.MONDAY]: "Monday",
	[WeekDay.TUESDAY]: "Tuesday",
	[WeekDay.WEDNESDAY]: "Wednesday",
	[WeekDay.THURSDAY]: "Thursday",
	[WeekDay.FRIDAY]: "Friday",
};

export enum WeightCategory {
	DAY_OFF = "Day Off",
	NO_EARLY_CLASSES = "Day Start Time",
	NO_LATE_CLASSES = "Day End Time",
	BREAK_AMOUNT = "Break/Class Ratio",
}

export type Weights = Record<WeightCategory, number>;

export type Schedule = {
	name: string;
	courses: Course[];
};

// Basic course metadata
export type CourseMetaData = {
	id: string;
	name?: string;
};

export type CourseDetails = {
	sectionId: string;
	prof: string;
	time: TimeRange;
	frequency?: Frequency;
};

// Class and sections as per schedule
export type RawCourse = CourseMetaData & {
	sections: string[];
	labSections: string[];
};

export type Course = CourseMetaData & {
	sections: ClassSection[];
};

export type ClassSection = CourseDetails & {
	isLab: boolean;
	isOnline: boolean;
	days: WeekDay[];
	classSectionIds?: string[];
};

// A specific class which occurs on a specific day
export type ScheduledClass = CourseMetaData &
	CourseDetails & {
		day: WeekDay;
		isLab: boolean;
		isOnline: boolean;
	};

// A ranked schedule is a schedule with scores for different weight categories
export type RankedSchedule = {
	classes: ScheduledClass[];
	totalScore: number;
	scores: Weights;
};
