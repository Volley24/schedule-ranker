import React from "react";
import styled from "styled-components";
import { TabBar } from "./components/TabBar";
import { computeValidSchedules, rankSchedules } from "./logic/ranker";
import { ScheduleView } from "./components/ScheduleView";
import { Course, ScheduledClass } from "./logic/definitions";

const MainContainer = styled.div`
	display: flex;
	flex-direction: row;

	height: 100%;
`;

const StyledScreenResults = styled.div`
	flex: 1;
`;

export enum WeightCategory {
	DAY_OFF = "Day Off",
	NO_EARLY_CLASSES = "Day Start Time",
	NO_LATE_CLASSES = "Day End Time",
	BREAK_AMOUNT = "Break/Class Ratio",
}

export type Weights = Map<WeightCategory, number>;

const initializeWeights = () => {
	const newMap = new Map<WeightCategory, number>();

	newMap.set(WeightCategory.NO_EARLY_CLASSES, 6 / 2);
	newMap.set(WeightCategory.NO_LATE_CLASSES, 3 / 2);
	newMap.set(WeightCategory.BREAK_AMOUNT, 1 / 2);
	newMap.set(WeightCategory.DAY_OFF, 10 / 2);

	return newMap;
};

export const App = () => {
	const [classes, setClasses] = React.useState<ScheduledClass[][]>([]);
	const [courses, setCourses] = React.useState<Course[]>([]);
	const [includedCourseIds, setIncludedCourseIds] = React.useState<Set<string>>(new Set());
	const [weights, setWeights] = React.useState<Weights>(initializeWeights);
	const [scheduleIndex, setScheduleIndex] = React.useState<number>(1);

	const rankedSchedules = React.useMemo(() => rankSchedules(classes, weights), [classes, weights]);

	const activateSchedule = (newCourses: Course[], validSchedules: ScheduledClass[][]) => {
		setCourses(newCourses);
		setIncludedCourseIds(new Set(newCourses.map((c) => c.id)));
		setClasses(validSchedules);
		setScheduleIndex(1);
	};

	const toggleCourseInclusion = (courseId: string, included: boolean) => {
		const newIds = new Set(includedCourseIds);
		if (included) {
			newIds.add(courseId);
		} else {
			newIds.delete(courseId);
		}
		setIncludedCourseIds(newIds);

		const filteredCourses = courses.filter((c) => newIds.has(c.id));
		const { validSchedules } = computeValidSchedules(filteredCourses);
		setClasses(validSchedules);
		setScheduleIndex(1);
	};

	return (
		<MainContainer>
			<StyledScreenResults>
				<ScheduleView selectedSchedule={rankedSchedules[scheduleIndex - 1]} />
			</StyledScreenResults>
			<TabBar
				value={scheduleIndex}
				setValue={setScheduleIndex}
				activateSchedule={activateSchedule}
				selectedSchedule={rankedSchedules[scheduleIndex - 1]}
				weights={weights}
				setWeights={setWeights}
				maxSchedules={rankedSchedules.length}
				courses={courses}
				includedCourseIds={includedCourseIds}
				onToggleCourseInclusion={toggleCourseInclusion}
			/>
		</MainContainer>
	);
};
