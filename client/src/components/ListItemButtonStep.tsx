import { Badge, IconButton, ListItem, ListItemButton } from "@mui/material";
import type React from "react";
import { type PropsWithChildren } from "react";
import type { ChangeStatus } from "../features/recipeSlice";
import DeleteIcon from '@mui/icons-material/Delete';


type Props = {
  itemKey?: string;
  status: ChangeStatus;
  onClick?: React.MouseEventHandler<HTMLDivElement>,
  onClickDelete?: React.MouseEventHandler<HTMLButtonElement>
  deletable?: boolean;
}

const ListItemButtonStep = ({ children, itemKey, onClick, status, deletable, onClickDelete }: PropsWithChildren<Props>) => {

  return (
    <ListItem sx={{ p: 0 }} secondaryAction={deletable && 
      <IconButton edge="end" aria-label="delete" onClick={onClickDelete}>
        <DeleteIcon/>
      </IconButton>
    }>
    <ListItemButton
      key={itemKey}
      onClick={onClick}
      sx={{ 
        whiteSpace: 'normal',
        alignItems: 'flex-start',
      }}
    >
      <Badge 
        variant="dot" 
        invisible={status === 'untouched'}
        color={
          status === 'created' ? 'success' :
          status === 'modified' ? 'warning' :
          status === 'deleted' ? 'error' : 'default'
        } 
        anchorOrigin={{
          horizontal: 'left',
        }}
      >
        {children}
      </Badge>
    </ListItemButton>
    </ListItem>
  );
}

export default ListItemButtonStep;