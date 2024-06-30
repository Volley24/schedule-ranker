export const enumToList = <T>(
	object:
		| {
				[s: string]: string | T;
		  }
		| ArrayLike<string | T>
): T[] => {
	return Object.values(object).filter((value): value is T => {
		return typeof value !== "string";
	});
};
