import { Box, Button, Checkbox, Group, Modal } from "@mantine/core";
import { useEffect, useState } from "react";

export interface ConfirmDeleteModalProps {
  opened: boolean;
  hasPlaylist: boolean;
  closeModal: () => void;
  confirmDelete: (deletePlaylist: boolean) => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  opened,
  hasPlaylist,
  closeModal,
  confirmDelete,
}) => {
  const [deletePlaylist, setDeletePlaylist] = useState(false);

  useEffect(() => {
    setDeletePlaylist(false);
  }, [opened]);

  return (
    <Modal opened={opened} onClose={closeModal} title="Confirm Delete" centered>
      <Box mb="md">Are you sure you want to delete this label?</Box>
      {hasPlaylist && (
        <Checkbox
          mb="md"
          label="Do you also want to delete the Spotify playlist?"
          checked={deletePlaylist}
          onChange={(event) => setDeletePlaylist(event.target.checked)}
        />
      )}
      <Group justify="flex-end">
        <Button variant="default" onClick={closeModal}>
          Cancel
        </Button>
        <Button
          color="red"
          onClick={() => {
            closeModal();
            confirmDelete(hasPlaylist && deletePlaylist);
          }}
        >
          Delete
        </Button>
      </Group>
    </Modal>
  );
};
export default ConfirmDeleteModal;
