import { ActionIcon, ActionIconProps, Tooltip, createPolymorphicComponent } from "@mantine/core";
import { forwardRef } from "react";

export interface TooltipActionIconProps extends ActionIconProps {
  label: string;
}

// Create intermediate component with default ref type and props
const _TooltipActionIcon = forwardRef<HTMLButtonElement, TooltipActionIconProps>(
  ({ label, ...others }, ref) => (
    <Tooltip label={label}>
      <ActionIcon component="button" aria-label={label} ref={ref} {...others} />
    </Tooltip>
  ),
);

// TooltipActionIcon simplifies the common pattern of a Tooltip that wraps an ActionIcon, applying
// accessibility attributes correctly
export const TooltipActionIcon = createPolymorphicComponent<"button", TooltipActionIconProps>(
  _TooltipActionIcon,
);
