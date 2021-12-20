import webpack from "webpack";
import generateCases from "../utils/cases";

jest.useFakeTimers()
jest.setSystemTime(new Date('2022-01-01'))

describe("webpack 4", () => {
  generateCases(webpack);
});
