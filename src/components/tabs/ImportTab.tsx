import React from "react";
import styled from "styled-components";
import { parseSchedules, generateSchedules, filterInvalidSchedules } from "../../logic/ranker";
import { Schedule } from "../../logic/definitions";
import { FormControl, InputLabel, Select, MenuItem, Button, Divider, Typography } from "@mui/material";
import { getScheduleByKey, getScheduleNames, putSchedule } from "./scheduleLocalStorage";

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

export const ImportTab = (props: { setSchedule: (schedule: Schedule[]) => void }) => {
	const { setSchedule } = props;
	const [messageState, setMessageState] = React.useState("");
	const [selectedSchedule, setSelectedSchedule] = React.useState("None");

	const importSchedule = (key: string, contents: string, save: boolean) => {
		try {
			const parsedJSON = JSON.parse(contents);
			const courses = parseSchedules(parsedJSON.classes);
			const schedules = generateSchedules(courses);
			const validSchedules = filterInvalidSchedules(schedules);
			setSchedule(validSchedules);

			// TODO: Show popup if already exists?
			// a) Override b) Store seperatally
			if (save) putSchedule(key, contents);

			setMessageState(
				[
					`Succesfully imported ${key}!`,
					`Name: ${parsedJSON.tag}`,
					`File Length: ${contents.length} chars`,
					"",
					`Total combinations: ${schedules.length}`,
					`Valid combinations: ${validSchedules.length}`,
					"",
					"Classes imported:",
					courses
						.map(
							(course) =>
								`${course.id} - Sections: ${course.sections.length} | Lab Sections: ${course.labSections.length}`
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
			<ImportButtonContainer>
				<Typography align="left" sx={{ marginBottom: "10px" }}>
					1. Import JSON locally
				</Typography>
				<Button variant="contained" component="label">
					Import JSON
					<input
						type="file"
						hidden
						accept=".json"
						onChange={async (files) => {
							console.log("on change");
							setMessageState("Importing...");
							const file = files.target.files?.[0];
							if (file) {
								const contents = await file.text();

								importSchedule(file.name, contents, true);
								// update json! (if valid).
							}
						}}
					/>
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
						{getScheduleNames().map((scheduleName) => (
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
							const fileContents = getScheduleByKey(selectedSchedule);

							if (fileContents) {
								importSchedule(selectedSchedule, fileContents, false);
							}
						}}
					>
						Import
					</Button>
					<Button variant="contained" component="label" color="error">
						Remove
					</Button>
				</SavedScheduleButtonContainer>
			</StyledSavedSchedulesContainer>

			<Divider color="#000000" sx={{ width: "100%" }} />

			{messageState}
		</CenteredDiv>
	);
};
