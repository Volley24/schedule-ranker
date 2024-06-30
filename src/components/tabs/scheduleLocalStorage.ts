export class ScheduleStorage {
	readonly TAG = "Schedule_State";
	readonly DELIM = ";";

	isActive() {
		return !!localStorage;
	}

	getAllScheduleKeys() {
		const schedules = [];
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key?.startsWith(this.TAG)) {
				const scheduleName = key.substring(key.indexOf(this.DELIM) + 1);
				schedules.push(scheduleName);
			}
		}

		return schedules;
	}

	scheduleExists = (key: string) => {
		return this.getScheduleByKey(key) !== null;
	};

	getScheduleByKey = (key: string) => {
		return localStorage.getItem(this.getFullKey(key));
	};

	putSchedule = (key: string, json: string) => {
		localStorage.setItem(this.getFullKey(key), json);
	};

	private getFullKey = (key: string) => {
		return this.TAG + this.DELIM + key;
	};
}

export const scheduleStorage = new ScheduleStorage();
