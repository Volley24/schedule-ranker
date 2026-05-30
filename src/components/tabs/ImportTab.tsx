import React from "react";
import styled from "styled-components";
import { parseSchedules, computeValidSchedules, mapDayWeekToDay } from "../../logic/ranker";
import { Course, ScheduledClass } from "../../logic/definitions";
import {
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Button,
	Divider,
	Typography,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
} from "@mui/material";
import { scheduleStorage } from "./logic/scheduleLocalStorage";
import { CreateScheduleDialog } from "./schedule_create/CreateScheduleDialog";
import { scheduleManager } from "./logic/schedules";
import { TimeRange } from "../../logic/time";

const CenteredDiv = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	text-align: center;
	white-space: pre;
`;

const StyledSavedSchedulesContainer = styled.div`
	margin-top: 10px;
	margin-bottom: 10px;
	width: 100%;
	text-align: center;
	padding: 0 10px;
	box-sizing: border-box;
`;

const SavedScheduleButtonContainer = styled.div`
	display: flex;
	margin-top: 10px;
	justify-content: space-evenly;
`;

const ImportButtonContainer = styled.div`
	width: 100%;
	padding: 10px;
	box-sizing: border-box;
`;

const MessageArea = styled.div`
	width: 100%;
	padding: 10px;
	box-sizing: border-box;
	white-space: pre-wrap;
	word-break: break-word;
	overflow-wrap: anywhere;
	text-align: left;
`;

function serializeCoursesToJSON(scheduleName: string, courses: Course[]): string {
	return JSON.stringify({
		tag: scheduleName,
		classes: courses.map((course) => ({
			id: course.id,
			name: course.name,
			sections: course.sections
				.filter((section) => !section.isLab)
				.map((section) => {
					return `${section.sectionId},${section.prof},${section.days.map((d) => mapDayWeekToDay(d)).join("/")},${section.time.format24h()}${section.isOnline ? ",ONLINE" : ""}`;
				}),
			labSections: course.sections
				.filter((section) => section.isLab)
				.map((section) => {
					return `${section.classSectionIds?.join("/")},${section.sectionId},${section.prof},${section.days.map((d) => mapDayWeekToDay(d)).join("/")},${section.time.format24h()}${section.isOnline ? ",ONLINE" : ""}`;
				}),
		})),
	});
}

function persistSchedule(scheduleName: string, courses: Course[]): void {
	const json = serializeCoursesToJSON(scheduleName, courses);
	scheduleManager.saveSchedule(scheduleName, json);
}

export const ImportTab = (props: { activateSchedule: (courses: Course[], validSchedules: ScheduledClass[][]) => void }) => {
	const { activateSchedule } = props;
	const [messageState, setMessageState] = React.useState("");
	const [selectedSchedule, setSelectedSchedule] = React.useState("None");

	const [isCreatingClasses, setCreatingClasses] = React.useState(false);
	const [noValidCombinationsError, setNoValidCombinationsError] = React.useState<{
		scheduleName: string;
		totalCombinations: number;
	} | null>(null);

	const tryActivateSchedule = (scheduleName: string, courses: Course[]): boolean => {
		const { validSchedules, totalCombinations } = computeValidSchedules(courses);

		if (validSchedules.length === 0) {
			setMessageState("");
			setNoValidCombinationsError({ scheduleName, totalCombinations });
			return false;
		}

		activateSchedule(courses, validSchedules);
		setSelectedSchedule(scheduleName);
		return true;
	};

	const handleSave = (scheduleName: string, courses: Course[]) => {
		persistSchedule(scheduleName, courses);
	};

	const handleCreateAndActivate = (scheduleName: string, courses: Course[]) => {
		persistSchedule(scheduleName, courses);
		tryActivateSchedule(scheduleName, courses);
	};

	const handleScheduleImport = async (files: React.ChangeEvent<HTMLInputElement>) => {
		setMessageState("Importing...");
		const file = files.target.files?.[0];
		if (file) {
			const contents = await file.text();
			importSchedule(file.name, contents, true);
		}
	};

	const importSchedule = (key: string, contents: string, save: boolean) => {
		try {
			const parsedJSON = JSON.parse(contents);
			const schedule = parseSchedules(parsedJSON);

			const transformedCourses: Course[] = schedule.courses.map((course) => ({
				...course,
				sections: course.sections.map((section) => ({
					...section,
					time: TimeRange.create(section.time),
				})),
			}));

			const { validSchedules, totalCombinations } = computeValidSchedules(transformedCourses);

			if (validSchedules.length === 0) {
				setMessageState("");
				setNoValidCombinationsError({
					scheduleName: key,
					totalCombinations,
				});
				return;
			}

			activateSchedule(transformedCourses, validSchedules);

			if (save) scheduleStorage.putSchedule(schedule.name, contents);

			setMessageState(
				[
					`Successfully imported ${schedule.name}!`,
					`File Length: ${contents.length} chars`,
					"",
					`Total combinations: ${totalCombinations}`,
					`Valid combinations: ${validSchedules.length}`,
					"",
					"Classes imported:",
					schedule.courses
						.map((course) => `${course.id} - Sections: ${course.sections.length}`)
						.join("\n"),
				].join("\n")
			);
		} catch (e) {
			setMessageState("Error: Invalid JSON. See console for more details.");
			console.error(e);
		}
	};

	return (
		<CenteredDiv>
			<Dialog
				open={noValidCombinationsError !== null}
				onClose={() => setNoValidCombinationsError(null)}
			>
				<DialogTitle>No Valid Schedules</DialogTitle>
				<DialogContent>
					{noValidCombinationsError && (
						<>
							<strong>{noValidCombinationsError.scheduleName}</strong> has no valid schedule
							combinations.
							<br />
							<br />
							{noValidCombinationsError.totalCombinations === 0
								? "No combinations could be generated. Make sure each course has at least one section."
								: `${noValidCombinationsError.totalCombinations} combination(s) were generated, but all had overlapping classes on the same day.`}
						</>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setNoValidCombinationsError(null)}>OK</Button>
				</DialogActions>
			</Dialog>

			<CreateScheduleDialog
				open={isCreatingClasses}
				close={() => setCreatingClasses(false)}
				onSave={handleSave}
				onCreateAndActivate={handleCreateAndActivate}
			/>
			<ImportButtonContainer>
				<Typography align="left" sx={{ marginBottom: "10px" }}>
					1. Add / Edit a Schedule
				</Typography>
				<Button variant="contained" component="label" onClick={() => setCreatingClasses(true)}>
					Schedule Editor
				</Button>
			</ImportButtonContainer>

			<Divider color="#000000" sx={{ width: "100%" }} />

			<StyledSavedSchedulesContainer>
				<Typography align="left" sx={{ marginBottom: "10px" }}>
					2. Select/Load Saved Schedule
				</Typography>

				<FormControl sx={{ width: 300, textAlign: "left" }}>
					<InputLabel>Saved Schedules</InputLabel>
					<Select
						value={selectedSchedule}
						label="Saved Schedules"
						onChange={(event) => {
							setSelectedSchedule(event.target.value);
						}}
					>
						<MenuItem value={"None"}>None</MenuItem>
						{scheduleStorage.getAllScheduleKeys().map((scheduleName) => (
							<MenuItem key={scheduleName} value={scheduleName}>
								{scheduleName}
							</MenuItem>
						))}
					</Select>
				</FormControl>
				<SavedScheduleButtonContainer>
				<Button
					variant="contained"
					component="label"
					disabled={selectedSchedule === "None"}
					onClick={() => {
						const fileContents = scheduleStorage.getScheduleByKey(selectedSchedule);

						if (fileContents) {
							importSchedule(selectedSchedule, fileContents, false);
						}
					}}
				>
					Load
				</Button>
					<Button variant="contained" component="label" color="error" disabled>
						Remove
					</Button>
				</SavedScheduleButtonContainer>
			</StyledSavedSchedulesContainer>

			<Divider color="#000000" sx={{ width: "100%" }} />

			<ImportButtonContainer>
				<Typography align="left" sx={{ marginBottom: "10px" }}>
					3. Import JSON locally
				</Typography>
				<Button variant="contained" component="label">
					Import JSON
					<input
						type="file"
						hidden
						accept=".json"
						onChange={handleScheduleImport}
					/>
				</Button>
			</ImportButtonContainer>

			<Divider color="#000000" sx={{ width: "100%", marginBottom: "10px" }} />

			{messageState && <MessageArea>{messageState}</MessageArea>}
		</CenteredDiv>
	);
};
