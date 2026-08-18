# ADR-001: Modular Feature-Based Frontend Architecture

## Status
Accepted

## Context
The application needs to scale across multiple enterprise roles (`ADMIN`, `HR`, `TEAM_MANAGER`, `TEAM_LEAD`, `EMPLOYEE`), maintaining clean code boundaries and independent feature modules.

## Decision
We adopted a modular feature-based folder architecture (`src/features/<module>/`) where each domain contains its own pages, components, and slice state.
