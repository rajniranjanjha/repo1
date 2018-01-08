/**
 *
 */
package com.shutterfly.missioncontrol.processarchive;

import static org.hamcrest.Matchers.equalTo;
import static org.testng.Assert.assertEquals;
import static io.restassured.RestAssured.given;

import com.shutterfly.missioncontrol.common.AppConstants;
import java.io.IOException;
import java.net.URL;
import java.nio.charset.StandardCharsets;

import org.testng.annotations.Test;

import com.google.common.io.Resources;
import com.shutterfly.missioncontrol.common.DatabaseValidationUtil;
import com.shutterfly.missioncontrol.common.EcgFileSafeUtil;
import com.shutterfly.missioncontrol.config.ConfigLoader;
import com.shutterfly.missioncontrol.config.CsvReaderWriter;

import io.restassured.RestAssured;
import io.restassured.config.EncoderConfig;
import io.restassured.http.ContentType;
import io.restassured.response.Response;

/**
 * @author dgupta
 */
public class ProcessArchiveBulkDataOnly extends ConfigLoader {

  private String uri = "";
  private String record = "";

  private String getProperties() {
    basicConfigNonWeb();
    uri = config.getProperty("BaseUrl") + config.getProperty("UrlExtensionProcessArchive");
    return uri;

  }

  private String buildPayload() throws IOException {
    URL file = Resources.getResource("XMLPayload/ProcessArchive/ProcessArchiveBulkDataOnly.xml");
    String payload = Resources.toString(file, StandardCharsets.UTF_8);
    record = cwr.getRequestIdByKeys("BDO");
    return payload = payload.replaceAll("REQUEST_101", record).replaceAll("bulkfile_all_valid.xml",
        (record + "_Archive.xml"));
  }

  CsvReaderWriter cwr = new CsvReaderWriter();

  @Test(groups = "Archive_BDO_Response", dependsOnGroups = {"Post_BDO_DB"})
  private void getResponse() throws IOException {
    basicConfigNonWeb();
    String payload = this.buildPayload();
    record = record + "_Archive";
    EcgFileSafeUtil.putFileAtSourceLocation(EcgFileSafeUtil.buildInboundFilePath(payload),
        record, AppConstants.BULK_FILE);
    EncoderConfig encoderconfig = new EncoderConfig();
    Response response = given()
        .config(RestAssured.config()
            .encoderConfig(
                encoderconfig.appendDefaultContentCharsetToContentTypeIfUndefined(false)))
        .header("saml", config.getProperty("SamlValue")).contentType(ContentType.XML).log().all()
        .body(this.buildPayload()).when().post(this.getProperties());
    assertEquals(response.getStatusCode(), 200, "Assertion for Response code!");
    response.then().body(
        "acknowledgeMsg.acknowledge.validationResults.transactionLevelAck.transaction.transactionStatus",
        equalTo("Accepted"));

  }

  @Test(groups = "Archive_BDO_DB", dependsOnGroups = {"Archive_BDO_Response"})
  private void validateRecordsInDatabase() throws Exception {
    record = record.replace("_Archive", "");
    DatabaseValidationUtil databaseValidationUtil = new DatabaseValidationUtil();
    databaseValidationUtil
        .validateRecordsAvailabilityAndStatusCheck(record, AppConstants.ACCEPTED_BY_ARCHIVAL_SYSTEM,
            AppConstants.ARCHIVE);
  }
}