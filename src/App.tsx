import React from "react";
import styled from "styled-components";
import { TabBar } from "./components/TabBar";
import { altnerateFilterInvalidSchedules, generateSchedules, parseSchedules, rankByFreeDays } from "./logic/ranker";
import { ScheduleView } from "./components/ScheduleView";
import schedule from "./logic/schedule.json";
import { TableScheduleView } from "./components/TableScheduleView";
import { Course } from "./logic/definitions";

const MainContainer = styled.div`
	display: flex;
	flex-direction: row;

	height: 100%;
`;

const StyledScreenResults = styled.div`
	flex: 1;
`;

export const App = () => {
	const [classes, setClasses] = React.useState<Course[]>(parseSchedules(schedule.classes)); // default
	const [scheduleIndex, setScheduleIndex] = React.useState<number>(0);

	const rankedSchedules = React.useMemo(
		() => rankByFreeDays(altnerateFilterInvalidSchedules(generateSchedules(classes))),
		[classes]
	);

	console.log(rankedSchedules.length);

	return (
		<MainContainer>
			<StyledScreenResults>
				{/* <button onClick={() => generateAndFilter(false)}>Generate #1</button>
				<button onClick={() => generateAndFilter(true)}>Generate #2</button>

				<button onClick={() => getNumOfCombinations(MAIN_SCHEDULE)}>COMBINATIONS</button> */}
				<ScheduleView selectedSchedule={rankedSchedules[scheduleIndex]} />
			</StyledScreenResults>
			<TabBar
				value={scheduleIndex}
				setValue={setScheduleIndex}
				selectedSchedule={rankedSchedules[scheduleIndex]}
				setSchedule={(a) => setClasses(a)}
			/>
		</MainContainer>
	);
};
