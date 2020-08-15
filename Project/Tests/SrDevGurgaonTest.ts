import { BasePage } from "../Pages/BasePage/BasePage";
import { DATA, srDevGurgaonData } from "../Data/Data";
import { BrowseJobsPage } from "../Pages/Actions/BrowseJobsPages";
import { SrDeveloperGurgaonPage } from "../Pages/Actions/SrDeveloperGurgaonPage";
let browseJobsPage: BrowseJobsPage = new BrowseJobsPage();
let srDeveloperGurgaonPage: SrDeveloperGurgaonPage;
describe("Sr Developer Gurgaon Test Workflow", () => {
  beforeAll(async () => {
    await BasePage.initialization(DATA.URL);
    srDeveloperGurgaonPage = await browseJobsPage.clickOnSrDevGurgaon();
  });

  it("Verify able to navigate on Sr. Software Developer Job Page with Location Gurgaon India", async () => {
    expect(await srDeveloperGurgaonPage.getSrDevGurgaonTitle()).toBe(
      srDevGurgaonData.title
    );
    expect(await srDeveloperGurgaonPage.getSrDevGurgaonLocation()).toBe(
      srDevGurgaonData.location
    );
  });
});
