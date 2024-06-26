import { Input } from "@mui/material";
import { RankedSchedule } from "../../logic/definitions";
import { WeightCategory, Weights } from "../../App";

export type ConfigTabProps = {
	scheduleIndex: number;
	setScheduleIndex: (newIndex: number) => void;

	selectedSchedule: RankedSchedule;
	weights: Weights;
	setWeights: (val: Weights) => void;
};

export const ConfigTab = (props: ConfigTabProps) => {
	const { scheduleIndex, setScheduleIndex, selectedSchedule, weights, setWeights } = props;

	return (
		<div>
			Schedule Index:
			<Input
				value={scheduleIndex}
				size="small"
				onChange={(e) => {
					const value = e.target.value;

					const isValidIndex = [...value].every((char) =>
						[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].includes(Number(char))
					);

					if (isValidIndex) {
						setScheduleIndex(Number(e.target.value));
					}
				}}
				inputProps={{
					"aria-labelledby": "input-slider",
				}}
			/>
			<br />
			Total Score: {selectedSchedule.totalScore.toFixed(4)} / 10
			<br />
			{Array.from(selectedSchedule.scores.entries()).map(([key, score]) => {
				return (
					<>
						<Input
							sx={{ width: "50px" }}
							value={weights.get(key)}
							size="small"
							onChange={(e) => {
								// This SUPER UGLY. Def need to change this later.
								const newMap = new Map<WeightCategory, number>(weights);
								newMap.set(key, Number(e.target.value));
								setWeights(newMap);
							}}
							inputProps={{
								type: "number",
								"aria-labelledby": "input-slider",
							}}
						/>
						{key}: {score.toFixed(4)} / 10
						<br />
					</>
				);
			})}
		</div>
	);
};
