# Software Construction and Evolution (CS – 8317)
## Project Report: Version Control & Configuration Management using Git, GitHub, and Netlify
**Group:** Group 4 (Gp-4)  
**System:** Analyze Food (FoodScan AI)  
**Type:** Version Control & Configuration Management  
**Tools:** Git, GitHub, Netlify CI/CD, Vite, Express, Google Gemini AI, Supabase  

---

# Abstract

This report documents the practical application of **Software Configuration Management (SCM)** and **Version Control Management** within the academic curriculum of **Software Construction and Evolution (CS-8317)**. The central objective of this study is to demonstrate how modern software evolves systematically through formal version control policies, distributed repositories, automated system building, change management, and continuous release pipelines.

As an empirical case study, we developed and evolved **Analyze Food (FoodScan AI)**—an intelligent full-stack nutrition and calorie tracking Progressive Web Application (PWA) powered by Google Gemini Vision AI and Supabase. The project begins with **Version 1.0** (initial core baseline containing image capture, AI food recognition, and caloric estimation) and evolves to **Version 1.1** (incorporating 7-day caloric analytics, mobile camera optimization, and automated Netlify CI/CD system building). 

Development was governed using **Git** as a Distributed Version Control System (DVCS) and **GitHub** for remote repository hosting, peer review, secret scanning protection, and pull request integration. Furthermore, **Netlify** was integrated to automate system building, environment management, and continuous deployment directly from Git codelines. The report explores core SCM principles—codelines, baselines, deltas, atomic commits, branch isolation, version tagging, automated build pipelines, and rollback mechanisms—proving how modern tooling ensures software stability, traceability, and controlled evolution throughout the software lifecycle.

---

# Contents

1. **INTRODUCTION**
   - 1.1 Project Overview
   - 1.2 Objectives and Purpose
2. **VERSION CONTROL & CONFIGURATION MANAGEMENT**
   - 2.1 Definition and Importance in Software Engineering
   - 2.2 SCM Core Activities (Sommerville Model)
   - 2.3 Types of Version Control Systems (LVCS, CVCS, DVCS)
   - 2.4 Role of Version Control in Software Evolution
3. **ABOUT GIT**
   - 3.1 Introduction to Git
   - 3.2 Git Architecture & Data Flow
   - 3.3 Key Features & Storage Mechanism (Deltas vs. Snapshots)
   - 3.4 Git Workflow
4. **ABOUT GITHUB & NETLIFY**
   - 4.1 Introduction to GitHub
   - 4.2 Collaboration & Pull Request Workflows
   - 4.3 Automated System Building & CI/CD with Netlify
   - 4.4 Security & Secret Push Protection
5. **IMPLEMENTATION (PROJECT DEVELOPMENT & EVOLUTION PROCESS)**
   - 5.1 Initial Project Setup (Version 1.0 – FoodScan Core Baseline)
   - 5.2 Feature Development using Branching (Version 1.1 Evolution)
   - 5.3 Pull Request, Code Review, and Merge Process
   - 5.4 Automated System Building Configuration (`netlify.toml`)
   - 5.5 Version Tagging (`v1.0` and `v1.1` Milestones)
   - 5.6 Rollback and Recovery Mechanisms (Git & Netlify)
6. **CONCLUSION**
7. **APPENDIX**
   - Appendix A: Key Terminal Commands & Output Log
   - Appendix B: Configuration Manifests (`netlify.toml`, `vite.config.js`)
   - Appendix C: References

---

# 1. Introduction

### 1.1 Project Overview
In modern software engineering, software systems are dynamic entities that undergo continuous change. As user requirements expand, bugs are identified, and platform environments evolve, software cannot remain static. However, unmanaged changes lead to critical failures—such as lost source files, overwritten features, undocumented regressions, and broken production releases.

This project focuses on the practical implementation of **Version Control Management** and **Configuration Management** within the course **Software Construction and Evolution**. Rather than simply developing an isolated web application, the primary focus is to examine and demonstrate how software is constructed, tracked, stabilized, and evolved across distinct releases using industrial-grade tooling: **Git**, **GitHub**, and **Netlify**.

The system developed for this study is **Analyze Food (FoodScan AI)**, a full-stack AI-driven nutrition tracking Progressive Web App (PWA). The system allows users to capture or upload food photos, estimates portion volume and macronutrients (calories, carbohydrates, proteins, and fats) using Google Gemini Vision AI, logs meals to a cloud database (Supabase), and provides analytical charts tracking 7-day caloric trends. By implementing this system across iterative versions (**Version 1.0** to **Version 1.1**), we showcase the complete lifecycle of software construction, continuous integration, and versioned evolution.

### 1.2 Objectives and Purpose
The main objectives of this project are:
1. **Understand SCM Foundations**: Apply the theoretical principles of Software Configuration Management formulated by Ian Sommerville (Version Control, System Building, Change Management, and Release Management).
2. **Implement Distributed Version Control**: Utilize Git to establish private workspaces, manage staging areas, record immutable commit snapshots, and structure codelines.
3. **Simulate Professional Collaboration**: Employ GitHub as a remote master repository to enforce feature-branching workflows, pull request code reviews, and push-protection security rules.
4. **Automate System Building & Continuous Deployment**: Integrate Netlify with GitHub to automate compilation, dependency resolution, asset bundling, and atomic deployments upon git synchronization.
5. **Demonstrate Controlled Software Evolution**: Guide the project through two formal baselines—initial launch (**v1.0**) and feature enhancement (**v1.1**)—proving how branching, tagging, and rollbacks preserve system integrity during change.

---

# 2. Version Control & Configuration Management

### 2.1 Definition and Importance in Software Engineering
**Configuration Management (CM)** is the discipline of applying policies, procedures, and tools to manage and control changing software systems throughout their entire lifecycle. 

In real-world software construction:
- Multiple developers work on the same code components simultaneously.
- Several versions of a system (development, staging, production) coexist.
- Bugs must be repaired in older releases without disrupting ongoing feature development.

Without formal configuration management, teams suffer from what software engineers term the *"Shared Data Problem"* and *"Multiple Update Problem"*, where developers overwrite each other's code, release the wrong version to end-users, or lose the ability to reproduce a previous build.

### 2.2 SCM Core Activities (Sommerville Model)
According to Ian Sommerville (*Software Engineering*, 10th Edition), Configuration Management comprises four interconnected activities:

```
                  ┌──────────────────────┐
                  │   Change Proposals   │
                  └──────────┬───────────┘
                             │
                             ▼
     ┌──────────────┐   ┌─────────┐   ┌─────────────────┐
     │System Build  ├───► Change  ├───► System Releases  │
     │              │   │Management│  │                 │
     └──────┬───────┘   └─────────┘   └────────┬────────┘
            │                                  │
            ▼                                  ▼
     ┌──────────────┐                 ┌─────────────────┐
     │  Component   │                 │     Release     │
     │   Versions   │◄────────────────┤   Management    │
     └──────┬───────┘                 └─────────────────┘
            │
            ▼
     ┌──────────────┐
     │   Version    │
     │  Management  │
     └──────────────┘
```

1. **Version Management**: Keeping track of multiple versions of system components and ensuring that changes made by different developers do not interfere.
2. **System Building**: The process of assembling source code, external libraries, data files, and configuration descriptors, then compiling and linking them to create a fully executable system.
3. **Change Management**: Investigating the cost and impact of requested changes, deciding if and when they should be implemented, and tracking which components are modified.
4. **Release Management**: Preparing software for external release to users, tracking release identifiers (e.g. `v1.0`, `v1.1`), and providing documentation and installation configurations.

### 2.3 Types of Version Control Systems
Version control systems have evolved through three distinct generations:

| Type | Architecture | Advantages | Disadvantages | Representative Tools |
| :--- | :--- | :--- | :--- | :--- |
| **Local VCS (LVCS)** | Single local database storing file revision deltas on one disk. | Simple, requires no network connection. | No team collaboration; single point of disk failure destroys entire history. | RCS (Revision Control System), SCCS |
| **Centralized VCS (CVCS)** | Single central server hosting the repository; clients check out working files. | Centralized management; easy access control. | Single point of server failure; network dependency for all operations; slow branching/merging. | Subversion (SVN), CVS, Perforce |
| **Distributed VCS (DVCS)** | Every developer clones the entire repository including the full history. | Fully offline capability; extremely fast local operations; redundant backups on every machine; advanced branching/merging. | Steeper initial learning curve; initial clone of huge repos can take longer. | **Git**, Mercurial |

### 2.4 Role of Version Control in Software Evolution
Software evolution represents the continuous modification, adaptation, and enhancement of a system after its initial operational baseline. Version control provides the foundational scaffolding for evolution:
- **Codelines**: Sequences of source code versions derived chronologically from earlier versions.
- **Baselines**: Formally reviewed and agreed-upon specifications of component versions, libraries, and configuration files that define a stable system state (e.g. `Release 1.0`).
- **Traceability**: Every line of code can be traced back to an author, commit message, timestamp, and justification.
- **Controlled Concurrency**: Feature branches decouple experimental work from the production mainline.

---

# 3. About Git

### 3.1 Introduction to Git
Created in 2005 by Linus Torvalds to maintain the Linux kernel, **Git** is an open-source Distributed Version Control System designed for speed, cryptographic data integrity, and non-linear development. Unlike older systems that store file differences (deltas), Git conceives of its data as a series of **snapshots** of a miniature filesystem.

### 3.2 Git Architecture & Data Flow
Git structures operations across three distinct local zones and one remote zone:

```
 +------------------+        git add        +------------------+
 | Working Tree     | --------------------> | Staging Area     |
 | (Local Files)    |                       | (Index)          |
 +------------------+                       +------------------+
          ▲                                           │
          │ git checkout / restore                    │ git commit
          │                                           ▼
 +------------------+        git push       +------------------+
 | Remote Repo      | <-------------------- | Local Repository |
 | (GitHub)         | --------------------> | (.git Directory) |
 +------------------+        git pull       +------------------+
```

1. **Working Tree**: The sandbox directory containing actual project files where the developer writes code, edits styles, or adds components.
2. **Staging Area (Index)**: A crucial intermediate layer that formats and stages exact modifications to be bundled into the next commit, giving the developer fine-grained control over commits.
3. **Local Repository (`.git`)**: The hidden database containing all commit objects, tree references, blob contents, and branch pointers.
4. **Remote Repository (GitHub)**: The shared cloud-hosted version of the repository used for synchronization and collaboration.

### 3.3 Key Features & Storage Mechanism
- **Cryptographic Integrity**: Git validates every commit, tree, and blob using SHA-1/SHA-256 cryptographic hashes. History cannot be altered or corrupted without altering all downstream hashes.
- **Lightweight Branching**: Branches in Git are simply 41-byte files containing the commit hash they point to. Creating, switching, and deleting branches executes in constant time ($O(1)$).
- **Packfiles & Deltas**: When compressing history, Git uses packfiles to store backward deltas between similar objects, drastically minimizing disk footprint while preserving snapshot retrieval speeds.

### 3.4 Git Workflow
The standardized workflow practiced in this project follows standard software engineering convention:
1. Initialize repository (`git init`).
2. Make component modifications in the working tree.
3. Review changes with `git status` and `git diff`.
4. Stage verified files using `git add <files>`.
5. Record an atomic snapshot with `git commit -m "Semantic message"`.
6. Push branches to the remote upstream with `git push origin <branch>`.

---

# 4. About GitHub & Netlify

### 4.1 Introduction to GitHub
**GitHub** is a cloud-based collaboration platform built on top of Git. It provides a centralized remote hub that integrates project tracking, peer code review, continuous integration workflows, and repository access control.

### 4.2 Collaboration & Pull Request Workflows
In modern agile development, developers rarely commit directly to the `main` production branch. Instead, teams use the **GitHub Flow**:
1. A descriptive branch is spawned off `main` (e.g. `feature/7-day-trend`).
2. Code is committed locally and pushed to GitHub.
3. A **Pull Request (PR)** is opened, allowing team members to review line-by-line diffs, discuss architectural decisions, and verify automated build checks.
4. Once approved, the branch is merged into `main`.

### 4.3 Automated System Building & CI/CD with Netlify
System building involves compiling high-level JSX and TypeScript modules, resolving npm package trees, bundling optimized minified assets, and deploying executables to an edge delivery network. 

**Netlify** provides an automated Continuous Integration and Continuous Deployment (CI/CD) platform:
- **Webhook Integration**: Netlify listens to GitHub repository push events.
- **Isolated Build Environment**: Launches a container, executes `npm run build`, and verifies zero syntax/lint errors.
- **Publish Directory Distribution**: Distributes compiled static bundles (`dist/`) across a global CDN.
- **Atomic Deploys**: Deployments occur instantaneously without downtime; if a build fails, the previous working release remains live.

```
 [Developer] ──── git push ────► [GitHub Repository]
                                        │
                                  Webhook Event
                                        ▼
                            [Netlify CI/CD Pipeline]
                                ├─ npm install
                                ├─ vite build (Rollup)
                                └─ Atomic Edge Deploy
                                        │
                                        ▼
                           [Live Production Website]
```

### 4.4 Security & Secret Push Protection
A critical aspect of configuration management is **Secret Management**. Developers must ensure that API credentials (e.g., Google Cloud API keys, database secret keys) never leak into version control history. GitHub provides **Push Protection**, an automated scanner that inspects outgoing commits for high-entropy secrets and blocks compromised commits at the remote gate before they enter the repository.

---

# 5. Implementation (Project Development & Evolution Process)

### 5.1 Initial Project Setup (Version 1.0 – FoodScan Core Baseline)
The project began by establishing the baseline architecture of **Analyze Food**:
- **Frontend**: React 19, Vite, Lucide React icons, and WebCam capture components.
- **Backend**: Express.js REST API gateway mounted with `@google/generative-ai` to communicate with Google Gemini Vision.
- **Database/Auth**: Supabase PostgreSQL and Authentication client.

#### Step 1: Initialize Git Repository and Configure Exclusion
To prevent committing dependencies and environment secrets, `.gitignore` was configured:
```bash
# Initialize local Git repository
git init

# Configure .gitignore to exclude build artifacts and secrets
node_modules/
.env
.env.local
dist/
```

#### Step 2: Stage and Commit Version 1.0
```bash
git add .
git commit -m "feat: initial food scanner application baseline v1.0"
```

#### Step 3: Link Remote GitHub Repository & Push Mainline
```bash
git remote add origin https://github.com/Khant919/analyze-food.git
git branch -M main
git push -u origin main
```

#### Step 4: Tag Stable Initial Release
```bash
git tag -a v1.0 -m "Release Version 1.0: Core AI Food Scanner Baseline"
git push origin v1.0
```

---

### 5.2 Feature Development using Branching (Version 1.1 Evolution)
To demonstrate controlled software evolution without destabilizing the working `main` branch, a new feature branch was created to introduce **7-Day Caloric Trend Analytics** and **Mobile Camera PWA Optimization**.

#### Step 1: Branch Creation
```bash
git checkout -b feature/7-day-trend-analytics
```

#### Step 2: Implement Evolutionary Changes
1. **Component Addition**: Developed `WeeklyChart.jsx` featuring dynamic bar heights, target guide lines (2000 kcal), and interactive day breakdowns.
2. **Mobile UX Enhancement**: Updated `CameraCapture.jsx` to support direct native phone camera triggers (`capture="environment"`) and client-side canvas downscaling (max 1280px).
3. **Database Client Evolution**: Updated `supabaseClient.js` to fetch a 14-day history window and implemented `parseMealDate()` to prevent timezone UTC date shifts.

#### Step 3: Commit Feature Components
```bash
git add frontend/src/components/WeeklyChart.jsx frontend/src/services/supabaseClient.js
git commit -m "feat(analytics): add 7-day caloric trend and robust timezone date parsing"

git add frontend/src/components/CameraCapture.jsx frontend/src/App.css
git commit -m "feat(mobile): add direct mobile camera capture and canvas image compression"
```

#### Step 4: Push Feature Branch to GitHub
```bash
git push -u origin feature/7-day-trend-analytics
```

---

### 5.3 Pull Request, Code Review, and Merge Process
1. On GitHub, navigated to **Pull Requests** &rarr; opened **PR #1**: `Merge feature/7-day-trend-analytics into main`.
2. Verified diffs: ensured no extraneous files or secrets were included.
3. Executed merge into `main`:
```bash
git checkout main
git merge feature/7-day-trend-analytics
git push origin main
```

---

### 5.4 Automated System Building Configuration (`netlify.toml`)
To formalize the system build and ensure automated builds occur in an identical, reproducible container, a declarative configuration manifest [`netlify.toml`](file:///c:/Users/PC/Documents/analyze-food/netlify.toml) was created at the project root:

```toml
[build]
  base = "frontend"
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

- **`base = "frontend"`**: Tells the build server to resolve dependencies within the frontend subproject.
- **`command = "npm run build"`**: Invokes Vite to compile JSX, bundle CSS, and generate PWA service workers.
- **`publish = "dist"`**: Directs the deployment engine to serve the compiled output.
- **`[[redirects]]`**: Enforces client-side Single Page Application (SPA) routing, rewriting all URL paths to `/index.html`.

---

### 5.5 Version Tagging (`v1.0` and `v1.1` Milestones)
With the new features successfully integrated, tested, and deployed, the repository was tagged to formalize **Version 1.1**:

```bash
git tag -a v1.1 -m "Release Version 1.1: 7-Day Caloric Analytics, Mobile Camera PWA, Netlify CI/CD"
git push origin v1.1
```

Comparing the two evolutionary states:
- **`v1.0`**: Single-meal image scan, portion detection, today's meal history.
- **`v1.1`**: 7-Day analytical bar chart, interactive day-by-day meal inspection, mobile native camera integration, canvas compression, and continuous deployment via Netlify.

---

### 5.6 Rollback and Recovery Mechanisms (Git & Netlify)
A critical requirement of configuration management is the ability to recover from defects. We evaluated two rollback strategies:

1. **Git Local Rollback / Inspection**:
   To inspect the system precisely as it existed at Version 1.0 without modifying the history tree:
   ```bash
   git checkout v1.0
   ```
2. **Netlify Instant Rollback**:
   In production, if a deployed build introduces a runtime regression, Netlify allows instant, one-click rollback to any previously published build hash without re-compiling source code.

---

# 6. Conclusion

This project successfully applied the principles of **Software Configuration Management (SCM)** to the construction and evolution of the **Analyze Food** application.

By utilizing **Git**, the project maintained full traceability, recorded immutable commit histories, and ensured that experimental feature development (such as 7-day analytics and mobile camera improvements) occurred safely in isolated branches without jeopardizing the mainline. 

Through **GitHub**, the team simulated modern collaborative engineering standards, using remote synchronization, pull requests, and push protection to safeguard confidential credentials. 

By integrating **Netlify**, the project fulfilled the requirements of modern continuous integration and automated system building, transforming manual build operations into a declarative, reproducible pipeline triggered automatically on git push.

Ultimately, this study proves that software configuration management is not merely an administrative task, but a foundational engineering discipline that enables complex software systems to evolve gracefully, reliably, and securely.

---

# 7. Appendix

### Appendix A: Key Command Reference & CLI Execution Log
```bash
# Check version history and branches
git log --oneline --graph --decorate --all

# Inspect tags
git tag -n

# Check working tree status
git status

# Inspect specific commit diffs
git show v1.1 --stat
```

### Appendix B: References
1. Sommerville, Ian. *Software Engineering*, 10th Edition. Pearson, 2016. (Chapter 25: Configuration Management).
2. Chacon, Scott, and Ben Straub. *Pro Git*, 2nd Edition. Apress, 2014. [https://git-scm.com/book/en/v2](https://git-scm.com/book/en/v2)
3. GitHub Documentation: *Collaborating with pull requests*. [https://docs.github.com/en/pull-requests](https://docs.github.com/en/pull-requests)
4. Netlify Documentation: *Build configuration and netlify.toml reference*. [https://docs.netlify.com/configure-builds/file-based-configuration/](https://docs.netlify.com/configure-builds/file-based-configuration/)
5. Vite Documentation: *Building for Production*. [https://vitejs.dev/guide/build.html](https://vitejs.dev/guide/build.html)
