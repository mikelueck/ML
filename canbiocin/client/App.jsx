import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router';

const RecipeDialog = lazy(() =>  import('./Recipe'));
const RecipeMixDialog = lazy(() =>  import('./RecipeMix'));
const IngredientDialog = lazy(() =>  import('./Ingredient'));
const TabLayout = lazy(() =>  import('./Tabs'));

export function App() {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route name="ingredient" path="/ingredient" element={<IngredientDialog />} />
          <Route name="recipeMix" path="/recipeMix" element={<RecipeMixDialog />} />
          <Route name="recipe" path="/recipe" element={<RecipeDialog />} />
          <Route name="main" path="*" element={<TabLayout />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
