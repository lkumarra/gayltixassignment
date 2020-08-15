import { BasePage } from "../Pages/BasePage/BasePage";
import { BrowseJobsPage } from "../Pages/Actions/BrowseJobsPages";
import { TestingEngineerLondonPage } from "../Pages/Actions/TestingEngineerLondonPage";
import { testEngLondonData, DATA } from "../Data/Data";
let browseJobsPage: BrowseJobsPage = new BrowseJobsPage();
let testingEngineerLondonPage: TestingEngineerLondonPage;
describe("Test Engineer London Test Workflow", () => {
  beforeAll(async () => {
    await BasePage.initialization(DATA.URL);
    testingEngineerLondonPage = await browseJobsPage.clickOnTestEngLondon();
  });

  it("Verify able to navigate on Testing Enginner Job Page with Location London Uk", async () => {
    expect(await testingEngineerLondonPage.getTestEngLonLocation()).toBe(
      testEngLondonData.location
    );
    expect(await testingEngineerLondonPage.getTestEngLonTitle()).toBe(
      testEngLondonData.title
    );
  });
});
