# ADR-004: Enterprise Role-Based Access Control (RBAC)

## Status
Accepted

## Context
The platform requires strict permission enforcement across 5 security roles (`ADMIN`, `HR`, `TEAM_MANAGER`, `TEAM_LEAD`, `EMPLOYEE`).

## Decision
We implemented a central permission matrix (`permissionMatrix.ts`) combined with high-order `<RoleGuard />` components to conditionally render UI regions and guard router paths.
