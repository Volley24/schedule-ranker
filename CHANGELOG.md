# Changelog

Dates are in YYYY/MM/DD

**Latest Version:** v.0.2.1

## v.0.3.0 - 2024/X/Y
-	[ ] Add course creator where users can type the course details and add sections / lab sections.

## v.0.2.1 - 2024/7/3

-   Added copyright notice + github link.
-   Updated README.md.
-   Fixed formatting issues in CHANGELOG.

## v.0.2 - 2024/6/30

**UI:**

-   Revamped the config UI to look better.
-   Added version number at the bottom of the tab bar.
-   Slightly revamped the schedule viewer UI by fixing inconsistencies.
-   Changed default create-react-app webapp title and description.
-   Disable remove button in the import UI as it doesn't currently work.

**App logic:**

-   Fixed a bug where app would crash if schedule index is out of bounds
    -   Schedule index now starts at 1, not 0, to avoid confusion.

**Buisness Logic:**

-   Global schedule score is now always normalized to be out of ten, regardless of the sum of the weights.

## v.0.2-alpha-2 - 2024/6/25

**UI:**

-   Added more information about a file import.
    -   A message is shown if a JSON file is failed to import.
-   You are now able to control the weights of each ranking!
    -   Ranks are now reported to four decimal places maximum.

**Import:**

-   Schedules that are imported are now persistent!
    -   You can choose schedules you've already imported with the dropdown. (Assuming they were successful)

## v.0.2-alpha-1 - 2024/6/19

**UI:**

-   Added basic import json file. Default = 1st sem.
-   Added times on the left.

**Logic:**

-   Two new rankings: Late class ending and total break time per day.
-   Change the rating for early classes/late classes for online classes accordigally.
-   Online classes on day off are still considering as being a day off.

## v.0.1 - 2024/6/11

**Logic:**

-   Added schedule permutator using recursion.
-   Added schedule filterer which eliminates invalid schedules.
-   Added basic ranking system which ranks schedules based on days off and whether the start time of a class in a given week is "reasonable" (hard-coded).

**UI:**

-   Added simple schedule view which displays a schedule.
    -   Shows class id and time.
    -   A bit of a hack, since it uses absolute positioning for every item; this has the side effect of making the 30m/1h lines appear thicker/thinner due to the way chrome renders these very thin pixel lines.
-   Added side-bar:
    -   Generate: Generate all possible schedules and filter out the invalid ones.
    -   Combinations: Figure out how manu schedule combinations there should be (logged to console.)
