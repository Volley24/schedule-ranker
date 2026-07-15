import React from "react";
import styled from "styled-components";
import { TabBar } from "./components/TabBar";
import { ScheduleView } from "./components/ScheduleView";

const MainContainer = styled.div`
	display: flex;
	flex-direction: row;

	height: 100%;
`;

const StyledScreenResults = styled.div`
	flex: 1;
`;

export const App = () => {
	return (
		<MainContainer>
			<StyledScreenResults>
				<ScheduleView />
			</StyledScreenResults>
			<TabBar />
		</MainContainer>
	);
};
