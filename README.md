# ArchArena
Design your model

# Project: HLD Arena — Interactive System Design Learning & Challenge Platform

## 1. Project Vision

Build a complete, modern, highly user-friendly web application called **HLD Arena**.

The platform teaches users High-Level Design (HLD) and helps them prepare for real-world system design interviews through an interactive, game-based learning experience.

The core gameplay is visual:

1. The user selects a system design question.
2. The application explains the problem and its requirements.
3. The user opens an interactive playground.
4. The user assembles a system architecture using drag-and-drop components.
5. The user connects components to define how data flows through the system.
6. The application evaluates the submitted architecture using a transparent scoring rubric.
7. The user receives a score, rating, stars, strengths, weaknesses, and improvement suggestions.
8. The user can improve the design, save it, or submit the final solution.

The platform must feel like a combination of a system design interview simulator, an educational playground, and a gamified challenge platform.

Do not build a static landing page or a simple collection of questions. Build a functional application with a working visual editor, evaluation flow, persistent progress, and a complete question bank.

---

## 2. Mandatory Technology Stack

Use the following stack unless an existing project already requires compatible alternatives:

- Frontend: React with TypeScript.
- Build tool: Vite.
- Visual diagram editor: @xyflow/react (React Flow).
- UI styling: Tailwind CSS or a consistent component-based CSS system.
- Icons: Lucide React.
- State management: Zustand or an equivalent lightweight solution.
- Form validation: Zod or an equivalent validation library.
- Backend: Node.js with TypeScript and REST APIs.
- Database: PostgreSQL.
- Database access: Prisma or Drizzle ORM.
- Authentication: Secure email-based authentication, with optional Google sign-in.
- PWA: vite-plugin-pwa with a properly configured service worker and web app manifest.
- Testing: Vitest and React Testing Library, with Playwright for important end-to-end flows.

Keep the frontend, backend, database models, and question evaluation logic modular.

Do not put all application logic into one component.

If the project is already initialized, inspect the existing architecture before making changes. Preserve working features and reuse compatible dependencies.

---

## 3. Language Requirements

The entire application UI must be in English by default.

Only the following content should have a language toggle:

- Problem explanation.
- Problem requirements.
- Functional requirements.
- Non-functional requirements.
- Interview hints, when provided.
- Question-specific clarifications.

For this content, provide two options:

- English
- Hinglish

The language toggle must change the explanatory content without changing the rest of the application UI.

Keep all navigation, buttons, component names, technical labels, scoring, settings, dashboard, feedback, and playground controls in English.

Use natural Hinglish written in Roman script. Do not use machine-translated or awkward Hinglish.

Every question must have both English and Hinglish versions of its explanation.

Persist the user's preferred explanation language.

---

## 4. Question Bank: Exactly 100 Questions

Create exactly 100 system design questions, divided into the following difficulty levels:

- Easy: 15 questions.
- Medium: 35 questions.
- Hard: 50 questions.

The total must be exactly 100.

Do not create duplicate questions with slightly different titles just to reach the target.

### Easy — 15 questions

Include foundational systems such as:

1. URL Shortener — basic version.
2. Pastebin.
3. Simple File Upload and Download Service.
4. Basic Notification Service.
5. Rate Limiter.
6. API Gateway — basic version.
7. Basic Image Hosting Service.
8. Simple Polling and Voting System.
9. Basic Chat Application.
10. Website Analytics Counter.
11. Unique ID Generator.
12. Simple Task Management Service.
13. Basic E-commerce Product Catalog.
14. Basic Search Autocomplete.
15. Basic Logging Service.

### Medium — 35 questions

Include interview-style systems such as:

1. URL Shortener at Scale.
2. WhatsApp.
3. Slack.
4. Instagram.
5. Twitter/X Timeline.
6. YouTube.
7. Netflix.
8. Google Drive.
9. Dropbox.
10. Google Docs Collaboration.
11. Uber.
12. Food Delivery Platform.
13. Ticket Booking System.
14. E-commerce Checkout.
15. Shopping Cart Service.
16. Payment Processing Platform.
17. Ride Matching Service.
18. Real-Time Location Tracking.
19. News Feed Service.
20. Recommendation Service.
21. Distributed Cache.
22. Distributed Message Queue.
23. Web Crawler.
24. Search Engine.
25. Metrics Monitoring Platform.
26. Centralized Logging Platform.
27. Notification Delivery Platform at Scale.
28. File Storage and CDN.
29. Video Upload and Transcoding.
30. Online Code Execution Platform.
31. Job Scheduler.
32. Distributed Rate Limiter.
33. Leaderboard System.
34. Inventory Management System.
35. Feature Flag Service.

### Hard — 50 questions

Include advanced interview-style challenges such as:

1. Design YouTube at Massive Scale.
2. Design WhatsApp at Massive Scale.
3. Design Instagram at Massive Scale.
4. Design Twitter/X at Massive Scale.
5. Design TikTok.
6. Design Netflix Global Streaming.
7. Design Spotify.
8. Design Google Search.
9. Design Google Maps.
10. Design Uber at Global Scale.
11. Design Airbnb.
12. Design Amazon-like E-commerce.
13. Design a Global Ticket Booking Platform.
14. Design a Global Payment System.
15. Design a Distributed Wallet and Ledger.
16. Design a Stock Trading Platform.
17. Design a Cryptocurrency Exchange.
18. Design a Banking Transaction Platform.
19. Design a Global Notification Infrastructure.
20. Design a Distributed API Gateway.
21. Design a Global Rate Limiting Service.
22. Design a Multi-Tenant SaaS Platform.
23. Design a Multi-Region Database Service.
24. Design a Distributed Key-Value Store.
25. Design a Distributed SQL Database.
26. Design a Global Object Storage Service.
27. Design a Content Delivery Network.
28. Design a Distributed Message Broker.
29. Design a Real-Time Event Streaming Platform.
30. Design a Large-Scale Web Crawler.
31. Design a Global Search and Indexing Platform.
32. Design a Real-Time Fraud Detection System.
33. Design a Large-Scale Recommendation Engine.
34. Design a Personalized Feed Ranking System.
35. Design a Global Ad Serving Platform.
36. Design an Observability Platform.
37. Design a Distributed Tracing System.
38. Design a Feature Flag Platform at Scale.
39. Design a Global Configuration Management Service.
40. Design a Distributed Job Execution Platform.
41. Design a Cloud-Based Code Execution Platform.
42. Design a Multiplayer Online Game Backend.
43. Design a Real-Time Collaborative Editor.
44. Design a Video Conferencing Platform.
45. Design a Live Streaming Platform.
46. Design a Global Chat Infrastructure.
47. Design a Location-Based Dispatch Platform.
48. Design a Travel Search and Booking Aggregator.
49. Design a Distributed Inventory Reservation System.
50. Design a Global Identity and Authentication Platform.

These are the initial seed topics. Validate the final question bank for duplicates and adjust difficulty based on actual scope, constraints, and expected interview complexity.

### Important question sourcing requirement

Use publicly available system design interview resources to research the question bank.

Prioritize reputable, accessible sources such as:

- System Design Primer on GitHub.
- Public system design interview preparation resources.
- Engineering blogs from established technology companies.
- Publicly available interview preparation articles and guides.

Store the source URL and source title for each question whenever a reliable source exists.

Do not claim that a company asks a specific question in its interview unless a reliable source supports that claim.

Distinguish between a commonly discussed interview-style problem and a verified company interview question.

Do not copy proprietary interview solutions or entire articles. Create original explanations, requirements, hints, evaluation rubrics, and reference architectures.

If internet access is unavailable, do not fabricate citations. Use clearly marked source-verification placeholders until the sources can be verified.

---

## 5. Required Question Data Structure

Every question must have a consistent data model containing:

- Unique question ID.
- Title.
- Slug.
- Difficulty.
- Category.
- Estimated completion time.
- English problem statement.
- Hinglish problem statement.
- English functional requirements.
- Hinglish functional requirements.
- English non-functional requirements.
- Hinglish non-functional requirements.
- Constraints and assumptions.
- Expected scale.
- Relevant system design concepts.
- Suggested component categories.
- Starter canvas configuration.
- Required architectural capabilities.
- Optional architectural capabilities.
- Critical failure conditions.
- Evaluation rubric.
- Progressive hints.
- Reference architecture.
- Reference architecture explanation.
- Source title.
- Source URL.
- Tags.
- Publication status.

Question data must be separate from UI components and stored in a maintainable seed-data or database structure.

Each question must be a complete, usable challenge, not merely a title.

---

## 6. Application Pages

Create the following pages.

### A. Landing Page

Display:

- Product name and tagline.
- Clear explanation of how the platform works.
- Start Learning button.
- Explore Challenges button.
- Featured system design challenges.
- Easy, Medium, and Hard difficulty summaries.
- Sample architecture preview.
- Benefits of practicing visual system design.
- Responsive navigation.
- Sign-in and registration actions.

Keep the page clean, modern, and focused on getting users into their first challenge.

### B. Dashboard

Display:

- Total questions completed.
- Total stars earned.
- Current XP.
- Current level.
- Overall average rating.
- Easy, Medium, and Hard progress.
- Recent attempts.
- Saved architecture drafts.
- Recommended next challenge.
- Continue Practicing button.
- Weak topics that need improvement.

Progress values must come from actual user data, not hardcoded numbers.

### C. Challenge Explorer

Provide:

- Search by question title.
- Filter by difficulty.
- Filter by category and topic.
- Filter by completion status.
- Sorting by difficulty, title, and completion time.
- Progress indicators.
- Pagination or efficient list virtualization if required.
- Clear difficulty labels.
- Estimated completion time.
- Start or Continue buttons.

Each challenge card should show:

- Question title.
- Difficulty.
- Category.
- Estimated time.
- Best score.
- Earned stars.
- Completion status.

Show a total of 100 questions, with exactly 15 Easy, 35 Medium, and 50 Hard challenges.

### D. Question Details Page

Before opening the playground, explain what the user needs to design.

Include:

- Problem title and difficulty.
- English/Hinglish explanation toggle.
- Problem statement.
- Functional requirements.
- Non-functional requirements.
- Expected scale and constraints.
- What the user is expected to deliver.
- Concepts being evaluated.
- Suggested time limit.
- Start Challenge button.
- Optional progressive hints.

Do not reveal the full reference architecture before the user has attempted the challenge.

---

## 7. Interactive System Design Playground

This is the most important part of the application.

Build a genuine visual architecture editor using React Flow.

The user must be able to construct a system design without writing code.

### Playground layout

Use a three-part workspace:

1. Left sidebar: Component library.
2. Center: Interactive architecture canvas.
3. Right sidebar: Selected component or connection properties.

Add a compact top toolbar containing:

- Question title.
- Autosave status.
- Undo and Redo.
- Zoom In and Zoom Out.
- Fit to Screen.
- Reset Layout.
- Validate Design.
- Submit for Evaluation.
- Final Submit.

Make the workspace responsive and usable on smaller screens.

### A. Component Library

Organize draggable components into logical categories.

**Clients and Entry Points**
- Web Client.
- Mobile Client.
- Desktop Client.
- DNS.
- CDN.
- Load Balancer.
- API Gateway.
- Reverse Proxy.

**Application Layer**
- Application Server.
- Microservice.
- Authentication Service.
- Background Worker.
- WebSocket Server.
- BFF (Backend for Frontend).

**Storage**
- SQL Database.
- NoSQL Database.
- Read Replica.
- Sharded Database.
- Object Storage.
- Search Index.
- Data Warehouse.

**Caching**
- In-Memory Cache.
- Distributed Cache.
- CDN Cache.

**Messaging and Processing**
- Message Queue.
- Event Stream.
- Event Consumer.
- Scheduler.
- Task Queue.
- Dead-Letter Queue.

**Supporting Services**
- Rate Limiter.
- Notification Service.
- Email/SMS Provider.
- Payment Provider.
- Search Service.
- Logging Service.
- Metrics and Monitoring.
- Distributed Tracing.
- Secrets Manager.
- Configuration Service.

Add additional components where a question genuinely needs them.

Each component must have a distinct icon, readable label, useful tooltip, and clear visual identity.

Do not allow the canvas to become cluttered with oversized icons or decorative elements.

### B. Drag-and-Drop Behaviour

Users must be able to:

- Drag components from the library onto the canvas.
- Move components freely.
- Select one or multiple components.
- Duplicate a component.
- Delete components and connections.
- Rename instances.
- Add notes or annotations.
- Group related components into visual sections.
- Undo and redo operations.
- Zoom and pan.
- Fit the complete architecture to the canvas.
- Save and restore the canvas.
- Use keyboard shortcuts where appropriate.

Show a useful empty-state message when the canvas has no components.

Provide a guided first-use experience.

### C. Connections Are Critical

A design is not correct merely because the user has placed the right components.

The connections between components must be evaluated as first-class parts of the architecture.

Users must be able to connect component handles using drag-and-drop.

Every connection should optionally define:

- Connection type.
- Direction.
- Protocol.
- Synchronous or asynchronous communication.
- Data flow description.
- Read or write operation.
- Whether the connection is critical.
- Optional annotations.

Provide sensible defaults so beginners can connect components without needing to configure every property.

Show directional arrows where applicable.

Make connections visually distinguishable, but keep the diagram easy to understand.

The evaluator must check:

- Whether important components are connected.
- Whether the flow starts and ends correctly.
- Whether requests can reach the appropriate application service.
- Whether the data layer is connected appropriately.
- Whether asynchronous components have valid producers and consumers.
- Whether there are unnecessary or invalid connections.
- Whether critical dependencies create a single point of failure.
- Whether data flows in the correct direction.
- Whether the architecture meets the specific question's requirements.

Do not evaluate connections using one universal fixed topology. Each question must have its own expected capabilities and validation rules.

### D. Component Properties

When a component is selected, show its configuration panel.

Depending on the component type, allow users to specify relevant properties such as:

- Name.
- Role.
- Replication strategy.
- Cache policy.
- Database type.
- Read/write responsibilities.
- Sharding strategy.
- Partition key.
- Replication count.
- Retry strategy.
- Timeout.
- Circuit breaker.
- Queue delivery behaviour.
- Load balancing strategy.
- Scaling strategy.
- Availability configuration.

Use contextual properties rather than displaying every possible field for every component.

Explain advanced terms through tooltips and optional help text.

---

## 8. Design Evaluation Engine

Create a real, explainable evaluation engine.

Do not use a random score or simply count the number of components.

Evaluate the submitted architecture against a question-specific rubric.

The evaluation must consider:

1. Functional requirement coverage.
2. Component selection.
3. Connection correctness.
4. Data flow correctness.
5. Scalability.
6. Availability and fault tolerance.
7. Database and storage design.
8. Caching strategy.
9. Communication patterns.
10. Security and reliability.
11. Bottlenecks and single points of failure.
12. Complexity and unnecessary components.

Use a configurable weighted scoring model.

A suggested default weighting is:

- Functional correctness: 25%.
- Connections and data flow: 20%.
- Component selection: 15%.
- Scalability: 15%.
- Reliability and availability: 10%.
- Data storage and caching: 10%.
- Simplicity and design efficiency: 5%.

The weights must be configurable per question because different systems have different priorities.

Normalize the final score to 100.

The evaluator must return:

- Overall score.
- Rating.
- Requirement coverage.
- Connection score.
- Component score.
- Scalability score.
- Reliability score.
- Major missing components.
- Missing critical connections.
- Invalid or suspicious connections.
- Potential bottlenecks.
- Unnecessary complexity.
- Security concerns.
- Specific suggestions for improvement.
- Evaluation breakdown with explanations.

For every deduction, explain why points were deducted.

For every recommendation, explain how it improves the architecture.

Do not require a single exact diagram if multiple valid architectures are possible.

Support acceptable alternatives through question-specific evaluation rules.

Where a requirement cannot be assessed reliably from a diagram, mark it as not assessed or ask the user to provide an explicit configuration. Do not pretend that the system has verified implementation details that the user has not supplied.

---

## 9. Submission Flow

Support three distinct actions.

### Validate Design

This performs quick local validation.

It checks:

- Missing components.
- Broken connections.
- Invalid connection directions.
- Obvious disconnected elements.
- Basic requirement coverage.

It should not consume the user's final submission attempt.

### Submit for Evaluation

This evaluates the current architecture and generates a detailed report.

The user can return to the playground and make improvements after reviewing the results.

Store each evaluation as an attempt, subject to sensible attempt limits or rate limits.

Show a clear before-and-after comparison when a user improves a design.

### Final Submit

Allow the user to mark an evaluated design as their final submission.

Before final submission:

- Save the latest diagram.
- Run validation.
- Show the current score.
- Show any remaining critical warnings.
- Ask the user to confirm final submission.

After confirmation:

- Persist the final architecture.
- Store the final score and rubric breakdown.
- Award eligible stars and XP.
- Update challenge completion and dashboard progress.
- Mark the challenge as completed.
- Provide a final result page.

Do not mark a challenge completed simply because the user opened it or placed a component on the canvas.

Clearly distinguish a draft, an evaluated attempt, and a final submission.

---

## 10. Stars, Ratings, XP, and Levels

Build a transparent gamification system.

### Star system

Use a five-star scale based on the final normalized score:

- 0–39: 0 stars.
- 40–54: 1 star.
- 55–69: 2 stars.
- 70–79: 3 stars.
- 80–89: 4 stars.
- 90–100: 5 stars.

Allow configuration of these thresholds.

Stars are awarded for the eligible final submission, not for every repeated evaluation of the same challenge.

If the user improves a completed solution, update the best score and stars according to clearly defined rules without duplicating rewards.

### Ratings

Display a numerical rating out of 5.0 based on the final score.

For example, a score of 84 corresponds to 4.2/5.

Clearly distinguish the numerical rating from the star achievement.

### XP and levels

Award XP according to:

- Successful challenge completion.
- Difficulty.
- Score quality.
- First-time achievements.
- Optional milestones.

Avoid unlimited XP farming through repeated submissions.

Provide a level progression system with a progress bar showing XP needed for the next level.

Keep XP reward rules configurable.

### Achievement system

Add achievements such as:

- First Architecture.
- First Five-Star Design.
- Ten Challenges Completed.
- All Easy Challenges Completed.
- Medium Master.
- Hard Challenge Finisher.
- Perfect Connection Flow.
- Improved Previous Score.

Award achievements only when their actual conditions are met.

---

## 11. Results and Feedback Page

After evaluation, show a clear and attractive results dashboard.

Include:

- Overall score.
- Five-star rating.
- Earned stars.
- XP gained.
- Completion status.
- Evaluation category breakdown.
- Requirement coverage.
- Strengths.
- Weaknesses.
- Critical missing connections.
- Scalability and availability feedback.
- Suggested improvements.
- Next recommended challenge.

Provide a button to return to the playground.

Provide an option to reveal the reference architecture after the attempt.

When revealing the reference solution, show:

- Reference architecture diagram.
- Explanation of each component.
- Explanation of critical connections.
- Trade-offs.
- Alternative valid approaches.
- Why the reference architecture meets the requirements.

Allow users to compare their design with the reference architecture without losing their own solution.

---

## 12. Question-Specific Rubrics and Reference Architectures

All 100 questions must have meaningful evaluation rules.

Do not create 100 question titles and use the same generic rubric for all of them.

For every question, define:

- Essential capabilities.
- Required logical flows.
- Acceptable component alternatives.
- Critical missing connections.
- Optional improvements.
- Common failure cases.
- Scalability expectations.
- Reliability expectations.
- Reference architecture.
- Scoring rules.

For example, a URL Shortener should evaluate short-code generation, persistence, redirects, caching, and collision handling.

A chat application should evaluate message delivery, conversation storage, real-time communication, and offline delivery where required.

A ticket booking system should evaluate inventory reservation, concurrent booking protection, and payment-related failure scenarios.

A video streaming system should evaluate upload, transcoding, object storage, CDN delivery, and metadata management.

These examples illustrate the evaluation style. The actual criteria must match the scope and difficulty of each question.

Build reusable validation rules, but configure them per question.

---

## 13. Learning and Hint System

Add progressive hints that help users learn without immediately revealing the answer.

Suggested hint levels:

- Hint 1: Clarify the main architectural challenge.
- Hint 2: Suggest a relevant system design concept.
- Hint 3: Suggest a missing responsibility or component category.
- Hint 4: Explain a relevant trade-off.

Do not reveal the complete reference diagram in the initial hints.

Record hint usage for analytics and optionally apply a configurable bonus adjustment to achievement rewards. Do not arbitrarily punish users for learning.

Hints must be available in English and Hinglish.

---

## 14. User Accounts and Saved Work

Support authenticated users and persistent progress.

Store:

- User profile.
- Preferred explanation language.
- Question completion.
- Current drafts.
- Diagram nodes and positions.
- Diagram connections and properties.
- Evaluation attempts.
- Best score.
- Final submission.
- Stars.
- XP and levels.
- Achievements.
- Timestamps.
- Relevant rubric versions.

Provide autosave with a visible status:

- Saving.
- Saved.
- Offline changes pending.
- Save failed.

Do not silently discard a user's diagram.

Support resuming an unfinished challenge.

Keep users' private drafts private by default.

Validate authorization on the server so one user cannot access another user's private submissions.

---

## 15. Database and Backend Design

Create a normalized database schema with appropriate relationships.

Suggested entities:

- users
- questions
- question_sources
- question_rubrics
- question_requirements
- question_reference_architectures
- user_question_progress
- design_drafts
- design_attempts
- design_submissions
- evaluation_results
- user_achievements
- user_xp_transactions

Use JSONB for flexible diagram snapshots or rubric-specific configuration where appropriate, but keep queryable business data in appropriate relational tables.

Use database transactions for final submission and reward allocation.

Prevent duplicate reward allocation when the same submission is processed more than once.

Store the rubric version used for every evaluation so historical results remain interpretable when evaluation rules change.

Include migrations, seed scripts, indexes, and development setup instructions.

---

## 16. Progressive Web App Requirements

The application must be installable as a PWA.

Implement:

- Web app manifest.
- App name and short name.
- Appropriate application icons.
- Theme and background colors.
- Standalone display mode.
- Service worker.
- Application shell caching.
- Versioned static asset caching.
- An offline fallback page.
- Update detection and a user-friendly update prompt.
- Install instructions where supported.

Previously loaded question content should be available offline where practical.

Allow local draft editing when offline and synchronize changes when the connection returns.

Show clear offline and synchronization status.

Do not pretend that a submission has been evaluated by the server while offline.

Queue eligible changes locally and reconcile them safely when online.

Do not cache authenticated API responses or private user data indiscriminately.

Use an explicit caching strategy for public question data, static assets, and private data.

---

## 17. User Experience and Accessibility

The application must be exceptionally easy to use for beginners.

Design principles:

- Clean, modern, professional interface.
- English UI throughout.
- Explanation-only English/Hinglish toggle.
- Consistent spacing and typography.
- Clear component labels.
- Helpful tooltips.
- Minimal unnecessary dialogs.
- Useful empty states.
- Clear success and error feedback.
- Loading states and skeletons where appropriate.
- Keyboard accessibility.
- Visible focus indicators.
- Accessible labels and contrast.
- Responsive layouts.
- Touch-friendly controls.
- Confirmation for destructive actions.
- No horizontal overflow on mobile.
- No unexplained technical jargon in beginner-facing guidance.

Use progressive disclosure: show essential actions first and advanced configuration when needed.

Provide a short first-use walkthrough that demonstrates dragging a component, creating a connection, validating the diagram, and reviewing feedback.

Avoid overloading the user with every component and property at once.

Include dark mode and light mode if feasible.

---

## 18. Security and Reliability

Implement:

- Secure authentication.
- Authorization for all private resources.
- Server-side request validation.
- Rate limiting on evaluation and authentication endpoints.
- Safe database queries through the ORM.
- Protection against common web vulnerabilities.
- Secure session or token handling.
- Environment-based secrets.
- Appropriate error handling.
- Audit-relevant submission timestamps.
- Idempotent final submission and reward processing.

Do not expose API secrets in frontend code.

Do not trust client-provided scores, XP, stars, or completion status.

The server must validate submissions and calculate authoritative rewards.

---

## 19. Performance

Optimize the application for a smooth experience.

Requirements:

- Lazy-load large pages and heavy modules where appropriate.
- Keep the playground responsive with larger diagrams.
- Avoid unnecessary React re-renders.
- Use stable node and edge identifiers.
- Debounce autosave.
- Avoid saving the entire diagram on every pointer movement.
- Use efficient database queries.
- Paginate or virtualize long lists where needed.
- Cache public question content sensibly.
- Keep dependencies reasonable.
- Avoid unnecessary animation and expensive visual effects.
- Handle failed network requests gracefully.

Do not compromise the usability of the diagram editor for decorative animations.

---

## 20. Testing and Quality Assurance

Create meaningful tests for:

- Question counts and difficulty distribution.
- Duplicate question detection.
- English and Hinglish explanation availability.
- Diagram serialization and restoration.
- Adding, deleting, and connecting nodes.
- Undo and redo.
- Autosave.
- Connection validation.
- Question-specific evaluation.
- Score normalization.
- Star thresholds.
- XP calculation.
- Duplicate reward prevention.
- Authentication and authorization.
- Offline draft recovery.
- Synchronization after reconnecting.
- Final submission.
- Responsive navigation.

Add end-to-end tests for the complete user journey:

Register → Open a challenge → Read the problem → Build an architecture → Evaluate → Improve → Final Submit → Receive stars and XP → Resume progress from the dashboard.

Run type checking, linting, unit tests, and production builds. Fix errors rather than hiding them.

---

## 21. Implementation Strategy

Work in the following phases.

### Phase 1: Foundation

- Inspect the existing repository.
- Establish the architecture.
- Set up React, TypeScript, Vite, styling, and routing.
- Define the database schema.
- Establish reusable UI components.
- Create the PWA foundation.

### Phase 2: Question Bank

- Create the 100-question dataset.
- Verify the 15/35/50 distribution.
- Add English and Hinglish explanations.
- Add question metadata, sources, and evaluation rubrics.
- Validate duplicates and missing fields.

### Phase 3: Playground

- Implement the component library.
- Implement drag-and-drop.
- Implement nodes and edges.
- Add connection properties.
- Add undo, redo, zoom, pan, and canvas controls.
- Implement serialization and autosave.

### Phase 4: Evaluation

- Implement question-specific rules.
- Add validation.
- Add scoring and feedback.
- Add the results page.
- Add reference architecture comparison.

### Phase 5: Gamification

- Add XP and levels.
- Add stars and numerical ratings.
- Add achievements.
- Add challenge progress.
- Add the dashboard.

### Phase 6: Accounts and Persistence

- Implement authentication.
- Implement database-backed drafts.
- Implement attempts and final submissions.
- Add authorization and idempotent rewards.

### Phase 7: PWA and Offline Experience

- Configure service worker and caching.
- Add installability.
- Add offline draft support.
- Add safe synchronization and update handling.

### Phase 8: Quality and Release

- Run tests.
- Fix bugs.
- Verify all 100 questions.
- Test mobile and desktop.
- Build the production bundle.
- Document deployment.

---

## 22. Deliverables

Provide a complete working project with:

- Frontend source code.
- Backend source code.
- Database schema and migrations.
- Seed data for exactly 100 questions.
- Question sources and metadata.
- Question-specific evaluation configuration.
- Reference architectures.
- Authentication and user progress.
- Interactive diagram editor.
- Results and scoring system.
- Stars, XP, levels, and achievements.
- PWA manifest and service worker.
- Offline draft support.
- Environment variable example file.
- Setup and deployment documentation.
- Automated tests.

Document which evaluation rules are implemented deterministically and which, if any, require future enhancement.

Do not leave core functionality as non-working placeholder buttons.

If an external service or credential is required, document the dependency and provide a useful development-mode alternative.

---

## 23. Final Acceptance Criteria

The project is only considered complete when all the following are true:

1. Exactly 100 unique questions exist: 15 Easy, 35 Medium, and 50 Hard.
2. Every question has English and Hinglish explanatory content.
3. All other UI elements remain in English.
4. Users can drag components onto a real interactive canvas.
5. Users can create, edit, and delete connections.
6. Connection correctness materially affects evaluation.
7. Every question has a relevant evaluation rubric.
8. Users receive an explainable score out of 100.
9. Stars and numerical ratings are awarded according to defined rules.
10. Final submission is persisted and protected against duplicate rewards.
11. Users can save and resume their work.
12. Dashboard progress reflects actual stored data.
13. The reference architecture can be revealed after an attempt.
14. The application is installable as a PWA.
15. Offline drafts can be recovered and synchronized safely.
16. The interface works on desktop, tablet, and mobile.
17. Critical flows have automated tests.
18. The production build completes successfully.

**Execution instruction:** Start by inspecting the existing project and proposing a short implementation plan. Then implement the application in small, testable phases. Do not stop after generating a UI mockup. Prioritize a working end-to-end challenge with a functional playground, meaningful evaluation, saved progress, and final submission before adding secondary polish. Keep the code modular and document important architectural decisions.
