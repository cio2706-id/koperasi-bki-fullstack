flowchart TD
    A[User Start] --> B[Select Portal]
    B --> C[Public Portal]
    B --> D[Member Login]
    B --> E[Admin Login]
    C --> F[Submit Payment Request]
    F --> G[Payment Request Created]
    G --> H[Staff Pengadaan Approval]
    H --> I{Approved}
    I -->|Yes| J[Manager Approval]
    I -->|No| K[Request Rejected]
    J --> L{Approved}
    L -->|Yes| M[Bendahara Approval]
    L -->|No| K
    M --> N{Approved}
    N -->|Yes| O[Post to Accurate]
    N -->|No| K
    O --> P[Payment Order Completed]
    D --> Q[Submit Loan Application]
    Q --> R[Loan Application Created]
    R --> S[Manager Approval]
    S --> T{Approved}
    T -->|Yes| U[Bendahara Approval]
    T -->|No| V[Application Rejected]
    U --> W{Approved}
    W -->|Yes| X[Post Loan to Accurate]
    W -->|No| V
    X --> Y[Loan Process Completed]