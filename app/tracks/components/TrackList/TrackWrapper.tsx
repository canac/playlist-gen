import { createStyles } from "@mantine/core";
import { useEffect, useRef } from "react";
import { useMultiSelectContext } from "../MultiSelectList/MultiSelectList";
import TrackItem from "../TrackItem";
import { TrackWithRelations } from "./types";

const useStyles = createStyles((theme) => ({
  item: {
    borderLeft: "4px solid transparent",
  },
  itemSelected: {
    backgroundColor: theme.colors.blue[1],
  },
  itemActive: {
    borderLeftColor: theme.colors.blue[5],
  },
}));

// Polyfill for the nonstandard Element.scrollIntoViewIfNeeded
// stickyHeaderHeight is the height of the global sticky header
const scrollIntoViewIfNeeded = (element: HTMLElement, stickyHeaderHeight: number) => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry) {
        return;
      }

      const ratio = entry.intersectionRatio;
      if (ratio < 1) {
        element.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
      observer.disconnect();
    },
    { rootMargin: `-${stickyHeaderHeight}px 0px 0px 0px` },
  );
  observer.observe(element);
};

interface TrackWrapperProps {
  track: TrackWithRelations;
}

const TrackWrapper: React.FC<TrackWrapperProps> = ({ track }) => {
  const { classes, cx } = useStyles();

  const { isItemSelected, isActiveItem, getItemProps } =
    useMultiSelectContext<TrackWithRelations>();
  const isActive = isActiveItem(track);
  const isSelected = isItemSelected(track);

  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (ref.current && isActive) {
      scrollIntoViewIfNeeded(ref.current, 80);
    }
  }, [isActive]);

  return (
    <div
      ref={ref}
      className={cx(classes.item, {
        [classes.itemSelected]: isSelected,
        [classes.itemActive]: isActive,
      })}
      {...getItemProps(track)}
    >
      <TrackItem track={track} />
    </div>
  );
};
export default TrackWrapper;
