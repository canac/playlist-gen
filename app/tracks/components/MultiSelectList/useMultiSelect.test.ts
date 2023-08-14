import { act, renderHook } from "@testing-library/react";
import { useMultiSelect } from "./useMultiSelect";

const defaultItems = [0, 1, 2, 3, 4];

describe("useMultiSelect", () => {
  const getKey = (item: number) => item;
  const render = (items: number[] = defaultItems) =>
    renderHook(() => useMultiSelect({ items, getKey }));

  describe("initially", () => {
    it("starts with no active item", () => {
      const { result } = render();

      expect(result.current.activeItem).toBeNull();
    });

    it("starts with no selected items", () => {
      const { result } = render();

      expect(result.current.selectedItems).toEqual([]);
    });
  });

  describe("items", () => {
    it("mirrors the provided items", () => {
      const { result } = render();

      expect(result.current.items).toEqual(defaultItems);
    });
  });

  describe("setActiveItem", () => {
    it("changes the active item", () => {
      const { result } = render();
      act(() => {
        result.current.setActiveItem(2);
      });

      expect(result.current.activeItem).toBe(2);
    });

    it("sets the active item to null for an invalid item", () => {
      const { result } = render();

      act(() => {
        result.current.setActiveItem(5);
      });
      expect(result.current.activeItem).toBeNull();
    });
  });

  describe("isItemSelected", () => {
    it("returns true if the item is selected", () => {
      const { result } = render();
      act(() => {
        result.current.setItemSelected(2, true);
      });

      expect(result.current.isItemSelected(2)).toBe(true);
    });

    it("returns false if the item is not selected", () => {
      const { result } = render();

      expect(result.current.isItemSelected(2)).toBe(false);
    });

    it("returns false if the item is invalid", () => {
      const { result } = render();

      expect(result.current.isItemSelected(-1)).toBe(false);
    });
  });

  describe("next", () => {
    describe("not selecting", () => {
      it("moves the active item to 0 when there is no active item", () => {
        const { result } = render();
        act(() => {
          result.current.next(null);
        });

        expect(result.current.activeItem).toBe(0);
      });

      it("moves the active item forwards", () => {
        const { result } = render();
        act(() => {
          result.current.setActiveItem(0);
        });
        act(() => {
          result.current.next(null);
        });

        expect(result.current.activeItem).toBe(1);
      });

      it("does not move past the end", () => {
        const { result } = render();
        act(() => {
          result.current.setActiveItem(4);
        });
        act(() => {
          result.current.next(null);
        });

        expect(result.current.activeItem).toBe(4);
      });
    });

    describe("selecting", () => {
      it("selects the current active item when there was no previous active item", () => {
        const { result } = render();
        act(() => {
          result.current.next(true);
        });

        expect(result.current.selectedItems).toEqual([0]);
      });

      it("selects the current and previous active items", () => {
        const { result } = render();
        act(() => {
          result.current.setActiveItem(2);
        });
        act(() => {
          result.current.next(true);
        });

        expect(result.current.selectedItems).toEqual([2, 3]);
      });
    });

    describe("deselecting", () => {
      it("deselects the current active item when there was no previous active item", () => {
        const { result } = render();
        act(() => {
          result.current.setAllSelected(true);
        });
        act(() => {
          result.current.next(false);
        });

        expect(result.current.selectedItems).toEqual([1, 2, 3, 4]);
      });

      it("deselects the current and previous active items", () => {
        const { result } = render();
        act(() => {
          result.current.setActiveItem(2);
          result.current.setAllSelected(true);
        });
        act(() => {
          result.current.next(false);
        });

        expect(result.current.selectedItems).toEqual([0, 1, 4]);
      });
    });
  });

  describe("previous", () => {
    describe("not selecting", () => {
      it("moves the active item to 0 when there is no active item", () => {
        const { result } = render();
        act(() => {
          result.current.previous(null);
        });

        expect(result.current.activeItem).toBe(0);
      });

      it("moves the active item backwards", () => {
        const { result } = render();
        act(() => {
          result.current.setActiveItem(1);
        });
        act(() => {
          result.current.previous(null);
        });

        expect(result.current.activeItem).toBe(0);
      });

      it("does not move past the beginning", () => {
        const { result } = render();
        act(() => {
          result.current.setActiveItem(0);
        });
        act(() => {
          result.current.previous(null);
        });

        expect(result.current.activeItem).toBe(0);
      });
    });

    describe("selecting", () => {
      it("selects the current active item when there was no previous active item", () => {
        const { result } = render();
        act(() => {
          result.current.previous(true);
        });

        expect(result.current.selectedItems).toEqual([0]);
      });

      it("selects the current and previous active items", () => {
        const { result } = render();
        act(() => {
          result.current.setActiveItem(2);
        });
        act(() => {
          result.current.previous(true);
        });

        expect(result.current.selectedItems).toEqual([1, 2]);
      });
    });

    describe("deselecting", () => {
      it("deselects the current active item when there was no previous active item", () => {
        const { result } = render();
        act(() => {
          result.current.setAllSelected(true);
        });
        act(() => {
          result.current.previous(false);
        });

        expect(result.current.selectedItems).toEqual([1, 2, 3, 4]);
      });

      it("deselects the current and previous active items", () => {
        const { result } = render();
        act(() => {
          result.current.setActiveItem(2);
          result.current.setAllSelected(true);
        });
        act(() => {
          result.current.previous(false);
        });

        expect(result.current.selectedItems).toEqual([0, 3, 4]);
      });
    });
  });

  describe("bottom", () => {
    describe("not selecting", () => {
      it("moves the active item to the end", () => {
        const { result } = render();
        act(() => {
          result.current.bottom(null);
        });

        expect(result.current.activeItem).toBe(4);
      });
    });

    describe("selecting", () => {
      it("selects all items when there was no previous active item", () => {
        const { result } = render();
        act(() => {
          result.current.bottom(true);
        });

        expect(result.current.selectedItems).toEqual([0, 1, 2, 3, 4]);
      });

      it("selects from the current active item to the bottom", () => {
        const { result } = render();
        act(() => {
          result.current.setActiveItem(2);
        });
        act(() => {
          result.current.bottom(true);
        });

        expect(result.current.selectedItems).toEqual([2, 3, 4]);
      });
    });

    describe("deselecting", () => {
      it("deselects all items when there was no previous active item", () => {
        const { result } = render();
        act(() => {
          result.current.setAllSelected(true);
        });
        act(() => {
          result.current.bottom(false);
        });

        expect(result.current.selectedItems).toEqual([]);
      });

      it("deselects from the current active item to the bottom", () => {
        const { result } = render();
        act(() => {
          result.current.setActiveItem(2);
          result.current.setAllSelected(true);
        });
        act(() => {
          result.current.bottom(false);
        });

        expect(result.current.selectedItems).toEqual([0, 1]);
      });
    });
  });

  describe("top", () => {
    describe("not selecting", () => {
      it("moves the active item to the beginning", () => {
        const { result } = render();
        act(() => {
          result.current.top(null);
        });

        expect(result.current.activeItem).toBe(0);
      });
    });

    describe("selecting", () => {
      it("selects the first item when there was no previous active item", () => {
        const { result } = render();
        act(() => {
          result.current.top(true);
        });

        expect(result.current.selectedItems).toEqual([0]);
      });

      it("selects from the current active item to the top", () => {
        const { result } = render();
        act(() => {
          result.current.setActiveItem(2);
        });
        act(() => {
          result.current.top(true);
        });

        expect(result.current.selectedItems).toEqual([0, 1, 2]);
      });
    });

    describe("deselecting", () => {
      it("deselects the first item when there was no previous active item", () => {
        const { result } = render();
        act(() => {
          result.current.setAllSelected(true);
        });
        act(() => {
          result.current.top(false);
        });

        expect(result.current.selectedItems).toEqual([1, 2, 3, 4]);
      });

      it("deselects from the current active item to the top", () => {
        const { result } = render();
        act(() => {
          result.current.setActiveItem(2);
          result.current.setAllSelected(true);
        });
        act(() => {
          result.current.top(false);
        });

        expect(result.current.selectedItems).toEqual([3, 4]);
      });
    });
  });

  describe("clear", () => {
    it("removes the active item", () => {
      const { result } = render();
      act(() => {
        result.current.setActiveItem(2);
      });
      act(() => {
        result.current.clear();
      });

      expect(result.current.activeItem).toBeNull();
    });
  });

  describe("toggleActiveItemSelected", () => {
    it("does nothing when there is no active item", () => {
      const { result } = render();
      act(() => {
        result.current.toggleActiveItemSelected();
      });

      expect(result.current.selectedItems).toEqual([]);
    });

    it("selects the previously deselected active item active item", () => {
      const { result } = render();
      act(() => {
        result.current.setActiveItem(2);
      });
      act(() => {
        result.current.toggleActiveItemSelected();
      });

      expect(result.current.selectedItems).toEqual([2]);
    });

    it("deselects the previously selected active item active item", () => {
      const { result } = render();
      act(() => {
        result.current.setAllSelected(true);
        result.current.setActiveItem(2);
      });
      act(() => {
        result.current.toggleActiveItemSelected();
      });

      expect(result.current.selectedItems).toEqual([0, 1, 3, 4]);
    });
  });

  describe("setItemSelected", () => {
    it("does nothing when the item is out of bounds", () => {
      const { result } = render();
      act(() => {
        result.current.setItemSelected(-1, true);
        result.current.setItemSelected(5, true);
      });

      expect(result.current.selectedItems).toEqual([]);
    });

    it("selects a deselected item", () => {
      const { result } = render();
      act(() => {
        result.current.setItemSelected(2, true);
      });

      expect(result.current.selectedItems).toEqual([2]);
    });

    it("deselects a selected item", () => {
      const { result } = render();
      act(() => {
        result.current.setAllSelected(true);
      });
      act(() => {
        result.current.setItemSelected(2, false);
      });

      expect(result.current.selectedItems).toEqual([0, 1, 3, 4]);
    });
  });

  describe("setItemSelected", () => {
    it("ignores out of bounds items nothing when the item is out of bounds", () => {
      const { result } = render();
      act(() => {
        result.current.setItemsSelected([-1, 2, 5], true);
      });

      expect(result.current.selectedItems).toEqual([2]);
    });

    it("selects deselected items", () => {
      const { result } = render();
      act(() => {
        result.current.setItemsSelected([2, 3], true);
      });

      expect(result.current.selectedItems).toEqual([2, 3]);
    });

    it("deselects selected items", () => {
      const { result } = render();
      act(() => {
        result.current.setAllSelected(true);
      });
      act(() => {
        result.current.setItemsSelected([2, 3], false);
      });

      expect(result.current.selectedItems).toEqual([0, 1, 4]);
    });
  });

  describe("setAllSelected", () => {
    it("selects all items", () => {
      const { result } = render();
      act(() => {
        result.current.setItemSelected(2, true);
      });
      act(() => {
        result.current.setAllSelected(true);
      });

      expect(result.current.selectedItems).toEqual([0, 1, 2, 3, 4]);
    });

    it("deselects all items", () => {
      const { result } = render();
      act(() => {
        result.current.setItemSelected(2, true);
      });
      act(() => {
        result.current.setAllSelected(false);
      });

      expect(result.current.selectedItems).toEqual([]);
    });
  });

  describe("startDrag", () => {
    describe("selecting", () => {
      it("begins a drag selection", () => {
        const { result } = render();
        act(() => {
          result.current.startDrag(2, true);
        });

        expect(result.current.isDragging).toBe(true);
        expect(result.current.activeItem).toBe(2);
        expect(result.current.selectedItems).toEqual([2]);
      });
    });

    describe("deselecting", () => {
      it("begins a drag selection", () => {
        const { result } = render();
        act(() => {
          result.current.setAllSelected(true);
          result.current.startDrag(2, false);
        });

        expect(result.current.isDragging).toBe(true);
        expect(result.current.activeItem).toBe(2);
        expect(result.current.selectedItems).toEqual([0, 1, 3, 4]);
      });
    });
  });

  describe("continueDrag", () => {
    describe("selecting", () => {
      it("expands a drag selection", () => {
        const { result } = render();
        act(() => {
          result.current.startDrag(2, true);
        });

        act(() => {
          result.current.continueDrag(4);
        });
        expect(result.current.activeItem).toBe(4);
        expect(result.current.selectedItems).toEqual([2, 3, 4]);

        act(() => {
          result.current.continueDrag(0);
        });
        expect(result.current.activeItem).toBe(0);
        expect(result.current.selectedItems).toEqual([0, 1, 2]);
      });
    });

    describe("deselecting", () => {
      it("expands a drag selection", () => {
        const { result } = render();
        act(() => {
          result.current.setAllSelected(true);
          result.current.startDrag(2, false);
        });

        act(() => {
          result.current.continueDrag(4);
        });
        expect(result.current.activeItem).toBe(4);
        expect(result.current.selectedItems).toEqual([0, 1]);

        act(() => {
          result.current.continueDrag(0);
        });
        expect(result.current.activeItem).toBe(0);
        expect(result.current.selectedItems).toEqual([3, 4]);
      });
    });
  });

  describe("abortDrag", () => {
    it("reverts the active item and selected items", () => {
      const { result } = render();
      act(() => {
        result.current.startDrag(2, true);
      });
      act(() => {
        result.current.continueDrag(4);
      });
      act(() => {
        result.current.abortDrag();
      });

      expect(result.current.isDragging).toBe(false);
      expect(result.current.activeItem).toBeNull();
      expect(result.current.selectedItems).toEqual([]);
    });
  });

  describe("commitDrag", () => {
    it("commits the active item and selected items", () => {
      const { result } = render();
      act(() => {
        result.current.startDrag(2, true);
      });
      act(() => {
        result.current.continueDrag(4);
      });
      act(() => {
        result.current.commitDrag();
      });

      expect(result.current.isDragging).toBe(false);
      expect(result.current.activeItem).toBe(4);
      expect(result.current.selectedItems).toEqual([2, 3, 4]);
    });
  });

  describe("changing the items", () => {
    it("resets the current drag", () => {
      const { result, rerender } = renderHook(
        ({ items }: { items: number[] }) => useMultiSelect({ items, getKey }),
        { initialProps: { items: [] } },
      );

      act(() => {
        result.current.startDrag(2, true);
      });
      rerender({ items: [] });

      expect(result.current.isDragging).toBe(false);
    });

    it("preserves the active item when the active item is kept", () => {
      const { result, rerender } = renderHook(
        ({ items }: { items: number[] }) => useMultiSelect({ items, getKey }),
        { initialProps: { items: [0, 1, 2, 3, 4] } },
      );

      act(() => {
        result.current.setActiveItem(2);
      });
      rerender({ items: [1, 2, 3, 4, 5] });

      expect(result.current.activeItem).toBe(2);
    });

    it("clears the active item when the active item is removed", () => {
      const { result, rerender } = renderHook(
        ({ items }: { items: number[] }) => useMultiSelect({ items, getKey }),
        { initialProps: { items: [0, 1, 2, 3, 4] } },
      );

      act(() => {
        result.current.setActiveItem(2);
      });
      rerender({ items: [0, 1, 4] });

      expect(result.current.activeItem).toBeNull();
    });

    it("preserves selected items", () => {
      const { result, rerender } = renderHook(
        ({ items }: { items: number[] }) => useMultiSelect({ items, getKey }),
        { initialProps: { items: [0, 1, 2, 3, 4] } },
      );

      act(() => {
        result.current.setActiveItem(2);
        result.current.setItemsSelected([0, 2, 4], true);
        result.current.startDrag(2, true);
      });
      rerender({ items: [1, 2, 3, 4, 5] });

      expect(result.current.selectedItems).toEqual([2, 4]);
    });
  });
});
