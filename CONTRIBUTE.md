# Contributing to VenueShift

First off, thank you for considering contributing! Your help is appreciated.

## Code of Conduct

This project and everyone participating in it is governed by a Code of Conduct (link to be added or defined). By participating, you are expected to uphold this code. Please report unacceptable behavior.

## How Can I Contribute?

* **Reporting Bugs:** If you find a bug, please ensure the bug was not already reported by searching on GitHub under Issues. If you're unable to find an open issue addressing the problem, open a new one. Be sure to include a title and clear description, as much relevant information as possible, and a code sample or an executable test case demonstrating the expected behavior that is not occurring.
* **Suggesting Enhancements:** Open an issue with the label `enhancement`. Provide a clear description of the enhancement, why it's needed, and potential implementation ideas.
* **Pull Requests:**
    1.  Fork the repo and create your branch from `main`.
    2.  If you've added code that should be tested, add tests.
    3.  If you've changed APIs, update the documentation.
    4.  Ensure the test suite passes (`npm test` or relevant command).
    5.  Make sure your code lints (`npm run lint`).
    6.  Issue that pull request!

## Development Setup

Follow the instructions in `docs/SETUP_GUIDE.md` to get your development environment ready.

## Coding Standards

* **Style:** Follow standard TypeScript/JavaScript/React/Node.js conventions. Use Prettier (config included) and ESLint (config included) for formatting and linting.
* **Commits:** Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. This helps in automating changelogs and understanding project history. Example: `feat: Add venue creation endpoint` or `fix: Correct user profile update logic`.
* **Testing:** Add unit or integration tests for new features or bug fixes.

## Pull Request Process

1.  Ensure any install or build dependencies are removed before the end of the layer when doing a build.
2.  Update the README.md with details of changes to the interface, this includes new environment variables, exposed ports, useful file locations and container parameters.
3.  Increase the version numbers in any examples files and the README.md to the new version that this Pull Request would represent.
4.  You may merge the Pull Request in once you have the sign-off of two other developers, or if you do not have permission to do that, you may request the second reviewer to merge it for you.

Thank you for your contribution!
