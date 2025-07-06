import { Grid, Typography, Box, Skeleton, Alert } from "@mui/material";
import { useEffect } from "react";
import { useAppDispatch } from "../store";
import { useSelector } from "react-redux";
import { fetchAllRecipes, selectRecipes, selectRecipesLoading, selectRecipesError } from "../features/recipeListSlice";
import EmptyCard from "../components/EmptyCard";
import RecipeCard from "../components/RecipeCard";

function Home() {
  const dispatch = useAppDispatch();
  const recipes = useSelector(selectRecipes);
  const loading = useSelector(selectRecipesLoading);
  const error = useSelector(selectRecipesError);

  useEffect(() => {
    dispatch(fetchAllRecipes());
  }, [dispatch]);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {[...Array(8)].map((_, index) => (
            <Grid size={3} key={index}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Error Loading Recipes
          </Typography>
          <Typography variant="body2">
            {error}
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Empty card for creating new recipe - always first */}
        <Grid size={3}>
          <EmptyCard />
        </Grid>
        
        {/* Recipe cards */}
        {recipes.map((recipe) => (
          <Grid size={3} key={recipe.id}>
            <RecipeCard recipe={recipe} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Home;