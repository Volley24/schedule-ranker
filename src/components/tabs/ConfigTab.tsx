import { TextField } from "@mui/material";
import { RankedSchedule } from "../../logic/definitions";
import { WeightCategory, Weights } from "../../App";
import styled from "styled-components";

export type ConfigTabProps = {
	scheduleIndex: number;
	setScheduleIndex: (newIndex: number) => void;

	selectedSchedule: RankedSchedule | undefined;
	maxSchedules: number;
	weights: Weights;
	setWeights: (val: Weights) => void;
};

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

export const ConfigTab = (props: ConfigTabProps) => {
	const { scheduleIndex, setScheduleIndex, selectedSchedule, weights, setWeights, maxSchedules } = props;

	const getWeightInput = (key: WeightCategory) => {
		return (
			<StyledInput
				variant="outlined"
				size="small"
				inputProps={{
					type: "number",
					"aria-labelledby": "input-slider",
				}}
				value={weights.get(key)}
				onChange={(e) => {
					// This SUPER UGLY. Def need to change this later.
					const newMap = new Map<WeightCategory, number>(weights);
					newMap.set(key, Number(e.target.value));
					setWeights(newMap);
				}}
			/>
		);
	};

	return (
		<div>
			<PaddedContainer>
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
							setScheduleIndex(Number(e.target.value));
						}
					}}
				/>
				/ {maxSchedules}
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

						{Array.from(selectedSchedule.scores.entries()).map(([key, score]) => {
							const weight = weights.get(key) ?? 0;
							return (
								<tr>
									<td>{key}</td>
									<td width={60}>{getWeightInput(key)}</td>
									<td>{score.toFixed(2)}</td>
									<td>{(score * weight).toFixed(2)}</td>
								</tr>
							);
						})}
					</StyledTable>
					<PaddedContainer>
						<strong>Total Score:</strong> {selectedSchedule.totalScore.toFixed(2)} / 10
					</PaddedContainer>
				</>
			)}
		</div>
	);
};
