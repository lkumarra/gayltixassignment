import { TestUtil } from "../../Utils/TestUtil";
import { BrowseJobsLocators } from "../Locators/BrowseJobsLocators";
import { SrDeveloperGurgaonPage } from "./SrDeveloperGurgaonPage";
import { SrDeveloperLondonPage } from "./SrDeveloperLondonPage";
import { TestingEngineerGurgaonPage } from "./TestingEngineerGurgaonPage";
import { TestingEngineerLondonPage } from "./TestingEngineerLondonPage";
import { WebDesignerGurgaonPage } from "./WebdesignerGurgaonPage";
import { WebDesignerLondonPage } from "./WebDesignerLondonPage";

export class BrowseJobsPage {
  private _testUtil: TestUtil = TestUtil.getInstance();
  private _browseJobLoc: BrowseJobsLocators = new BrowseJobsLocators();

  public async getBrowserJobTitle(): Promise<string> {
    return await this._testUtil.getWebElementText(
      this._browseJobLoc.getBrowseJobTitleLocator()
    );
  }

  public async clickOnSrDevGurgaon(): Promise<SrDeveloperGurgaonPage> {
    await this._testUtil.clickOnElement(
      this._browseJobLoc.getSrDeveloperGurgaonLocator()
    );
    return new SrDeveloperGurgaonPage();
  }

  public async clickOnSrDevLondon(): Promise<SrDeveloperLondonPage> {
    await this._testUtil.clickOnElement(
      this._browseJobLoc.getSrDevLondonLocator()
    );
    return new SrDeveloperLondonPage();
  }

  public async clickOnTestEngGurgaon(): Promise<TestingEngineerGurgaonPage> {
    await this._testUtil.clickOnElement(
      this._browseJobLoc.getTestEngGurgaonLocator()
    );
    return new TestingEngineerGurgaonPage();
  }

  public async clickOnTestEngLondon(): Promise<TestingEngineerLondonPage> {
    await this._testUtil.clickOnElement(
      this._browseJobLoc.getTestEngLondonLocator()
    );
    return new TestingEngineerLondonPage();
  }

  public async clickOnWebDesignerGurgaon(): Promise<WebDesignerGurgaonPage> {
    await this._testUtil.clickOnElement(
      this._browseJobLoc.getWebDesGurgaonLocator()
    );
    return new WebDesignerGurgaonPage();
  }

  public async clickOnWebDesignerLondon(): Promise<WebDesignerLondonPage> {
    await this._testUtil.clickOnElement(
      this._browseJobLoc.getWebDesLondonLocator()
    );
    return new WebDesignerLondonPage();
  }

  public async getSrDevGurTitle(): Promise<String> {
    return await this._testUtil.getWebElementText(
      this._browseJobLoc.getSrDevGurTitleLocator()
    );
  }

  public async getSrDevGurLocation(): Promise<String> {
    return await this._testUtil.getWebElementText(
      this._browseJobLoc.getSrDevGurLocLocator()
    );
  }

  public async getSrDevLonTitle(): Promise<String> {
    return await this._testUtil.getWebElementText(
      this._browseJobLoc.getSrDevLonTitleLocator()
    );
  }

  public async getSrDevGurLonLocation(): Promise<String> {
    return await this._testUtil.getWebElementText(
      this._browseJobLoc.getSrDevLonLocLocator()
    );
  }

  public async getTestEngineerGurTitle(): Promise<String> {
    return await this._testUtil.getWebElementText(
      this._browseJobLoc.getTestEngGurTitleLocator()
    );
  }

  public async getTestEngineerGurLocation(): Promise<String> {
    return await this._testUtil.getWebElementText(
      this._browseJobLoc.getTestEngGurLocLocator()
    );
  }

  public async getTestEngineerLonTitle(): Promise<String> {
    return await this._testUtil.getWebElementText(
      this._browseJobLoc.getTestEngLonTitleLocator()
    );
  }

  public async getTestEngineerLonLocation(): Promise<String> {
    return await this._testUtil.getWebElementText(
      this._browseJobLoc.getTestEngLonLocLocator()
    );
  }

  public async getWebDesGurTitle(): Promise<String> {
    return await this._testUtil.getWebElementText(
      this._browseJobLoc.getWebDesGurTitleLocator()
    );
  }

  public async getWebDesGurLocation(): Promise<String> {
    return await this._testUtil.getWebElementText(
      this._browseJobLoc.getWebDesGurLocLocator()
    );
  }

  public async getWebDesLonTitle(): Promise<String> {
    return await this._testUtil.getWebElementText(
      this._browseJobLoc.getWebDesLonTitleLocator()
    );
  }

  public async getWebDesLonLocation(): Promise<String> {
    return await this._testUtil.getWebElementText(
      this._browseJobLoc.getWebDesLonLocLocator()
    );
  }
}
