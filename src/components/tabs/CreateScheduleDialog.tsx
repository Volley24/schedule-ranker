import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Divider,
	Paper,
	Input,
	TextField,
	Autocomplete,
	IconButton,
	Checkbox,
	FormControlLabel,
} from "@mui/material";
import { useState } from "react";
import styled from "styled-components";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import AddIcon from "@mui/icons-material/Add";
import { useDispatch, useSelector } from "react-redux";
import { Course, CourseState, editSection, Section } from "./logic/courses";

export type CreateScheduleDialogProps = {
	open: boolean;
	close: () => void;
};

const BigDialog = styled(Dialog)`
	&& .MuiDialog-paper {
		min-width: calc(100% - 64px);
		min-height: calc(100% - 64px);
	}
`;

const CenteredHeader = styled.div`
	display: flex;
	align-items: center;
`;

const SectionCardContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 20px;
	padding-top: 20px;
`;

const selectCurrentCourse = (state: CourseState) => state.selectedCourse;
const selectCourses = (state: CourseState) => state.courses;

export const CreateScheduleDialog = (props: CreateScheduleDialogProps) => {
	const { open, close } = props;

	// const [courses, setCourses] = useState<JSX.Element[]>([]);
	// const [selectedCourseIndex, setSelectedCourseIndex] = useState<number | undefined>(undefined);
	// const [sections, setSections] = useState<JSX.Element[]>([]);

	// console.log(`Selected Index: ${selectedCourseIndex}`);

	const courses = useSelector(selectCourses);
	const currentCourse = useSelector(selectCurrentCourse);

	return (
		<BigDialog open={open}>
			<DialogTitle>
				<CenteredHeader>Create a Schedule</CenteredHeader>
			</DialogTitle>
			<Divider />
			<DialogContent>
				{currentCourse !== undefined ? (
					<>
						<Centered>
							<CourseCard goBack onClick={() => setSelectedCourseIndex(undefined)} />
						</Centered>
						<SectionCardContainer>
							{currentCourse.sections.map((section) => (
								<SectionCard />
							))}
							<ScheduleCardPaper>
								<Group>
									<IconButton
										color="primary"
										size="large"
										onClick={() => setSections((sections) => [...sections, <SectionCard />])}
									>
										<AddIcon />
									</IconButton>
								</Group>
							</ScheduleCardPaper>
						</SectionCardContainer>
					</>
				) : (
					<SectionCardContainer>
						{courses}
						<Group>
							<IconButton
								color="primary"
								size="large"
								onClick={() =>
									setCourses((courses) => [
										...courses,
										<CourseCard
											goBack={false}
											onClick={() => setSelectedCourseIndex(courses.length)}
										/>,
									])
								}
							>
								<AddIcon />
							</IconButton>
						</Group>
					</SectionCardContainer>
				)}
			</DialogContent>
			<Divider />
			<DialogActions>
				<Button color="error" onClick={close}>
					Discard
				</Button>
				<Button color="inherit">Create and Save</Button>
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

const Centered = styled.div`
	width: 100%;
	display: flex;
	justify-content: center;
`;

export const CreateScheduleCard = () => {
	const [department, setDepartment] = useState("");
	const [id, setId] = useState("");
	const [section, setSection] = useState("");
	const [name, setName] = useState("");

	const [start, setStart] = useState("");
	const [end, setEnd] = useState("");

	const [days, setDays] = useState("");
	const [profName, setProfName] = useState("");

	type func = (value: string) => void;
	const spacesAreDashes = (setter: func): func => {
		return (value: string) => {
			setter(value.replaceAll(" ", "-"));
		};
	};

	return (
		<ScheduleCardPaper elevation={5}>
			<Group>
				Course ID:
				<MyInput value={department} setValue={setDepartment} width={80} placeholder={"MATH"} />
				–
				<MyInput value={id} setValue={setId} width={80} placeholder={"1005"} />
			</Group>
			<Centered>Section A:</Centered>
			<Divider />
			<Group>
				Time:
				<MyInput value={start} setValue={setStart} width={80} placeholder={"10:00"} />
				–
				<MyInput value={end} setValue={setEnd} width={80} placeholder={"12:00"} />
				<br />
			</Group>
			<Group>
				Days: <MyInput value={days} setValue={setDays} placeholder={"Mon, Tue, Wed"} />
			</Group>
			<Group>
				Prof Name: <MyInput value={profName} setValue={setProfName} placeholder={"John Smith"} />
			</Group>
			{/* -
			<MyInput value={name} setValue={setName} width={70} placeholder={"1005"} />
			-
			<MyInput value={name} setValue={setName} width={40} placeholder={"F"} /> */}
		</ScheduleCardPaper>
	);
};

export const CourseCard = ({ goBack, onClick = () => {} }: { goBack: boolean; onClick?: () => void }) => {
	const [department, setDepartment] = useState("");
	const [id, setId] = useState("");
	return (
		<ScheduleCardPaper elevation={5}>
			<Group>
				{goBack && (
					<IconButton color="primary" aria-label="add to shopping cart" onClick={onClick}>
						<ArrowBackIosNewIcon />
					</IconButton>
				)}
				Course ID:
				<MyInput value={department} setValue={setDepartment} width={80} placeholder={"MATH"} />
				–
				<MyInput value={id} setValue={setId} width={80} placeholder={"1005"} />
			</Group>
			{!goBack && (
				<Button variant="contained" sx={{ width: "150px", margin: "auto" }} onClick={onClick}>
					Set Sections
				</Button>
			)}
		</ScheduleCardPaper>
	);
};

export const SectionCard = ({ section }: { section: Section }) => {
	// const [department, setDepartment] = useState("");
	// const [id, setId] = useState("");
	// const [section, setSection] = useState("");
	// const [name, setName] = useState("");

	// const [start, setStart] = useState("");
	// const [end, setEnd] = useState("");

	// const [days, setDays] = useState("");
	// const [profName, setProfName] = useState("");

	const dispatch = useDispatch();

	// useCallback or memo or wtv;
	const getDispatch = () => {
		return () => dispatch(editSection({
			courseId: "",
			sectionCrn: section.crn,
			
		}))
	}

	return (
		<ScheduleCardPaper elevation={5}>
			<Centered>
				<Group>
					Section
					<MyInput value={section.section} setValue={() => dispatch(editSection({}))} width={40} placeholder={"A"} />:
				</Group>
			</Centered>

			<Divider />
			<Group>
				Time:
				<MyInput value={section.startTime} setValue={setStart} width={80} placeholder={"10:00"} />
				–
				<MyInput value={section.endTime} setValue={setEnd} width={80} placeholder={"12:00"} />
				<br />
			</Group>
			<Group>
				Days: <MyInput value={section.days} setValue={setDays} placeholder={"Mon, Tue, Wed"} />
			</Group>
			<Group>
				Prof Name: <MyInput value={section.profName} setValue={setProfName} placeholder={"John Smith"} />
			</Group>
			<Group>
				<FormControlLabel control={<Checkbox defaultChecked={false} />} label="Is Online" />
				<FormControlLabel control={<Checkbox defaultChecked={false} />} label="Is Lab" />
			</Group>
		</ScheduleCardPaper>
	);
};

export type InputProps = {
	value: string;
	setValue: (value: string) => void;

	width?: number;
	placeholder?: string;
};

const StyledTextField = styled(TextField)`
	&&& .MuiOutlinedInput-input {
		padding: 3px 5px;
	}
`;

const MyInput = (props: InputProps) => {
	const { value, setValue, width, placeholder } = props;
	return (
		<StyledTextField
			autoComplete="off"
			sx={{ width }}
			variant="outlined"
			size="small"
			placeholder={placeholder}
			value={value}
			onChange={(e) => {
				// the big cac
				setValue(e.target.value);
			}}
		/>
	);
};
