import { BasePage } from "../Pages/BasePage/BasePage";
import { BrowseJobsPage } from "../Pages/Actions/BrowseJobsPages";
import { TestingEngineerGurgaonPage } from "../Pages/Actions/TestingEngineerGurgaonPage";
import { testEngGurgaonData, DATA} from "../Data/Data";
let browseJobsPage: BrowseJobsPage = new BrowseJobsPage();
let testingEngineerGurgaonPage: TestingEngineerGurgaonPage;
describe("Test Engineer Gurgaon Test Workflow", () => {
  beforeAll(async () => {
    await BasePage.initialization(DATA.URL);
    testingEngineerGurgaonPage = await browseJobsPage.clickOnTestEngGurgaon();
  });

  it("Verify able to navigate on Testing Enginner Job Page with Location Gurgaon India", async () => {
    expect(await testingEngineerGurgaonPage.getTestEngGurTitle()).toBe(
      testEngGurgaonData.title
    );
    expect(await testingEngineerGurgaonPage.getTestEngGurLocation()).toBe(
      testEngGurgaonData.location
    );
  });
});
