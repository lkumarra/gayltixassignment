import { findBy, How } from "../../Utils/PageFactory";
import { ElementFinder } from 'protractor';

export class SrDevGurgaonLocator{
    @findBy(How.XPATH, "//h1[contains(text(),'Sr. Software Developer')]")
    private _jobTitle:ElementFinder

    @findBy(How.XPATH, "//p[contains(text(),'Gurgaon, India')]")
    private _location:ElementFinder

    public getJobTitleLocator():ElementFinder{
        return this._jobTitle;
    }

    public getLocationLocator():ElementFinder{
        return this._location;
    }
}