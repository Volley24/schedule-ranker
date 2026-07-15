import { TextField, Typography } from "@mui/material";
import { WeightCategory } from "../../logic/definitions";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "../../ui/hooks";
import {
	selectMaxSchedules,
	selectScheduleIndex,
	selectSelectedSchedule,
	selectWeights,
	setScheduleIndex,
	setWeight,
} from "../../ui/scheduleViewUI";

const StyledTable = styled.table`
	width: 100%;
	border-collapse: collapse;

	> * > th,
	td {
		border: 1px black solid;
	}
`;

const PaddedContainer = styled.div`
	display: flex;
	align-items: center;

	gap: 10px;
	padding: 10px;
`;

const StyledInput = styled(TextField)`
	.MuiInputBase-input {
		padding: 5px 7px;
	}
`;

export const ConfigTab = () => {
	const dispatch = useAppDispatch();

	const scheduleIndex = useAppSelector(selectScheduleIndex);
	const selectedSchedule = useAppSelector(selectSelectedSchedule);
	const weights = useAppSelector(selectWeights);
	const maxSchedules = useAppSelector(selectMaxSchedules);

	const getWeightInput = (key: WeightCategory) => {
		return (
			<StyledInput
				variant="outlined"
				size="small"
				inputProps={{
					type: "number",
					"aria-labelledby": "input-slider",
				}}
				value={weights[key]}
				onChange={(e) => {
					dispatch(setWeight({ category: key, value: Number(e.target.value) }));
				}}
			/>
		);
	};

	return (
		<div>
			<PaddedContainer>
				{maxSchedules > 0 ? (
					<>
						<span>Schedule Rank:</span>
						<StyledInput
							sx={{ width: "100px" }}
							variant="outlined"
							size="small"
							inputProps={{
								type: "number",
								"aria-labelledby": "input-slider",
							}}
							value={scheduleIndex}
							onChange={(e) => {
								const value = e.target.value;
								const isValidIndex = [...value].every((char) =>
									[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].includes(Number(char))
								);
								if (isValidIndex) {
									dispatch(setScheduleIndex(Number(e.target.value)));
								}
							}}
						/>
						/ {maxSchedules}
					</>
				) : (
					<Typography variant="body2" color="text.secondary">
						{selectedSchedule ? "No possible schedules under this configuration!" : "No schedule loaded yet. Import one from the Import tab."}
					</Typography>
				)}
			</PaddedContainer>

			{selectedSchedule && (
				<>
					<StyledTable>
						<tr>
							<th>Category</th>
							<th>Weight</th>
							<th>Score</th>
							<th>Weight Score</th>
						</tr>

						{(Object.entries(selectedSchedule.scores) as [WeightCategory, number][]).map(
							([key, score]) => {
								const weight = weights[key] ?? 0;
								return (
									<tr key={key}>
										<td>{key}</td>
										<td width={60}>{getWeightInput(key)}</td>
										<td>{score.toFixed(2)}</td>
										<td>{(score * weight).toFixed(2)}</td>
									</tr>
								);
							}
						)}
					</StyledTable>
					<PaddedContainer>
						<Typography>
							<strong>Total Score:</strong> {selectedSchedule.totalScore.toFixed(2)} / 10
						</Typography>
					</PaddedContainer>
				</>
			)}
		</div>
	);
};
