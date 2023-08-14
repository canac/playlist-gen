import { renderHook } from "@testing-library/react";
import usePrevious from "./usePrevious";

describe("usePrevious", () => {
  it("returns the previous value", () => {
    let value = 0;
    const { result, rerender } = renderHook(() => usePrevious(value));

    expect(result.current).toBeUndefined();

    value = 1;
    rerender();

    expect(result.current).toBe(0);
  });
});
