import { RawCourse, Schedule } from "../../../logic/definitions";
import { parseUISchedules } from "../../../logic/ranker";
import { UISchedule } from "./courses";
import { ScheduleStorage } from "./scheduleLocalStorage";

class ScheduleManager {
    private scheduleStorage: ScheduleStorage = new ScheduleStorage();
    private schedules: Map<string, UISchedule> = new Map();

    getOrLoadUISchedule(key: string): UISchedule | undefined {
        if (this.schedules.has(key)) {
            return this.schedules.get(key);
        }

        const scheduleData = this.scheduleStorage.getScheduleByKey(key);
        if (scheduleData) {
            const rawData = JSON.parse(scheduleData);
            const schedule = parseUISchedules(rawData);
            this.schedules.set(key, schedule);
            return schedule;
        }
        return undefined;
    }

    saveSchedule(scheduleKey: string, json: string): void {
        const rawData = JSON.parse(json);
        const schedule = parseUISchedules(rawData);
        this.schedules.set(scheduleKey, schedule);
        this.scheduleStorage.putSchedule(scheduleKey, json);
    }
}

export const scheduleManager = new ScheduleManager();
