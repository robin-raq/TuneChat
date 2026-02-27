jest.mock("moment", () => {
  const actual = jest.requireActual("moment");
  return jest.fn(() => ({ format: () => "3:30 pm" }));
});

const { formatMessage } = require("../messages");

describe("formatMessage", () => {
  it("returns an object with username, text, and time", () => {
    const result = formatMessage("Alice", "Hello");
    expect(result).toMatchObject({ username: "Alice", text: "Hello" });
    expect(result.time).toBe("3:30 pm");
  });

  it("uses the provided username and text", () => {
    const result = formatMessage("Bob", "Hi there");
    expect(result.username).toBe("Bob");
    expect(result.text).toBe("Hi there");
  });
});
