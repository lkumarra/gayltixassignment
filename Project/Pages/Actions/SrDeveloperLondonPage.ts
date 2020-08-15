import { TestUtil } from "../../Utils/TestUtil";
import { SrDevLondonLocator } from "../Locators/SrDevLondonLocatos";
export class SrDeveloperLondonPage {
  private _testUtil: TestUtil = TestUtil.getInstance();
  private _srDevLonLoc: SrDevLondonLocator = new SrDevLondonLocator();
  public async getSrDevLonTitle(): Promise<string> {
    return await this._testUtil.getWebElementText(
      this._srDevLonLoc.getJobTitleLocator()
    );
  }

  public async getSrDevLonLocation(): Promise<String> {
    return await this._testUtil.getWebElementText(
      this._srDevLonLoc.getLocationLocator()
    );
  }
}
