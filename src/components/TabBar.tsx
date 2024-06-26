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

const StyledTab = styled(Tab)`
	width: 175px;
`;

const MainContainer = styled.div`
	width: 350px;
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
}) => {
	const { value, setValue, selectedSchedule, setSchedule, weights, setWeights } = props;
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
				/>
			);
		}
		return <></>;
	};

	return (
		<MainContainer>
			<StyledPaper elevation={10}>
				<StyledTabs
					value={selectedTab}
					onChange={(_event, value: TabName) => setSelectedTab(value)}
					aria-label="basic tabs example"
				>
					<StyledTab label={TabName.IMPORT} value={TabName.IMPORT} />
					<StyledTab label={TabName.CONFIG} value={TabName.CONFIG} />
				</StyledTabs>
				{renderSelectedTab()}
			</StyledPaper>
		</MainContainer>
	);
};
