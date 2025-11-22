---
name: prd-generator
description: Transform rough product ideas into comprehensive Product Requirements Documents (PRDs). Use when users present initial product concepts, app ideas, or feature requests that need to be formalized into structured PRDs with problem statements, detailed feature specifications, technical requirements with folder structure, UI/UX requirements, and top-level architecture. Trigger phrases include "turn this idea into a PRD", "create a PRD for", "help me spec out", "document requirements for", or when users describe a product concept and need formal documentation.
---

# PRD Generator

Transform rough product ideas into comprehensive, actionable Product Requirements Documents.

## Overview

This skill guides Claude through a structured conversation to gather information about a product idea, then generates a detailed PRD with problem statement, feature specifications, technical requirements, UI/UX requirements, and architecture.

## PRD Generation Process

Follow this workflow to create high-quality PRDs:

### 1. Gather Information Through Focused Questions

Ask questions **one at a time** to avoid overwhelming the user. Progress through these areas:

**Initial Understanding:**
- What is the core product idea? (Get a 2-3 sentence description)
- Who are the target users?
- What problem does this solve for them?

**Feature Exploration:**
- What are the must-have features for the first version?
- For each key feature, ask: What specific capabilities should this include?
- Are there any secondary features for future phases?

**Technical Context:**
- What platform(s)? (Web app, mobile app, both, other)
- Any specific technology preferences or constraints?
- What type of data will be stored and managed?

**UI/UX Considerations:**
- What's the desired look and feel? (modern, minimal, playful, professional, etc.)
- Are there any specific design inspirations or examples?
- What are the critical user flows?

**Additional Context:**
- Are there any third-party integrations needed?
- What are the success metrics?
- Any timeline or milestone expectations?

**Style:** Keep questions conversational and natural. Build on previous answers rather than asking all questions mechanically.

### 2. Generate the PRD Document

Once sufficient information is gathered, create a comprehensive PRD using the template structure in `assets/prd-template.md`.

**Critical requirements:**
- Use the exact template structure from `assets/prd-template.md`
- Fill in ALL sections with specific, actionable content
- Make feature specifications **detailed** with clear acceptance criteria
- Include realistic folder structure for the chosen tech stack
- Provide specific data models with field types
- List concrete API endpoints
- Create a visual architecture diagram using ASCII art
- Define complete design system (colors, typography, spacing)

### 3. Save the PRD

Create the PRD as a `.md` file in `/mnt/user-data/outputs/` with a descriptive filename like `[product-name]-prd.md`.

After generating, provide the download link and a brief summary.

## Template Structure Reference

The PRD should include these sections in order:

1. **Problem Statement** - Context, problem, target users, pain points
2. **Feature Specifications** - Core features with detailed requirements, user stories, UI/UX considerations
3. **Technical Requirements** - Tech stack, folder structure, data models, API endpoints, performance, security
4. **UI/UX Requirements** - Design system, key user flows, responsive design, accessibility
5. **Architecture** - High-level architecture diagram, component architecture, integrations, scalability
6. **Success Metrics** - Measurable targets
7. **Timeline & Milestones** - Phased approach (MVP, MVP+1, future)
8. **Open Questions & Risks** - Unresolved questions and risk mitigation
9. **Appendix** - Assumptions and references

## Quality Standards

**Feature Specifications must be detailed:**
- ❌ Bad: "Custom theme support for RSVP pages"
- ❌ Medium: "Users can customize colors, fonts, and layout of RSVP pages"
- ✅ Good: "Theme customization includes: primary/secondary colors (hex picker), 3 font choices (serif/sans-serif/display), 5 layout templates (classic/modern/minimal/elegant/playful), real-time preview pane showing changes, save/load theme presets"

**Technical requirements must be specific:**
- Include actual framework/library names (not generic "frontend framework")
- Provide realistic folder structures for the chosen stack
- Define data models with field names and types
- List concrete API endpoints with HTTP methods
- Specify performance targets with numbers

**Architecture must be visual:**
- Include ASCII diagram showing system components and data flow
- Explain relationships between components
- Identify third-party services and integrations

## Example Usage Pattern

```
User: "I want to build an RSVP app for event managers"

Claude: "Great idea! Let me help you create a comprehensive PRD. 

First, tell me more about the core problem - what specific pain points do event managers face with current RSVP solutions?"

User: [Provides context]

Claude: "Thanks! Now, what are the must-have features for the first version?"

User: [Lists features]

Claude: "For the custom theme feature you mentioned - what specific customization options should event managers have?"

[Continue asking focused questions one at a time...]

[Once sufficient info gathered]

Claude: [Generates comprehensive PRD using template structure]

[Saves to /mnt/user-data/outputs/rsvp-app-prd.md]

"I've created a comprehensive PRD for your RSVP app. [Download link]

The PRD includes detailed specifications for all 5 core features, a complete tech stack recommendation using React/Node.js, data models for events/RSVPs/guests, and a scalable architecture with QR code generation and analytics dashboard."
```

## Assets

- `prd-template.md` - Complete PRD template with all sections and structure
