import { TestUtil } from "../../Utils/TestUtil";
import { WebDesLondonLocator } from "../Locators/WebDesLondonLocator";
export class WebDesignerLondonPage {
  private _testUtil: TestUtil = TestUtil.getInstance();
  private _webDesLonLoc: WebDesLondonLocator = new WebDesLondonLocator();

  public async getWebDesLonTitle(): Promise<String> {
    return await this._testUtil.getWebElementText(
      this._webDesLonLoc.getJobTitleLocator()
    );
  }

  public async getWebLonLocation(): Promise<String> {
    return await this._testUtil.getWebElementText(
      this._webDesLonLoc.getLocationLocator()
    );
  }
}
