# 🗄️ Database Transaction & Data Scoping Flowchart

This flowchart demonstrates backend transaction sequences: schema constraint checks, entity updates, analytics query aggregation, index-driven lookups, transaction commits/rollbacks, and audit logging.

```mermaid
flowchart TD
    API["Backend Service"] --> TRANSACTION["Database Transaction"]
    TRANSACTION --> VALIDATE["Validate Foreign Keys + Constraints"]
    
    VALIDATE --> EMPLOYEE{"Employee Operation?"}
    
    EMPLOYEE -->|YES| EMP_DB["Employees Table"]
    EMPLOYEE -->|NO| ATTENDANCE{"Attendance Operation?"}
    
    ATT_DB["Attendance Table"]
    
    ATTENDANCE -->|YES| ATT_DB
    ATTENDANCE -->|NO| AUTH_DB["Users / Roles / Permissions"]
    
    EMP_DB --> UNIQUE["UNIQUE employee_code"]
    UNIQUE --> DEPT["Departments / Teams"]
    
    ATT_DB --> DUPLICATE["Duplicate / Idempotency Check"]
    
    AUTH_DB --> SESSION["Sessions / Refresh Tokens"]
    AUTH_DB --> MFA["MFA Challenges"]
    
    EMP_DB --> ANALYTICS["Analytics Queries"]
    ATT_DB --> ANALYTICS
    
    ANALYTICS --> KPI["Workforce KPIs"]
    ANALYTICS --> CHARTS["Analytics Data"]
    
    EMP_DB --> AUDIT["Audit Log"]
    ATT_DB --> AUDIT
    AUTH_DB --> AUDIT
    
    AUDIT --> AUDIT_TABLE["Audit Logs"]
    NOTIFY["Notification Service"] --> NOTIFY_TABLE["Notifications"]
    
    TRANSACTION --> COMMIT["COMMIT"]
    TRANSACTION --> ROLLBACK["ROLLBACK on Error"]
    
    COMMIT --> RESPONSE["Return Data"]
    ROLLBACK --> ERROR["Return Error"]
```
