import { TestUtil } from "../../Utils/TestUtil";
import { WebDesGurgaonLocator } from "../Locators/WebDesGurgaonLocator";
export class WebDesignerGurgaonPage {
  private _testUtil: TestUtil = TestUtil.getInstance();
  private _WebDesGurLoc: WebDesGurgaonLocator = new WebDesGurgaonLocator();

  public async getWebDesGurTitle(): Promise<String> {
    return await this._testUtil.getWebElementText(
      this._WebDesGurLoc.getJobTitleLocator()
    );
  }

  public async getWebGurLocation(): Promise<String> {
    return await this._testUtil.getWebElementText(
      this._WebDesGurLoc.getLocationLocator()
    );
  }
}
