---
name: iterative-planner
description: Transform PRDs or feature requests into actionable development plans with detailed user stories, acceptance criteria, technical tasks, and prioritized backlogs with clear dependencies. Use when users have a PRD and need to break it down into implementable work, when planning MVP or MVP+N iterations, when organizing features into sprints, or when asked to "plan the implementation", "create user stories", "break this down into tasks", "organize the backlog", or similar planning requests.
---

# Iterative Planning

Transform PRDs and feature requests into actionable development plans with user stories, acceptance criteria, technical tasks, and prioritized backlogs.

## Overview

This skill guides Claude through analyzing requirements and creating comprehensive, prioritized development plans that map features to user stories with clear dependencies and phased execution.

## Planning Process

### 1. Understand the Input

Identify what planning input is provided:

**Full PRD provided:**
- Proceed directly to analysis and planning
- Extract all features, requirements, and constraints

**Feature request or enhancement:**
- Ask clarifying questions about the feature scope
- Understand what already exists vs. what's new
- Identify integration points with existing system

**Partial information:**
- Ask targeted questions to fill gaps:
  - What's the scope of this iteration (MVP, MVP+1, etc.)?
  - What features are must-have vs. nice-to-have?
  - Are there technical constraints or dependencies?
  - What's the target timeline or team capacity?

### 2. Analyze and Structure

**Break down into epics:**
- Group related features into logical epics (5-8 epics is typical)
- Each epic should represent a cohesive functional area
- Examples: "User Authentication", "Dashboard & Analytics", "Data Management", "Payment Processing"

**Create user stories for each epic:**
- Write clear user stories following the format: "As a [user], I want to [action], so that [benefit]"
- Include 3-5 specific, testable acceptance criteria per story
- Break down into concrete technical tasks (3-8 tasks per story)
- Estimate effort (use story points, hours, or relative sizing like Small/Medium/Large)

**Quality standards for user stories:**
- Each story should be independently deliverable
- Stories should be small enough to complete in 1-5 days
- Technical tasks should be specific (not vague like "implement feature")
- Acceptance criteria must be testable/verifiable

### 3. Prioritize and Identify Dependencies

**Assign priorities:**
- **P0 (Critical):** Must have for launch, blocks other work
- **P1 (High):** Important for launch, significant user value
- **P2 (Medium):** Nice to have, can be deferred
- **P3 (Low):** Future enhancement

**Map dependencies:**
- Identify which stories must be completed before others can start
- Create a dependency graph showing relationships
- Highlight the critical path (longest chain of dependencies)
- Identify parallel work opportunities

**Consider technical constraints:**
- Infrastructure/setup tasks usually come first
- Authentication often blocks other features
- Data models should be established early
- UI work can often happen in parallel with backend

### 4. Organize into Development Phases

Create 2-4 development phases based on:
- Natural feature groupings
- Dependencies between stories
- Team capacity and timeline
- Risk management (tackle hard problems early)

Each phase should have:
- Clear goal/focus
- Specific stories included
- Concrete deliverables
- Estimated duration

### 5. Generate the Planning Document

Create a comprehensive planning document using the structure in `assets/planning-template.md`:

**Required sections:**
1. Planning Summary
2. Epics with User Stories (detailed)
3. Prioritized Backlog (table format with all stories)
4. Dependency Graph (visual representation)
5. Development Phases (timeline-based organization)
6. Technical Considerations
7. Risks & Mitigation
8. Future Iterations

**Save the document** in `/mnt/user-data/outputs/` with a descriptive filename like `[product-name]-development-plan.md`.

## User Story Writing Guidelines

### Structure
```
### User Story X.Y: [Concise, action-oriented title]

**As a** [specific user type]
**I want to** [specific capability or action]
**So that** [clear benefit or value]

**Acceptance Criteria:**
- [ ] [Specific, testable criterion using "should" or "must"]
- [ ] [Include both happy path and edge cases]
- [ ] [Define clear success state]

**Technical Tasks:**
1. [Specific implementation task with clear scope]
2. [Avoid vague tasks like "implement feature"]
3. [Include testing and documentation tasks]

**Estimate:** [Story points or time]
**Priority:** [P0/P1/P2/P3]
**Dependencies:** [Story IDs this depends on, or "None"]
```

### Good vs. Bad Examples

**Bad User Story:**
```
As a user, I want to use the app, so that I can do things.
```
*Problems: Too vague, not specific, no clear value*

**Good User Story:**
```
As an event manager, I want to customize the RSVP page theme with my brand colors and logo, so that the RSVP experience matches my event branding.
```
*Specific user, clear action, defined benefit*

**Bad Acceptance Criteria:**
```
- [ ] Theme works
- [ ] Colors can be changed
```
*Problems: Not testable, unclear success criteria*

**Good Acceptance Criteria:**
```
- [ ] User can select primary and secondary colors using a hex color picker
- [ ] User can upload a logo image (PNG/JPG, max 2MB)
- [ ] Changes preview in real-time without page refresh
- [ ] Custom theme persists after saving and page reload
- [ ] Logo displays at correct size (max 200px width) in header
```
*Specific, testable, covers main functionality and edge cases*

**Bad Technical Tasks:**
```
1. Build the theme system
2. Make it work
```
*Problems: Too vague, not actionable*

**Good Technical Tasks:**
```
1. Create ThemeCustomizer React component with color picker integration
2. Implement theme preview state management using React Context
3. Add logo upload endpoint with image validation and S3 storage
4. Create theme persistence API (POST /api/themes, GET /api/themes/:id)
5. Write unit tests for theme validation logic
6. Add E2E test for complete theme customization flow
```
*Specific, actionable, includes testing*

## Dependency Management

### Creating the Dependency Graph

Use ASCII art to visualize dependencies:

```
Story 1.1 (Auth System)
    ↓
Story 1.2 (User Profiles) ──────┐
    ↓                            │
Story 2.1 (Dashboard)            │
    ↓                            │
    ├─→ Story 2.2 (Analytics)    │
    └─→ Story 2.3 (Reports)      │
                                 │
Story 3.1 (Payments) ←───────────┘
```

### Identifying the Critical Path

List stories in sequence that form the longest dependency chain:
1. Story 1.1 → Story 1.2 → Story 2.1 → Story 2.2

This is the critical path - delays here impact the entire timeline.

### Parallel Work Opportunities

Identify stories that can be developed simultaneously:
- While Story 1.1 is being developed, Story 4.1 (static pages) can be built in parallel
- Stories 2.2 and 2.3 both depend on 2.1 but can be built in parallel after 2.1 completes

## Handling Different Planning Scenarios

### Scenario 1: New MVP from PRD
- Focus on P0 and P1 stories only
- Plan 2-3 development phases
- Keep MVP scope tight
- Clearly document MVP+1 candidates

### Scenario 2: MVP+N Enhancement
- Understand what's already built
- Focus on incremental value
- Consider integration with existing features
- Plan migration/upgrade paths if needed

### Scenario 3: Feature Request
- Understand where it fits in existing architecture
- Identify dependencies on existing code
- Consider impact on existing features
- Plan for backward compatibility if needed

### Scenario 4: Bug Fix or Technical Debt
- Create stories for fixes with clear repro steps
- Include root cause analysis in acceptance criteria
- Add regression test requirements
- Consider related issues that should be addressed together

## Example Usage Pattern

```
User: "Here's my RSVP app PRD. Create a development plan for the MVP."

Claude: [Reads PRD]

"I'll create a comprehensive development plan for your RSVP app MVP.

Based on the PRD, I'm organizing the work into 5 epics:
1. User Authentication & Management
2. Event Creation & Customization  
3. RSVP Collection & Management
4. Analytics Dashboard
5. QR Code Generation

For the MVP, I'm focusing on P0 and P1 stories. I see some key dependencies - authentication must be done first, followed by event creation, then RSVP functionality. The analytics dashboard can be built in parallel with RSVP management.

Let me create the detailed plan now..."

[Generates comprehensive planning document with all epics, user stories, acceptance criteria, technical tasks, prioritized backlog, dependency graph, and 3 development phases]

[Saves to /mnt/user-data/outputs/rsvp-app-development-plan.md]

"I've created a detailed development plan with 23 user stories organized into 5 epics.

[Download link]

The plan includes:
- 8 P0 stories (critical path, ~3 weeks)
- 10 P1 stories (high priority, ~2 weeks)  
- 5 P2 stories (nice-to-have, ~1 week)
- Clear dependency graph showing auth → events → RSVPs flow
- 3 development phases with specific goals
- Identified parallel work opportunities for frontend and backend teams

The critical path is: Auth setup → Event creation → RSVP form → Dashboard. I recommend starting with Phase 1 (Foundation) which includes authentication and basic event creation."
```

## Assets

- `planning-template.md` - Complete development plan template with all sections and structure
