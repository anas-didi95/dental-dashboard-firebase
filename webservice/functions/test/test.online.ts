import "mocha";
import { expect } from "chai";
import * as fft from "firebase-functions-test";
import { AppOptions } from "firebase-admin";

const test2 = fft(
  import("../config/dental-dashboard-firebase-config") as AppOptions,
  "../config/dental-dashboard-firebase-adminsdk-8zp2m-fdcd7ad194.json"
);
const hello = () => "HELLO WORLD";

describe("Hello function", () => {
  it("should return HELLO WORLD", () => {
    const result = hello();
    expect(result).to.equal("HELLO WORLD");
  });
});

describe("Cloud function", () => {
  after(() => {
    test2.cleanup();
  });
});
