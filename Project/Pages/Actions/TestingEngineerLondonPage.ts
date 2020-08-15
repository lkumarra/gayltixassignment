import { TestEngLondonLocator } from "../Locators/TestEngLonLocator";
import { TestUtil } from "../../Utils/TestUtil";
export class TestingEngineerLondonPage {
  private _testUtil: TestUtil = TestUtil.getInstance();
  private _testEngLonLoc: TestEngLondonLocator = new TestEngLondonLocator();
  public async getTestEngLonTitle(): Promise<String> {
    return this._testUtil.getWebElementText(
      this._testEngLonLoc.getJobTitleLocator()
    );
  }

  public async getTestEngLonLocation(): Promise<String> {
    return this._testUtil.getWebElementText(
      this._testEngLonLoc.getLocationLocator()
    );
  }
}
