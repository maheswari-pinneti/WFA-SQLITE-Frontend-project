# Development Guidelines

These guidelines establish coding standards, UI design rules, component hierarchy, and accessibility requirements for contributing to the **Stackly Workforce Analytics Platform**.

---

## 🎨 UI & Design System Standards

1. **Color Engine Tokens**:
   - Primary Blue: `#2563EB`
   - Secondary Indigo: `#4F46E5`
   - Success Emerald: `#22C55E`
   - Warning Amber: `#F59E0B`
   - Error Rose: `#EF4444`
   - Light Mode Background: `#FFFFFF` / `#F8FAFC`
   - Dark Mode Background: `#0F172A` / `#1E293B`

2. **Icon Architecture**:
   - 100% `lucide-react` icons.
   - Sizing rules:
     - Major Navigation & Header Controls: `24px` (`size={24}`)
     - Standard Actions: `20px` (`size={20}`)
     - Table Badges & Inline Hints: `16px` (`size={16}`)
   - Stroke width: `strokeWidth={2}`.

3. **Accessibility**:
   - Include `aria-label` and `title` attributes on all icon buttons.
