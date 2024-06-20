import { Paper } from "@mui/material";
import styled from "styled-components";
import { RankedSchedule, ScheduledClass, WeekDay, WeekDayName } from "../logic/definitions";
import React from "react";

const StyledScheduleView = styled.div`
	height: 100%;
	display: flex;
	gap: 5px;
`;

const FlexContainer = styled.div`
	display: flex;
	flex-wrap: nowrap;
`;

const StyledTable = styled.table`
	width: 100%;
	height: 100%;
	border-collapse: collapse;
	table-layout: fixed;
	display: table;
	> td,
	th {
		border: 1px black solid;
	}
`;

const Column = styled.div`
	flex: 1;
	height: 100%;
	/* display: block; */
`;

const HeaderRow = styled.div`
	/* height: 100px; */
	text-align: center;
	border: 1px black solid;
	height: 30px;
`;

const StyledBox = styled.div<{ $height: number }>`
	padding: 2px 0;
	border: 1px black solid;
	height: ${(props) => props.$height}px;
`;

const StyledClassView = styled(Paper)`
	&&& {
		background: #b3d2f0;
	}
	height: 100%;
	width: 100%;
	text-align: center;
	font-size: 10px;
	z-index: 4;
`;

// TODO: Re-write to take advantage of tables, as the absoulte positioning approach is kind of mid.

export const TableScheduleView = (props: { selectedSchedule: RankedSchedule }) => {
	const { selectedSchedule } = props;
	const days = [WeekDay.MONDAY, WeekDay.TUESDAY, WeekDay.WEDNESDAY, WeekDay.THURSDAY, WeekDay.FRIDAY];

	return (
		<FlexContainer>
			{Object.values(WeekDayName).map((weekDay) => (
				<Column>
					<HeaderRow>{weekDay}</HeaderRow>
					<StyledBox $height={100}>
						<StyledClassView />
					</StyledBox>
					<StyledBox $height={50} />
					<StyledBox $height={50} />
					<StyledBox $height={50} />
					<StyledBox $height={50} />
					<StyledBox $height={50} />
				</Column>
			))}
		</FlexContainer>
		// <StyledScheduleView>
		// 	{days.map((day) => (
		// 		<Week day={day} schedule={selectedSchedule} />
		// 	))}
		// </StyledScheduleView>
	);
};

const StyledWeekRow = styled(Paper)`
	height: 100%;
	flex: 1;
	text-align: center;
`;

const StyledClassesArea = styled.div`
	position: relative;
`;

const StyledBar = styled.div<{ $position: number; $halfTick: boolean }>`
	position: absolute;
	top: ${(props) => props.$position}px;
	width: 100%;
	height: 1px;
	background: ${(props) => (props.$halfTick ? "#636363" : "#a3a3a3")};
	z-index: 0;
`;

// export const Week = (props: { schedule: RankedSchedule; day: WeekDay }) => {
// 	const { schedule, day } = props;

// 	const bars = Array.from({ length: 30 }, (_, i) => i + 1);
// 	return (
// 		<StyledWeekRow>
// 			{WeekDayName[day]}
// 			<StyledClassesArea>
// 				{bars.map((bar) => (
// 					<StyledBar $position={(bar * 45) / 2} $halfTick={bar % 2 === 0} />
// 				))}
// 				{schedule.classes.map((aClass, index) => {
// 					if (aClass.day === day) return <ClassView aClass={aClass} key={index} />;
// 					return <></>;
// 				})}
// 			</StyledClassesArea>
// 		</StyledWeekRow>
// 	);
// };

// export const ClassView = (props: { aClass: ScheduledClass }) => {
// 	const { aClass } = props;

// 	const mul = 45;
// 	const hoursOffset = 8;

// 	// TODO: Migrate to table approach
// 	// Since this math is just funny numbers
// 	const startPos =
// 		aClass.time.startTime.hours * mul + (aClass.time.startTime.minutes - 10) * (mul / 60) - hoursOffset * mul;
// 	const endPos = aClass.time.endTime.hours * mul + (aClass.time.endTime.minutes - 3) * (mul / 60) - hoursOffset * mul;

// 	return (
// 		<StyledClassView elevation={3} height={endPos - startPos} position={startPos}>
// 			<strong>
// 				{aClass.id} {aClass.sectionId}
// 			</strong>
// 			<br />
// 			{aClass.time.startTime.toString()} - {aClass.time.endTime.toString()}
// 			<br />
// 			{aClass.isOnline && "ONLINE"}
// 		</StyledClassView>
// 	);
// };
