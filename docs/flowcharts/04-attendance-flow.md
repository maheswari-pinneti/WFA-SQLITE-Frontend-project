# ⏱️ Attendance Lifecycle, Offline Sync & Geofencing Flowchart

This flowchart outlines the attendance check-in, break, resume, check-out process, coordinate extraction, geofence check, offline persistence queue sync, idempotency validation, and UI updates.

```mermaid
flowchart TD
    EMP["Employee"] --> ACTION{"Attendance Action"}
    
    ACTION --> CHECKIN["Check-In"]
    ACTION --> BREAK["Break"]
    ACTION --> RESUME["Resume"]
    ACTION --> CHECKOUT["Check-Out"]
    
    CHECKIN --> LOCATION["Get Employee Location"]
    LOCATION --> DISTANCE["Calculate Distance"]
    DISTANCE --> GEOFENCE{"Inside Office Geofence?"}
    
    GEOFENCE -->|NO| REJECT["Reject Attendance"]
    REJECT --> ALERT["Security Alert"]
    ALERT --> AUDIT1["Audit Log"]
    
    GEOFENCE -->|YES| NETWORK{"Network Available?"}
    
    NETWORK -->|NO| QUEUE["Local Offline Queue"]
    QUEUE --> NETWORK_RESTORE["Network Restored"]
    NETWORK_RESTORE --> SYNC["Synchronize"]
    
    NETWORK -->|YES| VALIDATE["Backend Validation"]
    SYNC --> VALIDATE
    
    VALIDATE --> IDEMPOTENCY{"Duplicate Action?"}
    
    IDEMPOTENCY -->|YES| DUPLICATE["Reject Duplicate"]
    IDEMPOTENCY -->|NO| SAVE["Save Attendance"]
    
    SAVE --> DB["MongoDB"]
    DB --> AUDIT2["Audit Log"]
    DB --> NOTIFICATION["Notification"]
    DB --> SOCKET["Socket.IO Event"]
    SOCKET --> DASHBOARD["Live Dashboard Update"]
    
    BREAK --> VALIDATE
    RESUME --> VALIDATE
    CHECKOUT --> VALIDATE
```
