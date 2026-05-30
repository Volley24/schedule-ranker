import { ExpandMore as ExpandMoreIcon, School as SchoolIcon, DeleteOutline as DeleteIcon } from "@mui/icons-material";
import { Accordion, AccordionSummary, AccordionDetails, Button, Alert, IconButton } from "@mui/material";
import { addCourseSection, editCourseId, removeCourseByIndex, UICourse } from "../logic/courses";
import { CourseCardAccordionHeader, Group, MyInput } from "./common";
import { ScheduleCreationSection } from "./ScheduleCreationSection";
import { useDispatch } from "react-redux";

export type ScheduleCreationCourseProps = {
    course: UICourse;
    courseIndex: number;
    totalCourses: number;
};

export const ScheduleCreationCourse = (props: ScheduleCreationCourseProps) => {
    const { course, courseIndex, totalCourses } = props;
    const dispatch = useDispatch();

    const doEditCourseId = (value: string) => {
        dispatch(editCourseId({ courseIndex, newCourseId: value }));
    };

    const courseIdIsBlank = course.id === "";
    const canDeleteCourse = totalCourses > 1;

    return (
        <Accordion>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
            >
                <CourseCardAccordionHeader>
                    <Group>
                        <SchoolIcon />
                        <MyInput value={course.id} setValue={doEditCourseId} width={150} placeholder={"Course ID"} />
                        <IconButton
                            size="small"
                            color="error"
                            disabled={!canDeleteCourse}
                            onClick={(e) => {
                                e.stopPropagation();
                                dispatch(removeCourseByIndex({ courseIndex }));
                            }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Group>
                    {courseIdIsBlank && (
                        <Alert severity="error">Error: Blank Course Name</Alert>
                    )}
                </CourseCardAccordionHeader>
            </AccordionSummary>
            <AccordionDetails>
                {course.sections.map((section, index) => (
                    <ScheduleCreationSection
                        key={index}
                        showErrors
                        courseIndex={courseIndex}
                        sectionIndex={index}
                        courseSection={section}
                        totalSections={course.sections.length}
                    />
                ))}
                <Group>
                    <Button
                        sx={{ margin: "auto", marginTop: "10px" }}
                        variant="outlined"
                        onClick={() => dispatch(addCourseSection({ courseIndex }))}
                    >
                        Add Section
                    </Button>
                </Group>
            </AccordionDetails>
        </Accordion>
    );
};
