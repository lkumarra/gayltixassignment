import { browser } from 'protractor';
export class BasePage{
    /**
     * Intitialze the browser ang enter url
     * @param url 
     */
     public static async initialization(url:string){
         await browser.manage().window().maximize();
         await browser.manage().timeouts().implicitlyWait(30);
         await browser.get(url);
     }
}