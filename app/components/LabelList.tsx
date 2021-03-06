import {
  faPencil,
  faTrash,
  faWandMagicSparkles,
} from '@fortawesome/free-solid-svg-icons';
import {
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import { Label } from '@prisma/client';
import { ReactNode } from 'react';
import { useLocation, useMatch } from 'react-router';
import { Link, useResolvedPath } from 'remix';
import FaIcon from '~/components/FaIcon';

function LabelLink({
  labelId,
  children,
}: {
  labelId: number | 'new';
  children?: ReactNode;
}): JSX.Element {
  const { search } = useLocation();

  const to = `/labels/${labelId}`;
  const resolved = useResolvedPath(to);
  const match = useMatch({ path: resolved.pathname, end: false });

  return (
    <ListItem
      secondaryAction={
        labelId !== 'new' && (
          <>
            <Link to={`${to}/edit${search}`}>
              <IconButton aria-label="edit">
                <FaIcon icon={faPencil} />
              </IconButton>
            </Link>
            <Link to={`${to}/delete${search}`}>
              <IconButton aria-label="delete" color="error">
                <FaIcon icon={faTrash} />
              </IconButton>
            </Link>
          </>
        )
      }
      // Make the selection go all the way to the edge
      sx={{ paddingRight: 0 }}
    >
      <ListItemButton
        selected={Boolean(match)}
        component={Link}
        to={`${to}${search}`}
      >
        {children}
      </ListItemButton>
    </ListItem>
  );
}

export type LabelListProps = {
  labels: (Label & {
    numTracks: number;
  })[];
};

export default function LabelList(props: LabelListProps): JSX.Element {
  return (
    <List component="nav">
      {props.labels.map((label) => (
        <LabelLink key={label.id} labelId={label.id}>
          <ListItemText
            primary={`${label.name} (${label.numTracks})`}
            secondary={
              label.smartCriteria === null ? null : (
                <>
                  <FaIcon icon={faWandMagicSparkles} /> {label.smartCriteria}
                </>
              )
            }
          />
        </LabelLink>
      ))}
      <LabelLink labelId="new">
        <ListItemText primary={'Create new label...'} />
      </LabelLink>
    </List>
  );
}
