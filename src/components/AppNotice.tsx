import styled from "styled-components";

const VersionContainer = styled.div`
	position: absolute;
	bottom: 5px;
	left: 7px;
`;

const CopyrightText = styled.div`
	padding-top: 10px;
	font-size: 10px;
`;

export const AppNotice = () => {
    return (
        <VersionContainer>
            Carleton Schedule Ranker - v.0.2.2
            <br />
            Made by Maxim Creanga - <a href="https://github.com/Volley24/schedule-ranker">Github Link</a>
            <CopyrightText>© 2024-2025 Carleton Schedule Ranker. All Rights Reserved.</CopyrightText>
        </VersionContainer>
    );
}