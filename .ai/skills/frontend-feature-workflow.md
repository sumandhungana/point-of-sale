# Skill: Frontend Feature Implementation Workflow

This skill outlines the standard step-by-step procedure for creating a new frontend page or feature in `frontend`.

---

## Workflow Steps

### Step 1: Create the Feature API Service
Location: `src/features/services/<feature>Service.ts`
1. Import `apiService` from `@/infrastructure/utils/ApiService`.
2. Define TypeScript interfaces for requests and responses.
3. Include auth headers via `getAuthHeaders()`.
4. Validate `RestResponse` structure:
```typescript
import { apiService } from "@/infrastructure/utils/ApiService";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface ExampleDto {
  id: number;
  name: string;
  amount: number;
}

export const fetchExamples = async (): Promise<ExampleDto[]> => {
  const res = await apiService.get<{ code: number; message: string; data: ExampleDto[] }>(
    "api/v1/example/list",
    { headers: getAuthHeaders() }
  );

  if (res?.response?.code !== 0 || res?.response?.message !== "SUCCESS") {
    throw new Error(res.error || "Failed to fetch example items");
  }
  return res?.response?.data ?? [];
};
```

### Step 2: Create Page Component
Location: `src/features/<module>/pages/<FeatureName>.tsx`
- Manage form state with React hooks (`useState`, `useEffect`).
- Handle loading states and error notifications via `toast.error` / `toast.success` from `react-toastify`.
- Consume theme settings from `useAppSettings()`.
```typescript
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { fetchExamples, ExampleDto } from "@/features/services/exampleService";
import "@/styles/Example.css";

export const ExamplePage: React.FC = () => {
  const [items, setItems] = useState<ExampleDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchExamples();
      setItems(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="example-container container-fluid p-4">
      <h2>Example Management</h2>
      {loading ? <p>Loading...</p> : (
        <div className="row">
          {items.map(item => (
            <div key={item.id} className="col-md-4 mb-3">
              <div className="card p-3 shadow-sm">
                <h5>{item.name}</h5>
                <p>Amount: {item.amount}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### Step 3: Create Component Stylesheet
Location: `src/styles/<FeatureName>.css`
- Use scoped CSS classes prefixed with component name.
- Support responsive viewport constraints.

### Step 4: Register Route in App.tsx
In `src/App.tsx`:
1. Import the component:
   ```typescript
   import { ExamplePage } from "@/features/<module>/pages/ExamplePage";
   ```
2. Add `<Route>` under protected layout:
   ```tsx
   <Route path="/example" element={<ExamplePage />} />
   ```

### Step 5: Add Sidebar Navigation
In `src/components/Sidebar.tsx`:
- Add navigation item with relevant icon and permissions check:
```tsx
{hasPermission("permission:example:get") && (
  <li className="nav-item">
    <Link to="/example" className="nav-link">
      <i className="bi bi-folder me-2"></i> Example
    </Link>
  </li>
)}
```

### Step 6: Verify Build
Run inside `frontend`:
```bash
npm run build
```
