import { Key, useCallback, useEffect, useMemo, useState } from "react";
import usePrevious from "./usePrevious";

interface DragState {
  start: number;
  end: number;
  selecting: boolean;
}

export interface UseMultiSelectInput<Item extends {}> {
  items: Item[];
  getKey: (item: Item) => Key;
}

export interface UseMultiSelectResult<Item extends {}> {
  items: Item[];
  activeItem: Item | null;
  isActiveItem: (item: Item) => boolean;
  setActiveItem: (item: Item) => void;
  selectedItems: Item[];
  isItemSelected: (item: Item) => boolean;
  next: (selecting: boolean | null) => void;
  previous: (selecting: boolean | null) => void;
  bottom: (selecting: boolean | null) => void;
  top: (selecting: boolean | null) => void;
  clear: () => void;
  toggleActiveItemSelected: () => void;
  setItemSelected: (item: Item, selected: boolean) => void;
  setItemsSelected: (items: Item[], selected: boolean) => void;
  setAllSelected: (selected: boolean) => void;
  isDragging: boolean;
  startDrag: (item: Item, selecting: boolean) => void;
  continueDrag: (item: Item) => void;
  commitDrag: () => void;
  abortDrag: () => void;
}

export const useMultiSelect = <Item extends {}>({
  items,
  getKey,
}: UseMultiSelectInput<Item>): UseMultiSelectResult<Item> => {
  const [activeIndex, setActiveIndexRaw] = useState<number | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<ReadonlyMap<Key, boolean>>(
    new Map(items.map((item) => [getKey(item), false])),
  );
  const [currentDrag, setCurrentDrag] = useState<DragState | null>(null);

  // Return the items between index1 and index2, inclusive, regardless of whether index1 or index 2 is larger
  const getItemRange = useCallback(
    (index1: number, index2: number): Item[] => {
      const first = Math.min(index1, index2);
      const last = Math.max(index1, index2);
      return items.slice(first, last + 1);
    },
    [items],
  );

  // Set the active index, clamp it within the allowed bounds, and return the normalized new active index
  const setActiveIndex = useCallback(
    (index: number): number | null => {
      const newActiveIndex =
        items.length === 0 ? null : Math.max(0, Math.min(index, items.length - 1));
      setActiveIndexRaw(newActiveIndex);
      return newActiveIndex;
    },
    [items.length],
  );

  const setActiveItem = useCallback(
    (item: Item) => {
      const key = getKey(item);
      const newActiveIndex = items.findIndex((item) => getKey(item) === key);
      setActiveIndexRaw(newActiveIndex === -1 ? null : newActiveIndex);
    },
    [getKey, items],
  );

  const previousItems = usePrevious(items);

  useEffect(() => {
    const previousKeys = new Set((previousItems ?? []).map((item) => getKey(item)));
    setSelectedKeys(
      (selectedKeys) =>
        new Map([
          ...items.map((item) => [getKey(item), false] as const),
          ...Array.from(selectedKeys.entries()).filter(([key]) => previousKeys.has(key)),
        ]),
    );

    if (previousItems && activeIndex !== null) {
      const activeItem = previousItems[activeIndex];
      if (typeof activeItem !== "undefined") {
        setActiveItem(activeItem);
      }
    }

    setCurrentDrag(null);
  }, [activeIndex, getKey, items, previousItems, setActiveItem]);

  const move = (index: number, selecting: boolean | null) => {
    const oldIndex = activeIndex ?? 0;
    const newIndex = setActiveIndex(index);
    if (selecting !== null && newIndex !== null) {
      setItemsSelected(getItemRange(oldIndex, newIndex), selecting);
    }
  };

  const next = (selecting: boolean | null) => {
    move(activeIndex === null ? 0 : activeIndex + 1, selecting);
  };

  const previous = (selecting: boolean | null) => {
    move(activeIndex === null ? 0 : activeIndex - 1, selecting);
  };

  const top = (selecting: boolean | null) => {
    move(0, selecting);
  };

  const bottom = (selecting: boolean | null) => {
    move(items.length - 1, selecting);
  };

  const clear = () => {
    setActiveIndexRaw(null);
  };

  const setItemSelected = (item: Item, selected: boolean) => {
    setItemsSelected([item], selected);
  };

  const setItemsSelected = useCallback(
    (items: Item[], selected: boolean) => {
      setSelectedKeys(
        (selectedKeys) =>
          new Map([
            ...selectedKeys,
            ...items
              .map((item) => [getKey(item), selected] as const)
              .filter(([key]) => selectedKeys.has(key)),
          ]),
      );
    },
    [getKey],
  );

  const toggleItemSelected = (item: Item) => {
    const selected = selectedKeys.get(getKey(item));
    if (typeof selected !== "undefined") {
      setItemSelected(item, !selected);
    }
  };

  const toggleActiveItemSelected = () => {
    if (activeIndex !== null) {
      const item = items[activeIndex];
      if (item) {
        toggleItemSelected(item);
      }
    }
  };

  const setAllSelected = (selected: boolean) => {
    setSelectedKeys(new Map(items.map((item) => [getKey(item), selected])));
  };

  const startDrag = (item: Item, selecting: boolean) => {
    const key = getKey(item);
    const index = items.findIndex((item) => getKey(item) === key);
    if (index !== -1) {
      setCurrentDrag({
        start: index,
        end: index,
        selecting,
      });
    }
  };

  const continueDrag = (item: Item) => {
    if (!currentDrag) {
      return;
    }

    const key = getKey(item);
    const index = items.findIndex((item) => getKey(item) === key);
    if (index !== -1) {
      setCurrentDrag({ ...currentDrag, end: index });
    }
  };

  const commitDrag = useCallback(() => {
    if (!currentDrag) {
      return;
    }

    setItemsSelected(getItemRange(currentDrag.start, currentDrag.end), currentDrag.selecting);
    setActiveIndex(currentDrag.end);
    setCurrentDrag(null);
  }, [currentDrag, getItemRange, setActiveIndex, setItemsSelected]);

  const abortDrag = () => {
    setCurrentDrag(null);
  };

  // Calculate the selected keys, including ones in the drag selection
  const selectedKeysWithDrag = useMemo(() => {
    if (!currentDrag) {
      return selectedKeys;
    }

    return new Map([
      ...selectedKeys,
      ...getItemRange(currentDrag.start, currentDrag.end).map(
        (item) => [getKey(item), currentDrag.selecting] as const,
      ),
    ]);
  }, [currentDrag, selectedKeys, getItemRange, getKey]);

  const activeItem = useMemo((): Item | null => {
    const index = currentDrag?.end ?? activeIndex;
    if (index === null) {
      return null;
    }

    const activeItem = items[index];
    return activeItem ?? null;
  }, [activeIndex, currentDrag?.end, items]);

  const isActiveItem = useCallback(
    (item: Item): boolean => activeItem !== null && getKey(item) === getKey(activeItem),
    [activeItem, getKey],
  );

  const isItemSelected = useCallback(
    (item: Item): boolean => selectedKeysWithDrag.get(getKey(item)) ?? false,
    [getKey, selectedKeysWithDrag],
  );

  const selectedItems = useMemo(
    () => items.filter((item) => isItemSelected(item)),
    [isItemSelected, items],
  );

  return {
    items,
    activeItem,
    isActiveItem,
    setActiveItem,
    selectedItems,
    isItemSelected,
    next,
    previous,
    bottom,
    top,
    clear,
    toggleActiveItemSelected,
    setItemSelected,
    setItemsSelected,
    setAllSelected,
    isDragging: Boolean(currentDrag),
    startDrag,
    continueDrag,
    commitDrag,
    abortDrag,
  };
};
