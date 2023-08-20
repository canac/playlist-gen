import { assert } from "blitz";
import { HTMLAttributes, createContext, useContext, useEffect } from "react";
import { UseMultiSelectInput, UseMultiSelectResult, useMultiSelect } from "./useMultiSelect";

export type GetItemProps<Item extends {}> = (item: Item) => HTMLAttributes<HTMLElement>;
export type HandleKeyDown = (event: KeyboardEvent) => void;

export interface MultiSelectListContext<Item extends {}> extends UseMultiSelectResult<Item> {
  getItemProps: GetItemProps<Item>;
  handleKeyDown: HandleKeyDown;
}

export interface MultiSelectListProps<Item extends {}> extends UseMultiSelectInput<Item> {
  render: React.FC<MultiSelectListContext<Item>>;
}

export const MultiSelectContext = createContext<MultiSelectListContext<any> | null>(null);
MultiSelectContext.displayName = "MultiSelectContext";

export const MultiSelectProvider = MultiSelectContext.Provider;
export const MultiSelectConsumer = MultiSelectContext.Consumer;

export const useMultiSelectContext = <Item extends {}>(): MultiSelectListContext<Item> => {
  const context = useContext<MultiSelectListContext<Item> | null>(MultiSelectContext);
  assert(
    context,
    "useMultiSelectContext() must be called from within a child of a <MultiSelectList> component.",
  );
  return context;
};

const MultiSelectList = <Item extends {}>({ render, ...props }: MultiSelectListProps<Item>) => {
  const result = useMultiSelect(props);
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
  } = result;

  const handleKeyDown = (event: KeyboardEvent) => {
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

  // Return the props that should be applied to each item component to enable interactivity
  const getItemProps: GetItemProps<Item> = (item) => {
    return {
      onMouseDown: (event) => handleStartDrag(event, item),
      onMouseMove: (event) => handleDragging(event, item),
    };
  };

  const context = { ...result, getItemProps, handleKeyDown };
  return <MultiSelectProvider value={context}>{render(context)}</MultiSelectProvider>;
};
export default MultiSelectList;
