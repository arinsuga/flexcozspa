dev100 - fix(api): handle null values in user profile

Previously, the API crashed when user profile fields were null.
This commit adds validation to prevent null pointer exceptions.
Fixes #42