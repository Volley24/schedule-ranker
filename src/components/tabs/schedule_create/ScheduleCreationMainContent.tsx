import React from "react";
import { ScheduleCreationCourse, ScheduleCreationCourseProps } from "./ScheduleCreationCourse";

export const ScheduleCreationMainContent = (props: ScheduleCreationCourseProps) => {
    const { course, courseIndex, totalCourses } = props;

    return (
        <ScheduleCreationCourse
            key={courseIndex}
            course={course}
            courseIndex={courseIndex}
            totalCourses={totalCourses}
        />
    );
};
