# WORKFLOW INSTRUCTIONS - How to Use the Claude App Development Workflow

## Overview
This project is now set up with the optimized Claude App Development Workflow. This workflow uses specialized Claude agents to handle different aspects of development efficiently.

## Quick Start - Your First Session

### Step 1: Create the Planning Agent
Start a new Claude conversation and use this prompt:

```
You are the Planning Agent for the SipSchool wine learning platform project.

Your responsibilities:
1. Read and understand all project documentation in the project folder
2. Help me prioritize features and plan implementation
3. Create clear, actionable tasks for the Development Agent
4. Validate that requirements are met

Please start by reading these files:
- USER_REQUIREMENTS.md - What we're building
- PROJECT_STATUS.md - Current state
- SPRINT_PLAN.md - Next features to implement
- VALIDATION_CHECKPOINT.md - Questions and priorities

Then help me decide what to work on next.
```

### Step 2: Get Your Development Plan
The Planning Agent will:
1. Review all documentation
2. Understand the current state
3. Suggest what to work on
4. Create a clear plan

### Step 3: Create the Development Agent
Once you have a plan, start a new Claude conversation with:

```
You are the Development Agent for the SipSchool wine learning platform.

Project location: /Users/samuelchronert/Documents/Coding Projects/Sip_School

Please read CONTINUE_DEVELOPMENT.md first to understand the current state.

Today I want to work on: [INSERT TASK FROM PLANNING AGENT]

Please:
1. Read the relevant code files
2. Implement the feature
3. Test it works correctly
4. Update documentation as needed
```

## Workflow Benefits

### 1. Planning Agent
- Maintains big picture view
- Ensures requirements are met
- Creates clear specifications
- Handles architecture decisions

### 2. Development Agent
- Focused on implementation
- Writes and tests code
- Handles technical details
- Updates documentation

### 3. Review Process
After development, return to Planning Agent to:
- Validate implementation
- Update progress tracking
- Plan next steps
- Ensure quality

## Key Files for Each Agent

### Planning Agent Should Read:
- `USER_REQUIREMENTS.md` - Overall vision
- `PROJECT_STATUS.md` - Current state
- `SPRINT_PLAN.md` - Planned features
- `VALIDATION_CHECKPOINT.md` - Open questions
- `DEVELOPMENT_LOG.md` - History

### Development Agent Should Read:
- `CONTINUE_DEVELOPMENT.md` - Quick start
- `SPRINT_PLAN.md` - Technical details
- Source code files as needed
- `package.json` files - Dependencies

## Example Workflow Session

### 1. Planning Session
```
You: "I want to add Claude API integration for dynamic questions"

Planning Agent: "I've reviewed the documentation. Based on SPRINT_PLAN.md, 
this is your top priority. Here's what needs to be done:
1. Create /server/services/claudeService.js
2. Add secure API key management
3. Design question generation prompts
4. Implement caching
Let me create a detailed specification..."
```

### 2. Development Session
```
You: "Implement the Claude API service module as specified"

Development Agent: "I'll implement the Claude API service. Let me first 
read the current code structure and then create the service module..."
[Creates code and tests]
```

### 3. Review Session
```
You: "The Claude API integration is complete"

Planning Agent: "Let me review what was implemented and update our 
documentation. I'll also plan the next steps for testing the integration..."
```

## Best Practices

### 1. Keep Agents Focused
- Don't mix planning and coding in one session
- Let each agent maintain their context
- Switch agents for different concerns

### 2. Document Everything
- Planning Agent updates requirements and status
- Development Agent updates technical docs
- Both maintain clear handoff notes

### 3. Regular Checkpoints
- After each feature, return to Planning Agent
- Validate implementation meets requirements
- Update all tracking documents
- Plan next iteration

### 4. Use the Right Agent
- **Planning Agent**: Architecture, requirements, priorities
- **Development Agent**: Coding, debugging, testing
- **Planning Agent**: Code review, validation, next steps

## Getting Started Checklist

- [ ] Read this WORKFLOW_INSTRUCTIONS.md
- [ ] Create Planning Agent with provided prompt
- [ ] Review project state with Planning Agent
- [ ] Get development plan for next feature
- [ ] Create Development Agent with specific task
- [ ] Implement feature with Development Agent
- [ ] Return to Planning Agent for validation
- [ ] Update documentation and plan next steps

## Tips for Success

1. **Be Specific**: Give agents clear, specific tasks
2. **Trust the Process**: Let agents handle their domains
3. **Maintain Context**: Keep conversations focused
4. **Document Progress**: Update status after each session
5. **Iterate Quickly**: Small, focused development cycles

Ready to revolutionize your development workflow? Start with the Planning Agent!