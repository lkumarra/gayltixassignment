import { BrowseJobsPage } from "../Pages/Actions/BrowseJobsPages";
import { BasePage } from "../Pages/BasePage/BasePage";
import { WebDesignerGurgaonPage } from "../Pages/Actions/WebdesignerGurgaonPage";
import { webDesGurgaonData, DATA } from "../Data/Data";
let browseJobsPage: BrowseJobsPage = new BrowseJobsPage();
let webDesignerGurgaonPage: WebDesignerGurgaonPage;
describe("Sr. Web Designer Gurgaon Test Workflow", () => {
  beforeAll(async () => {
    await BasePage.initialization(DATA.URL);
    webDesignerGurgaonPage = await browseJobsPage.clickOnWebDesignerGurgaon();
  });

  it("Verify able to navigate on Sr. Web Designer Job Page with Location Gurgaon India.", async () => {
    expect(await webDesignerGurgaonPage.getWebDesGurTitle()).toBe(
      webDesGurgaonData.title
    );
    expect(await webDesignerGurgaonPage.getWebGurLocation()).toBe(
      webDesGurgaonData.location
    );
  });
});
