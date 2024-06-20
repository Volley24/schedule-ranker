# Changelog

Dates are in YYYY/MM/DD

**Latest Version:** v.0.2-alpha-1

# Upcoming

## v.0.3 - 'Customization'

As the name of the version implies, this version will add the ability to for customize/configure the schedule ranker. Some things planned:

-   Allowing importing of custom `schedules.json` into the app (temporary, a UI where you can insert classes will be another oprtion later down the road)
-   Being able to adjust the weights AND ranking critera.

# Current

## v.0.2-alpha-1 - 2024/6/19

**UI:**

-   [x] Added basic import json file. Default = 1st sem.
-   [x] Added times on the left.

**Logic:**

-   [x] Two new rankings: Late class ending and total break time per day.
-   [x] Change the rating for early classes/late classes for online classes accordigally.
-   [x] Online classes on day off are still considering as being a day off.

## v.0.1 - 2024/6/11 - 'Baseline'

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
