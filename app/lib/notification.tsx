import { showNotification } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";

export const successNotification = (message: string) => {
  showNotification({
    message,
    color: "green",
    icon: <IconCheck />,
  });
};

export const failureNotification = (message: string) => {
  showNotification({
    message,
    color: "red",
    icon: <IconX />,
  });
};

export const displayError = (error: unknown) => {
  failureNotification(error instanceof Error ? error.message : "An unknown error occurred");
};
