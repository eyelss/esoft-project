import { Grid, Typography, Box, Skeleton, Alert, Button } from "@mui/material";
import { useEffect } from "react";
import { useAppDispatch } from "../store";
import { useSelector } from "react-redux";
import { fetchRecipes, selectRecipes, selectRecipesLoading, selectRecipesError } from "../features/recipeListSlice";
import EmptyCard from "../components/EmptyCard";
import RecipeCard from "../components/RecipeCard";
import { useSearchParams } from "react-router-dom";
import { parseIntOrDefault } from "../utils/simple";

const responsiveSizes = {
  xs: 13,
  sm: 6,
  md: 3,
}

function Home() {
  const dispatch = useAppDispatch();
  const recipes = useSelector(selectRecipes);
  const loading = useSelector(selectRecipesLoading);
  const error = useSelector(selectRecipesError);
  const [params, setParams] = useSearchParams();

  const pageParam = parseIntOrDefault(params.get('p'), 1);
  const queryParam = params.get('q');
  const authorParam = params.get('a');
  const favoriteParam = params.get('f');

  useEffect(() => {
    dispatch(fetchRecipes({ 
      p: pageParam ?? undefined,
      a: authorParam ?? undefined,
      q: queryParam ?? undefined,
      f: favoriteParam ?? undefined,
    })); 
  }, [
    pageParam, 
    queryParam, 
    authorParam,
    favoriteParam,
    dispatch,
  ]);

  const handlePrevPage = () => {
    setParams(prev => {
      prev.delete('p');
      prev.append('p', (Math.max(pageParam - 1, 1)).toString());
      return prev;
    });
  }

  const handleNextPage = () => {
    setParams(prev => {
      prev.delete('p');
      prev.append('p', (pageParam + 1).toString());
      return prev;
    });
  }

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
        {/* Empty card for creating new recipe - always first 3*/}
        <Grid size={responsiveSizes}>
          <EmptyCard />
        </Grid>
        
        {/* Recipe cards 3*/}
        {recipes.map((recipe) => (
          <Grid size={responsiveSizes} key={recipe.id}>
            <RecipeCard recipe={recipe} />
          </Grid>
        ))}
      </Grid>

      <Box display="flex" justifyContent="center" alignItems="center" mt={2} gap={2}>
      <Button
        variant="contained"
        onClick={handlePrevPage}
        disabled={pageParam === 1}
      >
        Previous
      </Button>
      <span>Page {pageParam}</span>
      <Button
        variant="contained"
        onClick={handleNextPage}
        disabled={recipes.length === 0}
      >
        Next
      </Button>
    </Box>
      
    </Box>
  );
}

export default Home;