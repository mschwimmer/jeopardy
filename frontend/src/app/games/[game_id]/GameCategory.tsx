import Grid from "@mui/material/Grid2";
import { Typography } from "@mui/material";

interface GameCategoryProps {
  category: string;
}

const GameCategory: React.FC<GameCategoryProps> = ({ category }) => {
  return (
    <Grid
      size={{ xs: 12 / 5 }}
      sx={(theme) => ({
        display: "flex",
        height: "16.67%",
        alignItems: "center",
        textAlign: "center",
        border: `2px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.primary.main,
        justifyContent: "center",
      })}
    >
      <Typography variant="h4">{category}</Typography>
    </Grid>
  );
};

export default GameCategory;
