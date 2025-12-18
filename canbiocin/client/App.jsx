import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router';

const FormulationDialog = lazy(() =>  import('./Formulation'));
const RecipeMixDialog = lazy(() =>  import('./RecipeMix'));
const IngredientDialog = lazy(() =>  import('./Ingredient'));
const PackagingDialog = lazy(() =>  import('./PackagingItem'));
const TabLayout = lazy(() =>  import('./Tabs'));

import { useAuth0 } from "./auth.js"
import { requiresAuth } from "./auth.js"

import Loading from "./Loading";
import LoginButton from "./Login";

export function App() {
  const { user, isAuthenticated, isLoading, error } = useAuth0();

  if (requiresAuth && isLoading) {
    return ( <Loading /> )
  }

  if (requiresAuth && !isLoading && !isAuthenticated) {
    return (
      <LoginButton />
    )
  }

  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route name="ingredient" path="/ingredient" element={<IngredientDialog />} />
          <Route name="packaging" path="/packaging" element={<PackagingDialog />} />
          <Route name="recipeMix" path="/recipeMix" element={<RecipeMixDialog />} />
          <Route name="recipe" path="/recipe" element={<FormulationDialog />} />
          <Route name="main" path="*" element={<TabLayout />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
