import { ExpandMore as ExpandMoreIcon, School as SchoolIcon } from "@mui/icons-material";
import { Accordion, AccordionSummary, AccordionDetails, Button, Alert } from "@mui/material";
import { useState } from "react";
import { addCourseSection, UICourse, editCourseId, removeLastCourseSection } from "../logic/courses";
import { CourseCardAccordionHeader, Group, MyInput } from "./common";
import { ScheduleCreationSection } from "./ScheduleCreationSection";
import { useDispatch } from "react-redux";

export type ScheduleCreationCourseProps = {
    course: UICourse;
    courseIndex: number;
};

export const ScheduleCreationCourse = (props: ScheduleCreationCourseProps) => {
    const { course, courseIndex } = props;
    const dispatch = useDispatch();

    // add a section to the course
    const addSection = () => {
        dispatch(
            addCourseSection({
                courseIndex,
            })
        );
    }

    const removeLastSection = () => {
        dispatch(
            removeLastCourseSection()
        );
    }

    const doEditCourseId = (value: string) => {
        dispatch(editCourseId({ courseIndex, newCourseId: value }));
    }

    const courseIdIsBlank = course.id === "";

	return (
		<Accordion>
			<AccordionSummary
			expandIcon={<ExpandMoreIcon  />}
			aria-controls="panel1-content"
			id="panel1-header"
			>
			<CourseCardAccordionHeader>
                <Group>
                    <SchoolIcon />
                    <MyInput value={course.id} setValue={doEditCourseId} width={150} placeholder={"Course ID"} />
                </Group>
                {courseIdIsBlank && <Alert severity="error">
                    Error: Blank Course Name
                </Alert>}
			</CourseCardAccordionHeader>
			</AccordionSummary>
			<AccordionDetails>
				{course.sections.map((section, index) => (<ScheduleCreationSection showErrors courseId={course.id} sectionIndex={index} courseSection={section}/>))}
                <Group>
                    <Button
                        sx={{ margin: "auto", marginTop: "10px" }}
                        variant="outlined"
                        onClick={addSection}
                    >
                        Add Section
                    </Button>
                    <Button
                        sx={{ margin: "auto", marginTop: "10px" }}
                        variant="outlined"
                        color="error"
                        onClick={removeLastSection}
                    >
                        Remove Last Section
                    </Button>
                </Group>
			</AccordionDetails>
        </Accordion>
	);
};