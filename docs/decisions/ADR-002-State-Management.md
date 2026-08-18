# ADR-002: State Management with Redux Toolkit

## Status
Accepted

## Context
Predictable global state management is required for authentication, active security role scope, and employee directory data.

## Decision
We adopted **Redux Toolkit** with sliced state (`authSlice`, `hrSlice`, `adminSlice`) for type-safe state mutations and async thunks.
