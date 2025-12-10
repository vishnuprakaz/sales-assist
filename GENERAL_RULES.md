This guide outlines the mandatory rules and workflows for all coding agents contributing to this project. Adherence to these standards ensures consistency, maintainability, and proper progress tracking.

-----

### 1\. Project Structure and Context Management

The project is divided into two main parts:

  * **Frontend:** Located in the `ui/` folder.
      * **Context:** `ui/ui-context/` (for frontend-specific documentation).
  * **Backend/Agents:** Located in the `agents/` folder.
      * **Context:** `agents/agents-context/` (for backend-specific documentation).
  * **Project-level Context:** `project-context/` (for overall goals, vision, and cross-cutting concerns).

**Context Files (`.md`):** Must document current status, code changes, implementation rationale, and approaches/patterns used.

-----

### 2\. Tracking Systems

All work is tracked using:

| File | Purpose |
| :--- | :--- |
| `features.json` | Main tracking system for new feature implementation. |
| `tasks.json` | Tracks all granular development work (features, bugs, improvements). |

-----

### 3\. Feature Tracking (`features.json`)

**Feature States:** `planned`, `in_progress`, `testing`, `completed`, `blocked`.

**Completion Criteria:** A feature is only marked **`completed`** when:

1.  Frontend and Backend implementations are complete.
2.  Both parts are thoroughly tested.
3.  Full verification and approval has been done.

**Agent Responsibility:** Check and update feature status in `features.json` as work progresses. **Never** mark a feature as complete without full verification.

-----

### 4\. Task Tracking (`tasks.json`)

**Task Workflow:** `CREATE TASK` $\rightarrow$ `Mark as IN_PROGRESS` $\rightarrow$ `Do the work` $\rightarrow$ `Mark as COMPLETED`

**Task States:** `pending`, `in_progress`, `completed`, `blocked`.

**Rules:**

  * **Task Creation is Mandatory:** Agents **must create a task** before starting any work.
  * **Granularity:** Tasks must be small, manageable, and clearly defined.

-----

### 5\. Data Schemas and Descriptions

#### Task Format

**Minimum required fields:**

```json
{
  "id": "T001",
  "name": "Build leads table",
  "description": "Create HTML table component that displays all leads with columns: name, company, email, status. Rows must be selectable. Handle empty state gracefully.",
  "feature": "F001",
  "component": "UI",
  "status": "pending"
}
```

**Description must include:** What needs to be built, Key requirements, Expected behavior, and any Constraints.

**Example of Good Task Description:**

  * **Good:** "Fix leads table not displaying when there are more than 100 leads. Table should paginate or virtualize for performance." (Vs. Bad: "Fix the table")

#### Feature Format

**Minimum required fields:**

```json
{
  "id": "F001",
  "name": "Lead Management",
  "description": "Users should be able to manage their leads with full CRUD operations. Includes viewing leads in a table, clicking to see details in a side panel, adding new leads via natural language, editing existing leads, and deleting leads.",
  "status": "in_progress",
  "component": "UI"
}
```

**Description must include:** What the feature does from the user perspective, Main capabilities, and Expected user experience.

**Example of Good Feature Description:**

  * **Good:** "Deep lead research system that automatically gathers company info, LinkedIn profile, recent posts, and company hierarchy when user selects 'Research this lead'. Should work in parallel for multiple leads." (Vs. Bad: "Deep research")

**Why Good Descriptions Matter:**
The description provides necessary **context for the AI**, allowing it to immediately know what to build without needing clarification, thus saving time and preventing assumptions.

-----

### 6\. Code Quality and Structure Preferences

Agents must strictly adhere to the following principles:

  * **File Size:** **No large code files are allowed.** Code must be split into small, logical, and manageable code files.
  * **Simplicity:** Code should be the **most simplest** possible, preferring minimal lines and utilizing simple, focused functions.
  * **Reusability:** Always prefer to use **simple functions** over complex, monolithic blocks.
  * **Clean Code:** Use meaningful names, keep functions small, and follow the DRY principle.

-----

### 7\. Context Documentation Rules

Agents **MUST update context files** when:

  * Implementing a new feature or component.
  * Making significant code changes or architectural decisions.
  * Introducing new patterns or approaches.

**What to Document:**

  * **Implementation:** What was implemented, why this approach was chosen, key code changes, dependencies.
  * **Approaches:** Design/architectural patterns used, coding standards, and best practices.
  * **Maintenance:** Keep context concise, relevant, and current.

**Documentation Style:**

  * **Be concise:** Only essential information, no over-explanation.
  * **No excessive formatting:** Avoid unnecessary tables, emojis, or decorative elements that consume tokens.
  * **Straight to the point:** Technical facts only, no marketing language.
  * **Code examples:** Only when necessary to clarify implementation.
  * **Keep it minimal:** If it can be understood from code, don't document it.

-----

### 8\. Standard Development Workflow

1.  **Read Project Context:** Review overall goals in `project-context/`.
2.  **Check Features & Tasks:** Review `features.json` and `tasks.json`.
3.  **Create Task:** Create a new, scoped task in `tasks.json` and mark it as `in_progress`.
4.  **Review Relevant Context:** Read existing patterns and approaches in the relevant context folder.
5.  **Implement Changes:** Write clean, maintainable code following existing conventions and simplicity preferences.
6.  **Update Context:** Document changes, decisions, and approaches in the relevant context files.
7.  **Test Implementation:** Test the implementation and verify functionality works as expected.
8.  **Git Commit (MANDATORY):** Perform a **git commit** with a short, concise, straight-to-the-point commit message should be humanly like short commit. This step is **REQUIRED** before marking task complete.
9.  **Complete Task:** Mark the task as `completed` in `tasks.json`.
10. **Update Feature Status:** Update `features.json` if a feature milestone is reached.

-----

### 9\. Strict Prohibitions

Agents **MUST NEVER**:

  * Start coding without creating a task.
  * Mark a task as complete without doing a git commit first.
  * Mark a feature as complete without full verification.
  * Skip updating context documentation.
  * Skip git commit after code changes.
  * Make breaking changes without documenting them.
  * Ignore existing patterns or reinvent the wheel.
  * Create large, unsplit code files.

-----

### 10\. Priority Guidelines

Work should be prioritized in the following order:

1.  **Critical Bugs**
2.  **Blocked Tasks** (unblock other agents)
3.  **In-Progress Features** (complete ongoing work)
4.  **New Features**
5.  **Improvements** (optimize and refactor)

-----

**Principle:** Good agents maintain context, track progress, adhere to simplicity standards, and enable other agents to build on their work effectively.