export const hasLocalStorage = () => {
	return !!localStorage;
};

export const getScheduleNames = () => {
	const schedules = [];
	for (let i = 0; i < localStorage.length; i++) {
		const key = localStorage.key(i);
		if (key?.startsWith("Schedule_State;")) {
			const scheduleName = key.substring(key.indexOf(";") + 1);
			schedules.push(scheduleName);
		}
	}

	return schedules;
};

export const getScheduleByKey = (key: string) => {
	return localStorage.getItem("Schedule_State;" + key);
};

export const putSchedule = (key: string, json: string) => {
	localStorage.setItem("Schedule_State;" + key, json);
};

// Weights

export const getWeightsByKey = (key: string) => {
	return localStorage.getItem("Weights;" + key);
};

export const putWeightConfig = (key: string, json: string) => {
	localStorage.setItem("Weights;" + key, json);
};

// super super super annoying
// export const parseWeightConfig = (weightConfig: Record<string, number>): Map<WeightCategory, number> => {
// 	const newMap = new Map<WeightCategory, number>();

// 	const enumVal = WeightCategory["Day Off"];
// 	// SUPER SUPER SUPER UGLY.
// 	// It's temporary.
// 	const daysOff = weightConfig["days_off"];
// 	if (daysOff !== undefined) {
// 		newMap.set(WeightCategory.DAY_OFF, daysOff);
// 	}

// 	const earlyWeight = weightConfig["early"];
// 	if (earlyWeight !== undefined) {
// 		newMap.set(WeightCategory.NO_EARLY_CLASSES, earlyWeight);
// 	}

// 	const lateWeight = weightConfig["late"];
// 	if (lateWeight !== undefined) {
// 		newMap.set(WeightCategory.NO_LATE_CLASSES, lateWeight);
// 	}

// 	const breakWeight = weightConfig["break"];
// 	if (breakWeight !== undefined) {
// 		newMap.set(WeightCategory.BREAK_AMOUNT, breakWeight);
// 	}

// 	return newMap;
// };
