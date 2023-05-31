import "mocha"
import { expect } from "chai"

const hello = () => "HELLO WORLD"

describe("Hello function", () => {
  it("should return HELLO WORLD", () => {
    const result = hello()
    expect(result).to.equal("HELLO WORLD")
  })
})
