import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router';

import { RecipeDialog } from './Recipe';
import { RecipeMixDialog } from './RecipeMix';
import { IngredientDialog } from './Ingredient';
import { TabLayout } from './Tabs';

export function App() {
  return (
    <Router>
        <Routes>
          <Route name="ingredient" path="/ingredient" element={<IngredientDialog />} />
          <Route name="recipeMix" path="/recipeMix" element={<RecipeMixDialog />} />
          <Route name="recipe" path="/recipe" element={<RecipeDialog />} />
          <Route name="main" path="*" element={<TabLayout />} />
        </Routes>
    </Router>
  );
}
