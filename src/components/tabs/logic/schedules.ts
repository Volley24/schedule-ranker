import { RawCourse, Schedule } from "../../../logic/definitions";
import { parseSchedules } from "../../../logic/ranker";
import { UISchedule } from "./courses";
import { ScheduleStorage } from "./scheduleLocalStorage";

class ScheduleManager {
    private scheduleStorage: ScheduleStorage = new ScheduleStorage();
    private schedules: Map<string, UISchedule> = new Map();

    // getOrLoadSchedule(key: string): Schedule | undefined {
    //     if (this.schedules.has(key)) {
    //         return this.schedules.get(key);
    //     }

    //     const scheduleData = this.scheduleStorage.getScheduleByKey(key);
    //     if (scheduleData) {
    //         const rawData = JSON.parse(scheduleData);

    //         console.log("Raw data:", rawData);

    //         return parseSchedules(rawData);
    //     }
    //     return undefined;

    // }

    // bruh

    getOrLoadUISchedule(key: string): UISchedule | undefined {
        if (this.schedules.has(key)) {
            return this.schedules.get(key);
        }

        const scheduleData = this.scheduleStorage.getScheduleByKey(key);
        if (scheduleData) {
            const rawData = JSON.parse(scheduleData);

            console.log("Raw data:", rawData);

            return parseSchedules(rawData);
        }
        return undefined;

    }

    editSchedule(scheduleKey: string, newSchedule: UISchedule): void {
        this.schedules.set(scheduleKey, newSchedule);
        this.scheduleStorage.putSchedule(scheduleKey, JSON.stringify(newSchedule));
    }

    // TODO
    // editScheduleKey(oldKey: string, newKey: string): void {
    //     if (this.schedules.has(oldKey)) {
    //         const schedule = this.schedules.get(oldKey);
    //         this.schedules.delete(oldKey);
    //         this.schedules.set(newKey, schedule!);
    //         this.scheduleStorage.putSchedule(oldKey, newKey);
    //     }
    // }

}

export const scheduleManager = new ScheduleManager();
