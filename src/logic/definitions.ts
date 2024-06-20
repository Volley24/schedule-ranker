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

export type Schedule = ScheduledClass[];

export type RankedSchedule = {
	classes: ScheduledClass[];
	totalScore: number;

	dayOffScore: number;
	earlyClassScore: number;
	breakScore: number;
	lateClassScore: number;
};

export type ScheduledClass = CourseMetaData &
	CourseDetails & {
		day: WeekDay;
		isLab: boolean;
		isOnline: boolean;
	};

export type CourseMetaData = {
	id: string;
	name: string;
};

export type CourseDetails = {
	sectionId: string;
	prof: string;
	time: TimeRange;
};

export type Course = CourseMetaData & {
	sections: ClassSection[];
	labSections: LabSection[];
};

export type RawCourse = CourseMetaData & {
	sections: string[];
	labSections: string[];
};

export type LabSection = ClassSection & { classSectionIds?: string[] };
export type ClassSection = CourseDetails & {
	isOnline: boolean;
	days: WeekDay[];
};
