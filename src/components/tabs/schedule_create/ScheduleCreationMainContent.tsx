import React from "react";
import { MyInput } from "./common";
import { ScheduleCreationCourse, ScheduleCreationCourseProps } from "./ScheduleCreationCourse";

export const ScheduleCreationMainContent = (props: ScheduleCreationCourseProps) => {
    const { course, courseIndex } = props;
    
    return (        
        <ScheduleCreationCourse 
            key={courseIndex}
            course={course}
            courseIndex={courseIndex}
        />
    );
};