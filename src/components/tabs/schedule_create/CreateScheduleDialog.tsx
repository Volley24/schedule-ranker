import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Divider,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	Alert,
	TextField,
} from "@mui/material";
import { useState } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import {
	addCourse,
	commitSchedule,
	EMPTY_SCHEDULE,
	resetDraft,
	revertDraft,
	selectCourses,
	selectHasPendingChanges,
	selectHasSavedBaseline,
	selectIsNewSchedule,
	selectScheduleName,
	setSchedule,
	UICourse,
	UISchedule,
} from "../logic/courses";
import { VerticalGroup } from "./common";
import { ScheduleCreationMainContent } from "./ScheduleCreationMainContent";
import { scheduleStorage } from "../logic/scheduleLocalStorage";
import { Course } from "../../../logic/definitions";
import { scheduleManager } from "../logic/schedules";
import { TimeRange } from "../../../logic/time";

export type CreateScheduleDialogProps = {
	open: boolean;
	close: () => void;
	onSave: (scheduleName: string, courses: Course[]) => void;
	onCreateAndActivate: (scheduleName: string, courses: Course[]) => void;
};

const BigDialog = styled(Dialog)`
	&& .MuiDialog-paper {
		min-width: 800px;
		max-width: 900px;
		width: 90vw;
		min-height: calc(100% - 64px);
	}
`;

const TopActions = styled.div`
	display: flex;
	align-items: center;
	gap: 10px;
	margin-bottom: 10px;
`;

const SectionCardContainer = styled.div`
	display: flex;
	flex-direction: column;
	flex-wrap: wrap;
	padding-top: 20px;
`;

const Group = styled.div`
	display: flex;
	align-items: center;
	gap: 7px;
`;

type EditorState = { value: UISchedule; savedSnapshot: UICourse[] | null };

export const CreateScheduleDialog = (props: CreateScheduleDialogProps) => {
	const { open, close, onSave, onCreateAndActivate } = props;

	const dispatch = useDispatch();

	const scheduleName = useSelector((state: EditorState) => selectScheduleName(state));
	const isNewSchedule = useSelector((state: EditorState) => selectIsNewSchedule(state));
	const courses = useSelector((state: EditorState) => selectCourses(state));
	const hasPendingChanges = useSelector((state: EditorState) => selectHasPendingChanges(state));
	const hasSavedBaseline = useSelector((state: EditorState) => selectHasSavedBaseline(state));

	const [newScheduleName, setNewScheduleName] = useState<string>("");
	const [confirmSwitchTarget, setConfirmSwitchTarget] = useState<string | null>(null);

	const getEffectiveName = () => (isNewSchedule ? newScheduleName.trim() : scheduleName);

	const transformCourses = (): Course[] =>
		courses.map((course) => ({
			...course,
			sections: course.sections.map((section) => ({
				...section,
				time: TimeRange.create(section.time),
			})),
		}));

	const canSaveOrCreate = getEffectiveName().length > 0;
	const nameIsEmpty = isNewSchedule && newScheduleName.trim() === "";

	const handleSave = () => {
		if (!canSaveOrCreate) return;
		const name = getEffectiveName();
		const transformed = transformCourses();
		onSave(name, transformed);
		dispatch(commitSchedule({ name }));
	};

	const handleCreate = () => {
		if (!canSaveOrCreate) return;
		const name = getEffectiveName();
		const transformed = transformCourses();
		onCreateAndActivate(name, transformed);
		dispatch(commitSchedule({ name }));
	};

	const handleCreateAndClose = () => {
		handleCreate();
		close();
	};

	const getPersistedScheduleName = () => {
		const name = isNewSchedule ? newScheduleName.trim() : scheduleName;
		if (!name || name === EMPTY_SCHEDULE) return null;
		return scheduleStorage.scheduleExists(name) ? name : null;
	};

	const reloadPersistedSchedule = (name: string): boolean => {
		const schedule = scheduleManager.getOrLoadUISchedule(name);
		if (!schedule) return false;
		dispatch(setSchedule(schedule));
		setNewScheduleName(schedule.name);
		return true;
	};

	const handleDiscard = () => {
		const persistedName = getPersistedScheduleName();

		if (!hasPendingChanges) {
			if (persistedName) {
				reloadPersistedSchedule(persistedName);
			}
			close();
			return;
		}

		if (persistedName && reloadPersistedSchedule(persistedName)) {
			close();
			return;
		}

		if (hasSavedBaseline) {
			dispatch(revertDraft());
			close();
			return;
		}

		dispatch(resetDraft());
		setNewScheduleName("");
		close();
	};

	const doScheduleSwitch = (scheduleKey: string) => {
		if (scheduleKey === EMPTY_SCHEDULE) {
			dispatch(setSchedule(undefined));
			setNewScheduleName("");
		} else {
			const schedule = scheduleManager.getOrLoadUISchedule(scheduleKey);
			if (schedule) {
				dispatch(setSchedule(schedule));
				setNewScheduleName(schedule.name);
			}
		}
	};

	const handleScheduleDropdownChange = (scheduleKey: string) => {
		if (hasPendingChanges) {
			setConfirmSwitchTarget(scheduleKey);
		} else {
			doScheduleSwitch(scheduleKey);
		}
	};

	const confirmSwitch = () => {
		if (confirmSwitchTarget !== null) {
			doScheduleSwitch(confirmSwitchTarget);
			setConfirmSwitchTarget(null);
		}
	};

	const cancelSwitch = () => {
		setConfirmSwitchTarget(null);
	};

	return (
		<>
			<BigDialog open={open}>
				<DialogTitle>Schedule Editor</DialogTitle>
				<Divider />
				<DialogContent>
					<SectionCardContainer>
						<VerticalGroup>
							<Group>
								Schedule:
								<FormControl sx={{ width: 300, textAlign: "left" }}>
									<InputLabel>Saved Schedules</InputLabel>
									<Select
										value={scheduleName}
										defaultValue={null}
										label="Saved Schedules"
										onChange={(event) => {
											handleScheduleDropdownChange(event.target.value as string);
										}}
									>
										<MenuItem value={EMPTY_SCHEDULE}>{EMPTY_SCHEDULE}</MenuItem>
										<Divider />
										{scheduleStorage.getAllScheduleKeys().map((name) => (
											<MenuItem key={name} value={name}>
												{name}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							</Group>

							{isNewSchedule && (
								<Group>
									New Schedule Name:{" "}
									<TextField
										autoComplete="off"
										sx={{ width: 200 }}
										variant="outlined"
										size="small"
										placeholder="Schedule Name"
										value={newScheduleName}
										onChange={(e) => setNewScheduleName(e.target.value)}
										error={nameIsEmpty}
										helperText={nameIsEmpty ? "Name is required" : ""}
									/>
								</Group>
							)}
						</VerticalGroup>

						<Divider sx={{ margin: "20px 0" }} />

						<TopActions>
							{isNewSchedule ? (
								<Button
									variant="contained"
									disabled={!canSaveOrCreate || !hasPendingChanges}
									onClick={handleCreate}
								>
									Create
								</Button>
							) : (
								<Button
									variant="contained"
									disabled={!canSaveOrCreate || !hasPendingChanges}
									onClick={handleSave}
								>
									Save
								</Button>
							)}
						</TopActions>

						{hasPendingChanges && (
							<Alert severity="info" sx={{ marginBottom: "15px" }}>
								You have unsaved changes.
							</Alert>
						)}

						{courses.map((course, idx: number) => (
							<ScheduleCreationMainContent
								key={idx}
								course={course}
								courseIndex={idx}
								totalCourses={courses.length}
							/>
						))}

						<Button
							sx={{ margin: "auto", marginTop: "15px" }}
							variant="contained"
							onClick={() => dispatch(addCourse())}
						>
							Add Course
						</Button>
					</SectionCardContainer>
				</DialogContent>
				<Divider />
				<DialogActions>
					<Button color="error" onClick={handleDiscard}>
						Discard
					</Button>
				{isNewSchedule ? (
					<Button
						color="inherit"
						disabled={!canSaveOrCreate || !hasPendingChanges}
						onClick={handleCreateAndClose}
					>
						Create & Close
					</Button>
				) : (
					<Button
						color="inherit"
						disabled={!canSaveOrCreate || !hasPendingChanges}
						onClick={handleCreateAndClose}
					>
							Save & Close
						</Button>
					)}
				</DialogActions>
			</BigDialog>

			<Dialog open={confirmSwitchTarget !== null} onClose={cancelSwitch}>
				<DialogTitle>Unsaved Changes</DialogTitle>
				<DialogContent>
					You have unsaved changes. Switching schedules will discard them. Continue?
				</DialogContent>
				<DialogActions>
					<Button onClick={cancelSwitch}>Cancel</Button>
					<Button color="error" onClick={confirmSwitch}>
						Discard & Switch
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};
