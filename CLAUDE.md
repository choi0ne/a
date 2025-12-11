# CLAUDE.md - AI Assistant Guide

This document provides comprehensive guidance for AI assistants working with this repository.

## Repository Overview

**Repository Name:** a
**Type:** General purpose repository
**Status:** Early stage / Minimal setup
**Last Updated:** 2025-11-29

### Current State

This is a minimal repository currently containing:
- `README.md` - Basic repository description
- `.git/` - Git version control
- This documentation file

## Codebase Structure

```
a/
├── .git/                 # Git version control
├── README.md             # Repository introduction
└── CLAUDE.md             # AI assistant guide (this file)
```

### Expected Future Structure

As this project develops, expect the following structure to emerge:

```
a/
├── src/                  # Source code
├── tests/                # Test files
├── docs/                 # Documentation
├── .github/              # GitHub workflows and templates
├── config/               # Configuration files
├── scripts/              # Build and utility scripts
├── README.md             # Project overview
├── CLAUDE.md             # AI assistant guide
├── package.json          # Dependencies (if Node.js project)
├── requirements.txt      # Dependencies (if Python project)
└── .gitignore            # Git ignore rules
```

## Development Workflows

### Git Workflow

**Current Branch:** `claude/claude-md-mijuzd5dqv0q7jvd-01VzNdXXVFtPdrjEperCGmRp`

#### Branch Naming Convention
- Feature branches: `feature/<descriptive-name>`
- Bug fixes: `fix/<issue-description>`
- Claude AI branches: `claude/<session-id>`

#### Commit Guidelines
- Use clear, descriptive commit messages
- Follow conventional commits format when possible:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation changes
  - `refactor:` for code refactoring
  - `test:` for test additions/changes
  - `chore:` for maintenance tasks

#### Push Strategy
- Always push to the designated branch
- Use `git push -u origin <branch-name>` for first push
- Retry network failures up to 4 times with exponential backoff

### Code Quality Standards

#### General Principles
1. **Simplicity First**: Avoid over-engineering
2. **Minimal Changes**: Only modify what's necessary
3. **Security Aware**: Prevent common vulnerabilities (XSS, SQL injection, command injection)
4. **No Premature Optimization**: Don't add complexity for hypothetical futures
5. **Delete Unused Code**: Remove rather than comment out

#### What to Avoid
- Adding features beyond what's requested
- Unnecessary refactoring of surrounding code
- Adding docstrings/comments to unchanged code
- Creating abstractions for one-time operations
- Backwards-compatibility hacks for unused code
- Error handling for impossible scenarios

### Testing Strategy

As the project grows, implement:
- Unit tests for core functionality
- Integration tests for system components
- End-to-end tests for critical user flows
- Run tests before committing changes

## Key Conventions

### File Organization
- Keep related files together
- Use clear, descriptive file names
- Maintain consistent naming patterns across the codebase

### Code Style
- Follow language-specific style guides
- Maintain consistency with existing code
- Use meaningful variable and function names
- Keep functions small and focused

### Documentation
- Update README.md for user-facing changes
- Update CLAUDE.md for structural/workflow changes
- Document complex logic with inline comments
- Keep documentation in sync with code

## AI Assistant Best Practices

### Before Making Changes
1. **Read First**: Always read existing files before modifying
2. **Understand Context**: Review related code to understand patterns
3. **Check Dependencies**: Identify what might break
4. **Plan Complex Tasks**: Use TodoWrite for multi-step changes

### During Development
1. **Track Progress**: Use TodoWrite for tasks with 3+ steps
2. **Test Changes**: Verify modifications work as expected
3. **Handle Errors**: Fix issues immediately when discovered
4. **Stay Focused**: Complete one task before starting another

### After Changes
1. **Verify**: Ensure all changes work correctly
2. **Clean Up**: Remove debug code and temporary files
3. **Commit**: Create meaningful commit messages
4. **Document**: Update relevant documentation

### Tool Usage Preferences
- Use specialized tools (Read, Edit, Write) over bash commands
- Use Task tool for complex multi-step operations
- Use Grep/Glob for code search, not bash find/grep
- Parallelize independent operations

## Common Tasks

### Adding New Features
1. Understand the request and existing codebase
2. Plan the implementation (use TodoWrite if complex)
3. Read relevant existing files
4. Implement changes incrementally
5. Test the changes
6. Commit with descriptive message
7. Push to the designated branch

### Fixing Bugs
1. Reproduce and understand the issue
2. Locate the problematic code
3. Implement the fix
4. Verify the fix resolves the issue
5. Check for similar issues elsewhere
6. Commit and push

### Refactoring
1. Identify the specific need (performance, clarity, maintainability)
2. Ensure tests exist or create them first
3. Make incremental changes
4. Verify tests pass after each change
5. Commit logical chunks separately

### Documentation Updates
1. Identify what changed
2. Update affected documentation files
3. Ensure accuracy and clarity
4. Check for broken links or references
5. Commit documentation separately from code changes

## Security Guidelines

### Always Check For
- Command injection vulnerabilities
- Cross-site scripting (XSS)
- SQL injection
- Path traversal attacks
- Insecure deserialization
- Exposure of sensitive data

### Best Practices
- Validate all external input
- Use parameterized queries
- Sanitize user-provided data
- Don't store secrets in code
- Use secure dependencies
- Keep dependencies updated

## Project-Specific Notes

### Technology Stack
**To be determined** - Document here as the project evolves:
- Programming language(s):
- Framework(s):
- Database(s):
- Build tools:
- Testing framework(s):

### Key Dependencies
Document major dependencies here as they're added.

### Environment Setup
Document setup steps here as the project develops:
1. Clone the repository
2. Install dependencies
3. Configure environment variables
4. Run initial setup scripts
5. Verify installation

### Common Issues and Solutions
Document frequent issues and their resolutions here.

## Resources

### Internal Documentation
- README.md - Project overview
- (Add other docs as they're created)

### External Resources
- Git documentation: https://git-scm.com/doc
- GitHub guides: https://guides.github.com/

## Changelog

### 2025-11-29
- Initial CLAUDE.md creation
- Documented repository structure
- Established development workflows
- Defined AI assistant best practices

---

**Note to AI Assistants:** This document should be updated whenever:
- Project structure changes significantly
- New conventions are established
- Development workflows are modified
- Important architectural decisions are made
- New tools or frameworks are adopted

Keep this document concise, accurate, and focused on information that helps AI assistants work effectively with the codebase.
