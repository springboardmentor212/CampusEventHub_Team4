# Debug Entry Template

Use this template for new stabilization/debug entries in docs/ENGINEERING_DEBUG_LOG.md.

Add each entry under the correct contributor section using a Markdown <details> block.

Template block:

~~~markdown
<details>
<summary>[Title] - [YYYY-MM-DD]</summary>

### Title
[Title]

### Author
Author: @[username]

### Date
[YYYY-MM-DD]

### Branch
[Branch name or branch context]

### Summary
[Brief incident summary and impact]

### Root Cause
- [Cause 1]
- [Cause 2]
- [Cause 3]

### Repair Strategy
- [Repair principle 1]
- [Repair principle 2]
- [Repair principle 3]

### Affected Files
- [path/to/file1]
- [path/to/file2]
- [path/to/file3]

### Diff Evidence
Git comparison:

```bash
git diff [base-branch] [target-branch]
```

Files changed:
- [path/to/file1]
- [path/to/file2]

Statistics:
- [N] files changed
- [N] insertions
- [N] deletions

### Validation Steps
- [Validation step 1]
- [Validation step 2]
- [Validation step 3]

### Lessons Learned
- [Lesson 1]
- [Lesson 2]
- [Lesson 3]

</details>
~~~

Guidelines:
- Keep language factual and professional.
- Avoid self-promotional wording.
- Include concrete evidence (diff, files, validation).
- Keep entries scoped to the actual stabilization/debugging work.
