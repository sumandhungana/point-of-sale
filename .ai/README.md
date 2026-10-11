# Point of Sale (KhataBook) - AI Developer Context & Knowledge System

This `.ai/` directory provides comprehensive context, architectural rules, step-by-step developer skills, and domain models for AI assistants and software engineers working on the Point of Sale & KhataBook platform.

---

## Structure Overview

```
.ai/
├── README.md                          # Directory map and usage guide
├── rules/                             # Behavioral standards, conventions & coding guidelines
│   ├── general.md                     # General programming, Git, security & clean code practices
│   ├── backend-rules.md               # Micronaut 4, Java 21, Reactor, R2DBC & Clean Architecture rules
│   └── frontend-rules.md              # React 18, TypeScript, Vite, ApiService & Component conventions
├── skills/                            # Step-by-step actionable workflows for common developer tasks
│   ├── backend-usecase-workflow.md    # Creating new backend endpoints, use cases, and repositories
│   ├── frontend-feature-workflow.md   # Creating new frontend pages, services, and route bindings
│   ├── database-migrations.md         # SQL schema patches, sequences, and R2DBC entity updates
│   └── docker-testing-workflow.md     # Local multi-container development and verification
└── domain/                            # Business domain knowledge, concepts, and algorithms
    ├── domain-overview.md             # Multi-tenancy (Member), core system modules & architecture
    ├── sales-inventory-domain.md      # Products, stock alerts, sales bills, and purchase bills
    ├── parties-and-ledger-domain.md   # Customers, Suppliers, KhataBook "You Gave / You Received" logic
    ├── rental-and-services-domain.md  # Rental management, services, staff & salary workflows
    └── security-and-rbac-domain.md    # JWT authentication, RBAC permissions, and SecurityInterceptor
```

---

## How to Use This Knowledge Base

1. **For Feature Implementation**:
   - Check [domain/](file:///d:/POS/point-of-sale/.ai/domain) to understand business rules, data models, and logic.
   - Follow the relevant workflow in [skills/](file:///d:/POS/point-of-sale/.ai/skills).
   - Verify code against [rules/](file:///d:/POS/point-of-sale/.ai/rules).

2. **For Debugging and Refactoring**:
   - Inspect [backend-rules.md](file:///d:/POS/point-of-sale/.ai/rules/backend-rules.md) for reactive pipeline handling (`Mono`/`Flux`) and security context propagation.
   - Inspect [parties-and-ledger-domain.md](file:///d:/POS/point-of-sale/.ai/domain/parties-and-ledger-domain.md) for balance computation logic.
