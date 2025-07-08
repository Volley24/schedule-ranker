import { WeightCategory } from "../App";
import { TimeRange } from "./time";

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

export type Schedule = {
	name: string;
	courses: Course[];
};

// Basic couse metadata
export type CourseMetaData = {
	id: string;
	name?: string;
};

export type CourseDetails = {
	sectionId: string;
	prof: string;
	time: TimeRange; // Can be undefined if the course is online or has no specific time
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

// A spesific class which occurs on a specific day
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
	scores: Map<WeightCategory, number>;
};
