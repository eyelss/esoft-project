import { ListItemButton } from "@mui/material";
import type React from "react";
import type { PropsWithChildren } from "react";
import type { ChangeStatus } from "../features/recipeSlice";

type Props = {
  key?: string;
  status: ChangeStatus;
  onClick?: React.MouseEventHandler<HTMLDivElement>,
}

const mappedColor: Record<ChangeStatus, string> = {
  created: 'green',
  modified: 'yellow',
  deleted: 'red',
  untouched: ''
}

const ListItemButtonStep = ({ children, key, onClick, status }: PropsWithChildren<Props>) => {
  return (
    <ListItemButton
      key={key}
      onClick={onClick}
      sx={{
        backgroundColor: mappedColor[status],
      }}
    >
      {children}
    </ListItemButton>
  );
}

export default ListItemButtonStep;