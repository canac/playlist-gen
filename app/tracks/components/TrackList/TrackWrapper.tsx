import clsx from "clsx";
import { useEffect, useRef } from "react";
import { useMultiSelectContext } from "../MultiSelectList/MultiSelectList";
import TrackItem from "../TrackItem";
import classes from "./TrackWrapper.module.css";
import { TrackWithRelations } from "./types";

// Inspired by the nonstandard Element.scrollIntoViewIfNeeded
// stickyHeaderHeight is the height in pixels of the global sticky header
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
      className={clsx(classes.item, {
        [classes.itemSelected!]: isSelected,
        [classes.itemActive!]: isActive,
      })}
      {...getItemProps(track)}
    >
      <TrackItem track={track} />
    </div>
  );
};
export default TrackWrapper;
