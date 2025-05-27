import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Divider,
	Paper,
} from "@mui/material";
import { useState } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import {addCourse, UICourse, removeLastCourse, UICourseState } from "../logic/courses";
import { MyInput } from "./common";
import { ScheduleCreationMainContent } from "./ScheduleCreationMainContent";

export type CreateScheduleDialogProps = {
	open: boolean;
	close: () => void;

	onCreateAndSave?: (scheduleName: string, courses: UICourse[]) => void;
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

const selectCourses = (state: { value: UICourseState }) => state.value.courses;

export const CreateScheduleDialog = (props: CreateScheduleDialogProps) => {
	const { open, close, onCreateAndSave } = props;

	const dispatch = useDispatch();
	const courses = useSelector(selectCourses);

	const [scheduleName, setScheduleName] = useState("");

	return (
		<BigDialog open={open}>
			<DialogTitle>
				<CenteredHeader>Create a Schedule</CenteredHeader>
			</DialogTitle>
			<Divider />
			<DialogContent>
				<SectionCardContainer>
					<Group >
						Schedule Name: <MyInput value={scheduleName} setValue={setScheduleName} width={200} placeholder={"Schedule Name"} />
					</Group>

					<Divider sx={{margin: "20px 0"}}/>

					{courses.map((course: UICourse, idx: number) => (
						<ScheduleCreationMainContent 
							key={idx}
							course={course}
							courseIndex={idx}
						/>
					))}
					
						<Button
							sx={{ margin: "auto", marginTop: "15px" }}
							variant="contained"
							onClick={() =>
								dispatch(
									addCourse()
								)
							}
						>
							Add Course
						</Button>
						<Button
							sx={{ margin: "auto", marginTop: "5px" }}
							variant="contained"
							color="error"
							onClick={() =>
								dispatch(
									removeLastCourse()
								)
							}
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
				<Button color="inherit" onClick={() => onCreateAndSave?.(scheduleName, courses)}>Create and Save</Button>
				<Button>Create and Load</Button>
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

