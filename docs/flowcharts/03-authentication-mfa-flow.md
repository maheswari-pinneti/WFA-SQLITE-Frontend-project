# 🔐 Authentication & MFA Sequence Flow

This sequence flowchart outlines the specific multi-step verification: login submission, domain verification, password hash matching, generating MFA/OTP challenges, user verification, and issuing session keys.

```mermaid
sequenceDiagram
    autonumber
    title Authentication & MFA Security Flow
    actor User
    participant View as Login Page (View)
    participant Pres as Auth Presenter / Service
    participant MFA as MFA Gateway
    participant JWT as JWT Issuer
    participant DB as MongoDB Database

    User->>View: Enter Email (e.g. admin@thestackly.com) & Password
    View->>Pres: Submit Credentials
    
    alt Invalid Corporate Domain
        Pres-->>View: Reject (Domain Access Denied)
        View-->>User: Display Error: Access Permitted for Corporate Domains Only
    else Valid Corporate Domain
        Pres->>DB: Query User Password Hash
        DB-->>Pres: Return User Data + Hash
        
        alt Password Mismatch
            Pres-->>View: Authentication Failed
            View-->>User: Display Error: Invalid Credentials
        else Password Verified
            Pres->>MFA: Trigger MFA Challenge (OTP Code)
            MFA-->>User: Send 6-Digit Code (Simulated in logs / email)
            User->>View: Enter OTP Code
            View->>Pres: Submit OTP Code
            
            alt OTP Code Invalid
                Pres-->>View: Display Error: Verification Code Invalid
            else OTP Code Valid
                Pres->>JWT: Request Tokens
                JWT-->>Pres: Return Access Token + Refresh Token
                Pres->>View: Store Token in Client State & LocalStorage
                View-->>User: Display Scoped Role Dashboard
            end
        end
    end
```
