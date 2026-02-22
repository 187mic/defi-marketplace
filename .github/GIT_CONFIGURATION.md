# Git Configuration Guide

## Setting Up Your Git Identity

Before contributing to this repository, ensure your git identity is properly configured.

### Quick Setup

```bash
# Set your name (use your real name or GitHub username)
git config --global user.name "Your Name"

# Set your email (use your GitHub no-reply email or public email)
git config --global user.email "your-email@example.com"
```

### Using GitHub No-Reply Email

To keep your personal email private, use GitHub's no-reply email:

```bash
# Format: USERNAME@users.noreply.github.com
# Or with ID: ID+USERNAME@users.noreply.github.com

git config --global user.email "187mic@users.noreply.github.com"
```

Find your GitHub no-reply email at: https://github.com/settings/emails

### Per-Repository Configuration

If you need different identities for different projects:

```bash
cd /path/to/defi-marketplace
git config user.name "Your Name"
git config user.email "your-email@example.com"
```

### Verify Your Configuration

```bash
# Check current settings
git config user.name
git config user.email

# See all user settings
git config --list | grep user
```

## Why This Matters

- **Privacy**: Local email addresses (e.g., `user@MacBook-Pro.local`) expose your computer name and username
- **Professionalism**: Public commits should use your professional identity
- **Security**: Avoid exposing personal information in public repositories

## Fixing Existing Commits

If you've already made commits with the wrong identity on your local branch (not yet pushed):

```bash
# Amend the last commit
git commit --amend --author="Your Name <your-email@example.com>"

# For multiple commits, use interactive rebase
git rebase -i HEAD~N --exec 'git commit --amend --no-edit --reset-author'
```

**⚠️ Warning**: Only do this on unpushed commits. Rewriting history on pushed commits requires force push and affects all collaborators.

## Best Practices

1. ✅ Configure git identity **before** making any commits
2. ✅ Use your **GitHub email** or **no-reply email**
3. ✅ Verify settings with `git config --list`
4. ✅ Check commit author with `git log` before pushing
5. ✅ Use **meaningful commit messages** that describe the changes

## Additional Security

### Enable Commit Signing (Optional but Recommended)

```bash
# Generate GPG key (if you don't have one)
gpg --full-generate-key

# List GPG keys
gpg --list-secret-keys --keyid-format=long

# Configure git to use GPG
git config --global user.signingkey YOUR_KEY_ID
git config --global commit.gpgsign true

# Add GPG key to GitHub
gpg --armor --export YOUR_KEY_ID
# Then paste at: https://github.com/settings/keys
```

### Set Default Branch Name

```bash
git config --global init.defaultBranch main
```

## Resources

- [GitHub: Setting your commit email](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-personal-account-on-github/managing-email-preferences/setting-your-commit-email-address)
- [GitHub: About commit email addresses](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-personal-account-on-github/managing-email-preferences/about-commit-email-addresses)
- [Git Configuration Documentation](https://git-scm.com/book/en/v2/Customizing-Git-Git-Configuration)
