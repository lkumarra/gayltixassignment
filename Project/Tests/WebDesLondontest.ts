import { BrowseJobsPage } from '../Pages/Actions/BrowseJobsPages';
import { BasePage } from "../Pages/BasePage/BasePage";
import { DATA, webDesLondonData } from '../Data/Data';
import { WebDesignerLondonPage } from '../Pages/Actions/WebDesignerLondonPage';
let browseJobsPage:BrowseJobsPage = new BrowseJobsPage();
let webDesignerLondonPage:WebDesignerLondonPage;
describe("Sr. Web Designer London Test Workflow", () => {
    beforeAll(async () => {
        await BasePage.initialization(DATA.URL);
        webDesignerLondonPage = await browseJobsPage.clickOnWebDesignerLondon();
      });

    it("Verify able to navigate on Sr. Web Designer Job Page with Location London UK", async () => {
        expect(await webDesignerLondonPage.getWebDesLonTitle()).toBe(webDesLondonData.title);
        expect(await webDesignerLondonPage.getWebLonLocation()).toBe(webDesLondonData.location);
      });
  });