import {
	Divider,
	Checkbox,
	FormControlLabel,
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Alert,
	IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ScienceIcon from "@mui/icons-material/Science";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useDispatch } from "react-redux";
import { editSectionByIndex, removeSectionByIndex, UISection } from "../logic/courses";
import { CourseCardAccordionHeader, Group, MyInput } from "./common";
import { ClassSection, WeekDay } from "../../../logic/definitions";
import React from "react";
import { Time, TimeRange } from "../../../logic/time";
import { mapDayToWeekDay, mapDayWeekToDay } from "../../../logic/ranker";

export type ScheduleCreationSectionProps = {
    courseIndex: number;
    sectionIndex: number;
    courseSection: UISection;
    totalSections: number;
    showErrors?: boolean;
};

export const ScheduleCreationSection = (props: ScheduleCreationSectionProps) => {
    const { courseIndex, sectionIndex, courseSection, totalSections, showErrors = false } = props;

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
        } catch {}

        setDays(courseSection.days.map(day => mapDayWeekToDay(day, true)).join(", "));
        setClassSectionIds(courseSection.classSectionIds?.join(", ") ?? "");
    }, []);

    React.useEffect(() => {
        if (courseSection.classSectionIds) {
            dispatch(
                editSectionByIndex({
                    courseIndex,
                    sectionIndex,
                    newSection: { classSectionIds: classSectionIds.split(",").map(id => id.trim()) },
                })
            );
        }
    }, [classSectionIds]);

    React.useEffect(() => {
        const dayArray = days.trim().split(",").map(day => mapDayToWeekDay(day.trim()));

        if (dayArray.some(d => d === undefined)) {
            setIsDaysValid(false);
        } else {
            setIsDaysValid(true);
            dispatch(
                editSectionByIndex({
                    courseIndex,
                    sectionIndex,
                    newSection: { days: dayArray.filter((day): day is WeekDay => day !== undefined) },
                })
            );
        }
    }, [days]);

    React.useEffect(() => {
        const isValidTime = (time: string) => {
            try {
                Time.create(time);
                return true;
            } catch {
                return false;
            }
        };

        if (isValidTime(startTime) && isValidTime(endTime)) {
            setIsTimeValid(true);
            dispatch(
                editSectionByIndex({
                    courseIndex,
                    sectionIndex,
                    newSection: { time: `${startTime} - ${endTime}` },
                })
            );
        } else {
            setIsTimeValid(false);
        }
    }, [startTime, endTime]);

    const setSectionField = (field: keyof ClassSection) => (value: string | boolean) => {
        dispatch(
            editSectionByIndex({
                courseIndex,
                sectionIndex,
                newSection: { [field]: value },
            })
        );
    };

    const errors = Object.entries(courseSection).filter(([key, value]) => {
        if (key === "isOnline" || key === "isLab") return false;
        if (key === "validSections" || key === "crn") return false;
        return value === "" || value === undefined;
    });

    const hasErrors = showErrors && errors.length > 0;
    const canDelete = totalSections > 1;

    return (
        <Accordion>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
            >
                <CourseCardAccordionHeader>
                    <Group>
                        {courseSection.isLab ? <ScienceIcon color="secondary" /> : <LibraryBooksIcon color="primary" />}
                        <span>{courseSection.isLab ? "Lab Section" : "Section"}</span>
                        <MyInput value={courseSection.sectionId} setValue={setSectionField("sectionId")} width={80} placeholder={"A"} />
                        <IconButton
                            size="small"
                            color="error"
                            disabled={!canDelete}
                            onClick={(e) => {
                                e.stopPropagation();
                                dispatch(removeSectionByIndex({ courseIndex, sectionIndex }));
                            }}
                        >
                            <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                    </Group>
                    {hasErrors && (
                        <Alert severity="error">
                            Error: Missing {errors.map(([key]) => key).join(", ")}
                        </Alert>
                    )}
                    {!isTimeValid && (
                        <Alert severity="error">
                            Error: Invalid Start/End Time.
                        </Alert>
                    )}
                </CourseCardAccordionHeader>
            </AccordionSummary>
            <Divider />
            <AccordionDetails sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <Group>
                    Time:
                    <MyInput value={startTime} setValue={setStartTime} width={80} placeholder={"10:00"} />
                    –
                    <MyInput value={endTime} setValue={setEndTime} width={80} placeholder={"12:00"} />
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
};
