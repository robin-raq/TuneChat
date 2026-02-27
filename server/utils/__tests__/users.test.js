const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("../users");

beforeEach(() => {
  jest.resetModules();
});

describe("users", () => {
  it("userJoin adds a user and returns it", () => {
    const mod = require("../users");
    const user = mod.userJoin("id1", "Alice", "House");
    expect(user).toEqual({ id: "id1", username: "Alice", room: "House" });
    expect(mod.getRoomUsers("House")).toHaveLength(1);
  });

  it("getCurrentUser returns the user by id", () => {
    const mod = require("../users");
    mod.userJoin("id1", "Alice", "House");
    expect(mod.getCurrentUser("id1").username).toBe("Alice");
    expect(mod.getCurrentUser("id2")).toBeUndefined();
  });

  it("userLeave removes user and returns them", () => {
    const mod = require("../users");
    mod.userJoin("id1", "Alice", "House");
    const left = mod.userLeave("id1");
    expect(left.username).toBe("Alice");
    expect(mod.getCurrentUser("id1")).toBeUndefined();
  });

  it("getRoomUsers returns only users in the room", () => {
    const mod = require("../users");
    mod.userJoin("id1", "Alice", "House");
    mod.userJoin("id2", "Bob", "House");
    mod.userJoin("id3", "Carol", "Techno");
    expect(mod.getRoomUsers("House")).toHaveLength(2);
    expect(mod.getRoomUsers("Techno")).toHaveLength(1);
  });
});
