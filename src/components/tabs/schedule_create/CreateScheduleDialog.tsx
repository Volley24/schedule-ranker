import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Divider,
	Paper,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	Alert,
} from "@mui/material";
import { useState } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import {addCourse, EMPTY_SCHEDULE, removeLastCourse, setSchedule, UICourse, UISchedule } from "../logic/courses";
import { MyInput, VerticalGroup } from "./common";
import { ScheduleCreationMainContent } from "./ScheduleCreationMainContent";
import { scheduleStorage } from "../logic/scheduleLocalStorage";
import { Course, Schedule } from "../../../logic/definitions";
import { scheduleManager } from "../logic/schedules";
import { TimeRange } from "../../../logic/time";

export type CreateScheduleDialogProps = {
	open: boolean;
	close: () => void;

	onCreateAndSave?: (scheduleName: string, courses: Course[]) => void;
};

const BigDialog = styled(Dialog)`
	&& .MuiDialog-paper {
		min-width: 600px;
		min-height: calc(100% - 64px);
	}
`;

const CenteredHeader = styled.div`
	display: flex;
	align-items: center;
`;

const SectionCardContainer = styled.div`
	display: flex;
	flex-direction: column;
	flex-wrap: wrap;
	padding-top: 20px;
`;

const selectScheduleName = (state: { value: UISchedule }) => state.value.name;
const selectIsNewSchedule = (state: { value: UISchedule }) => state.value.newSchedule;
const selectCourses = (state: { value: UISchedule }) => state.value.courses;
const selectHasPendingChanges = (state: { value: UISchedule }) => state.value.undoStack.length > 0;

export const CreateScheduleDialog = (props: CreateScheduleDialogProps) => {
	const { open, close, onCreateAndSave } = props;

	const dispatch = useDispatch();

	const scheduleName = useSelector(selectScheduleName);
	const isNewSchedule = useSelector(selectIsNewSchedule);
	const courses = useSelector(selectCourses);

	const hasPendingChanges = useSelector(selectHasPendingChanges);

	const [newScheduleName, setNewScheduleName] = useState<string>("");

	const onCreateAndSaveHandler = () => {
		const transformedCourses: Course[] = courses.map((course) => ({
			...course,
			sections: course.sections.map((section) => ({
				...section,
				time: TimeRange.create(section.time),
			})),
		}));
		
		onCreateAndSave?.(newScheduleName, transformedCourses);
	};

	return (
		<BigDialog open={open}>
			<DialogTitle>
				<CenteredHeader>Create a Schedule</CenteredHeader>
			</DialogTitle>
			<Divider />
			<DialogContent>
				<SectionCardContainer>
					<VerticalGroup >
						<Group>
							Schedule: 
							<FormControl sx={{ width: 300, textAlign: "left" }}>
								<InputLabel>Saved Schedules</InputLabel>
								<Select
									value={scheduleName}
									defaultValue={null}
									label="Saved Schedules"
									onChange={(event) => {
										// TODO: Only change if there aren't any pending changes.
										// I.E: if the undo stack is empty.

										const scheduleKey = event.target.value as string;

										if (scheduleKey === EMPTY_SCHEDULE) {
											dispatch(setSchedule(undefined));
										} else {
											const schedule = scheduleManager.getOrLoadUISchedule(scheduleKey);
										
											console.log("Get schedule:");
											console.log(schedule);
											if (schedule) {
												dispatch(setSchedule(schedule));
												setNewScheduleName(schedule.name);
											}
										}
									}}
								>
									<MenuItem value={EMPTY_SCHEDULE}>{EMPTY_SCHEDULE}</MenuItem>
									<Divider />
									{scheduleStorage.getAllScheduleKeys().map((scheduleName) => (
										<MenuItem key={scheduleName} value={scheduleName}>
											{scheduleName}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Group>

						{isNewSchedule && (
							<Group>
								New Schedule Name: <MyInput value={newScheduleName} setValue={setNewScheduleName} width={200} placeholder={"Schedule Name"} />
							</Group>
						)}
					</VerticalGroup>

					<Divider sx={{margin: "20px 0"}}/>

					{/* {hasPendingChanges && <Alert severity="info">You have unsaved changed!</Alert>} */}

					{courses.map((course, idx: number) => (
						<ScheduleCreationMainContent 
							key={idx}
							course={course}
							courseIndex={idx}
						/>
					))}
					
					{/* TODO: should be better styled */}
					<Button
						sx={{ margin: "auto", marginTop: "15px" }}
						variant="contained"
						onClick={() => dispatch(addCourse())}
					>
						Add Course
					</Button>
					<Button
						sx={{ margin: "auto", marginTop: "5px" }}
						variant="contained"
						color="error"
						onClick={() => dispatch(removeLastCourse())}
					>
						Remove Last
					</Button>
					
				</SectionCardContainer>
			</DialogContent>
			<Divider />
			<DialogActions>
				<Button color="error" onClick={close}>
					Discard
				</Button>
				<Button color="inherit" onClick={() => onCreateAndSaveHandler()}>{scheduleName === EMPTY_SCHEDULE ? "Create" : "Save"}</Button>
			</DialogActions>
		</BigDialog>
	);
};

const ScheduleCardPaper = styled(Paper)`
	display: flex;
	flex-direction: column;
	gap: 10px;

	padding: 10px;
	&&& {
		background: #b3d2f0;
	}
`;

const Group = styled.div`
	display: flex;
	align-items: center;
	gap: 7px;
`;

