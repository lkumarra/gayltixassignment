var app = angular.module('reportingApp', []);

//<editor-fold desc="global helpers">

var isValueAnArray = function (val) {
    return Array.isArray(val);
};

var getSpec = function (str) {
    var describes = str.split('|');
    return describes[describes.length - 1];
};
var checkIfShouldDisplaySpecName = function (prevItem, item) {
    if (!prevItem) {
        item.displaySpecName = true;
    } else if (getSpec(item.description) !== getSpec(prevItem.description)) {
        item.displaySpecName = true;
    }
};

var getParent = function (str) {
    var arr = str.split('|');
    str = "";
    for (var i = arr.length - 2; i > 0; i--) {
        str += arr[i] + " > ";
    }
    return str.slice(0, -3);
};

var getShortDescription = function (str) {
    return str.split('|')[0];
};

var countLogMessages = function (item) {
    if ((!item.logWarnings || !item.logErrors) && item.browserLogs && item.browserLogs.length > 0) {
        item.logWarnings = 0;
        item.logErrors = 0;
        for (var logNumber = 0; logNumber < item.browserLogs.length; logNumber++) {
            var logEntry = item.browserLogs[logNumber];
            if (logEntry.level === 'SEVERE') {
                item.logErrors++;
            }
            if (logEntry.level === 'WARNING') {
                item.logWarnings++;
            }
        }
    }
};

var convertTimestamp = function (timestamp) {
    var d = new Date(timestamp),
        yyyy = d.getFullYear(),
        mm = ('0' + (d.getMonth() + 1)).slice(-2),
        dd = ('0' + d.getDate()).slice(-2),
        hh = d.getHours(),
        h = hh,
        min = ('0' + d.getMinutes()).slice(-2),
        ampm = 'AM',
        time;

    if (hh > 12) {
        h = hh - 12;
        ampm = 'PM';
    } else if (hh === 12) {
        h = 12;
        ampm = 'PM';
    } else if (hh === 0) {
        h = 12;
    }

    // ie: 2013-02-18, 8:35 AM
    time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;

    return time;
};

var defaultSortFunction = function sortFunction(a, b) {
    if (a.sessionId < b.sessionId) {
        return -1;
    } else if (a.sessionId > b.sessionId) {
        return 1;
    }

    if (a.timestamp < b.timestamp) {
        return -1;
    } else if (a.timestamp > b.timestamp) {
        return 1;
    }

    return 0;
};

//</editor-fold>

app.controller('ScreenshotReportController', ['$scope', '$http', 'TitleService', function ($scope, $http, titleService) {
    var that = this;
    var clientDefaults = {
    "showTotalDurationIn": "header",
    "totalDurationFormat": "hms",
    "columnSettings": {
        "displayTime": true,
        "displayBrowser": false,
        "displaySessionId": false,
        "displayOS": false,
        "inlineScreenshots": false,
        "warningTime": 10000,
        "dangerTime": 20000
    }
};

    $scope.searchSettings = Object.assign({
        description: '',
        allselected: true,
        passed: true,
        failed: true,
        pending: true,
        withLog: true
    }, clientDefaults.searchSettings || {}); // enable customisation of search settings on first page hit

    this.warningTime = 1400;
    this.dangerTime = 1900;
    this.totalDurationFormat = clientDefaults.totalDurationFormat;
    this.showTotalDurationIn = clientDefaults.showTotalDurationIn;

    var initialColumnSettings = clientDefaults.columnSettings; // enable customisation of visible columns on first page hit
    if (initialColumnSettings) {
        if (initialColumnSettings.displayTime !== undefined) {
            // initial settings have be inverted because the html bindings are inverted (e.g. !ctrl.displayTime)
            this.displayTime = !initialColumnSettings.displayTime;
        }
        if (initialColumnSettings.displayBrowser !== undefined) {
            this.displayBrowser = !initialColumnSettings.displayBrowser; // same as above
        }
        if (initialColumnSettings.displaySessionId !== undefined) {
            this.displaySessionId = !initialColumnSettings.displaySessionId; // same as above
        }
        if (initialColumnSettings.displayOS !== undefined) {
            this.displayOS = !initialColumnSettings.displayOS; // same as above
        }
        if (initialColumnSettings.inlineScreenshots !== undefined) {
            this.inlineScreenshots = initialColumnSettings.inlineScreenshots; // this setting does not have to be inverted
        } else {
            this.inlineScreenshots = false;
        }
        if (initialColumnSettings.warningTime) {
            this.warningTime = initialColumnSettings.warningTime;
        }
        if (initialColumnSettings.dangerTime) {
            this.dangerTime = initialColumnSettings.dangerTime;
        }
    }


    this.chooseAllTypes = function () {
        var value = true;
        $scope.searchSettings.allselected = !$scope.searchSettings.allselected;
        if (!$scope.searchSettings.allselected) {
            value = false;
        }

        $scope.searchSettings.passed = value;
        $scope.searchSettings.failed = value;
        $scope.searchSettings.pending = value;
        $scope.searchSettings.withLog = value;
    };

    this.isValueAnArray = function (val) {
        return isValueAnArray(val);
    };

    this.getParent = function (str) {
        return getParent(str);
    };

    this.getSpec = function (str) {
        return getSpec(str);
    };

    this.getShortDescription = function (str) {
        return getShortDescription(str);
    };
    this.hasNextScreenshot = function (index) {
        var old = index;
        return old !== this.getNextScreenshotIdx(index);
    };

    this.hasPreviousScreenshot = function (index) {
        var old = index;
        return old !== this.getPreviousScreenshotIdx(index);
    };
    this.getNextScreenshotIdx = function (index) {
        var next = index;
        var hit = false;
        while (next + 2 < this.results.length) {
            next++;
            if (this.results[next].screenShotFile && !this.results[next].pending) {
                hit = true;
                break;
            }
        }
        return hit ? next : index;
    };

    this.getPreviousScreenshotIdx = function (index) {
        var prev = index;
        var hit = false;
        while (prev > 0) {
            prev--;
            if (this.results[prev].screenShotFile && !this.results[prev].pending) {
                hit = true;
                break;
            }
        }
        return hit ? prev : index;
    };

    this.convertTimestamp = convertTimestamp;


    this.round = function (number, roundVal) {
        return (parseFloat(number) / 1000).toFixed(roundVal);
    };


    this.passCount = function () {
        var passCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.passed) {
                passCount++;
            }
        }
        return passCount;
    };


    this.pendingCount = function () {
        var pendingCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.pending) {
                pendingCount++;
            }
        }
        return pendingCount;
    };

    this.failCount = function () {
        var failCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (!result.passed && !result.pending) {
                failCount++;
            }
        }
        return failCount;
    };

    this.totalDuration = function () {
        var sum = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.duration) {
                sum += result.duration;
            }
        }
        return sum;
    };

    this.passPerc = function () {
        return (this.passCount() / this.totalCount()) * 100;
    };
    this.pendingPerc = function () {
        return (this.pendingCount() / this.totalCount()) * 100;
    };
    this.failPerc = function () {
        return (this.failCount() / this.totalCount()) * 100;
    };
    this.totalCount = function () {
        return this.passCount() + this.failCount() + this.pendingCount();
    };


    var results = [
    {
        "description": "Verify user able to navigate on Browse Job Page|Browse Job Test Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "2426e08616aa735bb209067438e19876",
        "instanceId": 16408,
        "browser": {
            "name": "chrome",
            "version": "84.0.4147.125"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1597489875330,
        "duration": 3147
    },
    {
        "description": "Verify user able to see Jobs on Browse Jobs Page|Browse Job Test Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "2426e08616aa735bb209067438e19876",
        "instanceId": 16408,
        "browser": {
            "name": "chrome",
            "version": "84.0.4147.125"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1597489878524,
        "duration": 1384
    },
    {
        "description": "Verify able to navigate on Sr. Software Developer Job Page with Location Gurgaon India|Sr Developer Gurgaon Test Workflow",
        "passed": false,
        "pending": false,
        "os": "windows",
        "sessionId": "2426e08616aa735bb209067438e19876",
        "instanceId": 16408,
        "browser": {
            "name": "chrome",
            "version": "84.0.4147.125"
        },
        "message": [
            "Failed: invalid selector: Unable to locate an element with the xpath expression //a[@href=\"/job/1\"]\" because of the following error:\nSyntaxError: Failed to execute 'evaluate' on 'Document': The string '//a[@href=\"/job/1\"]\"' is not a valid XPath expression.\n  (Session info: chrome=84.0.4147.125)\nFor documentation on this error, please visit: https://www.seleniumhq.org/exceptions/invalid_selector_exception.html\nBuild info: version: '3.141.59', revision: 'e82be7d358', time: '2018-11-14T08:25:53'\nSystem info: host: 'LAPTOP-ORI8JR52', ip: '192.168.137.1', os.name: 'Windows 10', os.arch: 'amd64', os.version: '10.0', java.version: '1.8.0_241'\nDriver info: driver.version: unknown",
            "Failed: Cannot read property 'getSrDevGurgaonTitle' of undefined"
        ],
        "trace": [
            "InvalidSelectorError: invalid selector: Unable to locate an element with the xpath expression //a[@href=\"/job/1\"]\" because of the following error:\nSyntaxError: Failed to execute 'evaluate' on 'Document': The string '//a[@href=\"/job/1\"]\"' is not a valid XPath expression.\n  (Session info: chrome=84.0.4147.125)\nFor documentation on this error, please visit: https://www.seleniumhq.org/exceptions/invalid_selector_exception.html\nBuild info: version: '3.141.59', revision: 'e82be7d358', time: '2018-11-14T08:25:53'\nSystem info: host: 'LAPTOP-ORI8JR52', ip: '192.168.137.1', os.name: 'Windows 10', os.arch: 'amd64', os.version: '10.0', java.version: '1.8.0_241'\nDriver info: driver.version: unknown\n    at Object.checkLegacyResponse (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\selenium-webdriver\\lib\\error.js:546:15)\n    at parseHttpResponse (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\selenium-webdriver\\lib\\http.js:509:13)\n    at E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\selenium-webdriver\\lib\\http.js:441:30\n    at processTicksAndRejections (internal/process/task_queues.js:93:5)\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (E:\\NodeJsTestingProjects\\GayltixExcercise\\e2e_tests\\Tests\\SrDevGurgaonTest.js:9:5)\n    at addSpecsToSuite (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (E:\\NodeJsTestingProjects\\GayltixExcercise\\e2e_tests\\Tests\\SrDevGurgaonTest.js:8:1)\n    at Module._compile (internal/modules/cjs/loader.js:956:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:973:10)\n    at Module.load (internal/modules/cjs/loader.js:812:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:724:14)\n    at Module.require (internal/modules/cjs/loader.js:849:19)\n    at require (internal/modules/cjs/helpers.js:74:18)\n    at E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:93:5\n    at Array.forEach (<anonymous>)\n    at Jasmine.loadSpecs (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:92:18)\n    at Jasmine.execute (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:197:8)",
            "TypeError: Cannot read property 'getSrDevGurgaonTitle' of undefined\n    at UserContext.<anonymous> (E:\\NodeJsTestingProjects\\GayltixExcercise\\e2e_tests\\Tests\\SrDevGurgaonTest.js:14:45)\n    at E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\jasminewd2\\index.js:112:25\n    at new Promise (<anonymous>)\n    at SimpleScheduler.promise (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\selenium-webdriver\\lib\\promise.js:2242:12)\n    at schedulerExecute (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\jasminewd2\\index.js:95:18)\n    at E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\selenium-webdriver\\lib\\promise.js:2232:22\n    at new Promise (<anonymous>)\n    at SimpleScheduler.promise (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\selenium-webdriver\\lib\\promise.js:2242:12)\n    at SimpleScheduler.execute (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\selenium-webdriver\\lib\\promise.js:2227:17)\n    at UserContext.<anonymous> (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at callWhenIdle (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\jasminewd2\\index.js:62:5)\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (E:\\NodeJsTestingProjects\\GayltixExcercise\\e2e_tests\\Tests\\SrDevGurgaonTest.js:13:5)\n    at addSpecsToSuite (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (E:\\NodeJsTestingProjects\\GayltixExcercise\\e2e_tests\\Tests\\SrDevGurgaonTest.js:8:1)\n    at Module._compile (internal/modules/cjs/loader.js:956:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:973:10)\n    at Module.load (internal/modules/cjs/loader.js:812:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:724:14)\n    at Module.require (internal/modules/cjs/loader.js:849:19)\n    at require (internal/modules/cjs/helpers.js:74:18)\n    at E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:93:5\n    at Array.forEach (<anonymous>)\n    at Jasmine.loadSpecs (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:92:18)\n    at Jasmine.execute (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:197:8)"
        ],
        "browserLogs": [],
        "screenShotFile": "screenshots\\008500ef-00c7-00a6-0082-00c6002100a4.png",
        "timestamp": 1597489880499,
        "duration": 18
    },
    {
        "description": "Verify able to navigate on Sr. Software Developer Job Page with Location London UK |Sr Developer London Test Workflow",
        "passed": false,
        "pending": false,
        "os": "windows",
        "sessionId": "2426e08616aa735bb209067438e19876",
        "instanceId": 16408,
        "browser": {
            "name": "chrome",
            "version": "84.0.4147.125"
        },
        "message": [
            "Failed: invalid selector: Unable to locate an element with the xpath expression //a[@href=\"/job/2\"]\" because of the following error:\nSyntaxError: Failed to execute 'evaluate' on 'Document': The string '//a[@href=\"/job/2\"]\"' is not a valid XPath expression.\n  (Session info: chrome=84.0.4147.125)\nFor documentation on this error, please visit: https://www.seleniumhq.org/exceptions/invalid_selector_exception.html\nBuild info: version: '3.141.59', revision: 'e82be7d358', time: '2018-11-14T08:25:53'\nSystem info: host: 'LAPTOP-ORI8JR52', ip: '192.168.137.1', os.name: 'Windows 10', os.arch: 'amd64', os.version: '10.0', java.version: '1.8.0_241'\nDriver info: driver.version: unknown",
            "Failed: Cannot read property 'getSrDevLonLocation' of undefined"
        ],
        "trace": [
            "InvalidSelectorError: invalid selector: Unable to locate an element with the xpath expression //a[@href=\"/job/2\"]\" because of the following error:\nSyntaxError: Failed to execute 'evaluate' on 'Document': The string '//a[@href=\"/job/2\"]\"' is not a valid XPath expression.\n  (Session info: chrome=84.0.4147.125)\nFor documentation on this error, please visit: https://www.seleniumhq.org/exceptions/invalid_selector_exception.html\nBuild info: version: '3.141.59', revision: 'e82be7d358', time: '2018-11-14T08:25:53'\nSystem info: host: 'LAPTOP-ORI8JR52', ip: '192.168.137.1', os.name: 'Windows 10', os.arch: 'amd64', os.version: '10.0', java.version: '1.8.0_241'\nDriver info: driver.version: unknown\n    at Object.checkLegacyResponse (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\selenium-webdriver\\lib\\error.js:546:15)\n    at parseHttpResponse (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\selenium-webdriver\\lib\\http.js:509:13)\n    at E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\selenium-webdriver\\lib\\http.js:441:30\n    at processTicksAndRejections (internal/process/task_queues.js:93:5)\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (E:\\NodeJsTestingProjects\\GayltixExcercise\\e2e_tests\\Tests\\SrDevLondonTest.js:9:5)\n    at addSpecsToSuite (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (E:\\NodeJsTestingProjects\\GayltixExcercise\\e2e_tests\\Tests\\SrDevLondonTest.js:8:1)\n    at Module._compile (internal/modules/cjs/loader.js:956:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:973:10)\n    at Module.load (internal/modules/cjs/loader.js:812:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:724:14)\n    at Module.require (internal/modules/cjs/loader.js:849:19)\n    at require (internal/modules/cjs/helpers.js:74:18)\n    at E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:93:5\n    at Array.forEach (<anonymous>)\n    at Jasmine.loadSpecs (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:92:18)\n    at Jasmine.execute (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:197:8)",
            "TypeError: Cannot read property 'getSrDevLonLocation' of undefined\n    at UserContext.<anonymous> (E:\\NodeJsTestingProjects\\GayltixExcercise\\e2e_tests\\Tests\\SrDevLondonTest.js:14:44)\n    at E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\jasminewd2\\index.js:112:25\n    at new Promise (<anonymous>)\n    at SimpleScheduler.promise (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\selenium-webdriver\\lib\\promise.js:2242:12)\n    at schedulerExecute (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\jasminewd2\\index.js:95:18)\n    at E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\selenium-webdriver\\lib\\promise.js:2232:22\n    at new Promise (<anonymous>)\n    at SimpleScheduler.promise (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\selenium-webdriver\\lib\\promise.js:2242:12)\n    at SimpleScheduler.execute (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\selenium-webdriver\\lib\\promise.js:2227:17)\n    at UserContext.<anonymous> (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at callWhenIdle (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\jasminewd2\\index.js:62:5)\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (E:\\NodeJsTestingProjects\\GayltixExcercise\\e2e_tests\\Tests\\SrDevLondonTest.js:13:5)\n    at addSpecsToSuite (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (E:\\NodeJsTestingProjects\\GayltixExcercise\\e2e_tests\\Tests\\SrDevLondonTest.js:8:1)\n    at Module._compile (internal/modules/cjs/loader.js:956:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:973:10)\n    at Module.load (internal/modules/cjs/loader.js:812:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:724:14)\n    at Module.require (internal/modules/cjs/loader.js:849:19)\n    at require (internal/modules/cjs/helpers.js:74:18)\n    at E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:93:5\n    at Array.forEach (<anonymous>)\n    at Jasmine.loadSpecs (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:92:18)\n    at Jasmine.execute (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:197:8)"
        ],
        "browserLogs": [],
        "screenShotFile": "screenshots\\0087000c-00d9-0060-00d2-001300d20074.png",
        "timestamp": 1597489881481,
        "duration": 17
    },
    {
        "description": "Verify able to navigate on Testing Enginner Job Page with Location Gurgaon India|Test Engineer Gurgaon Test Workflow",
        "passed": false,
        "pending": false,
        "os": "windows",
        "sessionId": "2426e08616aa735bb209067438e19876",
        "instanceId": 16408,
        "browser": {
            "name": "chrome",
            "version": "84.0.4147.125"
        },
        "message": [
            "Failed: invalid selector: Unable to locate an element with the xpath expression //a[@href=\"/job/3\"]\" because of the following error:\nSyntaxError: Failed to execute 'evaluate' on 'Document': The string '//a[@href=\"/job/3\"]\"' is not a valid XPath expression.\n  (Session info: chrome=84.0.4147.125)\nFor documentation on this error, please visit: https://www.seleniumhq.org/exceptions/invalid_selector_exception.html\nBuild info: version: '3.141.59', revision: 'e82be7d358', time: '2018-11-14T08:25:53'\nSystem info: host: 'LAPTOP-ORI8JR52', ip: '192.168.137.1', os.name: 'Windows 10', os.arch: 'amd64', os.version: '10.0', java.version: '1.8.0_241'\nDriver info: driver.version: unknown",
            "Failed: Cannot read property 'getTestEngGurTitle' of undefined"
        ],
        "trace": [
            "InvalidSelectorError: invalid selector: Unable to locate an element with the xpath expression //a[@href=\"/job/3\"]\" because of the following error:\nSyntaxError: Failed to execute 'evaluate' on 'Document': The string '//a[@href=\"/job/3\"]\"' is not a valid XPath expression.\n  (Session info: chrome=84.0.4147.125)\nFor documentation on this error, please visit: https://www.seleniumhq.org/exceptions/invalid_selector_exception.html\nBuild info: version: '3.141.59', revision: 'e82be7d358', time: '2018-11-14T08:25:53'\nSystem info: host: 'LAPTOP-ORI8JR52', ip: '192.168.137.1', os.name: 'Windows 10', os.arch: 'amd64', os.version: '10.0', java.version: '1.8.0_241'\nDriver info: driver.version: unknown\n    at Object.checkLegacyResponse (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\selenium-webdriver\\lib\\error.js:546:15)\n    at parseHttpResponse (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\selenium-webdriver\\lib\\http.js:509:13)\n    at E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\selenium-webdriver\\lib\\http.js:441:30\n    at processTicksAndRejections (internal/process/task_queues.js:93:5)\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (E:\\NodeJsTestingProjects\\GayltixExcercise\\e2e_tests\\Tests\\TestEngGurgaonTest.js:9:5)\n    at addSpecsToSuite (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (E:\\NodeJsTestingProjects\\GayltixExcercise\\e2e_tests\\Tests\\TestEngGurgaonTest.js:8:1)\n    at Module._compile (internal/modules/cjs/loader.js:956:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:973:10)\n    at Module.load (internal/modules/cjs/loader.js:812:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:724:14)\n    at Module.require (internal/modules/cjs/loader.js:849:19)\n    at require (internal/modules/cjs/helpers.js:74:18)\n    at E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:93:5\n    at Array.forEach (<anonymous>)\n    at Jasmine.loadSpecs (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:92:18)\n    at Jasmine.execute (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:197:8)",
            "TypeError: Cannot read property 'getTestEngGurTitle' of undefined\n    at UserContext.<anonymous> (E:\\NodeJsTestingProjects\\GayltixExcercise\\e2e_tests\\Tests\\TestEngGurgaonTest.js:14:49)\n    at E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\jasminewd2\\index.js:112:25\n    at new Promise (<anonymous>)\n    at SimpleScheduler.promise (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\selenium-webdriver\\lib\\promise.js:2242:12)\n    at schedulerExecute (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\jasminewd2\\index.js:95:18)\n    at E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\selenium-webdriver\\lib\\promise.js:2232:22\n    at new Promise (<anonymous>)\n    at SimpleScheduler.promise (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\selenium-webdriver\\lib\\promise.js:2242:12)\n    at SimpleScheduler.execute (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\selenium-webdriver\\lib\\promise.js:2227:17)\n    at UserContext.<anonymous> (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at callWhenIdle (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\jasminewd2\\index.js:62:5)\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (E:\\NodeJsTestingProjects\\GayltixExcercise\\e2e_tests\\Tests\\TestEngGurgaonTest.js:13:5)\n    at addSpecsToSuite (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (E:\\NodeJsTestingProjects\\GayltixExcercise\\e2e_tests\\Tests\\TestEngGurgaonTest.js:8:1)\n    at Module._compile (internal/modules/cjs/loader.js:956:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:973:10)\n    at Module.load (internal/modules/cjs/loader.js:812:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:724:14)\n    at Module.require (internal/modules/cjs/loader.js:849:19)\n    at require (internal/modules/cjs/helpers.js:74:18)\n    at E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:93:5\n    at Array.forEach (<anonymous>)\n    at Jasmine.loadSpecs (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:92:18)\n    at Jasmine.execute (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:197:8)"
        ],
        "browserLogs": [],
        "screenShotFile": "screenshots\\0015005c-00dd-0005-0091-00ed001c000c.png",
        "timestamp": 1597489882404,
        "duration": 15
    },
    {
        "description": "Verify able to navigate on Testing Enginner Job Page with Location London Uk|Test Engineer London Test Workflow",
        "passed": false,
        "pending": false,
        "os": "windows",
        "sessionId": "2426e08616aa735bb209067438e19876",
        "instanceId": 16408,
        "browser": {
            "name": "chrome",
            "version": "84.0.4147.125"
        },
        "message": [
            "Failed: invalid selector: Unable to locate an element with the xpath expression //a[@href=\"/job/4\"]\" because of the following error:\nSyntaxError: Failed to execute 'evaluate' on 'Document': The string '//a[@href=\"/job/4\"]\"' is not a valid XPath expression.\n  (Session info: chrome=84.0.4147.125)\nFor documentation on this error, please visit: https://www.seleniumhq.org/exceptions/invalid_selector_exception.html\nBuild info: version: '3.141.59', revision: 'e82be7d358', time: '2018-11-14T08:25:53'\nSystem info: host: 'LAPTOP-ORI8JR52', ip: '192.168.137.1', os.name: 'Windows 10', os.arch: 'amd64', os.version: '10.0', java.version: '1.8.0_241'\nDriver info: driver.version: unknown",
            "Failed: Cannot read property 'getTestEngLonLocation' of undefined"
        ],
        "trace": [
            "InvalidSelectorError: invalid selector: Unable to locate an element with the xpath expression //a[@href=\"/job/4\"]\" because of the following error:\nSyntaxError: Failed to execute 'evaluate' on 'Document': The string '//a[@href=\"/job/4\"]\"' is not a valid XPath expression.\n  (Session info: chrome=84.0.4147.125)\nFor documentation on this error, please visit: https://www.seleniumhq.org/exceptions/invalid_selector_exception.html\nBuild info: version: '3.141.59', revision: 'e82be7d358', time: '2018-11-14T08:25:53'\nSystem info: host: 'LAPTOP-ORI8JR52', ip: '192.168.137.1', os.name: 'Windows 10', os.arch: 'amd64', os.version: '10.0', java.version: '1.8.0_241'\nDriver info: driver.version: unknown\n    at Object.checkLegacyResponse (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\selenium-webdriver\\lib\\error.js:546:15)\n    at parseHttpResponse (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\selenium-webdriver\\lib\\http.js:509:13)\n    at E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\selenium-webdriver\\lib\\http.js:441:30\n    at processTicksAndRejections (internal/process/task_queues.js:93:5)\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (E:\\NodeJsTestingProjects\\GayltixExcercise\\e2e_tests\\Tests\\TestEngLondonTest.js:9:5)\n    at addSpecsToSuite (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (E:\\NodeJsTestingProjects\\GayltixExcercise\\e2e_tests\\Tests\\TestEngLondonTest.js:8:1)\n    at Module._compile (internal/modules/cjs/loader.js:956:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:973:10)\n    at Module.load (internal/modules/cjs/loader.js:812:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:724:14)\n    at Module.require (internal/modules/cjs/loader.js:849:19)\n    at require (internal/modules/cjs/helpers.js:74:18)\n    at E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:93:5\n    at Array.forEach (<anonymous>)\n    at Jasmine.loadSpecs (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:92:18)\n    at Jasmine.execute (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:197:8)",
            "TypeError: Cannot read property 'getTestEngLonLocation' of undefined\n    at UserContext.<anonymous> (E:\\NodeJsTestingProjects\\GayltixExcercise\\e2e_tests\\Tests\\TestEngLondonTest.js:14:48)\n    at E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\jasminewd2\\index.js:112:25\n    at new Promise (<anonymous>)\n    at SimpleScheduler.promise (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\selenium-webdriver\\lib\\promise.js:2242:12)\n    at schedulerExecute (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\jasminewd2\\index.js:95:18)\n    at E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\selenium-webdriver\\lib\\promise.js:2232:22\n    at new Promise (<anonymous>)\n    at SimpleScheduler.promise (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\selenium-webdriver\\lib\\promise.js:2242:12)\n    at SimpleScheduler.execute (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\selenium-webdriver\\lib\\promise.js:2227:17)\n    at UserContext.<anonymous> (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at callWhenIdle (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\jasminewd2\\index.js:62:5)\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (E:\\NodeJsTestingProjects\\GayltixExcercise\\e2e_tests\\Tests\\TestEngLondonTest.js:13:5)\n    at addSpecsToSuite (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (E:\\NodeJsTestingProjects\\GayltixExcercise\\e2e_tests\\Tests\\TestEngLondonTest.js:8:1)\n    at Module._compile (internal/modules/cjs/loader.js:956:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:973:10)\n    at Module.load (internal/modules/cjs/loader.js:812:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:724:14)\n    at Module.require (internal/modules/cjs/loader.js:849:19)\n    at require (internal/modules/cjs/helpers.js:74:18)\n    at E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:93:5\n    at Array.forEach (<anonymous>)\n    at Jasmine.loadSpecs (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:92:18)\n    at Jasmine.execute (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:197:8)"
        ],
        "browserLogs": [],
        "screenShotFile": "screenshots\\00cf00ce-00e4-00f2-00e3-00a800e10081.png",
        "timestamp": 1597489883299,
        "duration": 18
    },
    {
        "description": "Verify able to navigate on Sr. Web Designer Job Page with Location Gurgaon India.|Sr. Web Designer Gurgaon Test Workflow",
        "passed": false,
        "pending": false,
        "os": "windows",
        "sessionId": "2426e08616aa735bb209067438e19876",
        "instanceId": 16408,
        "browser": {
            "name": "chrome",
            "version": "84.0.4147.125"
        },
        "message": [
            "Failed: invalid selector: Unable to locate an element with the xpath expression //a[@href=\"/job/5\"]\" because of the following error:\nSyntaxError: Failed to execute 'evaluate' on 'Document': The string '//a[@href=\"/job/5\"]\"' is not a valid XPath expression.\n  (Session info: chrome=84.0.4147.125)\nFor documentation on this error, please visit: https://www.seleniumhq.org/exceptions/invalid_selector_exception.html\nBuild info: version: '3.141.59', revision: 'e82be7d358', time: '2018-11-14T08:25:53'\nSystem info: host: 'LAPTOP-ORI8JR52', ip: '192.168.137.1', os.name: 'Windows 10', os.arch: 'amd64', os.version: '10.0', java.version: '1.8.0_241'\nDriver info: driver.version: unknown",
            "Failed: Cannot read property 'getWebDesGurTitle' of undefined"
        ],
        "trace": [
            "InvalidSelectorError: invalid selector: Unable to locate an element with the xpath expression //a[@href=\"/job/5\"]\" because of the following error:\nSyntaxError: Failed to execute 'evaluate' on 'Document': The string '//a[@href=\"/job/5\"]\"' is not a valid XPath expression.\n  (Session info: chrome=84.0.4147.125)\nFor documentation on this error, please visit: https://www.seleniumhq.org/exceptions/invalid_selector_exception.html\nBuild info: version: '3.141.59', revision: 'e82be7d358', time: '2018-11-14T08:25:53'\nSystem info: host: 'LAPTOP-ORI8JR52', ip: '192.168.137.1', os.name: 'Windows 10', os.arch: 'amd64', os.version: '10.0', java.version: '1.8.0_241'\nDriver info: driver.version: unknown\n    at Object.checkLegacyResponse (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\selenium-webdriver\\lib\\error.js:546:15)\n    at parseHttpResponse (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\selenium-webdriver\\lib\\http.js:509:13)\n    at E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\selenium-webdriver\\lib\\http.js:441:30\n    at processTicksAndRejections (internal/process/task_queues.js:93:5)\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (E:\\NodeJsTestingProjects\\GayltixExcercise\\e2e_tests\\Tests\\WebDesGurgaonTest.js:9:5)\n    at addSpecsToSuite (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (E:\\NodeJsTestingProjects\\GayltixExcercise\\e2e_tests\\Tests\\WebDesGurgaonTest.js:8:1)\n    at Module._compile (internal/modules/cjs/loader.js:956:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:973:10)\n    at Module.load (internal/modules/cjs/loader.js:812:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:724:14)\n    at Module.require (internal/modules/cjs/loader.js:849:19)\n    at require (internal/modules/cjs/helpers.js:74:18)\n    at E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:93:5\n    at Array.forEach (<anonymous>)\n    at Jasmine.loadSpecs (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:92:18)\n    at Jasmine.execute (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:197:8)",
            "TypeError: Cannot read property 'getWebDesGurTitle' of undefined\n    at UserContext.<anonymous> (E:\\NodeJsTestingProjects\\GayltixExcercise\\e2e_tests\\Tests\\WebDesGurgaonTest.js:14:45)\n    at E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\jasminewd2\\index.js:112:25\n    at new Promise (<anonymous>)\n    at SimpleScheduler.promise (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\selenium-webdriver\\lib\\promise.js:2242:12)\n    at schedulerExecute (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\jasminewd2\\index.js:95:18)\n    at E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\selenium-webdriver\\lib\\promise.js:2232:22\n    at new Promise (<anonymous>)\n    at SimpleScheduler.promise (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\selenium-webdriver\\lib\\promise.js:2242:12)\n    at SimpleScheduler.execute (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\selenium-webdriver\\lib\\promise.js:2227:17)\n    at UserContext.<anonymous> (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at callWhenIdle (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\jasminewd2\\index.js:62:5)\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (E:\\NodeJsTestingProjects\\GayltixExcercise\\e2e_tests\\Tests\\WebDesGurgaonTest.js:13:5)\n    at addSpecsToSuite (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (E:\\NodeJsTestingProjects\\GayltixExcercise\\e2e_tests\\Tests\\WebDesGurgaonTest.js:8:1)\n    at Module._compile (internal/modules/cjs/loader.js:956:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:973:10)\n    at Module.load (internal/modules/cjs/loader.js:812:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:724:14)\n    at Module.require (internal/modules/cjs/loader.js:849:19)\n    at require (internal/modules/cjs/helpers.js:74:18)\n    at E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:93:5\n    at Array.forEach (<anonymous>)\n    at Jasmine.loadSpecs (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:92:18)\n    at Jasmine.execute (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:197:8)"
        ],
        "browserLogs": [],
        "screenShotFile": "screenshots\\009d0058-0097-00b8-009b-0078009200d3.png",
        "timestamp": 1597489884201,
        "duration": 16
    },
    {
        "description": "Verify able to navigate on Sr. Web Designer Job Page with Location London UK|Sr. Web Designer London Test Workflow",
        "passed": false,
        "pending": false,
        "os": "windows",
        "sessionId": "2426e08616aa735bb209067438e19876",
        "instanceId": 16408,
        "browser": {
            "name": "chrome",
            "version": "84.0.4147.125"
        },
        "message": [
            "Failed: invalid selector: Unable to locate an element with the xpath expression //a[@href=\"/job/4\"]\" because of the following error:\nSyntaxError: Failed to execute 'evaluate' on 'Document': The string '//a[@href=\"/job/4\"]\"' is not a valid XPath expression.\n  (Session info: chrome=84.0.4147.125)\nFor documentation on this error, please visit: https://www.seleniumhq.org/exceptions/invalid_selector_exception.html\nBuild info: version: '3.141.59', revision: 'e82be7d358', time: '2018-11-14T08:25:53'\nSystem info: host: 'LAPTOP-ORI8JR52', ip: '192.168.137.1', os.name: 'Windows 10', os.arch: 'amd64', os.version: '10.0', java.version: '1.8.0_241'\nDriver info: driver.version: unknown",
            "Failed: Cannot read property 'getWebDesLonTitle' of undefined"
        ],
        "trace": [
            "InvalidSelectorError: invalid selector: Unable to locate an element with the xpath expression //a[@href=\"/job/4\"]\" because of the following error:\nSyntaxError: Failed to execute 'evaluate' on 'Document': The string '//a[@href=\"/job/4\"]\"' is not a valid XPath expression.\n  (Session info: chrome=84.0.4147.125)\nFor documentation on this error, please visit: https://www.seleniumhq.org/exceptions/invalid_selector_exception.html\nBuild info: version: '3.141.59', revision: 'e82be7d358', time: '2018-11-14T08:25:53'\nSystem info: host: 'LAPTOP-ORI8JR52', ip: '192.168.137.1', os.name: 'Windows 10', os.arch: 'amd64', os.version: '10.0', java.version: '1.8.0_241'\nDriver info: driver.version: unknown\n    at Object.checkLegacyResponse (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\selenium-webdriver\\lib\\error.js:546:15)\n    at parseHttpResponse (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\selenium-webdriver\\lib\\http.js:509:13)\n    at E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\selenium-webdriver\\lib\\http.js:441:30\n    at processTicksAndRejections (internal/process/task_queues.js:93:5)\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (E:\\NodeJsTestingProjects\\GayltixExcercise\\e2e_tests\\Tests\\WebDesLondontest.js:9:5)\n    at addSpecsToSuite (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (E:\\NodeJsTestingProjects\\GayltixExcercise\\e2e_tests\\Tests\\WebDesLondontest.js:8:1)\n    at Module._compile (internal/modules/cjs/loader.js:956:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:973:10)\n    at Module.load (internal/modules/cjs/loader.js:812:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:724:14)\n    at Module.require (internal/modules/cjs/loader.js:849:19)\n    at require (internal/modules/cjs/helpers.js:74:18)\n    at E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:93:5\n    at Array.forEach (<anonymous>)\n    at Jasmine.loadSpecs (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:92:18)\n    at Jasmine.execute (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:197:8)",
            "TypeError: Cannot read property 'getWebDesLonTitle' of undefined\n    at UserContext.<anonymous> (E:\\NodeJsTestingProjects\\GayltixExcercise\\e2e_tests\\Tests\\WebDesLondontest.js:14:44)\n    at E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\jasminewd2\\index.js:112:25\n    at new Promise (<anonymous>)\n    at SimpleScheduler.promise (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\selenium-webdriver\\lib\\promise.js:2242:12)\n    at schedulerExecute (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\jasminewd2\\index.js:95:18)\n    at E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\selenium-webdriver\\lib\\promise.js:2232:22\n    at new Promise (<anonymous>)\n    at SimpleScheduler.promise (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\selenium-webdriver\\lib\\promise.js:2242:12)\n    at SimpleScheduler.execute (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\selenium-webdriver\\lib\\promise.js:2227:17)\n    at UserContext.<anonymous> (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at callWhenIdle (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\jasminewd2\\index.js:62:5)\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (E:\\NodeJsTestingProjects\\GayltixExcercise\\e2e_tests\\Tests\\WebDesLondontest.js:13:5)\n    at addSpecsToSuite (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (E:\\NodeJsTestingProjects\\GayltixExcercise\\e2e_tests\\Tests\\WebDesLondontest.js:8:1)\n    at Module._compile (internal/modules/cjs/loader.js:956:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:973:10)\n    at Module.load (internal/modules/cjs/loader.js:812:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:724:14)\n    at Module.require (internal/modules/cjs/loader.js:849:19)\n    at require (internal/modules/cjs/helpers.js:74:18)\n    at E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:93:5\n    at Array.forEach (<anonymous>)\n    at Jasmine.loadSpecs (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:92:18)\n    at Jasmine.execute (E:\\NodeJsTestingProjects\\GayltixExcercise\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:197:8)"
        ],
        "browserLogs": [],
        "screenShotFile": "screenshots\\005000c3-00a2-005d-005d-005a00bd00eb.png",
        "timestamp": 1597489885079,
        "duration": 16
    }
];

    this.sortSpecs = function () {
        this.results = results.sort(function sortFunction(a, b) {
    if (a.sessionId < b.sessionId) return -1;else if (a.sessionId > b.sessionId) return 1;

    if (a.timestamp < b.timestamp) return -1;else if (a.timestamp > b.timestamp) return 1;

    return 0;
});

    };

    this.setTitle = function () {
        var title = $('.report-title').text();
        titleService.setTitle(title);
    };

    // is run after all test data has been prepared/loaded
    this.afterLoadingJobs = function () {
        this.sortSpecs();
        this.setTitle();
    };

    this.loadResultsViaAjax = function () {

        $http({
            url: './combined.json',
            method: 'GET'
        }).then(function (response) {
                var data = null;
                if (response && response.data) {
                    if (typeof response.data === 'object') {
                        data = response.data;
                    } else if (response.data[0] === '"') { //detect super escaped file (from circular json)
                        data = CircularJSON.parse(response.data); //the file is escaped in a weird way (with circular json)
                    } else {
                        data = JSON.parse(response.data);
                    }
                }
                if (data) {
                    results = data;
                    that.afterLoadingJobs();
                }
            },
            function (error) {
                console.error(error);
            });
    };


    if (clientDefaults.useAjax) {
        this.loadResultsViaAjax();
    } else {
        this.afterLoadingJobs();
    }

}]);

app.filter('bySearchSettings', function () {
    return function (items, searchSettings) {
        var filtered = [];
        if (!items) {
            return filtered; // to avoid crashing in where results might be empty
        }
        var prevItem = null;

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            item.displaySpecName = false;

            var isHit = false; //is set to true if any of the search criteria matched
            countLogMessages(item); // modifies item contents

            var hasLog = searchSettings.withLog && item.browserLogs && item.browserLogs.length > 0;
            if (searchSettings.description === '' ||
                (item.description && item.description.toLowerCase().indexOf(searchSettings.description.toLowerCase()) > -1)) {

                if (searchSettings.passed && item.passed || hasLog) {
                    isHit = true;
                } else if (searchSettings.failed && !item.passed && !item.pending || hasLog) {
                    isHit = true;
                } else if (searchSettings.pending && item.pending || hasLog) {
                    isHit = true;
                }
            }
            if (isHit) {
                checkIfShouldDisplaySpecName(prevItem, item);

                filtered.push(item);
                prevItem = item;
            }
        }

        return filtered;
    };
});

//formats millseconds to h m s
app.filter('timeFormat', function () {
    return function (tr, fmt) {
        if(tr == null){
            return "NaN";
        }

        switch (fmt) {
            case 'h':
                var h = tr / 1000 / 60 / 60;
                return "".concat(h.toFixed(2)).concat("h");
            case 'm':
                var m = tr / 1000 / 60;
                return "".concat(m.toFixed(2)).concat("min");
            case 's' :
                var s = tr / 1000;
                return "".concat(s.toFixed(2)).concat("s");
            case 'hm':
            case 'h:m':
                var hmMt = tr / 1000 / 60;
                var hmHr = Math.trunc(hmMt / 60);
                var hmMr = hmMt - (hmHr * 60);
                if (fmt === 'h:m') {
                    return "".concat(hmHr).concat(":").concat(hmMr < 10 ? "0" : "").concat(Math.round(hmMr));
                }
                return "".concat(hmHr).concat("h ").concat(hmMr.toFixed(2)).concat("min");
            case 'hms':
            case 'h:m:s':
                var hmsS = tr / 1000;
                var hmsHr = Math.trunc(hmsS / 60 / 60);
                var hmsM = hmsS / 60;
                var hmsMr = Math.trunc(hmsM - hmsHr * 60);
                var hmsSo = hmsS - (hmsHr * 60 * 60) - (hmsMr*60);
                if (fmt === 'h:m:s') {
                    return "".concat(hmsHr).concat(":").concat(hmsMr < 10 ? "0" : "").concat(hmsMr).concat(":").concat(hmsSo < 10 ? "0" : "").concat(Math.round(hmsSo));
                }
                return "".concat(hmsHr).concat("h ").concat(hmsMr).concat("min ").concat(hmsSo.toFixed(2)).concat("s");
            case 'ms':
                var msS = tr / 1000;
                var msMr = Math.trunc(msS / 60);
                var msMs = msS - (msMr * 60);
                return "".concat(msMr).concat("min ").concat(msMs.toFixed(2)).concat("s");
        }

        return tr;
    };
});


function PbrStackModalController($scope, $rootScope) {
    var ctrl = this;
    ctrl.rootScope = $rootScope;
    ctrl.getParent = getParent;
    ctrl.getShortDescription = getShortDescription;
    ctrl.convertTimestamp = convertTimestamp;
    ctrl.isValueAnArray = isValueAnArray;
    ctrl.toggleSmartStackTraceHighlight = function () {
        var inv = !ctrl.rootScope.showSmartStackTraceHighlight;
        ctrl.rootScope.showSmartStackTraceHighlight = inv;
    };
    ctrl.applySmartHighlight = function (line) {
        if ($rootScope.showSmartStackTraceHighlight) {
            if (line.indexOf('node_modules') > -1) {
                return 'greyout';
            }
            if (line.indexOf('  at ') === -1) {
                return '';
            }

            return 'highlight';
        }
        return '';
    };
}


app.component('pbrStackModal', {
    templateUrl: "pbr-stack-modal.html",
    bindings: {
        index: '=',
        data: '='
    },
    controller: PbrStackModalController
});

function PbrScreenshotModalController($scope, $rootScope) {
    var ctrl = this;
    ctrl.rootScope = $rootScope;
    ctrl.getParent = getParent;
    ctrl.getShortDescription = getShortDescription;

    /**
     * Updates which modal is selected.
     */
    this.updateSelectedModal = function (event, index) {
        var key = event.key; //try to use non-deprecated key first https://developer.mozilla.org/de/docs/Web/API/KeyboardEvent/keyCode
        if (key == null) {
            var keyMap = {
                37: 'ArrowLeft',
                39: 'ArrowRight'
            };
            key = keyMap[event.keyCode]; //fallback to keycode
        }
        if (key === "ArrowLeft" && this.hasPrevious) {
            this.showHideModal(index, this.previous);
        } else if (key === "ArrowRight" && this.hasNext) {
            this.showHideModal(index, this.next);
        }
    };

    /**
     * Hides the modal with the #oldIndex and shows the modal with the #newIndex.
     */
    this.showHideModal = function (oldIndex, newIndex) {
        const modalName = '#imageModal';
        $(modalName + oldIndex).modal("hide");
        $(modalName + newIndex).modal("show");
    };

}

app.component('pbrScreenshotModal', {
    templateUrl: "pbr-screenshot-modal.html",
    bindings: {
        index: '=',
        data: '=',
        next: '=',
        previous: '=',
        hasNext: '=',
        hasPrevious: '='
    },
    controller: PbrScreenshotModalController
});

app.factory('TitleService', ['$document', function ($document) {
    return {
        setTitle: function (title) {
            $document[0].title = title;
        }
    };
}]);


app.run(
    function ($rootScope, $templateCache) {
        //make sure this option is on by default
        $rootScope.showSmartStackTraceHighlight = true;
        
  $templateCache.put('pbr-screenshot-modal.html',
    '<div class="modal" id="imageModal{{$ctrl.index}}" tabindex="-1" role="dialog"\n' +
    '     aria-labelledby="imageModalLabel{{$ctrl.index}}" ng-keydown="$ctrl.updateSelectedModal($event,$ctrl.index)">\n' +
    '    <div class="modal-dialog modal-lg m-screenhot-modal" role="document">\n' +
    '        <div class="modal-content">\n' +
    '            <div class="modal-header">\n' +
    '                <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n' +
    '                    <span aria-hidden="true">&times;</span>\n' +
    '                </button>\n' +
    '                <h6 class="modal-title" id="imageModalLabelP{{$ctrl.index}}">\n' +
    '                    {{$ctrl.getParent($ctrl.data.description)}}</h6>\n' +
    '                <h5 class="modal-title" id="imageModalLabel{{$ctrl.index}}">\n' +
    '                    {{$ctrl.getShortDescription($ctrl.data.description)}}</h5>\n' +
    '            </div>\n' +
    '            <div class="modal-body">\n' +
    '                <img class="screenshotImage" ng-src="{{$ctrl.data.screenShotFile}}">\n' +
    '            </div>\n' +
    '            <div class="modal-footer">\n' +
    '                <div class="pull-left">\n' +
    '                    <button ng-disabled="!$ctrl.hasPrevious" class="btn btn-default btn-previous" data-dismiss="modal"\n' +
    '                            data-toggle="modal" data-target="#imageModal{{$ctrl.previous}}">\n' +
    '                        Prev\n' +
    '                    </button>\n' +
    '                    <button ng-disabled="!$ctrl.hasNext" class="btn btn-default btn-next"\n' +
    '                            data-dismiss="modal" data-toggle="modal"\n' +
    '                            data-target="#imageModal{{$ctrl.next}}">\n' +
    '                        Next\n' +
    '                    </button>\n' +
    '                </div>\n' +
    '                <a class="btn btn-primary" href="{{$ctrl.data.screenShotFile}}" target="_blank">\n' +
    '                    Open Image in New Tab\n' +
    '                    <span class="glyphicon glyphicon-new-window" aria-hidden="true"></span>\n' +
    '                </a>\n' +
    '                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\n' +
    '            </div>\n' +
    '        </div>\n' +
    '    </div>\n' +
    '</div>\n' +
     ''
  );

  $templateCache.put('pbr-stack-modal.html',
    '<div class="modal" id="modal{{$ctrl.index}}" tabindex="-1" role="dialog"\n' +
    '     aria-labelledby="stackModalLabel{{$ctrl.index}}">\n' +
    '    <div class="modal-dialog modal-lg m-stack-modal" role="document">\n' +
    '        <div class="modal-content">\n' +
    '            <div class="modal-header">\n' +
    '                <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n' +
    '                    <span aria-hidden="true">&times;</span>\n' +
    '                </button>\n' +
    '                <h6 class="modal-title" id="stackModalLabelP{{$ctrl.index}}">\n' +
    '                    {{$ctrl.getParent($ctrl.data.description)}}</h6>\n' +
    '                <h5 class="modal-title" id="stackModalLabel{{$ctrl.index}}">\n' +
    '                    {{$ctrl.getShortDescription($ctrl.data.description)}}</h5>\n' +
    '            </div>\n' +
    '            <div class="modal-body">\n' +
    '                <div ng-if="$ctrl.data.trace.length > 0">\n' +
    '                    <div ng-if="$ctrl.isValueAnArray($ctrl.data.trace)">\n' +
    '                        <pre class="logContainer" ng-repeat="trace in $ctrl.data.trace track by $index"><div ng-class="$ctrl.applySmartHighlight(line)" ng-repeat="line in trace.split(\'\\n\') track by $index">{{line}}</div></pre>\n' +
    '                    </div>\n' +
    '                    <div ng-if="!$ctrl.isValueAnArray($ctrl.data.trace)">\n' +
    '                        <pre class="logContainer"><div ng-class="$ctrl.applySmartHighlight(line)" ng-repeat="line in $ctrl.data.trace.split(\'\\n\') track by $index">{{line}}</div></pre>\n' +
    '                    </div>\n' +
    '                </div>\n' +
    '                <div ng-if="$ctrl.data.browserLogs.length > 0">\n' +
    '                    <h5 class="modal-title">\n' +
    '                        Browser logs:\n' +
    '                    </h5>\n' +
    '                    <pre class="logContainer"><div class="browserLogItem"\n' +
    '                                                   ng-repeat="logError in $ctrl.data.browserLogs track by $index"><div><span class="label browserLogLabel label-default"\n' +
    '                                                                                                                             ng-class="{\'label-danger\': logError.level===\'SEVERE\', \'label-warning\': logError.level===\'WARNING\'}">{{logError.level}}</span><span class="label label-default">{{$ctrl.convertTimestamp(logError.timestamp)}}</span><div ng-repeat="messageLine in logError.message.split(\'\\\\n\') track by $index">{{ messageLine }}</div></div></div></pre>\n' +
    '                </div>\n' +
    '            </div>\n' +
    '            <div class="modal-footer">\n' +
    '                <button class="btn btn-default"\n' +
    '                        ng-class="{active: $ctrl.rootScope.showSmartStackTraceHighlight}"\n' +
    '                        ng-click="$ctrl.toggleSmartStackTraceHighlight()">\n' +
    '                    <span class="glyphicon glyphicon-education black"></span> Smart Stack Trace\n' +
    '                </button>\n' +
    '                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\n' +
    '            </div>\n' +
    '        </div>\n' +
    '    </div>\n' +
    '</div>\n' +
     ''
  );

    });
