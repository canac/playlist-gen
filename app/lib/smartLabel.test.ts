import { generatePrismaFilter } from "./smartLabel";

jest.useFakeTimers().setSystemTime(new Date(2022, 3, 1));

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

  describe("supports name", () => {
    names.forEach((name) => {
      expect(generatePrismaFilter(`name:"${name}"`)).toEqual({
        name: { contains: name, mode: "insensitive" },
      });
    });
  });

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

  describe("added", () => {
    it("supports relative dates", () => {
      expect(generatePrismaFilter("added=1d")).toEqual({
        dateAdded: {
          gt: new Date(2022, 2, 31),
          lt: new Date(2022, 3, 2),
        },
      });
      expect(generatePrismaFilter("added=3m")).toEqual({
        dateAdded: {
          gt: new Date(2021, 12, 1),
          lt: new Date(2022, 6, 1),
        },
      });
      expect(generatePrismaFilter("added=5y")).toEqual({
        dateAdded: {
          gt: new Date(2017, 3, 1),
          lt: new Date(2027, 3, 1),
        },
      });

      expect(generatePrismaFilter("added<1d")).toEqual({
        dateAdded: {
          gt: new Date(2022, 2, 31),
        },
      });
      expect(generatePrismaFilter("added<3m")).toEqual({
        dateAdded: {
          gt: new Date(2021, 12, 1),
        },
      });
      expect(generatePrismaFilter("added<5y")).toEqual({
        dateAdded: {
          gt: new Date(2017, 3, 1),
        },
      });

      expect(generatePrismaFilter("added<=1d")).toEqual({
        dateAdded: {
          gte: new Date(2022, 2, 31),
        },
      });
      expect(generatePrismaFilter("added<=3m")).toEqual({
        dateAdded: {
          gte: new Date(2021, 12, 1),
        },
      });
      expect(generatePrismaFilter("added<=5y")).toEqual({
        dateAdded: {
          gte: new Date(2017, 3, 1),
        },
      });

      expect(generatePrismaFilter("added>1d")).toEqual({
        dateAdded: {
          lt: new Date(2022, 2, 31),
        },
      });
      expect(generatePrismaFilter("added>3m")).toEqual({
        dateAdded: {
          lt: new Date(2021, 12, 1),
        },
      });
      expect(generatePrismaFilter("added>5y")).toEqual({
        dateAdded: {
          lt: new Date(2017, 3, 1),
        },
      });

      expect(generatePrismaFilter("added>=1d")).toEqual({
        dateAdded: {
          lte: new Date(2022, 2, 31),
        },
      });
      expect(generatePrismaFilter("added>=3m")).toEqual({
        dateAdded: {
          lte: new Date(2021, 12, 1),
        },
      });
      expect(generatePrismaFilter("added>=5y")).toEqual({
        dateAdded: {
          lte: new Date(2017, 3, 1),
        },
      });
    });

    it("supports absolute dates", () => {
      expect(generatePrismaFilter("added=4-1-2022")).toEqual({
        dateAdded: {
          gte: new Date(2022, 3, 1),
          lt: new Date(2022, 3, 2),
        },
      });
      expect(generatePrismaFilter("added<4-1-2022")).toEqual({
        dateAdded: {
          lt: new Date(2022, 3, 1),
        },
      });
      expect(generatePrismaFilter("added<=4-1-2022")).toEqual({
        dateAdded: {
          lt: new Date(2022, 3, 2),
        },
      });
      expect(generatePrismaFilter("added>4-1-2022")).toEqual({
        dateAdded: {
          gte: new Date(2022, 3, 2),
        },
      });
      expect(generatePrismaFilter("added>=4-1-2022")).toEqual({
        dateAdded: {
          gte: new Date(2022, 3, 1),
        },
      });
    });
  });

  describe("released", () => {
    it("supports relative dates", () => {
      expect(generatePrismaFilter("released=1d")).toEqual({
        album: {
          dateReleased: {
            gt: new Date(2022, 2, 31),
            lt: new Date(2022, 3, 2),
          },
        },
      });
      expect(generatePrismaFilter("released=3m")).toEqual({
        album: {
          dateReleased: {
            gt: new Date(2021, 12, 1),
            lt: new Date(2022, 6, 1),
          },
        },
      });
      expect(generatePrismaFilter("released=5y")).toEqual({
        album: {
          dateReleased: {
            gt: new Date(2017, 3, 1),
            lt: new Date(2027, 3, 1),
          },
        },
      });

      expect(generatePrismaFilter("released<1d")).toEqual({
        album: {
          dateReleased: {
            gt: new Date(2022, 2, 31),
          },
        },
      });
      expect(generatePrismaFilter("released<3m")).toEqual({
        album: {
          dateReleased: {
            gt: new Date(2021, 12, 1),
          },
        },
      });
      expect(generatePrismaFilter("released<5y")).toEqual({
        album: {
          dateReleased: {
            gt: new Date(2017, 3, 1),
          },
        },
      });

      expect(generatePrismaFilter("released<=1d")).toEqual({
        album: {
          dateReleased: {
            gte: new Date(2022, 2, 31),
          },
        },
      });
      expect(generatePrismaFilter("released<=3m")).toEqual({
        album: {
          dateReleased: {
            gte: new Date(2021, 12, 1),
          },
        },
      });
      expect(generatePrismaFilter("released<=5y")).toEqual({
        album: {
          dateReleased: {
            gte: new Date(2017, 3, 1),
          },
        },
      });

      expect(generatePrismaFilter("released>1d")).toEqual({
        album: {
          dateReleased: {
            lt: new Date(2022, 2, 31),
          },
        },
      });
      expect(generatePrismaFilter("released>3m")).toEqual({
        album: {
          dateReleased: {
            lt: new Date(2021, 12, 1),
          },
        },
      });
      expect(generatePrismaFilter("released>5y")).toEqual({
        album: {
          dateReleased: {
            lt: new Date(2017, 3, 1),
          },
        },
      });

      expect(generatePrismaFilter("released>=1d")).toEqual({
        album: {
          dateReleased: {
            lte: new Date(2022, 2, 31),
          },
        },
      });
      expect(generatePrismaFilter("released>=3m")).toEqual({
        album: {
          dateReleased: {
            lte: new Date(2021, 12, 1),
          },
        },
      });
      expect(generatePrismaFilter("released>=5y")).toEqual({
        album: {
          dateReleased: {
            lte: new Date(2017, 3, 1),
          },
        },
      });
    });

    it("supports absolute dates", () => {
      expect(generatePrismaFilter("released=4-1-2022")).toEqual({
        album: {
          dateReleased: {
            gte: new Date(2022, 3, 1),
            lt: new Date(2022, 3, 2),
          },
        },
      });
      expect(generatePrismaFilter("released<4-1-2022")).toEqual({
        album: {
          dateReleased: {
            lt: new Date(2022, 3, 1),
          },
        },
      });
      expect(generatePrismaFilter("released<=4-1-2022")).toEqual({
        album: {
          dateReleased: {
            lt: new Date(2022, 3, 2),
          },
        },
      });
      expect(generatePrismaFilter("released>4-1-2022")).toEqual({
        album: {
          dateReleased: {
            gte: new Date(2022, 3, 2),
          },
        },
      });
      expect(generatePrismaFilter("released>=4-1-2022")).toEqual({
        album: {
          dateReleased: {
            gte: new Date(2022, 3, 1),
          },
        },
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
