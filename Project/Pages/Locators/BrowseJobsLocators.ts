import { findBy, How } from "../../Utils/PageFactory";
import { ElementFinder } from 'protractor';

export class BrowseJobsLocators{

    @findBy(How.XPATH, "//h1[contains(text(),'Browse Jobs')]")
    private _browseJobTitle:ElementFinder

    @findBy(How.XPATH,'//a[@href="/job/1"]')
    private _srDevGurgaon:ElementFinder

    @findBy(How.XPATH, '//a[@href="/job/2"]')
    private _srDevLondon:ElementFinder

    @findBy(How.XPATH, '//a[@href="/job/3"]')
    private _testEngGurgaon:ElementFinder

    @findBy(How.XPATH, '//a[@href="/job/4"]')
    private _testEngLondon:ElementFinder

    @findBy(How.XPATH, '//a[@href="/job/6"]')
    private _webDesGurgaon:ElementFinder

    @findBy(How.XPATH, '//a[@href="/job/5"]')
    private _webDesLondon:ElementFinder

    @findBy(How.XPATH, '//a[@href="/job/1"]/span[1]')
    private _srDevGurTitle:ElementFinder

    @findBy(How.XPATH, '//a[@href="/job/1"]/span[2]')
    private _srDevGurLoc:ElementFinder

    @findBy(How.XPATH, '//a[@href="/job/2"]/span[1]')
    private _srDevLonTitle:ElementFinder

    @findBy(How.XPATH, '//a[@href="/job/2"]/span[2]')
    private _srDevLonLoc:ElementFinder

    @findBy(How.XPATH, '//a[@href="/job/3"]/span[1]')
    private _testEngGurTitle:ElementFinder

    @findBy(How.XPATH, '//a[@href="/job/3"]/span[2]')
    private _testEngGurLoc:ElementFinder

    @findBy(How.XPATH, '//a[@href="/job/4"]/span[1]')
    private _testEngLonTitle:ElementFinder

    @findBy(How.XPATH, '//a[@href="/job/4"]/span[2]')
    private _testEngLonLoc:ElementFinder

    @findBy(How.XPATH,'//a[@href="/job/6"]/span[1]')
    private _webDesGurTitle:ElementFinder

    @findBy(How.XPATH,'//a[@href="/job/6"]/span[2]')
    private _webDesGurLoc:ElementFinder

    @findBy(How.XPATH,'//a[@href="/job/5"]/span[1]')
    private _webDesLonTitle:ElementFinder

    @findBy(How.XPATH,'//a[@href="/job/5"]/span[2]')
    private _webDesLonLoc:ElementFinder


    public getBrowseJobTitleLocator():ElementFinder{
        return this._browseJobTitle;
    }

    public getSrDeveloperGurgaonLocator():ElementFinder{
        return this._srDevGurgaon;
    }

    public getSrDevLondonLocator():ElementFinder{
        return this._srDevLondon;
    }

    public getTestEngGurgaonLocator():ElementFinder{
        return this._testEngGurgaon;
    }

    public getTestEngLondonLocator():ElementFinder{
        return this._testEngLondon;
    }

    public getWebDesGurgaonLocator():ElementFinder{
        return this._webDesGurgaon;
    }

    public getWebDesLondonLocator():ElementFinder{
        return this._webDesLondon;
    }

    public getSrDevGurTitleLocator():ElementFinder{
        return this._srDevGurTitle;
    }

    public getSrDevGurLocLocator():ElementFinder{
        return this._srDevGurLoc;
    }

    public getSrDevLonTitleLocator():ElementFinder{
        return this._srDevLonTitle;
    }

    public getSrDevLonLocLocator():ElementFinder{
        return this._srDevLonLoc;
    }

    public getTestEngGurTitleLocator():ElementFinder{
        return this._testEngGurTitle;
    }

    public getTestEngGurLocLocator():ElementFinder{
        return this._testEngGurLoc;
    }

    public getTestEngLonTitleLocator():ElementFinder{
        return this._testEngLonTitle;
    }

    public getTestEngLonLocLocator():ElementFinder{
        return this._testEngLonLoc;
    }

    public getWebDesGurTitleLocator():ElementFinder{
        return this._webDesGurTitle;
    }

    public getWebDesGurLocLocator():ElementFinder{
        return this._webDesGurLoc;
    }

    public getWebDesLonTitleLocator():ElementFinder{
        return this._webDesLonTitle;
    }

    public getWebDesLonLocLocator():ElementFinder{
        return this._webDesLonLoc;
    }


}