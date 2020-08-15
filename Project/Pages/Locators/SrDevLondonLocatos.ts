import { findBy, How } from "../../Utils/PageFactory";
import { ElementFinder } from 'protractor';

export class SrDevLondonLocator{
    @findBy(How.XPATH, "//h1[contains(text(),'Sr. Software Developer')]")
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