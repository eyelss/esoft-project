import { Card, CardContent, Typography, CardActionArea, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { RecipeListItem } from "../features/recipeListSlice";
import FavoriteIcon from '@mui/icons-material/Favorite';

type RecipeCardProps = {
  recipe: RecipeListItem;
};

function RecipeCard({ recipe }: RecipeCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/recipe/${recipe.id}`);
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 200 }}>
      <CardActionArea 
        onClick={handleClick}
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            {recipe.title}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              flexGrow: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {recipe.description || 'No description available'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', pl: 0, pb: 0 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              By {recipe.owner}
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <FavoriteIcon color={recipe.likedByMe ? 'error' : 'disabled'} fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="body2">{recipe.likes}</Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default RecipeCard;