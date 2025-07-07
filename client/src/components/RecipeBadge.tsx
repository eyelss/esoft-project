import type { PropsWithChildren } from "react";
import type { ChangeStatus } from "../features/recipeSlice";
import { Badge } from "@mui/material";

type Props = {
    status?: ChangeStatus;
};

type ColorUnion = 'primary' | 'secondary' | 'default' | 'error' | 'info' | 'success' | 'warning';

const colorsTransform = {
    'untouched': 'primary',
    'created': 'primary',
    'modified': 'warning',
    'deleted': 'error',
} satisfies Record<ChangeStatus, ColorUnion>;

function RecipeTitleBadge({ status, children }: PropsWithChildren<Props>) {

    return (
        (status === undefined || status === 'untouched') ? <>{children}</> : (
        <Badge color={colorsTransform[status]} variant="dot">
            {children}
        </Badge>)
    );
}

export default RecipeTitleBadge;