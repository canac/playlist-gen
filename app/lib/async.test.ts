import { resolves } from "./async";

describe("resolves", () => {
  it("returns true if the promise resolves", async () => {
    await expect(resolves(Promise.resolve())).resolves.toBe(true);
  });

  it("returns false if the promise rejects", async () => {
    await expect(resolves(Promise.reject())).resolves.toBe(false);
  });
});
