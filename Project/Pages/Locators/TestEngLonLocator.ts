import { findBy, How } from "../../Utils/PageFactory";
import { ElementFinder } from 'protractor';
export class TestEngLondonLocator{
    @findBy(How.XPATH, "//h1[contains(text(),'Testing Engineer')]")
    private _jobTitle:ElementFinder

    @findBy(How.XPATH, "//p[contains(text(),'London, UK')]")
    private _location:ElementFinder

    public getJobTitleLocator():ElementFinder{
        return this._jobTitle;
    }

    public getLocationLocator():ElementFinder{
        return this._location;
    }
}