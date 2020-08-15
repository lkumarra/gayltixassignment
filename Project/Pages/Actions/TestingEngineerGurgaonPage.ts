import { TestUtil } from "../../Utils/TestUtil";
import { TestEngGurgaonLocator } from "../Locators/TestEngGurLocator";
export class TestingEngineerGurgaonPage {
  private _testUtil: TestUtil = TestUtil.getInstance();
  private _testEngGurLoc: TestEngGurgaonLocator = new TestEngGurgaonLocator();

  public async getTestEngGurTitle(): Promise<String> {
    return this._testUtil.getWebElementText(
      this._testEngGurLoc.getJobTitleLocator()
    );
  }

  public async getTestEngGurLocation(): Promise<String> {
    return this._testUtil.getWebElementText(
      this._testEngGurLoc.getLocationLocator()
    );
  }
}
