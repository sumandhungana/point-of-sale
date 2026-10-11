# Frontend Architecture & Coding Rules

The `frontend` is built with **React 18**, **TypeScript**, **Vite**, **React Router v6**, and **Bootstrap 5**.

---

## 1. Directory & Feature Organization

- **Feature-Driven Architecture**:
  - Keep domain components organized inside `src/features/<module>/`:
    - `components/`: UI components specific to the feature.
    - `pages/`: Page-level components bound to routes.
    - Feature services reside in `src/features/services/<serviceName>.ts`.
- **Shared Infrastructure**:
  - `src/infrastructure/utils/ApiService.ts`: Singleton instance for executing HTTP requests.
  - `src/context/`: Context providers (e.g., `AppSettingsContext` for dynamic theme/branding).
  - `src/styles/`: Dedicated CSS files mapped to page components.

---

## 2. API Communication Rules

- **Service Pattern**: Never call `fetch` or `axios` directly in React components. Always encapsulate endpoint calls in a dedicated service function inside `src/features/services/`.
- **Authentication**: Include `getAuthHeaders()` in every protected request:
  ```typescript
  function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
  ```
- **Response Validation**:
  - All backend endpoints return `RestResponse<T>`.
  - Always verify `res?.response?.code === 0` and `res?.response?.message === 'SUCCESS'`:
  ```typescript
  if (res?.response?.code !== 0 || res?.response?.message !== 'SUCCESS') {
    throw new Error(res.error || "Failed to process request");
  }
  return res?.response?.data;
  ```

---

## 3. TypeScript & Type Safety

- **Strict Typing**: Avoid `any`. Create explicit request and response interfaces for each API payload:
  ```typescript
  export interface AddProductRequest {
    name: string;
    categoryId: number;
    sellingPrice: number;
  }
  ```
- **Error Boundaries & Feedback**:
  - Wrap async actions in `try / catch` blocks.
  - Display user-friendly error and success notifications using `react-toastify`.

---

## 4. Styling & Theme Integration

- **Component Styles**: Use dedicated CSS files per page/component (e.g. `AddRentalItem.css`).
- **Dynamic Theming**: Integrate with `useAppSettings()` from `AppSettingsContext` to apply customer-configured primary colors, logo, and currency settings:
  ```typescript
  const { appSettings } = useAppSettings();
  // appSettings.currency, appSettings.dateFormat, appSettings.sideMenuBgColor
  ```
- **Responsive Layout**: Leverage Bootstrap grid (`row`, `col-md-6`, `col-12`) alongside CSS flexbox and responsive breakpoints.
