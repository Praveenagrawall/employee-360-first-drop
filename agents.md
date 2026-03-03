# Employee 360 Dashboard — Project Intelligence File
# Place this at: /Users/praveenagrawal/Downloads/employee360/agents.md

## Project Overview
KPMG internal Employee 360 Dashboard — an HR Intelligence Platform providing comprehensive, role-based employee information. Built as a full-stack enterprise application with Java Spring Boot backend and React TypeScript frontend.

## Tech Stack

### Backend
- **Language:** Java 17
- **Framework:** Spring Boot 3.2.3
- **ORM:** Spring Data JPA / Hibernate 6.4
- **Database:** H2 (dev, in-memory) / PostgreSQL 16 (prod)
- **Build:** Maven 3.9
- **Code Generation:** Lombok (@Data, @Builder, @NoArgsConstructor, @AllArgsConstructor), MapStruct 1.5.5
- **API Docs:** Springdoc OpenAPI 2.3.0 (Swagger UI at /swagger-ui.html)
- **Port:** 8080

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (KPMG SAP SuccessFactors theme)
- **State Management:** React Context (UserContextProvider) + React Query
- **HTTP Client:** Axios
- **Routing:** React Router v6
- **Charts:** Recharts
- **Notifications:** React Hot Toast
- **Icons:** Lucide React
- **Port:** 5173

## Architecture

### Backend Package Structure
```
com.kpmg.employee360/
├── config/                 # WebConfig, DataLoader, CurrentUserContext, CurrentUserInterceptor
├── controller/             # REST controllers (all under /api/v1/)
├── dto/
│   ├── request/            # RequestDTOs.java (all request DTOs as inner classes)
│   └── response/           # ApiResponse.java, ResponseDTOs.java (all response DTOs as inner classes)
├── entity/                 # JPA entities
├── enums/                  # All enums (Permission, DesignationType, ProjectType, etc.)
├── exception/              # Global exception handler + custom exceptions
├── repository/             # JPA repositories + Specifications
└── service/                # Business logic services
```

### Frontend Structure
```
src/
├── api/                    # Axios API calls (one file per domain)
├── components/
│   ├── allocation/         # Allocation request modals and panels
│   ├── common/             # Reusable UI components (Avatar, Badge, Button, Modal, etc.)
│   ├── dashboard/          # Dashboard-specific components
│   ├── employee/           # Profile components (header, tabs, org chart node)
│   ├── feedback/           # GiveFeedbackModal
│   ├── layout/             # PageLayout, Sidebar, Topbar, RoleSwitcher
│   ├── performance/        # StartReviewModal
│   ├── project/            # CreateProjectModal
│   └── team/               # AddMemberModal
├── context/                # UserContextProvider (global user state + permissions)
├── hooks/                  # Custom hooks per domain (useEmployee, useProject, etc.)
├── pages/                  # Page components (one per route)
├── types/                  # TypeScript interfaces per domain
└── utils/                  # Helpers (cn, constants, formatters)
```

## Entities & Relationships
- **Employee** — self-referencing for reportingManager and performanceManager. FK to Designation.
- **Designation** — 7 levels (1=Associate Consultant → 7=Partner), maps to DashboardType (INDIVIDUAL/MANAGER/LEADERSHIP)
- **Project** — types: CLIENT, INTERNAL, PROPOSAL. Statuses: ACTIVE, COMPLETED, ON_HOLD, PIPELINE
- **Team** — belongs to Project, has teamLead (Employee)
- **TeamMember** — junction: Employee + Team, with roleInTeam, allocationPercentage (0-100), AllocationStatus
- **PerformanceReview** — lifecycle: DRAFT → SUBMITTED → ACKNOWLEDGED → COMPLETED. Rating 1-5.
- **Feedback** — types: PEER, UPWARD, DOWNWARD. Optional anonymity. Optional project context.
- **AllocationRequest** — request entity for team member allocation changes
- **Notification** — system notifications for employees

## Permission System
No Spring Security. Uses header-based simulation:
- Frontend sends `X-Current-User-Id` header with every request
- `CurrentUserInterceptor` reads header and sets `CurrentUserContext` (ThreadLocal)
- Default user: Employee ID 15 (Praveen Agrawal, Consultant)
- `PermissionService` resolves permissions based on designation level:
  - Level 1-3 (Individual): VIEW_OWN_*, SEARCH_BASIC, GIVE_PEER_FEEDBACK
  - Level 4-5 (Manager): + VIEW_TEAM_*, WRITE_PERFORMANCE_REVIEW, ASSIGN_TEAM_MEMBERS, SEARCH_FULL
  - Level 6 (Director): + VIEW_ANY_*, CREATE_PROJECT, VIEW_ORG_ANALYTICS, EXPORT_ANY_REPORT
  - Level 7 (Partner): + ADMIN_PANEL

## API Conventions
- Base URL: `/api/v1/`
- All responses wrapped in `ApiResponse<T>` with fields: success, message, data, timestamp
- Pagination: Spring Pageable (page, size, sort params)
- Error responses: 400 (validation), 403 (permission), 404 (not found), 409 (duplicate), 500 (server)
- DTOs: All request/response DTOs are inner classes in RequestDTOs.java / ResponseDTOs.java
- Validation: Jakarta `@Valid`, `@NotBlank`, `@Min`, `@Max`, `@Email`

## Controllers & Endpoints
| Controller | Base Path | Purpose |
|---|---|---|
| UserContextController | /user-context | /me, /switch/{id}, /switchable-users |
| EmployeeController | /employees | CRUD, /filter, /{id}/direct-reports, /{id}/org-hierarchy, /{id}/teammates |
| ProjectController | /projects | CRUD, /filter, /{id}/status, /employee/{id} |
| TeamController | /teams | CRUD members, /members/{id}/allocation, /members/{id}/role |
| PerformanceController | /performance | /reviews CRUD, /reviews/{id}/submit, /acknowledge, /complete, /summary |
| FeedbackController | /feedback | CRUD, /employee/{id}, /project/{id} |
| DashboardController | /dashboard | /{employeeId} — returns role-appropriate dashboard data |
| AnalyticsController | /analytics | /headcount, /utilization, /performance-overview, /project-overview |
| SearchController | /search | /global?q=&type= |
| ExportController | /export | /employees, /projects, /performance, /team-allocation |
| AllocationRequestController | /allocation-requests | Request/approve/reject allocation changes |
| NotificationController | /notifications | Employee notification management |

## Frontend Routing
| Path | Page | Access |
|---|---|---|
| / | DashboardPage | All (role-based content) |
| /profile | OwnProfilePage | All |
| /employees | EmployeesPage | All |
| /employees/:id | EmployeeProfilePage | All (permission-filtered content) |
| /projects | ProjectsPage | All (permission-filtered list) |
| /projects/:id | ProjectDetailPage | All |
| /requests | AllocationRequestsPage | Manager+ |
| /performance | PerformanceOverviewPage | Manager+ |
| /feedback | FeedbackPage | Manager+ |
| /analytics | AnalyticsPage | Director+ |
| /org-chart | OrgChartPage | Director+ |

## UI Theme — KPMG SAP SuccessFactors
- **Primary:** #00338D (KPMG Blue)
- **Header:** Blue gradient (135deg, #00338D → #0056B3 → #0077CC), height 64px
- **Sidebar:** White, 240px fixed, blue left-border accent on active item
- **Tables:** Light blue headers (#E3EFF9), 1px borders
- **Cards:** White, 1px solid #E5E8EB border, 4px border-radius, minimal shadow
- **Buttons:** Primary filled blue, secondary outlined, 4px radius
- **Badges:** 3px radius (square-ish, not pills), uppercase, 11px
- **Layout:** Fixed topbar + fixed sidebar, only main content scrolls
- **Fonts:** Inter / system font stack

## Coding Rules

### Backend
- Every entity uses `@Data @Builder @NoArgsConstructor @AllArgsConstructor` from Lombok
- Audit fields: `createdAt` (@CreationTimestamp), `updatedAt` (@UpdateTimestamp) on all entities
- Service layer handles ALL business logic — controllers are thin
- Always check permissions via `PermissionService` using `CurrentUserContext.getCurrentUserId()`
- Soft delete pattern: set `isActive = false`, never hard delete
- Repository naming: `findBy...`, custom queries use `@Query` with JPQL
- Specifications used for advanced filtering (EmployeeSpecification, PerformanceReviewSpecification)
- New DTOs go as inner classes in RequestDTOs.java or ResponseDTOs.java — do NOT create separate files

### Frontend
- Components use functional style with hooks
- API calls in `src/api/` — one file per domain, all use shared `axiosInstance`
- Custom hooks in `src/hooks/` — use React Query for data fetching
- TypeScript interfaces in `src/types/` — one file per domain
- Use `useUserContext()` for current user and permissions
- Use `<PermissionGate>` component to conditionally render UI based on permissions
- Use `<ProtectedRoute>` for route-level access control
- Tailwind only — no custom CSS files except index.css for global styles
- No `localStorage` or `sessionStorage` — use React state
- Buttons/actions on profiles: hide "Give Feedback" and "Write Review" on own profile
- All modals are separate components in their feature folder

### General
- No hardcoded IDs in business logic (except default user 15 in dev interceptor)
- API errors return `ApiResponse.error(message)` with appropriate HTTP status
- Toast notifications for all user actions (success/error)
- Loading states: skeleton components, not spinners (except initial app load)
- Empty states: meaningful messages with icons, not blank screens
- All lists/tables support: loading, empty, error states

## Demo Data
- 30+ employees across 7 designation levels
- 8 projects (4 client, 3 internal, 1 proposal)
- 8 teams with realistic allocations
- 28+ performance reviews across 3 cycles
- 25+ feedback entries (peer, upward, downward)
- Key test users: Praveen (ID 15, Consultant), Karthik (ID 7, Manager), Mallikarjun (ID 1, Partner)

## Known Patterns
- Role switcher in topbar sends X-Current-User-Id header — entire app reacts
- Dashboard endpoint returns different data shape based on designation's dashboardType
- Search has two modes: SEARCH_BASIC (name/designation only) vs SEARCH_FULL (all fields)
- Performance reviews have a 4-step lifecycle with different actors at each step
- Feedback auto-detects type (PEER/UPWARD/DOWNWARD) based on relative designation levels
- Self-feedback and self-review are prevented on both frontend and backend

## Do NOT
- Do NOT add Spring Security or authentication (planned for Phase 2)
- Do NOT use rounded-lg or rounded-xl on cards — keep flat corporate SAP style (rounded or rounded-md max)
- Do NOT use heavy shadows — use 1px borders instead
- Do NOT create separate DTO files — keep inner classes in RequestDTOs/ResponseDTOs
- Do NOT use pill-shaped badges — use square-ish 3px radius
- Do NOT break the existing fixed layout (topbar + sidebar fixed, only content scrolls)
- Do NOT use localStorage/sessionStorage in frontend
- Do NOT use emojis or casual language in the UI — keep it corporate
