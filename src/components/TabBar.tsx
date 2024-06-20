import { Paper, Tabs, Tab, AccordionSummary, AccordionDetails, Input, Accordion, Button } from "@mui/material";
import styled from "styled-components";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import React from "react";
import { Course, RankedSchedule } from "../logic/definitions";
import { parseSchedules } from "../logic/ranker";

const StyledPaper = styled(Paper)`
	height: 100%;
`;

const StyledTabs = styled(Tabs)`
	background: #e4e4e4;
`;

const StyledTab = styled(Tab)`
	width: 175px;
`;

const InputWrapper = styled.div`
	/* display: flex; */
`;

const MainContainer = styled.div`
	width: 350px;
`;

const StyledAccordion = styled(Accordion)`
	width: 100%;
`;

/*
will need this for later
 <StyledAccordion>
	<AccordionSummary
		aria-controls="panel1-content"
		id="panel1-header"
		expandIcon={<ExpandMoreIcon />}
	>
		Accordion 1
	</AccordionSummary>
	<AccordionDetails>
		8AM class :skull:
		<Input
			value={inputValue}
			size="small"
			onChange={(e) => setInputValue(e.target.value)}
			inputProps={{
				step: 1,
				min: -10,
				max: 10,
				type: "number",
				"aria-labelledby": "input-slider",
			}}
		/>
	</AccordionDetails>
</StyledAccordion> 
*/

export const TabBar = (props: {
	value: number;
	setValue: (num: number) => void;
	selectedSchedule: RankedSchedule;
	setSchedule: (courses: Course[]) => void;
}) => {
	const { value, setValue, selectedSchedule, setSchedule } = props;
	const [selectedTabIndex, setSelectedTabIndex] = React.useState(0);

	const renderSelectedTab = () => {
		if (selectedTabIndex === 0) {
			return (
				<Button variant="contained" component="label">
					Import JSON
					<input
						type="file"
						hidden
						accept=".json"
						onChange={async (files) => {
							// just grab first file idc
							const file = files.target.files?.[0];
							if (file) {
								const contents = await file.text();

								try {
									const courses = parseSchedules(JSON.parse(contents).classes);
									setSchedule(courses);
								} catch {
									console.log("Invalid JSON :skull:");
								}
								// update json! (if valid).
							}
						}}
					/>
				</Button>
			);
		} else if (selectedTabIndex === 1) {
			return (
				<InputWrapper>
					<Input
						value={value}
						size="small"
						onChange={(e) => setValue(Number(e.target.value))}
						inputProps={{
							type: "number",
							"aria-labelledby": "input-slider",
						}}
					/>
					<br />
					<Button variant="contained">Generate</Button>
					<Button variant="outlined">Combinations</Button>
					{/* TODO: Of course, we should convert this to a map later. */}
					<br />
					Total Score: {selectedSchedule.totalScore}
					<br />
					Days Off Score: {selectedSchedule.dayOffScore} / 10
					<br />
					Early Score: {selectedSchedule.earlyClassScore} / 10
					<br />
					Break Score: {selectedSchedule.breakScore} / 10
					<br />
					Late Score: {selectedSchedule.lateClassScore} / 10
				</InputWrapper>
			);
		}
		return <></>;
	};

	return (
		<MainContainer>
			<StyledPaper elevation={10}>
				<StyledTabs
					value={selectedTabIndex}
					onChange={(_event, value) => setSelectedTabIndex(value)}
					aria-label="basic tabs example"
				>
					<StyledTab label="Config" />
					<StyledTab label="Weights" />
				</StyledTabs>
				{renderSelectedTab()}
			</StyledPaper>
		</MainContainer>
	);
};
