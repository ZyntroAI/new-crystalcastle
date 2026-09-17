# Enterprise Base Frontend

Stack: Angular + TypeScript/JavaScript + HTML5 + CSS.

## Recommended structure

```text
src/
├── app/
│   ├── core/
│   │   ├── services/
│   │   ├── guards/
│   │   └── interceptors/
│   ├── shared/
│   │   ├── components/
│   │   ├── directives/
│   │   └── pipes/
│   ├── layout/
│   │   ├── header/
│   │   ├── navigation/
│   │   └── shell/
│   ├── features/
│   │   ├── search/
│   │   ├── categories/
│   │   └── recommendations/
│   ├── app.component.html
│   ├── app.component.ts
│   └── app.routes.ts
├── assets/
│   └── img/
├── styles/
│   ├── enterprise-base.css
│   ├── tokens.css
│   └── utilities.css
├── index.html
└── main.ts
```

## Migration notes

- Vue scoped selectors such as `[data-v-xxxx]` were removed.
- Component class names were retained where practical for incremental Angular migration.
- CSS custom properties provide enterprise design tokens.
- Dark mode supports both `.theme-dark` and `[data-theme="dark"]`.
- The source's image asset paths remain compatible with an `assets/img/` layout after path adjustment.
- Angular templates should use semantic HTML5 elements and bind state through Angular rather than embedding framework-generated CSS selectors.
