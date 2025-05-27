export enum TimeErrors {
	INVALID_TIME = "Invalid hours or minutes provided, 24h format not supported. Correct usage: 1:00PM. Incorrect usage: 13:00",
	INVALID_TIME_MOD = "Time should end in either AM or PM, 24h format not supported. Correct usage: 11:00AM. Incorrect usage: 11:00 (ambiguous).",
	MINUTES_LENGTH_2 = "The minutes should be of exactly length 2. Correct Usage: 12:00PM. Incorrect Usage: 12:0PM",

	INVALID_DASH_AMOUNT = "Time range must only contain exactly one dash. Correct Usage: 12:00PM - 1:00PM. Incorrect Usages: 12:00PM, 12:00PM - 1:00PM - 2:30PM",
}

export const DayOfWeek = ["sun", "mon", "tue", "wed", "thur", "fri", "sat"];

export class TimeRange {
	constructor(public startTime: Time, public endTime: Time) {}

	toString() {
		return `${this.startTime.toString()} - ${this.endTime.toString()}`;
	}

	format24h() {
		return `${this.startTime.format24h()} - ${this.endTime.format24h()}`;
	}

	durationFormatted() {
		return this.startTime.durationFormatted(this.endTime);
	}

	duration() {
		return this.startTime.durationMinutes(this.endTime);
	}

	static create(input: string) {
		const times = input.replaceAll(" ", "").toLowerCase().split("-");

		if (times.length !== 2) {
			throw new Error("Time range must only exactly one dash. Example: 12:00PM - 1:00PM");
		}

		return new TimeRange(Time.create(times[0]), Time.create(times[1]));
	}
}

export class Time {
	constructor(public hours: number, public minutes: number) {}

	toString() {
		return this.format();
	}

	format24h() {
		return `${Time.addExtraZeroIfNeeded(this.hours)}:${Time.addExtraZeroIfNeeded(this.minutes)}`;
	}

	static create(timeStr: string): Time {
		timeStr = timeStr.replaceAll(" ", "").toLowerCase();

		const [hours, minutes = 0] = timeStr.split(":").map((str) => Number(str));

		if (hours < 1 || hours > 24 || minutes < 0 || minutes > 59) {
			throw new Error(TimeErrors.INVALID_TIME);
		}
		return new Time(hours, minutes);
	}

	static formatDuration(totalMinutes: number) {
		const hours = Math.floor(totalMinutes / 60);
		const minutes = totalMinutes % 60;

		if (hours === 0) {
			return `${minutes}m`;
		} else {
			return minutes === 0 ? `${hours}h` : `${hours}h${Time.addExtraZeroIfNeeded(minutes)}`;
		}
	}

	static now(offset: number = -5): Time {
		const actualTime = DateTime.getActualDate(offset);
		return new Time(actualTime.getHours(), actualTime.getMinutes());
	}

	getDecimalHour(): number {
		const decimalMinutes = this.minutes / 60;

		return this.hours + (decimalMinutes > 0.25 && decimalMinutes < 0.75 ? 0.5 : 0);
	}

	compare(time: Time) {
		if (this.isSameAs(time)) return 0;
		if (this.isBefore(time)) return -1;
		return 1;
	}

	isSameAs(time: Time) {
		return time.hours === this.hours && this.minutes === time.minutes;
	}

	isBefore(time: Time) {
		if (time.hours === this.hours) {
			return this.minutes < time.minutes;
		}
		return this.hours < time.hours;
	}

	isAfter(time: Time) {
		if (time.hours === this.hours) {
			return this.minutes > time.minutes;
		}
		return this.hours > time.hours;
	}

	isBeforeOrSameAs(time: Time) {
		return this.isBefore(time) || this.isSameAs(time);
	}

	isAfterOrSameAs(time: Time) {
		return this.isAfter(time) || this.isSameAs(time);
	}

	isBetween(timeA: Time, timeB: Time, log?: boolean) {
		if (this.hours > timeA.hours && this.hours < timeB.hours) {
			return true;
		} else if (this.hours === timeA.hours) {
			return this.minutes >= timeA.minutes;
		} else if (this.hours === timeB.hours) {
			return this.minutes < timeB.minutes;
		}
		return false;
	}

	durationFormatted(timeB: Time) {
		return Time.formatDuration(this.durationMinutes(timeB));
	}

	durationMinutes(timeB: Time) {
		return (timeB.hours - this.hours) * 60 + (timeB.minutes - this.minutes);
	}

	format() {
		let hours;
		let mod;
		if (this.hours < 12) {
			hours = this.hours === 0 ? 12 : this.hours;
			mod = "AM";
		} else {
			hours = this.hours === 12 ? 12 : this.hours - 12;
			mod = "PM";
		}

		return this.minutes === 0 ? `${hours}${mod}` : `${hours}:${Time.addExtraZeroIfNeeded(this.minutes)}${mod}`;
	}

	private static addExtraZeroIfNeeded(num: number): string {
		return num < 10 ? `0${num}` : `${num}`;
	}
}

export class DateTime {
	static getActualDate(offset: number = -5) {
		const now = new Date();
		const localTime = now.getTime();
		const localOffset = now.getTimezoneOffset() * 60000;

		const utc = localTime + localOffset;
		const actualTimeOffset = utc + 3600000 * offset;

		return new Date(actualTimeOffset);
	}

	static getDayName() {
		return DayOfWeek[DateTime.getActualDate().getDay()];
	}
}
