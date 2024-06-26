import { WeightCategory } from "../App";
import { Course, LabSection, RankedSchedule, RawCourse, Schedule, ScheduledClass, WeekDay } from "./definitions";
import { TimeRange } from "./time";

/**
 * Sort the schedule by number of free days. Modifies the original list.
 * @param schedule A list of classes which is sorted by start time and days, and which does not have any overlapping classes.
 * @returns A sorted schedule with the "best" schedules at the start, and the "worst" ones at the bottom.
 */
export const rankSchedules = (schedule: Schedule[], weights: Map<WeightCategory, number>): RankedSchedule[] => {
	let dayRecord: Record<string, boolean> = {};

	// Sliders to control the weights
	// It doesn't matter what they add up to.

	// Would be nice to have a data structure for the classes already sorted + in their respect weeks.
	// As most of these algorithms will use that in some way.
	// The alternateFilterMethod, although slower, provides this data structure.

	const getDayOffScore = (schedule: Schedule) => {
		dayRecord = {};
		for (const classA of schedule) {
			// Online classes don't really count
			// As you are still home.
			if (!classA.isOnline) {
				dayRecord[classA.day] = true;
			}
			if (Object.keys(dayRecord).length === 5) break;
		}

		return Object.keys(dayRecord).length === 5 ? 0 : 10;
	};

	// Weights aren't enough...
	// We need to configure what a good score is!
	// What if only wants early classes!
	const getEarlyClassTimeScore = (schedule: Schedule) => {
		// 10 = No penalty (~11AM)

		const timeMap: Record<number, number> = {
			8: 0,
			8.5: 3,
			9: 6,
			9.5: 8,
			10: 9,
			10.5: 10,
		};

		const earliestClassForDay: Record<string, ScheduledClass> = {};
		schedule.forEach((aClass) => {
			const earilestClass = earliestClassForDay[aClass.day];
			if (!earilestClass || aClass.time.startTime.isBefore(earilestClass.time.startTime)) {
				earliestClassForDay[aClass.day] = aClass;
			}
		});

		const earliestClasses = Object.values(earliestClassForDay);

		return (
			earliestClasses.reduce((acc, val) => {
				let decimalHour = val.time.startTime.getDecimalHour();

				if (val.isOnline) {
					// NOTICE: The real score of a class being early considers the commute!
					// So for an online class, add the commute time (+1h30)
					decimalHour += 1.5;
				}

				if (decimalHour <= 8) {
					return acc + timeMap[8];
				} else if (decimalHour >= 10.5) {
					return acc + timeMap[10.5];
				}
				return acc + timeMap[decimalHour];
			}, 0) / earliestClasses.length
		);
		/*
			[6:30AM]  8 AM     - 0
			[7AM]     8:30 AM  - 3
			[7:30AM]  9 AM     - 6
			[8AM]     9:30 AM  - 8
			[8:30AM]  10 AM    - 9
			[9AM]     10:30 AM - 10
			[9:30AM]  11 AM +  - 10
		*/

		// 5PM - 10PM? = 10
		// late class score =
	};

	const getLateClassTimeScore = (schedule: Schedule) => {
		// 10 = No penalty (~11AM)

		const timeMap: Record<number, number> = {
			18: 9,
			18.5: 8,
			19: 6,
			19.5: 5,
			20: 4,
			20.5: 3,
			21: 2,
			21.5: 1,
		};

		const latestClassForEachDay: Record<string, ScheduledClass> = {};
		schedule.forEach((aClass) => {
			const latestClass = latestClassForEachDay[aClass.day];
			if (!latestClass || aClass.time.startTime.isAfter(latestClass.time.startTime)) {
				latestClassForEachDay[aClass.day] = aClass;
			}
		});

		const latestClasses = Object.values(latestClassForEachDay);

		return (
			latestClasses.reduce((acc, val) => {
				// debugger;
				let decimalHour = val.time.endTime.getDecimalHour();

				if (val.isOnline) {
					// NOTICE: The real score of a class being early considers the commute!
					// So for an online class, substract the commute time (-1h30)
					decimalHour -= 1.5;
				}

				if (decimalHour < 18) {
					return acc + 10;
				} else if (decimalHour > 21.5) {
					return acc + 0;
				}
				return acc + timeMap[decimalHour];
			}, 0) / latestClasses.length
		);
		/*
			[6:30AM]  8 AM     - 0
			[7AM]     8:30 AM  - 3
			[7:30AM]  9 AM     - 6
			[8AM]     9:30 AM  - 8
			[8:30AM]  10 AM    - 9
			[9AM]     10:30 AM - 10
			[9:30AM]  11 AM +  - 10
		*/

		// 5PM - 10PM? = 10
		// late class score =
	};

	// After x amount of time, there should be y break.
	//
	const getBreakScore = (schedule: Schedule) => {
		// Get a score, from 0 - 10, based on how good the breaks are.
		// 10 being a particular day follows the adequete break times.

		// Warning: Assumes schedule is LINEARALY SORTED.
		const breakRecord: Record<string, number> = {};
		const classRecord: Record<string, number> = {};
		// debugger;

		for (let i = 0; i < schedule.length; i++) {
			const aClass = schedule[i];
			const lastClass = schedule[i - 1];

			if (classRecord[aClass.day] === undefined) classRecord[aClass.day] = 0;
			const duration = aClass.time.startTime.durationMinutes(aClass.time.endTime);
			classRecord[aClass.day] += duration;

			if (lastClass === undefined) continue;
			if (aClass.day !== lastClass.day) continue;

			const breakTime = lastClass.time.endTime.durationMinutes(aClass.time.startTime);

			// Validate that break time isn't too big
			// Should be a seperate algorithm => "Break Health"
			// But like... 15m break & 30m break vs 45m break isn't a big deal :skull:

			//
			/*
				For now, some basic linear equations will suffice.

				Used desmos for this.

				Break falloff (early)
				[15 - 60]
				y = x / 4.5 - 1 / 0.3 


				Break falloff (late)
				[120 - 300]
				y = -x / 18 + 1 / 0.06 

				Points of interest:
				15m = 0
				... short fallout
				1h = 10
				2h = 10
				... longer fallout
				5h = 0 
			*/
			// let score: number;
			// if (breakTime < 60) {
			// 	score = Math.max(0, breakTime / 4.5 - 1 / 0.3);
			// } else if (breakTime > 120) {
			// 	score = Math.max(0, -breakTime / 18 + 1 / 0.06);
			// }else {
			// 	score = 10;
			// }

			if (!breakRecord[aClass.day]) breakRecord[aClass.day] = 0;
			breakRecord[aClass.day] += breakTime;
		}

		return (
			Object.keys(breakRecord).reduce((acc, weekDay) => {
				const totalClassTime = classRecord[weekDay];
				const totalBreakTime = breakRecord[weekDay];

				if (totalBreakTime === 0) {
					// ratio is totalClassTime now

					// i.e: < 2

					if (totalClassTime <= 2) return acc + 10;

					const k = 2 / 4.5;
					return acc + Math.max(10 + (-5 * k * (totalClassTime - 2) ** 2) / 2, 0);
				}
				//2.66666666667
				const ratio = totalClassTime / totalBreakTime;

				// Quadratic ratio.
				// A bit too fancy for now, but that's fine.
				if (ratio < 2) {
					// y = 5x
					return acc + Math.max(10 + (-5 * (ratio - 2) ** 2) / 2, 0);
				} else if (ratio > 2) {
					// 5h of classes
					const k = 2 / 4.5;
					return acc + Math.max(10 + (-5 * k * (ratio - 2) ** 2) / 2, 0);
				} else {
					return acc + 10;
				}
			}, 0) / Object.keys(breakRecord).length
		);
	};

	const rankedSchedules: RankedSchedule[] = schedule.map((schedule) => {
		const scoreMap = new Map<WeightCategory, number>();
		scoreMap.set(WeightCategory.BREAK_AMOUNT, getBreakScore(schedule));
		scoreMap.set(WeightCategory.DAY_OFF, getDayOffScore(schedule));
		scoreMap.set(WeightCategory.NO_EARLY_CLASSES, getEarlyClassTimeScore(schedule));
		scoreMap.set(WeightCategory.NO_LATE_CLASSES, getLateClassTimeScore(schedule));

		const totalScore = Array.from(scoreMap.entries()).reduce(
			(totalScore, [key, score]) => totalScore + (weights.get(key) ?? 0) * score,
			0
		);

		return {
			classes: schedule,
			totalScore,
			scores: scoreMap,
		};
	});

	return rankedSchedules.sort((a, b) => {
		return b.totalScore - a.totalScore;
	});
};

export const parseSchedules = (courses: RawCourse[]): Course[] => {
	const mapClasses = (strSplit: string[], offset: number = 0): LabSection => {
		type Days = "mon" | "tue" | "wed" | "thu" | "fri";
		const mapDay: Record<Days, WeekDay> = {
			mon: WeekDay.MONDAY,
			tue: WeekDay.TUESDAY,
			wed: WeekDay.WEDNESDAY,
			thu: WeekDay.THURSDAY,
			fri: WeekDay.FRIDAY,
		};

		return {
			sectionId: strSplit[0 + offset],
			prof: strSplit[1 + offset],
			days: strSplit[2 + offset].split("/").map((strDay) => mapDay[strDay.toLowerCase() as Days]),
			time: TimeRange.create(strSplit[3 + offset]),
			isOnline: strSplit[4 + offset] === "ONLINE",
		};
	};

	return courses.map((course) => ({
		...course,
		sections: course.sections.map((str) => {
			return mapClasses(str.split(","));
		}),
		labSections: course.labSections.map((str) => {
			const strSplit = str.split(",");
			const labSection = mapClasses(strSplit, 1);
			labSection.classSectionIds = strSplit[0].split("/");
			return labSection;
		}),
	}));
};

// export const MAIN_SCHEDULE = parseSchedules(schedule.classes);

export const getNumOfCombinations = (courses: Course[]) => {
	let combinations = 0;
	courses.forEach((course) => {
		let combinationsHere = 0;

		if (course.labSections.length === 0) {
			combinations *= course.sections.length;
			return;
		}

		course.labSections.forEach((lab) => {
			combinationsHere += lab.classSectionIds?.length ?? course.sections.length;
		});

		if (combinations === 0) {
			combinations = combinationsHere;
		} else {
			combinations *= combinationsHere;
		}
	});
	return combinations;
};

export const filterInvalidSchedules = (schedules: Schedule[]) => {
	const filtered = schedules
		.map((schedule) =>
			schedule.sort((a, b) => {
				if (a.day !== b.day) return a.day - b.day;

				return a.time.startTime.compare(b.time.startTime);
			})
		)
		.filter((schedule) => {
			for (let i = 1; i < schedule.length; i++) {
				const currentClass = schedule[i];
				const lastClass = schedule[i - 1];

				if (currentClass.day !== lastClass.day) {
					continue;
				}
				if (currentClass.time.startTime.isBefore(lastClass.time.endTime)) {
					return false;
				}
			}
			return true;
		});
	return filtered;
};

export const generateSchedules = (courses: Course[]): Schedule[] => {
	console.log("Generating schedules...");
	const schedules: Schedule[] = [];

	const recurse = (schedule: Schedule = [], index: number) => {
		const myClass = courses[index];
		myClass.sections.forEach((potentialClass) => {
			const newSchedule: Schedule = [...schedule];

			newSchedule.push(
				...potentialClass.days.map((day) => ({
					...myClass,
					...potentialClass,
					day,
					isLab: false,
				}))
			);

			if (myClass.labSections.length === 0) {
				// only possibility is that one class w/ no labs.
				if (index + 1 < courses.length) {
					recurse(newSchedule, index + 1);
				} else {
					schedules.push(newSchedule);
				}
				return;
			}

			myClass.labSections.forEach((potentialLab) => {
				const classSectionsIds = potentialLab.classSectionIds;
				if (classSectionsIds && !classSectionsIds.includes(potentialClass.sectionId)) {
					return;
				}
				const newerSchedule: Schedule = [...newSchedule];

				newerSchedule.push(
					...potentialLab.days.map((day) => ({
						...myClass,
						...potentialLab,
						day,
						isLab: true,
					}))
				);

				if (index + 1 < courses.length) {
					recurse(newerSchedule, index + 1);
				} else {
					schedules.push(newerSchedule);
				}
			});
		});
	};

	if (courses.length === 0) {
		return [];
	}
	recurse([], 0);
	return schedules;
};
