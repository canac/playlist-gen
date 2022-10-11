import { generatePrismaFilter } from "./smartLabel";

describe("validateSmartCriteria", () => {
  describe("supports clean", () => {
    expect(generatePrismaFilter("clean")).toEqual({ explicit: false });
  });

  describe("supports explicit", () => {
    expect(generatePrismaFilter("explicit")).toEqual({ explicit: true });
  });

  describe("supports unlabeled", () => {
    expect(generatePrismaFilter("unlabeled")).toEqual({ labels: { none: {} } });
  });

  const names = ["Name", "Name with space", "&&:||:()"];

  describe("supports label", () => {
    names.forEach((name) => {
      expect(generatePrismaFilter(`label:"${name}"`)).toEqual({ labels: { some: { name } } });
    });
  });

  describe("supports album", () => {
    names.forEach((name) => {
      expect(generatePrismaFilter(`album:"${name}"`)).toEqual({ album: { name } });
    });
  });

  describe("supports artist", () => {
    names.forEach((name) => {
      expect(generatePrismaFilter(`artist:"${name}"`)).toEqual({ artists: { some: { name } } });
    });
  });

  const comparisonOperators = ["<=", ">=", "<", ">", "="];

  describe("added", () => {
    it("supports relative dates", () => {
      comparisonOperators.forEach((operator) => {
        expect(generatePrismaFilter(`added${operator}1d`)).not.toBe(null);
        expect(generatePrismaFilter(`added${operator}5m`)).not.toBe(null);
        expect(generatePrismaFilter(`added${operator}10y`)).not.toBe(null);
      });
    });

    it("supports absolute dates", () => {
      comparisonOperators.forEach((operator) => {
        expect(generatePrismaFilter(`added${operator}2020`)).not.toBe(null);
        expect(generatePrismaFilter(`added${operator}1-1-2020`)).not.toBe(null);
        expect(generatePrismaFilter(`added${operator}11-11-2020`)).not.toBe(null);
      });
    });
  });

  describe("released", () => {
    it("supports relative date", () => {
      comparisonOperators.forEach((operator) => {
        expect(generatePrismaFilter(`released${operator}1d`)).not.toBe(null);
        expect(generatePrismaFilter(`released${operator}5m`)).not.toBe(null);
        expect(generatePrismaFilter(`released${operator}10y`)).not.toBe(null);
      });
    });

    it("supports absolute dates", () => {
      comparisonOperators.forEach((operator) => {
        expect(generatePrismaFilter(`released${operator}2020`)).not.toBe(null);
        expect(generatePrismaFilter(`released${operator}1-1-2020`)).not.toBe(null);
        expect(generatePrismaFilter(`released${operator}11-11-2020`)).not.toBe(null);
      });
    });
  });

  const clean = { explicit: false };

  it("supports !", () => {
    expect(generatePrismaFilter(`!clean`)).toEqual({ NOT: clean });
  });

  describe("supports &&", () => {
    expect(generatePrismaFilter(`clean && clean`)).toEqual({
      AND: [clean, clean],
    });
  });

  describe("supports ||", () => {
    expect(generatePrismaFilter(`clean || clean`)).toEqual({
      OR: [clean, clean],
    });
  });

  describe("supports parentheses", () => {
    expect(generatePrismaFilter(`!(clean || (clean && (!clean) || clean))`)).toEqual({
      NOT: {
        OR: [
          clean,
          {
            OR: [{ AND: [clean, { NOT: clean }] }, clean],
          },
        ],
      },
    });
  });

  it("doesn't throw with invalid input", () => {
    expect(generatePrismaFilter('label:"name')).toBe(null);
  });
});
