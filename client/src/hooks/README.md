# Authentication Hooks & Components

## Overview

This directory contains improved authentication utilities that replace the old `useAuthedRedirect` and `useNonAuthedRedirect` hooks with a more robust, declarative approach.

## New Architecture

### 1. `useAuth` Hook
**File:** `useAuth.ts`

A unified hook that provides authentication state and handles session verification.

```typescript
const { user, loading, isAuthenticated, authStatus } = useAuth();
```

**Returns:**
- `user`: Current user object or null
- `loading`: Boolean indicating if auth check is in progress
- `isAuthenticated`: Boolean indicating if user is logged in
- `authStatus`: 'loading' | 'authenticated' | 'unauthenticated'

### 2. `ProtectedRoute` Component
**File:** `../components/ProtectedRoute.tsx`

A declarative component that handles route protection based on authentication status.

```typescript
// Require authentication
<RequireAuth>
  <ProfilePage />
</RequireAuth>

// Require no authentication (for login/register pages)
<RequireNoAuth>
  <LoginPage />
</RequireNoAuth>

// Custom protection
<ProtectedRoute requireAuth={true} fallbackPath="/custom-login">
  <AdminPage />
</ProtectedRoute>
```

### 3. `useAuthRedirect` Hook
**File:** `useAuthRedirect.ts`

Handles post-authentication redirects, useful for login/register flows.

```typescript
const { loading } = useAuthRedirect({
  redirectTo: '/dashboard',
  preserveQuery: true
});
```

## Migration Guide

### Before (Old Approach)
```typescript
// LoginPage.tsx
function Login() {
  useAuthedRedirect(); // ❌ Side effects in render
  // ...
}

// ProfilePage.tsx
function Profile() {
  useNonAuthedRedirect(); // ❌ Inconsistent patterns
  // ...
}
```

### After (New Approach)
```typescript
// LoginPage.tsx
function Login() {
  const { loading } = useAuthRedirect(); // ✅ Clean, predictable
  
  return (
    <RequireNoAuth> {/* ✅ Declarative protection */}
      <LoginForm />
    </RequireNoAuth>
  );
}

// ProfilePage.tsx
function Profile() {
  return (
    <RequireAuth> {/* ✅ Consistent pattern */}
      <ProfileContent />
    </RequireAuth>
  );
}
```

## Benefits

### ✅ **No Side Effects in Render**
- All redirects happen in `useEffect`
- Predictable component behavior

### ✅ **Loading States**
- Proper handling of authentication loading
- Better UX with loading indicators

### ✅ **Declarative Protection**
- Clear intent in component structure
- Easier to understand and maintain

### ✅ **Consistent Patterns**
- Same approach for all auth-related routing
- Reduced cognitive load

### ✅ **Better Error Handling**
- Graceful handling of edge cases
- Preserved navigation state

### ✅ **Type Safety**
- Full TypeScript support
- Better IDE assistance

## Usage Examples

### Basic Route Protection
```typescript
// In your router
<Route 
  path="/profile" 
  element={
    <RequireAuth>
      <ProfilePage />
    </RequireAuth>
  } 
/>
```

### Custom Redirect Paths
```typescript
<ProtectedRoute requireAuth={true} fallbackPath="/custom-login">
  <AdminPage />
</ProtectedRoute>
```

### Post-Authentication Redirects
```typescript
function LoginPage() {
  const { loading } = useAuthRedirect({
    redirectTo: '/dashboard',
    preserveQuery: true
  });
  
  return (
    <RequireNoAuth>
      <LoginForm disabled={loading} />
    </RequireNoAuth>
  );
}
```

### Accessing Auth State
```typescript
function Header() {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <nav>
      {isAuthenticated ? (
        <span>Welcome, {user?.login}!</span>
      ) : (
        <Link to="/login">Sign In</Link>
      )}
    </nav>
  );
}
``` 