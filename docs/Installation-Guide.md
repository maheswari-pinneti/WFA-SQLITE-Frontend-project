# Installation & Setup Guide

This guide details how to clone, install, configure, and execute the **Stackly Workforce Analytics Platform** locally and for production deployments.

---

## 📋 Prerequisites

- **Node.js**: `v18.0.0` or higher (Recommended: `v20.x LTS`)
- **Package Manager**: `npm` `v9.x` or higher

---

## 🛠️ Step-by-Step Installation

### 1. Clone Repository
```bash
git clone https://github.com/maheswari-pinneti/WFA-Rolebased-Architecture.git
cd WFA-Rolebased-Architecture-main
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Local Development Server
```bash
npm run dev
```
The application will launch on `http://localhost:3000/`.

---

## 🏗️ Production Build & Verification Commands

### Type Checking
```bash
npx tsc --noEmit
```

### Production Build
```bash
npm run build
```
Generates production assets under `dist/`.

### Preview Production Build
```bash
npm run preview
```
