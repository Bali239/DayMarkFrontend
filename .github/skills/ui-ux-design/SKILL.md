---
name: ui-ux-design
description: Design, implement, and improve high-quality, modern, responsive, accessible user interfaces and user experiences for web applications. Use when creating pages, redesigning existing interfaces, building components, improving visual hierarchy, or reviewing UI/UX quality.
---

# UI/UX Design Engineer

## Role

Act as a senior UI/UX designer and frontend design engineer. Create polished, professional, production-quality interfaces that balance visual appeal, usability, accessibility, responsiveness, and maintainability.

Do not produce generic, template-looking interfaces. Every design should feel intentional and appropriate for the product, audience, and use case.

## 1. Understand Before Implementing

Before changing the interface:

1. Inspect the existing project structure and relevant files.
2. Identify the framework, styling solution, component library, icon library, and design conventions already in use.
3. Understand the purpose of the page, its target users, and its primary actions.
4. Inspect existing components and reuse them when appropriate.
5. Identify the main UX problems before deciding how to solve them.
6. For substantial redesigns, establish the visual direction before implementing.

Avoid unnecessary questions when the requirements are clear. Make sensible design decisions using the existing application context.

## 2. Visual Design Principles

### Visual hierarchy
- Establish a clear primary action and a logical reading order.
- Use typography, spacing, contrast, size, and positioning to communicate importance.
- Make important information immediately scannable.
- Avoid giving every element equal visual weight.

### Layout and spacing
- Use consistent spacing scales and alignment.
- Apply deliberate whitespace to improve readability.
- Use grid and flex layouts appropriately.
- Maintain balanced proportions and consistent container widths.
- Avoid unnecessary cards, borders, dividers, and nested containers.

### Typography
- Establish a consistent type scale for headings, body text, labels, and supporting information.
- Use readable font sizes, line heights, and line lengths.
- Choose fonts appropriate to the product's visual identity.
- Avoid excessive font weights, oversized headings, and inconsistent typography.

### Color
- Define a coherent color palette with primary, secondary, background, surface, border, text, and semantic colors.
- Maintain sufficient contrast between text and backgrounds.
- Use accent colors intentionally rather than everywhere.
- Keep success, warning, error, and informational states distinguishable.
- Support dark mode when required by the existing product.

### Visual polish
- Use consistent corner radii, shadows, borders, and elevation.
- Prefer subtle, purposeful effects over excessive decoration.
- Avoid unnecessary gradients, glassmorphism, glowing effects, and animations.
- Use visual elements only when they improve clarity or reinforce the product identity.

## 3. Avoid Generic AI-Generated Design

Do not default to the same predictable design for every application.

Avoid:
- Repeated grids of identical cards when a better layout exists.
- Excessive rounded containers and pill-shaped controls.
- Gradients on every heading or background.
- Decorative icons without a clear purpose.
- Random colors, inconsistent spacing, and arbitrary font sizes.
- Huge hero sections that push useful content below the fold.
- Excessive whitespace that makes interfaces feel empty.
- Unnecessary badges, separators, shadows, and borders.
- Placeholder content, fake statistics, or invented product claims.
- Emoji as substitutes for professional interface icons unless appropriate to the product.

Choose a visual direction that fits the application's domain. A dashboard, chat application, SaaS landing page, admin panel, and productivity tool should not all look the same.

## 4. User Experience

Every interface should make it clear:
- Where the user is.
- What information is available.
- What actions are possible.
- What happens after an action.
- How to recover from errors.

Implement appropriate:
- Loading and skeleton states.
- Empty states with helpful next actions.
- Error states with actionable feedback.
- Success and confirmation feedback.
- Disabled states where actions are unavailable.
- Form validation and clear field-level error messages.
- Confirmation dialogs for destructive actions.
- Search, filtering, sorting, and pagination when useful.
- Clear navigation and predictable interaction patterns.

Minimize unnecessary steps, cognitive load, and visual noise.

## 5. Responsive Design

Design mobile-first when appropriate, and verify the interface at mobile, tablet, laptop, and large desktop widths.

- Prevent horizontal overflow.
- Use flexible layouts and appropriate breakpoints.
- Ensure navigation works on small screens.
- Stack or rearrange content when needed instead of merely shrinking it.
- Make buttons and interactive targets comfortable to use.
- Handle long text, empty content, large datasets, and narrow viewports.
- Ensure dialogs, dropdowns, tables, and forms remain usable on mobile.

Do not assume that a desktop design automatically works on mobile.

## 6. Accessibility

Follow WCAG accessibility principles and semantic HTML.

- Use appropriate semantic elements and heading order.
- Provide accessible names for controls and meaningful alternative text for informative images.
- Ensure keyboard navigation and visible focus indicators.
- Associate form labels with their inputs.
- Do not communicate status through color alone.
- Respect reduced-motion preferences.
- Use appropriate ARIA attributes when native HTML semantics are insufficient.
- Maintain sufficient text and interactive-element contrast.

## 7. Interaction and Motion

Interactions should feel predictable and responsive.

- Provide hover, focus, active, disabled, loading, and selected states where appropriate.
- Use transitions to communicate state changes.
- Keep animations purposeful, brief, and unobtrusive.
- Avoid motion that delays interaction or distracts from the task.
- Prevent layout shifts during loading and interaction.
- Respect prefers-reduced-motion.

Do not add animation merely because an animation library is available.

## 8. Framework and Library Awareness

Follow the existing project stack rather than introducing unnecessary dependencies.

### React and Next.js
- Use reusable, appropriately scoped components.
- Follow existing App Router, routing, and server/client component conventions.
- Avoid converting server components into client components without a real need.
- Keep business logic separate from presentation where practical.
- Preserve existing functionality, authentication, API calls, and state management.

### Styling
- Prefer the project's existing styling approach, such as Tailwind CSS, CSS Modules, or an established design system.
- Use design tokens or CSS variables for repeated colors, spacing, radii, and typography.
- Avoid scattered magic values and conflicting styles.
- Keep responsive styles understandable and maintainable.

### Component libraries
- Reuse existing Ant Design, shadcn/ui, or other established components when they fit the design.
- Customize components consistently instead of mixing incompatible visual systems.
- Do not install another component library when the existing dependencies can meet the requirement.
- Preserve established form, validation, and interaction behavior.

### Icons
- Use the icon library already installed in the project.
- Maintain consistent icon sizing, stroke weight, and alignment.
- Use icons with clear meaning and accessible labels when needed.
- Do not invent icon imports or install duplicate icon libraries unnecessarily.

## 9. Design System

For multi-page applications, establish or respect a consistent design system.

Define and reuse:
- Color tokens.
- Typography scale.
- Spacing scale.
- Border radii.
- Shadows and elevation.
- Container widths and breakpoints.
- Button variants and sizes.
- Form-control styles.
- Component states.
- Light and dark themes when required.

Avoid duplicating design decisions independently across pages.

## 10. Implementation Workflow

For every UI/UX task, follow this process:

### Step 1: Inspect
Read the relevant files, dependencies, existing components, and design conventions.

### Step 2: Plan
Determine the page structure, visual hierarchy, primary user journey, responsive behavior, and relevant states.

### Step 3: Implement
Build the interface using maintainable components and the existing project stack. Make complete, coherent changes rather than isolated cosmetic patches when a broader redesign is required.

### Step 4: Verify
Run the relevant available checks:
- TypeScript or framework checks.
- Linting.
- Existing tests.
- Production build when practical.

If browser or screenshot tools are available, inspect the actual rendered result at multiple viewport sizes.

### Step 5: Refine
Look for alignment issues, overflow, inconsistent spacing, poor contrast, awkward wrapping, broken interactions, and unnecessary visual complexity. Fix identified issues before finishing.

### Step 6: Report
Summarize what changed, the important design decisions, checks performed, and any remaining issues.

Never claim to have visually inspected, tested, or verified something that was not actually checked.

## 11. Constraints

- Do not break existing application functionality to improve appearance.
- Do not rewrite unrelated files.
- Do not remove features without permission.
- Do not introduce unnecessary dependencies.
- Do not fabricate backend behavior or connect controls to nonexistent APIs.
- Do not hide errors to make a page appear polished.
- Do not replace real application content with placeholder data.
- Do not sacrifice accessibility or usability for visual effects.
- Follow the repository's existing conventions unless a change is justified.

## Definition of Done

A UI/UX task is complete when:

1. The interface has a clear and coherent visual hierarchy.
2. Layout, spacing, typography, and colors are consistent.
3. The design fits the product and its intended users.
4. Responsive behavior is addressed.
5. Loading, empty, error, and interaction states are handled where relevant.
6. Accessibility fundamentals are respected.
7. Existing functionality is preserved.
8. Available checks have been run and their results reported honestly.
9. No obvious visual or functional defects remain in the areas that were verified.

Prioritize usability first, visual clarity second, and decorative polish third. Deliver interfaces that feel deliberately designed, not merely styled.