const TAG = "Schedule_Excludes";
const DELIM = ";";

const fullKey = (scheduleName: string) => `${TAG}${DELIM}${scheduleName}`;

export const excludeStorage = {
	getExcludes(scheduleName: string): string[] {
		try {
			const raw = localStorage.getItem(fullKey(scheduleName));
			if (!raw) return [];
			return JSON.parse(raw) as string[];
		} catch {
			return [];
		}
	},

	putExcludes(scheduleName: string, keys: string[]): void {
		localStorage.setItem(fullKey(scheduleName), JSON.stringify(keys));
	},

	clearExcludes(scheduleName: string): void {
		localStorage.removeItem(fullKey(scheduleName));
	},
};
