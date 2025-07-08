import React from "react";
import styled from "styled-components";
import { parseSchedules, generateSchedules, filterInvalidSchedules, mapDayWeekToDay } from "../../logic/ranker";
import { Course, ScheduledClass } from "../../logic/definitions";
import {
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Button,
	Divider,
	Typography,
} from "@mui/material";
import { scheduleStorage } from "./logic/scheduleLocalStorage";
import { CreateScheduleDialog } from "./schedule_create/CreateScheduleDialog";
import { UICourse } from "./logic/courses";
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

export const ImportTab = (props: { setSchedule: (schedule: ScheduledClass[][]) => void }) => {
	const { setSchedule } = props;
	const [messageState, setMessageState] = React.useState("");
	const [selectedSchedule, setSelectedSchedule] = React.useState("None");
	const [isOverridePopupOpen, setOverridePopupOpen] = React.useState(false);

	const [isCreatingClasses, setCreatingClasses] = React.useState(false);

	const onCloseAndSave = (scheduleName: string, courses: Course[]) => {
		const schedules = generateSchedules(courses);
		const validSchedules = filterInvalidSchedules(schedules);

		setSchedule(validSchedules);

		// Ok this is kinda like the most important part.
		/*
		{
			"id": "MATH 1005",
			"name": "Diff. Eqs. & Series Eng. & Phy",
			"sections": [
				"A,Ayse Alaca,Wed/Fri,10:05 - 11:25",
				"B,Ayse Alaca,Mon/Wed,11:35 - 12:55",
				"C,Unknown,Tue/Thu,08:35 - 09:55",
				"D,Unknown,Tue/Thu,14:35 - 15:55",
				"E,Unknown,Mon/Wed,18:05 - 19:25",
				"F,Unknown,Tue/Thu,19:35 - 20:55"
			],
			"labSections": [
				"A,AT,a,Wed,17:35 - 18:25",
				"B,BT,a,Mon,14:35 - 15:25",
				"C,CT,a,Thu,13:35 - 14:25",
				"D,DT,a,Thu,17:35 - 18:25",
				"E,ET,a,Wed,19:35 - 20:25",
				"F,FT,a,Thu,21:05 - 21:55"
			]
		}
		*/
		// Convert convertedCourses -> "JSON string notation". Here is an example:

		// "A,Shaghayegh Gomar,Mon/Wed,08:35 - 09:55"
		const scheduleJSON = JSON.stringify(
			{
				tag: scheduleName,
				classes: courses.map((course) => ({
					id: course.id,
					name: course.name,
					sections: course.sections.filter(section => !section.isLab).map((section) => {
						console.log("Section days:", section.days);
						console.log("Section days mapped:", section.days.map((dayOfWeek) => mapDayWeekToDay(dayOfWeek)));
						return `${section.sectionId},${section.prof},${section.days.map((dayOfWeek) => mapDayWeekToDay(dayOfWeek)).join("/")},${section.time.format24h()}${section.isOnline ? ",ONLINE" : ""}`;
					}),
					labSections: course.sections.filter(section => section.isLab).map((section) => {
						return `${section.classSectionIds?.join("/")},${section.sectionId},${section.prof},${section.days.map((dayOfWeek) => mapDayWeekToDay(dayOfWeek)).join("/")},${section.time.format24h()}${section.isOnline ? ",ONLINE" : ""}`;
					}),
				})),
			}
		);

		console.log("Converted Courses JSON:", scheduleJSON);
		// save to local storage.
		if (scheduleName) {
			scheduleStorage.putSchedule(scheduleName, scheduleJSON);
		}
	};

	const handleScheduleImport = async (files: React.ChangeEvent<HTMLInputElement>) => {
		console.log("on change");
		setMessageState("Importing...");
		const file = files.target.files?.[0];
		if (file) {
			const contents = await file.text();

			importSchedule(file.name, contents, true);
			// update json! (if valid).
		}
	}


	const importSchedule = (key: string, contents: string, save: boolean) => {
		// TODO: for later.
		// if (save && scheduleStorage.scheduleExists(key)) {
		// 	// Show popup.
		// 	setOverridePopupOpen(true);
		// 	return;
		// }

		try {
			const parsedJSON = JSON.parse(contents);
			const schedule = parseSchedules(parsedJSON);

			console.log(`Parse schedules:`, schedule);

			const transformedCourses: Course[] = schedule.courses.map((course) => ({
				...course,
				sections: course.sections.map((section) => ({
					...section,
					time: TimeRange.create(section.time),
				})),
			}));

					
			const schedules = generateSchedules(transformedCourses);
			const validSchedules = filterInvalidSchedules(schedules);

			setSchedule(validSchedules);

			// TODO: Show popup if already exists?
			// a) Override b) Store seperatally
			if (save) scheduleStorage.putSchedule(schedule.name, contents);

			setMessageState(
				[
					`Succesfully imported ${schedule.name}!`,
					`File Length: ${contents.length} chars`,
					"",
					`Total combinations: ${schedules.length}`,
					`Valid combinations: ${validSchedules.length}`,
					"",
					"Classes imported:",
					schedule.courses
						.map(
							(course) =>
								`${course.id} - Sections: ${course.sections.length}`
						)
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
			<CreateScheduleDialog open={isCreatingClasses} close={() => setCreatingClasses(false)} onCreateAndSave={onCloseAndSave}/>
			<ImportButtonContainer>
				<Typography align="left" sx={{ marginBottom: "10px" }}>
					1. Add / Edit a Schedule
				</Typography>
				<Button variant="contained" component="label"  onClick={() => setCreatingClasses(true)}>
					Schedule Editor
				</Button>
			</ImportButtonContainer>
		
			<Divider color="#000000" sx={{ width: "100%" }} />

			<StyledSavedSchedulesContainer>
				<Typography align="left" sx={{ marginBottom: "10px" }}>
					2. Select Saved Schedule
				</Typography>

				<FormControl sx={{ width: 300, textAlign: "left" }}>
					<InputLabel>Saved Schedules</InputLabel>
					<Select
						value={selectedSchedule}
						label="Saved Schedules"
						onChange={(event) => {
							setSelectedSchedule(event.target.value);
							//const key = event.target.value;
							//const item = localStorage.getItem(key);

							// if (item) {
							// 	handleSelect(key, item);
							// }
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
						onClick={() => {
							const fileContents = scheduleStorage.getScheduleByKey(selectedSchedule);

							if (fileContents) {
								importSchedule(selectedSchedule, fileContents, false);
							}
						}}
					>
						Import
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

			{messageState}
		</CenteredDiv>
	);
};
