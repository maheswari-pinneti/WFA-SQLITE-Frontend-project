# 🔄 Complete End-to-End System Flowchart

This flowchart visualizes the complete end-to-end user-to-database-to-UI flow. It serves as a overview mapping out the request chain from the React UI down to MongoDB, and Socket.io updating the dashboard UI.

```mermaid
flowchart LR
    USER["User"] --> FE["React Frontend (TypeScript / Redux / React Query)"]
    FE --> API["Express REST API"]
    API --> AUTH["JWT / MFA / OTP Verification"]
    AUTH --> RBAC["RBAC Evaluation"]
    RBAC --> ABAC["ABAC Scope Validation"]
    ABAC --> SERVICE["Business Services"]
    SERVICE --> DB["SQLite Database"]
    
    DB --> AUDIT["Audit Logs"]
    SERVICE --> SOCKET["Socket.IO Server"]
    SOCKET --> UI["Updated React Dashboard UI"]
    
    DB --> SERVICE
    SERVICE --> API
    API --> FE
    FE --> UI
```

---

### End-to-End Request Chain in One Sentence:
> **User** $\rightarrow$ **React UI** $\rightarrow$ **Protected Route** $\rightarrow$ **REST API** $\rightarrow$ **JWT/MFA** $\rightarrow$ **RBAC** $\rightarrow$ **ABAC/Scope** $\rightarrow$ **Controller** $\rightarrow$ **Service** $\rightarrow$ **SQLite Database** $\rightarrow$ **Audit/Notification** $\rightarrow$ **Socket.IO** $\rightarrow$ **React UI**.
