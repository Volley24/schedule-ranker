import {
	Divider,
	Checkbox,
	FormControlLabel,
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ScienceIcon from "@mui/icons-material/Science";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import { useDispatch } from "react-redux";
import { UISection, editSectionByIndex } from "../logic/courses";
import { CourseCardAccordionHeader, Group, MyInput } from "./common";


export type ScheduleCreationSectionProps = {
    courseId: string; 
    sectionIndex: number;
    courseSection: UISection;

    showErrors?: boolean; // Whether to show errors for this section for missing fields
}

export const ScheduleCreationSection = (props: ScheduleCreationSectionProps) => {
    const { courseId, sectionIndex, courseSection, showErrors = false } = props;

	const dispatch = useDispatch();

	const setSectionField = (field: keyof UISection) => (value: string | boolean) => {
		dispatch(
			editSectionByIndex({
				courseId, 
				sectionIndex,
				newSection: { [field]: value },
			})
		);
	};

    // get each key of the courseSection, and filter it to only include the ones that are empty.
    // that is our list of errors
    const errors = Object.entries(courseSection).filter(([key, value]) => {
        if (key === "isOnline" || key === "isLab") return false; // Skip boolean fields
        if (key === "validSections" || key === "crn") return false; // Skip "optional" fields
        return value === "" || value === undefined;
    });

    const hasErrors = showErrors && errors.length > 0;

    return (
        <Accordion>
            <AccordionSummary
            expandIcon={<ExpandMoreIcon  />}
            aria-controls="panel1-content"
            id="panel1-header"
            >
            <CourseCardAccordionHeader>
                <Group>
                    {courseSection.isLab ? <ScienceIcon color="secondary" /> : <LibraryBooksIcon color="primary" /> }
                    <span>{courseSection.isLab ? "Lab Section" : "Section"}</span> <MyInput value={courseSection.section} setValue={setSectionField("section")} width={80} placeholder={"A"} />
                </Group>
                {hasErrors && (
                    <Alert severity="error">
                        Error: Missing {errors.map(([key]) => key).join(", ")}
                    </Alert>
                )}
                	
            </CourseCardAccordionHeader>
            </AccordionSummary>
            <Divider/>
            <AccordionDetails>	
                				
                <Group>
                    Time:
                    <MyInput value={courseSection.startTime} setValue={setSectionField("startTime")} width={80} placeholder={"10:00"} />
                    –
                    <MyInput value={courseSection.endTime} setValue={setSectionField("endTime")} width={80} placeholder={"12:00"} />
                    <br />
                </Group>
                <Group>
                    Days: <MyInput value={courseSection.days} setValue={setSectionField("days")} placeholder={"Mon, Tue, Wed"} />
                </Group>
                <Group>
                    Prof Name: <MyInput value={courseSection.profName} setValue={setSectionField("profName")} placeholder={"John Smith"} />
                </Group>
                <Group>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={courseSection.isOnline}
                                onChange={(_, checked) => setSectionField("isOnline")(checked)}
                            />
                        }
                        label="Is Online"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={courseSection.isLab}
                                onChange={(_, checked) => setSectionField("isLab")(checked)}
                            />
                        }
                        label="Is Lab"
                    />
                </Group>
                {courseSection.isLab && (
                    <Group>
                        Valid Sections: <MyInput value={courseSection.validSections} setValue={setSectionField("validSections")} placeholder={"Lab details"} />
                    </Group>
                )}
            </AccordionDetails>
        </Accordion>
    );
}