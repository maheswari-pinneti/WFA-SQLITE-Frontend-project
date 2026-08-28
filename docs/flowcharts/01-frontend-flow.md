# 📊 Frontend Runtime Flowchart

This flowchart outlines the React application bootstrap process, route routing, authentication check, user dashboard routing based on role permissions, and how state updates trigger re-renders.

```mermaid
flowchart TD
    START["User Opens Application"] --> LOGIN["Login Page"]
    LOGIN --> CREDENTIALS["Enter Email + Password"]
    CREDENTIALS --> API_LOGIN["POST /api/auth/login"]
    
    API_LOGIN --> MFA_REQUIRED{"MFA Required?"}
    MFA_REQUIRED -->|YES| OTP["Enter OTP"]
    OTP --> VERIFY["POST /api/auth/verify-otp"]
    VERIFY --> OTP_VALID{"OTP Valid?"}
    OTP_VALID -->|NO| ERROR["Show Authentication Error"]
    ERROR --> LOGIN
    OTP_VALID -->|YES| TOKEN["Receive Access Token + Refresh Token"]
    
    MFA_REQUIRED -->|NO| TOKEN
    
    TOKEN --> PROFILE["Load User Profile"]
    PROFILE --> ROLE{"Determine Role"}
    
    ROLE --> ADMIN["Admin Dashboard (AdminDashboardPage)"]
    ROLE --> HR["HR Dashboard (HrDashboardPage)"]
    ROLE --> MANAGER["Manager Dashboard (ManagerDashboardPage)"]
    ROLE --> LEAD["Team Lead Dashboard (TeamLeadDashboardPage)"]
    ROLE --> EMP["Employee Dashboard (EmployeeDashboardPage)"]
    
    ADMIN --> API["API Request"]
    HR --> API
    MANAGER --> API
    LEAD --> API
    EMP --> API
    
    API --> BACKEND["Express REST API"]
    BACKEND --> RESPONSE["API Response"]
    RESPONSE --> QUERY["React Query Cache"]
    QUERY --> COMPONENT["React Components"]
    COMPONENT --> DASHBOARD["Update Dashboard UI"]
    
    SOCKET["Socket.IO Event"] --> COMPONENT
    DASHBOARD --> END["User Sees Updated Data"]
```
