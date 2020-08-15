import { BasePage } from "../Pages/BasePage/BasePage";
import { DATA, browseJobData } from "../Data/Data";
import { BrowseJobsPage } from "../Pages/Actions/BrowseJobsPages";
let browseJobsPage: BrowseJobsPage = new BrowseJobsPage();
describe("Browse Job Test Workflow", () => {
  it("Verify user able to navigate on Browse Job Page", async () => {
    await BasePage.initialization(DATA.URL);
    expect(await browseJobsPage.getBrowserJobTitle()).toBe(browseJobData.title);
  });

  it("Verify user able to see Jobs on Browse Jobs Page", async () => {
    expect(await browseJobsPage.getSrDevGurTitle()).toBe(
      browseJobData.srDevGurTitle
    );
    expect(await browseJobsPage.getSrDevGurLocation()).toBe(
      browseJobData.srDevGurLocation
    );
    expect(await browseJobsPage.getSrDevLonTitle()).toBe(
      browseJobData.srDevLonTitle
    );
    expect(await browseJobsPage.getSrDevGurLonLocation()).toBe(
      browseJobData.srDevLonLocation
    );
    expect(await browseJobsPage.getTestEngineerGurTitle()).toBe(
      browseJobData.testEngGurTitle
    );
    expect(await browseJobsPage.getTestEngineerGurLocation()).toBe(
      browseJobData.testEngGurLocation
    );
    expect(await browseJobsPage.getTestEngineerLonTitle()).toBe(
      browseJobData.testEngLonTitle
    );
    expect(await browseJobsPage.getTestEngineerLonLocation()).toBe(
      browseJobData.testEngLonLocation
    );
    expect(await browseJobsPage.getWebDesGurTitle()).toBe(
      browseJobData.webDesGurTitle
    );
    expect(await browseJobsPage.getWebDesGurTitle()).toBe(
      browseJobData.webDesGurTitle
    );
    expect(await browseJobsPage.getWebDesLonTitle()).toBe(
      browseJobData.webDesLonTitle
    );
    expect(await browseJobsPage.getWebDesLonLocation()).toBe(
      browseJobData.webDesLonLocation
    );
  });
});
