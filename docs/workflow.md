# 🔁 Development Workflow – CampusEventHub

This document defines the official workflow for all contributors.

---

## 🧭 Branch Hierarchy

```
main (protected)
   ↑
dev (root development branch)
   ↑
feature branches
```

---

## 🔄 Complete Flow

1. Clone repository
2. Checkout dev
3. Pull latest code
4. Create feature branch
5. Develop
6. Commit properly
7. Push branch
8. Raise PR to dev
9. Review + Merge
10. Pull latest dev

---

## ❌ What Not To Do

* Do not push to main
* Do not merge without PR
* Do not force push to shared branches
* Do not commit node_modules
* Do not commit .env

---

## 🔄 Keeping Code Updated

Before starting new feature:

```
git checkout dev
git pull origin dev
```

Always branch from updated dev.

---

## 🧱 Merge Strategy

Only squash or merge via PR.

No direct CLI merges into main.