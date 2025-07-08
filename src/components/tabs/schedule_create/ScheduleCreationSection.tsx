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
import {editSectionByIndex, UISection } from "../logic/courses";
import { CourseCardAccordionHeader, Group, MyInput } from "./common";
import { ClassSection, WeekDay } from "../../../logic/definitions";
import React from "react";
import { Time, TimeRange } from "../../../logic/time";
import { mapDayToWeekDay, mapDayWeekToDay } from "../../../logic/ranker";


export type ScheduleCreationSectionProps = {
    courseId: string; 
    sectionIndex: number;
    courseSection: UISection;

    showErrors?: boolean; // Whether to show errors for this section for missing fields
}

export const ScheduleCreationSection = (props: ScheduleCreationSectionProps) => {
    const { courseId, sectionIndex, courseSection, showErrors = false } = props;

	const dispatch = useDispatch();

    const [startTime, setStartTime] = React.useState("");
    const [endTime, setEndTime] = React.useState("");
    const [isTimeValid, setIsTimeValid] = React.useState(true);

    const [days, setDays] = React.useState("");
    const [isDaysValid, setIsDaysValid] = React.useState(true);

    const [classSectionIds, setClassSectionIds] = React.useState("");

    React.useEffect(() => {
        try {
            const tr = TimeRange.create(courseSection.time);
            setStartTime(tr.startTime.format24h());
            setEndTime(tr.endTime.format24h());
        }catch {}

        setDays(courseSection.days.map(day => mapDayWeekToDay(day, true)).join(", "));
        setClassSectionIds(courseSection.classSectionIds?.join(", ") ?? "");
    }, []);

    React.useEffect(() => {
        if (courseSection.classSectionIds) {
            dispatch(
                editSectionByIndex({
                    courseId, 
                    sectionIndex,
                    newSection: { classSectionIds: classSectionIds.split(",").map(id => id.trim()) }, 
                })
            );        
        }
    }, [classSectionIds]);

    React.useEffect(() => {
        // Map string to WeekDay
        const dayArray = days.trim().split(",").map(day => mapDayToWeekDay(day.trim()));

        if (dayArray.some(days => days === undefined)) {
            setIsDaysValid(false);
        }else {
            setIsDaysValid(true);
            dispatch(
                editSectionByIndex({
                    courseId, 
                    sectionIndex,
                    newSection: { days: dayArray.filter((day): day is WeekDay => day !== undefined) }, 
                })
            );
        }
    }, [days]);

    React.useEffect(() => {
        // Update time if start time and end time change and are valid.
        // If they are invalid, set isTimeValid to true.
        const isValidTime = (time: string) => {
            // only 24h format is 
            try {
                Time.create(time);
                return true;
            }catch {
                return false;
            }
        }

        if (isValidTime(startTime) && isValidTime(endTime)) {
            setIsTimeValid(true);
            dispatch(
                editSectionByIndex({
                    courseId, 
                    sectionIndex,
                    newSection: { time: `${startTime} - ${endTime}` },
                })
            );
        }else {
            setIsTimeValid(false);
        }
    }, [startTime, endTime]);

	const setSectionField = (field: keyof ClassSection) => (value: string | boolean) => {
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
                    <span>{courseSection.isLab ? "Lab Section" : "Section"}</span> <MyInput value={courseSection.sectionId} setValue={setSectionField("sectionId")} width={80} placeholder={"A"} />
                </Group>
                {hasErrors && (
                    <Alert severity="error">
                        Error: Missing {errors.map(([key]) => key).join(", ")}
                    </Alert>
                )}
                {
                    !isTimeValid && (
                    <Alert severity="error">
                        Error: Invalid Start/End Time.
                    </Alert>
                )}
                
                	
            </CourseCardAccordionHeader>
            </AccordionSummary>
            <Divider/>
            <AccordionDetails>	
                				
                <Group>
                    Time:
                    <MyInput value={startTime} setValue={setStartTime} width={80} placeholder={"10:00"} />
                    –
                    <MyInput value={endTime} setValue={setEndTime} width={80} placeholder={"12:00"} />
                    <br />
                </Group>
                <Group>
                    Days: <MyInput value={days} setValue={setDays} placeholder={"Mon, Tue, Wed"} />
                </Group>
                <Group>
                    Prof Name: <MyInput value={courseSection.prof} setValue={setSectionField("prof")} placeholder={"John Smith"} />
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
                        Valid Sections: <MyInput value={classSectionIds} setValue={setClassSectionIds} placeholder={"Lab details"} />
                    </Group>
                )}
            </AccordionDetails>
        </Accordion>
    );
}