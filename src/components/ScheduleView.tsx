import { Paper } from "@mui/material";
import styled from "styled-components";
import { RankedSchedule, ScheduledClass, WeekDay, WeekDayName } from "../logic/definitions";
import React from "react";

const StyledScheduleView = styled.div`
	height: 100%;
	display: flex;
	gap: 5px;
`;

export const ScheduleView = (props: { selectedSchedule: RankedSchedule | undefined }) => {
	const { selectedSchedule } = props;
	const days = [WeekDay.MONDAY, WeekDay.TUESDAY, WeekDay.WEDNESDAY, WeekDay.THURSDAY, WeekDay.FRIDAY];

	return (
		<StyledScheduleView>
			<TimeIndication />
			{days.map((day) => (
				<Week day={day} schedule={selectedSchedule} />
			))}
		</StyledScheduleView>
	);
};

const StyledWeekRow = styled(Paper)`
	display: flex;
	flex-direction: column;
	height: 100%;
	flex: 1;
	text-align: center;
`;

const StyledClassesArea = styled.div`
	flex: 1;
	position: relative;
	height: inherit;
`;

const StyledBar = styled.div<{ $position: number; $halfTick: boolean }>`
	position: absolute;
	top: ${(props) => props.$position}%;
	width: 100%;
	border-bottom: 1px solid ${(props) => (props.$halfTick ? "#9b9b9b" : "#000000")};
	z-index: 0;
`;

const StyledTimeIndicator = styled(Paper)`
	display: flex;
	flex-direction: column;
	width: 40px;
`;

const PaddedWeekName = styled.div`
	height: 31.6px;
`;

const AbsoluteTimeRegion = styled.div`
	flex: 1;
	position: relative;
`;

const AbsoluteTime = styled.div<{ $top: number }>`
	font-size: 10px;
	position: absolute;
	top: calc(${(props) => props.$top}% - 6px);
	right: 5%;
`;

export const TimeIndication = () => {
	const NUM_TICKS = 30;
	const times = Array.from({ length: NUM_TICKS }, (_, i) => `${Math.floor(i / 2 + 8)}:${i % 2 === 0 ? "00" : "30"}`);

	return (
		<StyledTimeIndicator>
			<PaddedWeekName></PaddedWeekName>
			<AbsoluteTimeRegion>
				{times.map((time, i) => (
					<AbsoluteTime $top={(100 * i) / NUM_TICKS}>{time}</AbsoluteTime>
				))}
			</AbsoluteTimeRegion>
		</StyledTimeIndicator>
	);
};

export const Week = (props: { schedule: RankedSchedule | undefined; day: WeekDay }) => {
	const { schedule, day } = props;
	const NUM_TICKS = 30;

	const bars = Array.from({ length: NUM_TICKS }, (_, i) => i);
	return (
		<StyledWeekRow elevation={2}>
			<PaddedWeekName>{WeekDayName[day]}</PaddedWeekName>
			<StyledClassesArea>
				{bars.map((i) => (
					<StyledBar $halfTick={i % 2 === 0} $position={(100 * i) / NUM_TICKS} />
				))}
				{schedule &&
					schedule.classes.map((aClass, index) => {
						if (aClass.day === day) return <ClassView aClass={aClass} key={index} numTicks={NUM_TICKS} />;
						return <></>;
					})}
			</StyledClassesArea>
		</StyledWeekRow>
	);
};

const StyledClassView = styled.div<{ position: number; height: number }>`
	position: absolute;
	top: ${(props) => props.position}%;
	height: ${(props) => props.height}%;
	/* margin-top: 5px; */

	flex: 1;
	text-align: center;
	font-size: 10px;
	z-index: 4;

	width: 100%;
	padding: 0 1px;
	box-sizing: border-box;
`;

const PaperView = styled(Paper)`
	&&& {
		background: #b3d2f0;
	}
	height: 100%;
`;

const PaddedView = styled.div`
	padding: 0 5px;
	width: 100%;
	box-sizing: border-box;
`;

export const ClassView = (props: { aClass: ScheduledClass; numTicks: number }) => {
	const { aClass, numTicks } = props;

	const mul = (100 * 2) / numTicks;
	const hoursOffset = 8;

	// TODO: Migrate to table approach
	// Since this math is just funny numbers
	const startPos = aClass.time.startTime.hours * mul + aClass.time.startTime.minutes * (mul / 60) - hoursOffset * mul;
	const endPos = aClass.time.endTime.hours * mul + aClass.time.endTime.minutes * (mul / 60) - hoursOffset * mul;

	return (
		<StyledClassView height={endPos - startPos} position={startPos}>
			<PaperView elevation={3}>
				<strong>
					{aClass.id} {aClass.sectionId}
				</strong>
				<br />
				{aClass.time.startTime.toString()} - {aClass.time.endTime.toString()}
				<br />
				{aClass.isOnline && "ONLINE"}
			</PaperView>
		</StyledClassView>
	);
};
