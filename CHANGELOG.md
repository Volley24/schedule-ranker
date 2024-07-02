# Changelog

Dates are in YYYY/MM/DD

**Latest Version:** v.0.2

# Current

## v.0.2 - 2024/6/30

**UI:**

-   [x] Revamped the config UI to look better.
-   [x] Added version number at the bottom of the tab bar.
-   [x] Slightly revamped the schedule viewer UI by fixing inconsistencies.
-   [x] Changed default create-react-app webapp title and description.
-   [x] Disable remove button in the import UI as it doesn't currently work.

**App logic:**

-   [x] Fixed a bug where app would crash if schedule index is out of bounds
    -   [x] Schedule index now starts at 1, not 0, to avoid confusion.

**Buisness Logic:**

-               [x] Global schedule score is now always normalized to be out of ten, regardless of the sum of the weights.

## v.0.2-alpha-2 - 2024/6/25

**UI:**

-   [x] Added more information about a file import.
    -   [x] A message is shown if a JSON file is failed to import.
-   [x] You are now able to control the weights of each ranking!
    -   [x] Ranks are now reported to four decimal places maximum.
-                     [ ] Fixed a bug where the website would crash upon the schedule index being out of bounds.

**Import:**

-   [x] Schedules that are imported are now persistent!
    -   [x] You can choose schedules you've already imported with the dropdown. (Assuming they were successful)

## v.0.2-alpha-1 - 2024/6/19

**UI:**

-   [x] Added basic import json file. Default = 1st sem.
-   [x] Added times on the left.

**Logic:**

-   [x] Two new rankings: Late class ending and total break time per day.
-   [x] Change the rating for early classes/late classes for online classes accordigally.
-   [x] Online classes on day off are still considering as being a day off.

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
