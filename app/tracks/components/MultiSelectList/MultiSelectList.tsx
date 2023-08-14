import { HTMLAttributes, useEffect } from "react";
import { UseMultiSelectInput, UseMultiSelectResult, useMultiSelect } from "./useMultiSelect";

export type GetContainerProps = (props: HTMLAttributes<HTMLElement>) => HTMLAttributes<HTMLElement>;
export type GetItemProps<Item extends {}> = (item: Item) => HTMLAttributes<HTMLElement>;

export interface RenderProps<Item extends {}> extends UseMultiSelectResult<Item> {
  getContainerProps: GetContainerProps;
  getItemProps: GetItemProps<Item>;
}

export interface MultiSelectListProps<Item extends {}> extends UseMultiSelectInput<Item> {
  render: React.FC<RenderProps<Item>>;
}

const MultiSelectList = <Item extends {}>({ render, ...props }: MultiSelectListProps<Item>) => {
  const context = useMultiSelect(props);
  const {
    setActiveItem,
    isItemSelected,
    next,
    previous,
    bottom,
    top,
    clear,
    toggleActiveItemSelected,
    setItemSelected,
    setAllSelected,
    isDragging,
    startDrag,
    continueDrag,
    commitDrag,
    abortDrag,
  } = context;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    abortDrag();

    const selecting = event.shiftKey ? !event.ctrlKey : null;
    if (event.key === "ArrowDown") {
      if (event.metaKey) {
        bottom(selecting);
      } else {
        next(selecting);
      }
    } else if (event.key === "ArrowUp") {
      if (event.metaKey) {
        top(selecting);
      } else {
        previous(selecting);
      }
    } else if (event.key === "Escape") {
      clear();
    } else if (event.key === " ") {
      toggleActiveItemSelected();
    } else if (event.key === "a") {
      if (event.metaKey) {
        const selected = !event.ctrlKey;
        setAllSelected(selected);
        if (selected) {
          bottom(null);
        } else {
          clear();
        }
      }
    } else {
      return;
    }

    event.preventDefault();
  };

  useEffect(() => {
    document.addEventListener("mouseup", commitDrag);
    document.addEventListener("blur", commitDrag);

    return () => {
      document.removeEventListener("mouseup", commitDrag);
      document.removeEventListener("blur", commitDrag);
    };
  }, [commitDrag]);

  const handleStartDrag = (event: React.MouseEvent<HTMLElement>, item: Item) => {
    if (event.metaKey) {
      startDrag(item, !isItemSelected(item));
    } else {
      setAllSelected(false);
      setActiveItem(item);
      setItemSelected(item, true);
    }
  };

  const handleDragging = (event: React.MouseEvent<HTMLElement>, item: Item) => {
    if (isDragging) {
      continueDrag(item);
      event.preventDefault();
    }
  };

  // Return the props that should be applied to the root component to enable interactivity
  // The other props for the container should be passed in to ensure that event listeners aren't overwritten
  const getContainerProps: GetContainerProps = (props) => {
    return {
      tabIndex: 0,
      ...props,
      onKeyDown: (event) => {
        // Call both keydown handlers if one was provided
        props.onKeyDown?.(event);
        handleKeyDown(event);
      },
    };
  };

  // Return the props that should be applied to each item component to enable interactivity
  const getItemProps: GetItemProps<Item> = (item) => {
    return {
      onMouseDown: (event) => handleStartDrag(event, item),
      onMouseMove: (event) => handleDragging(event, item),
    };
  };

  return render({ ...context, getContainerProps, getItemProps });
};
export default MultiSelectList;
