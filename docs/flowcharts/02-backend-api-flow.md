# ⚙️ Backend API Routing & Request Flowchart

This flowchart outlines the backend request flow: parsing headers, checking token validation, verifying role guards, evaluating ABAC and scoping permissions, executing handlers, database interaction, audit logs, and responding back.

```mermaid
flowchart TD
    REQUEST["Incoming HTTP Request"] --> ROUTE["Express Route"]
    ROUTE --> JWT["JWT Middleware"]
    JWT --> TOKEN_VALID{"Access Token Valid?"}
    TOKEN_VALID -->|NO| REFRESH["Try Refresh Token"]
    REFRESH --> REFRESH_VALID{"Refresh Token Valid?"}
    REFRESH_VALID -->|NO| UNAUTHORIZED["401 Unauthorized"]
    REFRESH_VALID -->|YES| NEW_TOKEN["Issue New Access Token"]
    NEW_TOKEN --> AUTH_USER["Authenticated User"]
    TOKEN_VALID -->|YES| AUTH_USER
    AUTH_USER --> ROLE["Extract Role"]
    ROLE --> ROLE_CHECK{"Role Allowed?"}
    ROLE_CHECK -->|NO| FORBIDDEN["403 Forbidden"]
    ROLE_CHECK -->|YES| PERMISSION["Permission Check"]
    PERMISSION --> PERMISSION_CHECK{"Permission Allowed?"}
    PERMISSION_CHECK -->|NO| FORBIDDEN
    PERMISSION_CHECK -->|YES| SCOPE["ABAC / Scope Check"]
    SCOPE --> SCOPE_CHECK{"Within Scope?"}
    SCOPE_CHECK -->|NO| FORBIDDEN
    SCOPE_CHECK -->|YES| VALIDATE["Validate Request"]
    VALIDATE --> CONTROLLER["Controller"]
    CONTROLLER --> SERVICE["Business Service"]
    SERVICE --> DB["SQLite Database"]
    DB --> RESULT["Database Result"]
    RESULT --> AUDIT["Create Audit Event"]
    RESULT --> NOTIFY["Trigger Notification if Required"]
    RESULT --> SOCKET["Socket.IO Event"]
    RESULT --> RESPONSE["JSON Response"]
    RESPONSE --> CLIENT["React Frontend"]
    SOCKET --> CLIENT
```
