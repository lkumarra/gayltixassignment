import { BasePage } from "../Pages/BasePage/BasePage";
import { DATA, srDevLondonData } from "../Data/Data";
import { BrowseJobsPage } from "../Pages/Actions/BrowseJobsPages";
import { SrDeveloperLondonPage } from "../Pages/Actions/SrDeveloperLondonPage";
let browseJobsPage: BrowseJobsPage = new BrowseJobsPage();
let srDeveloperLondonPage: SrDeveloperLondonPage;
describe("Sr Developer London Test Workflow", () => {
  beforeAll(async () => {
    await BasePage.initialization(DATA.URL);
    srDeveloperLondonPage = await browseJobsPage.clickOnSrDevLondon();
  });

  it("Verify able to navigate on Sr. Software Developer Job Page with Location London UK ", async () => {
    expect(await srDeveloperLondonPage.getSrDevLonLocation()).toBe(
      srDevLondonData.location
    );
    expect(await srDeveloperLondonPage.getSrDevLonTitle()).toBe(
      srDevLondonData.title
    );
  });
});
