import React from "react";
import styled from "styled-components";
import { ImportTab } from "./tabs/ImportTab";
import { Paper, Tabs, Tab } from "@mui/material";
import { ConfigTab } from "./tabs/ConfigTab";
import { IncludesTab } from "./tabs/IncludesTab";
import { AppNotice } from "./AppNotice";

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

enum TabName {
	IMPORT = "Import",
	INCLUDES = "Includes",
	CONFIG = "Config",
}

export const TabBar = () => {
	const [selectedTab, setSelectedTab] = React.useState<TabName>(TabName.IMPORT);

	const renderSelectedTab = () => {
		if (selectedTab === TabName.IMPORT) {
			return <ImportTab />;
		} else if (selectedTab === TabName.INCLUDES) {
			return <IncludesTab />;
		} else if (selectedTab === TabName.CONFIG) {
			return <ConfigTab />;
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
					<Tab label={TabName.INCLUDES} value={TabName.INCLUDES} />
					<Tab label={TabName.CONFIG} value={TabName.CONFIG} />
				</StyledTabs>
				{renderSelectedTab()}
				<AppNotice />
			</StyledPaper>
		</MainContainer>
	);
};
