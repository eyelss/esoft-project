import { alpha, InputBase, styled } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { useState } from "react";

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  }, 
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    [theme.breakpoints.up('sm')]: {
      width: '25ch',
      '&:focus': {
        width: '40ch',
      },
    },
  },
}));

type Props = {
  onSearch?: (query: string) => void;
}

function SearchInput({ onSearch }: Props) {
  const [query, setQuery] = useState('');

  return (
    <Search sx={{ mx: 1 }}>
      <SearchIconWrapper>
        <SearchIcon />
      </SearchIconWrapper>
      <StyledInputBase
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onSearch !== undefined) {
            e.preventDefault();
            onSearch(query);
          }
        }}
        placeholder="Search recipe"
        inputProps={{ 'aria-label': 'search' }}
        onSubmit={() => console.log('search')}
      />
    </Search>
  );
}

export default SearchInput;