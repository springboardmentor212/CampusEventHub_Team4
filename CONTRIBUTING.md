# Contributing to CampusEventHub

## Branch Strategy

```
main      protected, production only
dev       integration branch
name/description-branch   your work
```

Current active branch: `uday/role-security-flow-fix`

## If you are working on Milestone 3 or 4

Branch from: `uday/role-security-flow-fix`
PR target:   `uday/role-security-flow-fix`

Do not raise PRs directly to `dev` while this branch
is active. Once it is stable and reviewed we merge
to dev together.

## Steps to contribute

```bash
# 1. Get the active branch
git fetch origin
git checkout uday/role-security-flow-fix
git pull origin uday/role-security-flow-fix

# 2. Create your branch
git checkout -b yourname/what-you-are-fixing

# 3. Make your changes
# 4. Commit with clear message
git commit -m "fix(registrations): correct waitlist position"

# 5. Push and raise PR
git push origin yourname/what-you-are-fixing
# Raise PR targeting uday/role-security-flow-fix
```

## Commit Message Format

```
feat(area): short description of what was added
fix(area): short description of what was fixed
chore(area): config, dependency, cleanup changes
docs(area): documentation changes only
```

Areas: auth, events, registrations, notifications,
       feedback, dashboard, colleges, ui, config

## Files to coordinate on

If you are touching these files, comment on the
open issue first so we don't conflict:

```
backend/controllers/authController.js
backend/controllers/eventController.js
backend/controllers/registrationController.js
backend/middleware/auth.js
frontend/src/pages/AdminDashboard.jsx
frontend/src/pages/CollegeAdminDashboard.jsx
frontend/src/pages/StudentDashboard.jsx
frontend/src/pages/EventDetail.jsx
frontend/src/App.jsx
```

## PR Rules

- PR description must say what changed and why
- Test your changes locally before raising PR
- Target the correct branch (not dev directly)
- At least one other person should review before merge

## Note on docs/

The docs folder reflects the latest implementation.
When docs and code conflict, go by the code.
If you find a discrepancy, update the doc in the
same PR as your code change.
