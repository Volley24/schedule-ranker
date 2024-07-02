import React from "react";
import styled from "styled-components";
import { TabBar } from "./components/TabBar";
import { filterInvalidSchedules, generateSchedules, parseSchedules, rankSchedules } from "./logic/ranker";
import { ScheduleView } from "./components/ScheduleView";
import schedule from "./logic/schedule.json";
import { Schedule } from "./logic/definitions";

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
	const [classes, setClasses] = React.useState<Schedule[]>([]);
	const [weights, setWeights] = React.useState<Weights>(initializeWeights);

	React.useEffect(() => {
		setClasses(filterInvalidSchedules(generateSchedules(parseSchedules(schedule.classes))));
	}, []);
	const [scheduleIndex, setScheduleIndex] = React.useState<number>(1);

	const rankedSchedules = React.useMemo(() => rankSchedules(classes, weights), [classes, weights]);

	// Maybe we should be defining the tabs of tab bar...
	// Else, we need prop drill EVERYTHING!!!
	// Or use redux lmao
	return (
		<MainContainer>
			<StyledScreenResults>
				<ScheduleView selectedSchedule={rankedSchedules[scheduleIndex - 1]} />
			</StyledScreenResults>
			<TabBar
				value={scheduleIndex}
				setValue={setScheduleIndex}
				setSchedule={setClasses}
				selectedSchedule={rankedSchedules[scheduleIndex - 1]}
				weights={weights}
				setWeights={setWeights}
				maxSchedules={rankedSchedules.length}
			/>
		</MainContainer>
	);
};
