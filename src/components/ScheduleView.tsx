import React from "react";
import styled from "styled-components";
import { Paper, Tooltip } from "@mui/material";
import { Frequency, ScheduledClass, WeekDay, WeekDayName } from "../logic/definitions";
import { enumToList } from "../utils/objectUtils";
import { useAppSelector } from "../ui/hooks";
import {
	CourseColorMap,
	availableCourseColors,
	selectCourseColorMap,
	selectSelectedSchedule,
} from "../ui/scheduleViewUI";

const StyledScheduleView = styled.div`
	background: #f0f0f0;

	height: 100%;
	display: flex;
	gap: 5px;

	&:nth-last-child(n) {
		padding-right: 5px;
	}
`;

// ─── Lane assignment ─────────────────────────────────────────────────────────

type Positioned = ScheduledClass & { lane: number; laneCount: number };

/**
 * Assigns each class a lane index within its overlap cluster.
 * Non-overlapping classes get laneCount=1 (full width).
 * Within a cluster, EVEN comes first (lane 0), ODD second (lane 1),
 * then remaining classes by start time.
 */
function assignLanes(classes: ScheduledClass[]): Positioned[] {
	const sorted = [...classes].sort((a, b) =>
		a.time.startTime.compare(b.time.startTime)
	);

	const result: Positioned[] = [];
	// Tracks the furthest end time seen so far in the current cluster
	let clusterEnd = sorted[0]?.time.endTime ?? null;
	let clusterStart = 0;

	const flushCluster = (endExclusive: number) => {
		const cluster = sorted.slice(clusterStart, endExclusive);
		// Sort within cluster: EVEN → ODD → rest (by original order)
		const ordered = [
			...cluster.filter((c) => c.frequency === Frequency.EVEN),
			...cluster.filter((c) => c.frequency === Frequency.ODD),
			...cluster.filter(
				(c) =>
					c.frequency !== Frequency.EVEN && c.frequency !== Frequency.ODD
			),
		];
		ordered.forEach((c, lane) => {
			result.push({ ...c, lane, laneCount: cluster.length });
		});
	};

	for (let i = 1; i < sorted.length; i++) {
		const cur = sorted[i];
		// Overlaps if current starts before the furthest end seen
		if (cur.time.startTime.isBefore(clusterEnd!)) {
			// Extend cluster end if needed
			if (cur.time.endTime.isAfter(clusterEnd!)) {
				clusterEnd = cur.time.endTime;
			}
		} else {
			flushCluster(i);
			clusterStart = i;
			clusterEnd = cur.time.endTime;
		}
	}
	if (sorted.length > 0) {
		flushCluster(sorted.length);
	}

	return result;
}

// ─── Components ──────────────────────────────────────────────────────────────

export const ScheduleView = () => {
	const selectedSchedule = useAppSelector(selectSelectedSchedule);
	const courseColorMap = useAppSelector(selectCourseColorMap);

	const numTicks = 30;
	const days = enumToList(WeekDay);

	const classesByWeek = React.useMemo(() => {
		return selectedSchedule?.classes.reduce((acc, val) => {
			if (!acc[val.day]) {
				acc[val.day] = [];
			}
			acc[val.day].push(val);
			return acc;
		}, {} as Record<WeekDay, ScheduledClass[]>);
	}, [selectedSchedule]);

	return (
		<StyledScheduleView>
			<TimeIndication numTicks={numTicks} />
			{days.map((day) => (
				<Week
					key={day}
					schedule={classesByWeek?.[day]}
					day={day}
					numTicks={numTicks}
					courseColorMap={courseColorMap}
				/>
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
	padding-top: 5px;
	height: 25px;
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

export const TimeIndication = ({ numTicks }: { numTicks: number }) => {
	const times = Array.from(
		{ length: numTicks },
		(_, i) => `${Math.floor(i / 2 + 8)}:${i % 2 === 0 ? "00" : "30"}`
	);

	return (
		<StyledTimeIndicator>
			<PaddedWeekName></PaddedWeekName>
			<AbsoluteTimeRegion>
				{times.map((time, i) => (
					<AbsoluteTime $top={(100 * i) / numTicks} key={time}>
						{time}
					</AbsoluteTime>
				))}
			</AbsoluteTimeRegion>
		</StyledTimeIndicator>
	);
};

export const Week = (props: {
	schedule: ScheduledClass[] | undefined;
	day: WeekDay;
	numTicks: number;
	courseColorMap: CourseColorMap;
}) => {
	const { schedule, day, numTicks, courseColorMap } = props;

	const bars = Array.from({ length: numTicks }, (_, i) => i);
	const positioned = React.useMemo(
		() => (schedule ? assignLanes(schedule) : []),
		[schedule]
	);

	return (
		<StyledWeekRow elevation={1}>
			<PaddedWeekName key={day}>{WeekDayName[day]}</PaddedWeekName>
			<StyledClassesArea>
				{bars.map((i) => (
					<StyledBar
						key={(100 * i) / numTicks}
						$halfTick={i % 2 !== 0}
						$position={(100 * i) / numTicks}
					/>
				))}
				{positioned.map((scheduledClass) => {
					const color = scheduledClass.isLab
						? (courseColorMap.lab[scheduledClass.id] ?? availableCourseColors[0])
						: (courseColorMap.regular[scheduledClass.id] ?? availableCourseColors[0]);
					return (
						<ClassView
							key={`${scheduledClass.id}-${scheduledClass.sectionId}`}
							aClass={scheduledClass}
							numTicks={numTicks}
							color={color}
							lane={scheduledClass.lane}
							laneCount={scheduledClass.laneCount}
						/>
					);
				})}
			</StyledClassesArea>
		</StyledWeekRow>
	);
};

const StyledClassView = styled.div<{
	$position: number;
	$height: number;
	$paddHoriz: number;
	$width: number;
	$left: number;
}>`
	position: absolute;
	top: ${(props) => props.$position}%;
	height: ${(props) => props.$height}%;
	width: ${(props) => props.$width}%;
	left: ${(props) => props.$left}%;

	flex: 1;
	text-align: center;
	font-size: 10px;
	z-index: 4;

	padding-left: ${(props) => props.$paddHoriz + "px"};
	box-sizing: border-box;
`;

const PaperView = styled(Paper)<{ $color: string }>`
	&&& {
		background: ${(props) => props.$color};
	}
	width: 100%;
	height: 100%;
	padding: 5px;
	box-sizing: border-box;
	position: relative;
	overflow: hidden;
`;


/** Resolve percentage width and left offset for a class card. */
function resolveLayout(
	lane: number,
	laneCount: number,
	frequency: Frequency | undefined
): { width: number; left: number } {
	if (laneCount > 1) {
		// Real time overlap: equal split regardless of frequency
		const w = 100 / laneCount;
		return { width: w, left: lane * w };
	}
	// Solo slot — nudge biweekly classes to their side at 80% width
	if (frequency === Frequency.EVEN) return { width: 80, left: 0 };
	if (frequency === Frequency.ODD) return { width: 80, left: 20 };
	return { width: 100, left: 0 };
}

export const ClassView = (props: {
	aClass: ScheduledClass;
	numTicks: number;
	color: string;
	lane: number;
	laneCount: number;
}) => {
	const { aClass, numTicks, color, lane, laneCount } = props;

	const mul = (100 * 2) / numTicks;
	const hoursOffset = 8;

	const startPos =
		aClass.time.startTime.hours * mul +
		aClass.time.startTime.minutes * (mul / 60) -
		hoursOffset * mul;
	const endPos =
		aClass.time.endTime.hours * mul +
		aClass.time.endTime.minutes * (mul / 60) -
		hoursOffset * mul;

	const { width, left } = resolveLayout(lane, laneCount, aClass.frequency);
	const durationMinutes = aClass.time.startTime.durationMinutes(aClass.time.endTime);
	const isNarrow = laneCount > 1 && durationMinutes < 120;

	const tooltipContent = isNarrow ? (
		<>
			{aClass.time.toString()}
			<br />
			{aClass.prof}
			{aClass.isOnline && (
				<>
					<br />
					ONLINE
				</>
			)}
		</>
	) : null;

	const cardInner = (
		<PaperView elevation={1} $color={color}>
			<strong>
				{aClass.id} {aClass.sectionId}
			</strong>
			{!isNarrow && (
				<>
					<br />
					{aClass.time.toString()}
					<br />
					{aClass.prof}
					<br />
					{aClass.isOnline && "ONLINE"}
				</>
			)}
		</PaperView>
	);

	return (
		<StyledClassView
			$height={endPos - startPos}
			$position={startPos}
			$paddHoriz={1}
			$width={width}
			$left={left}
		>
			{isNarrow ? (
				<Tooltip title={tooltipContent} placement="right" arrow>
					{cardInner}
				</Tooltip>
			) : (
				cardInner
			)}
		</StyledClassView>
	);
};
