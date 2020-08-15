import { TestUtil } from "../../Utils/TestUtil";
import { SrDevGurgaonLocator } from "../Locators/SrDevGugaonLocator";
export class SrDeveloperGurgaonPage {
  private _testUtil: TestUtil = TestUtil.getInstance();
  private _SrDevGurLoc: SrDevGurgaonLocator = new SrDevGurgaonLocator();

  public async getSrDevGurgaonTitle(): Promise<string> {
    return await this._testUtil.getWebElementText(
      this._SrDevGurLoc.getJobTitleLocator()
    );
  }

  public async getSrDevGurgaonLocation(): Promise<String> {
    return await this._testUtil.getWebElementText(
      this._SrDevGurLoc.getLocationLocator()
    );
  }
}
