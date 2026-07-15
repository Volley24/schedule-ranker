import React from "react";
import {
	Checkbox,
	FormControlLabel,
	Typography,
	Divider,
	IconButton,
	Popover,
	Switch,
	Button,
	Tooltip,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "../../ui/hooks";
import {
	clearCourseExclusions,
	clearExclusions,
	loadExclusions,
	makeSectionKey,
	selectCourseColorMap,
	selectCourses,
	selectExcludedSectionKeys,
	selectExcludedSectionsSummary,
	selectIgnoreExcludes,
	selectScheduleName,
	setIgnoreExcludes,
	toggleCourseInclusion,
	toggleSectionExclusion,
} from "../../ui/scheduleViewUI";

const CourseListContainer = styled.div`
	padding: 10px;
	display: flex;
	flex-direction: column;
`;

const ColorSwatch = styled.span<{ $color: string }>`
	display: inline-block;
	width: 14px;
	height: 14px;
	border-radius: 3px;
	border: 1px solid rgba(0, 0, 0, 0.3);
	background: ${(props) => props.$color};
	flex-shrink: 0;
`;

const CourseRow = styled.div`
	display: flex;
	align-items: center;
`;

const PopoverContent = styled.div`
	padding: 12px 16px;
	min-width: 320px;
	max-width: 460px;
`;

const SectionRow = styled.div`
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 2px 0;
`;

const SectionTag = styled.span<{ $isLab: boolean; $isOnline: boolean }>`
	font-size: 10px;
	padding: 1px 5px;
	border-radius: 3px;
	background: ${(props) => (props.$isLab ? "#d6b3f0" : props.$isOnline ? "#b3f0d2" : "#b3d2f0")};
	color: #333;
	flex-shrink: 0;
`;

const ExcludedSummaryContainer = styled.div<{ $faded: boolean }>`
	padding: 8px 10px;
	opacity: ${(props) => (props.$faded ? 0.45 : 1)};
	transition: opacity 0.2s;
`;

const ExcludedChip = styled.span`
	display: inline-block;
	font-size: 11px;
	background: #f0b3b3;
	border-radius: 4px;
	padding: 2px 6px;
	margin: 2px 3px 2px 0;
`;

const ExcludeCount = styled.span<{ $isLab: boolean }>`
	font-size: 10px;
	font-weight: 600;
	color: ${(props) => (props.$isLab ? "#7a4fa0" : "#1a5fa0")};
	background: ${(props) => (props.$isLab ? "#e8d5f5" : "#d5e8f5")};
	border-radius: 3px;
	padding: 0px 4px;
	line-height: 16px;
`;

const CourseSectionsPopover = ({ courseId }: { courseId: string }) => {
	const dispatch = useAppDispatch();
	const courses = useAppSelector(selectCourses);
	const excludedKeys = useAppSelector(selectExcludedSectionKeys);
	const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);

	const course = courses.find((c) => c.id === courseId);
	if (!course) return null;

	const open = Boolean(anchor);

	const excludedSectionCount = course.sections.filter(
		(s) => !s.isLab && excludedKeys.includes(makeSectionKey(courseId, s))
	).length;
	const excludedLabCount = course.sections.filter(
		(s) => s.isLab && excludedKeys.includes(makeSectionKey(courseId, s))
	).length;
	const allExcluded = course.sections.length > 0 &&
		excludedSectionCount + excludedLabCount === course.sections.length;

	return (
		<>
			{!allExcluded && excludedSectionCount > 0 && (
				<ExcludeCount $isLab={false}>{excludedSectionCount}S</ExcludeCount>
			)}
			{!allExcluded && excludedLabCount > 0 && (
				<ExcludeCount $isLab={true}>{excludedLabCount}L</ExcludeCount>
			)}
			<Tooltip title="Configure included sections">
				<IconButton
					size="small"
					onClick={(e) => setAnchor(e.currentTarget)}
					sx={{ padding: "2px", color: open ? "primary.main" : "action.active" }}
				>
					<SettingsIcon fontSize="inherit" />
				</IconButton>
			</Tooltip>

			<Popover
				open={open}
				anchorEl={anchor}
				onClose={() => setAnchor(null)}
				anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
				transformOrigin={{ vertical: "top", horizontal: "left" }}
			>
				<PopoverContent>
					<Typography variant="subtitle2" sx={{ marginBottom: "8px" }}>
						{courseId}
					</Typography>

					{course.sections.length === 0 && (
						<Typography variant="body2" color="text.secondary">
							No sections available.
						</Typography>
					)}

					{course.sections.map((section) => {
						const key = makeSectionKey(courseId, section);
						const isExcluded = excludedKeys.includes(key);
						return (
							<SectionRow key={key}>
								<Checkbox
									size="small"
									checked={!isExcluded}
									onChange={(_, checked) =>
										dispatch(
											toggleSectionExclusion({
												courseId,
												section,
												excluded: !checked,
											})
										)
									}
									sx={{ padding: "2px" }}
								/>
								<Typography variant="body2" sx={{ minWidth: "48px" }}>
									{section.sectionId}
								</Typography>
								<SectionTag $isLab={section.isLab} $isOnline={section.isOnline}>
									{section.isLab ? "Lab" : section.isOnline ? "Online" : "Lecture"}
								</SectionTag>
								<Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
									{section.prof}
								</Typography>
								<Typography variant="body2" color="text.secondary">
									{section.time.toString()}
								</Typography>
							</SectionRow>
						);
					})}
				</PopoverContent>
			</Popover>
		</>
	);
};

export const IncludesTab = () => {
	const dispatch = useAppDispatch();

	const courses = useAppSelector(selectCourses);
	const courseColorMap = useAppSelector(selectCourseColorMap);
	const excludedSectionKeys = useAppSelector(selectExcludedSectionKeys);
	const ignoreExcludes = useAppSelector(selectIgnoreExcludes);
	const excludedSummary = useAppSelector(selectExcludedSectionsSummary);
	const scheduleName = useAppSelector(selectScheduleName);

	const importInputRef = React.useRef<HTMLInputElement>(null);

	const handleExportIncludes = () => {
		const content = excludedSectionKeys.join("\n");
		const blob = new Blob([content], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${scheduleName || "schedule"}-includes.txt`;
		a.click();
		URL.revokeObjectURL(url);
	};

	const handleImportIncludes = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const text = await file.text();
		const keys = text
			.split(/\r?\n/)
			.map((l) => l.trim())
			.filter((l) => l.length > 0);
		dispatch(loadExclusions(keys));
		if (importInputRef.current) importInputRef.current.value = "";
	};

	if (courses.length === 0) {
		return (
			<CourseListContainer>
				<Typography variant="body2" color="text.secondary">
					No schedule loaded yet. Import one from the Import tab.
				</Typography>
			</CourseListContainer>
		);
	}

	return (
		<div>
			<CourseListContainer>
				{courses.map((course) => {
					const excludedForCourse = course.sections.filter((s) =>
						excludedSectionKeys.includes(makeSectionKey(course.id, s))
					);
					const allExcluded =
						course.sections.length > 0 &&
						excludedForCourse.length === course.sections.length;
					const isIndeterminate = !allExcluded && excludedForCourse.length > 0;
					const isChecked = !allExcluded && excludedForCourse.length === 0;

					const handleCourseToggle = () => {
						if (allExcluded || isIndeterminate) {
							// OFF or indeterminate → fully ON (clear all excludes for this course)
							dispatch(clearCourseExclusions({ courseId: course.id }));
						} else {
							// ON → fully OFF (exclude all sections)
							dispatch(toggleCourseInclusion({ courseId: course.id, included: false }));
						}
					};

					return (
						<CourseRow key={course.id}>
							<FormControlLabel
								sx={{ flex: 1, marginRight: 0 }}
								control={
									<Checkbox
										size="small"
										checked={isChecked}
										indeterminate={isIndeterminate}
										onClick={handleCourseToggle}
										onChange={() => {}}
									/>
								}
								label={
									<span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
										<ColorSwatch $color={courseColorMap.regular[course.id]} />
										{course.id}
									</span>
								}
							/>
							<CourseSectionsPopover courseId={course.id} />
						</CourseRow>
					);
				})}

				<Divider sx={{ marginTop: "5px", marginBottom: "6px" }} />

				<div style={{ display: "flex", gap: "6px" }}>
					<Button
						size="small"
						variant="outlined"
						component="label"
						sx={{ fontSize: "11px", padding: "1px 8px" }}
					>
						Import includes
						<input
							ref={importInputRef}
							type="file"
							accept=".txt"
							hidden
							onChange={handleImportIncludes}
						/>
					</Button>
					<Button
						size="small"
						variant="outlined"
						disabled={excludedSectionKeys.length === 0}
						sx={{ fontSize: "11px", padding: "1px 8px" }}
						onClick={handleExportIncludes}
					>
						Export includes
					</Button>
				</div>
			</CourseListContainer>

			{excludedSectionKeys.length > 0 && (
				<>
					<ExcludedSummaryContainer $faded={ignoreExcludes}>
						<div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
							<Typography variant="subtitle2">Excluded Sections</Typography>
							<FormControlLabel
								sx={{ marginLeft: "auto", marginRight: 0 }}
								control={
									<Switch
										size="small"
										checked={ignoreExcludes}
										onChange={(_, checked) => dispatch(setIgnoreExcludes(checked))}
									/>
								}
								label={<Typography variant="caption">Ignore</Typography>}
								labelPlacement="start"
							/>
						</div>
						<div>
							{excludedSummary.map(({ courseId, section }) => (
								<ExcludedChip key={makeSectionKey(courseId, section)}>
									{courseId} — {section.sectionId}
									{section.isLab ? " (Lab)" : ""}
								</ExcludedChip>
							))}
						</div>
						<Button
							size="small"
							color="error"
							sx={{ marginTop: "6px", padding: "1px 8px", fontSize: "11px" }}
							onClick={() => dispatch(clearExclusions())}
						>
							Clear all
						</Button>
					</ExcludedSummaryContainer>
					<Divider />
				</>
			)}
		</div>
	);
};
