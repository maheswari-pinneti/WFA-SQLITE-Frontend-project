# ADR-003: JWT Authentication & Axios Interceptors

## Status
Accepted

## Context
Secure corporate authentication is required to protect enterprise workforce data and enforce role permissions.

## Decision
We implemented JWT Bearer authentication with Axios interceptors (`authInterceptor.ts`) that automatically inject tokens and handle 401 token refresh cycles.
