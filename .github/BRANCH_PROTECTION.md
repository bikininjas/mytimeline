# Branch Protection Configuration

To make the security workflow a required check for merging pull requests, you need to configure branch protection rules in your GitHub repository.

## Steps to Configure Branch Protection:

1. **Go to Repository Settings**
   - Navigate to your GitHub repository
   - Click on "Settings" tab
   - Click on "Branches" in the left sidebar

2. **Add Branch Protection Rule**
   - Click "Add rule" or edit existing rule for `main`/`master` branch
   - Branch name pattern: `main` (or `master` depending on your default branch)

3. **Configure Required Status Checks**
   - ✅ Check "Require status checks to pass before merging"
   - ✅ Check "Require branches to be up to date before merging"
   - Add the following required status checks:
     - `🔒 Dependency Scan`
     - `🔍 CodeQL Analysis`
     - `🐳 Docker Security Scan`
     - `🔐 Secrets Scan`
     - `📋 Security Gate`

4. **Additional Recommended Settings**
   - ✅ "Require a pull request before merging"
   - ✅ "Dismiss stale PR approvals when new commits are pushed"
   - ✅ "Require conversation resolution before merging"
   - ✅ "Do not allow bypassing the above settings"

## Required Status Checks Names:

When adding status checks, use these exact names as they appear in the workflow:

```
🔒 Dependency Scan
🔍 CodeQL Analysis  
🐳 Docker Security Scan
🔐 Secrets Scan
📋 Security Gate
```

## What This Accomplishes:

- **Security Enforcement**: No pull request can be merged until all security scans pass
- **Automated Gate**: The `📋 Security Gate` job will fail if any security scan finds critical issues
- **Clear Feedback**: Developers get immediate feedback on security issues in their PRs
- **Compliance**: Ensures all code meets security standards before reaching the main branch

## Manual Override:

Repository administrators can still merge in emergency situations by temporarily disabling branch protection, but this should be avoided and any bypassed security issues should be addressed immediately after merge.
