import React from "react";
import styled from "styled-components";
import { ImportTab } from "./tabs/ImportTab";
import { Paper, Tabs, Tab } from "@mui/material";
import { RankedSchedule, Schedule } from "../logic/definitions";
import { ConfigTab } from "./tabs/ConfigTab";
import { Weights } from "../App";

const StyledPaper = styled(Paper)`
	height: 100%;
`;

const StyledTabs = styled(Tabs)`
	background: #e4e4e4;
`;

const MainContainer = styled.div`
	width: 350px;
	position: relative;
`;

const VersionContainer = styled.div`
	position: absolute;
	bottom: 5px;
	left: 7px;
`;

enum TabName {
	IMPORT = "Import",
	CONFIG = "Config",
}

export const TabBar = (props: {
	value: number;
	setValue: (num: number) => void;
	selectedSchedule: RankedSchedule;
	setSchedule: (courses: Schedule[]) => void;
	weights: Weights;
	setWeights: (val: Weights) => void;
	maxSchedules: number;
}) => {
	const { value, setValue, selectedSchedule, setSchedule, weights, setWeights, maxSchedules } = props;
	const [selectedTab, setSelectedTab] = React.useState<TabName>(TabName.IMPORT);

	const renderSelectedTab = () => {
		if (selectedTab === TabName.IMPORT) {
			return <ImportTab setSchedule={setSchedule} />;
		} else if (selectedTab === TabName.CONFIG) {
			return (
				<ConfigTab
					scheduleIndex={value}
					setScheduleIndex={setValue}
					selectedSchedule={selectedSchedule}
					weights={weights}
					setWeights={setWeights}
					maxSchedules={maxSchedules}
				/>
			);
		}
		return <></>;
	};

	return (
		<MainContainer>
			<StyledPaper>
				<StyledTabs
					value={selectedTab}
					onChange={(_event, value: TabName) => setSelectedTab(value)}
					aria-label="basic tabs example"
					variant="fullWidth"
				>
					<Tab label={TabName.IMPORT} value={TabName.IMPORT} />
					<Tab label={TabName.CONFIG} value={TabName.CONFIG} />
				</StyledTabs>
				{renderSelectedTab()}
				<VersionContainer>Carleton Schedule Ranker - v.0.2</VersionContainer>
			</StyledPaper>
		</MainContainer>
	);
};
