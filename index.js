/*jshint esversion: 6 */

/*added by andrewc2020

    args must resolve to the correct soap message per operation.

    The soap js module will transform key value pairs, but some operations e.g. GetCharities involve nested elements.
    
    In these cases nested javaScript objects can be used, but it may be simpler to provide the xml as per the wsdl which the soap module supports with the following syntax:

    let args = { _xml: xml }

    Example with XML String for the args (From https://www.npmjs.com/package/soap)
    You may pass in a fully-formed XML string instead the individual elements in JSON args and attributes that make up the XML. The XML string should not contain an XML declaration (e.g., <?xml version="1.0" encoding="UTF-8"?>) or a document type declaration (e.g., <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Frameset//EN" "http://www.w3.org/TR/html4/frameset.dtd">).

    var args = { _xml: "<GetCharities xmlns="http://www.charitycommission.gov.uk/">
      <APIKey>YOUR API KEY GOES HERE</APIKey>
      <strSearch>
       
        <Keyword>MatchAnyWords</Keyword>
        <SearchKeyword>marine</SearchKeyword>
        <SearchIn>All</SearchIn>
        
      </strSearch>
    </GetCharities>"
            };

    Rather than hard coding the xml, it may be more convenient to read it from a saved file using fs

    const xml = fs.readFileSync('your_request.xml', 'utf-8');
  
  
    let args = { _xml: xml};


    For full list of method names & their args see:.
    Official Guide
    http://apps.charitycommission.gov.uk/Showcharity/API/SearchCharitiesV1/Docs/DevGuideHome.aspx

    soap messages
    http://apps.charitycommission.gov.uk/Showcharity/API/SearchCharitiesV1/SearchCharitiesV1.asmx
    
    wsdl
    http://apps.charitycommission.gov.uk/Showcharity/API/SearchCharitiesV1/SearchCharitiesV1.asmx?wsdl
    
    MatchAnyWord or MatchAllWords
    
    Searching using multiple keywords appears problematic. The wsdl only allows 
    one entry for SearchKeyword, so the options do not apply. More than one SearchKeyword element can be supplied in the request without throwing a fault,
    but there is no provision in the wsdl for an arrayList of SearchKeywords and when added appear to be ignored.
    
    
    */

const ccAPIUrl = 'http://apps.charitycommission.gov.uk/Showcharity/API/SearchCharitiesV1/SearchCharitiesV1.asmx?wsdl';

const operationNames = [
    "GetCharityByRegisteredCharityNumber",
    "GetCharityByRegisteredCharityNumberAndSubsidiaryNumber",
    "GetCharities",
    "GetCharitiesByKeyword",
    "GetCharitiesByName",
    "GetCharityAccountListing",
    "GetCharityAnnualReturns",
    "GetCharityChartAssetsLiabilitiesAndPeople",
    "GetCharityChartCharitableSpending",
    "GetCharityChartComplianceHistory",
    "GetCharityChartFinancialHistory",
    "GetCharityChartIncome",
    "GetCharityChartSpending",
    "GetCharityChartIncomeAndSpending",
    "GetCharityNumbersChart",
    "GetCharityFinancialComplianceTableData",
    "GetCharityLatestFiling",
    "GetCharityAreasOfOperation",
    "GetCharityPublishedReport",
    "GetCharityRegistrations",
    "GetCharitySubmissions",
    "GetCharitySubsidiaries",
    "GetCharityTrustees",
    "GetTrusteeAndRelatedCharities",
];

const createClient = function(url) {
    const soap = require('soap');
    return new Promise(function(resolve, reject) {
        soap.createClient(url, function(err, client) {
            if (err) {
                console.log(`→ \t Client creation failed with error: ${err}`);
                console.log(`→ \t Check your network connection`);
                reject(err);
            } else {
                resolve(client);
            }
        });
    });
};

const operation = function(operationName, client, args) {
    if (!client) {
        return Promise.reject('Please supply a valid client object using the createClient operation');
    }
    return new Promise(function(resolve, reject) {
        client[operationName](args, function(err, result) {
            if (err) {
                reject({ operationName, err });
            } else {
                resolve(result);
            }
        });
    });
};

const ccAPI = {
    ccAPIUrl,
    createClient,
    operationNames
};

// iterate through the operation name and create method return a promise
operationNames.forEach(function(e, i, a) {
    ccAPI[e] = function(args) {
        return new Promise(function(resolve, reject) {
            createClient(ccAPIUrl).then(function(client) {
                resolve(operation(e, client, args));

            });
        });
    };
});

module.exports = ccAPI;

// const ccAPI = require('charity-commission-api');
// const args = { APIKey: 'xx-xx-xx-x', strSearch: 'happy' };

// ccAPI.GetCharitiesByKeyword(args).then(function(value) {
//     console.log(value);
// }).catch(function(err) {
//     console.log(`Call to ${err.operationName} failed with error: ${err.err}`);
// });

