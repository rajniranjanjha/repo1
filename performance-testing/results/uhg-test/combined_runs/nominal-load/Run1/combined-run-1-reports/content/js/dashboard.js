/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();
    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter)
        regexp = new RegExp(seriesFilter, 'i');

    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            var newRow = tBody.insertRow(-1);
            for(var col=0; col < item.data.length; col++){
                var cell = newRow.insertCell(-1);
                cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.21066666666667, "KoPercent": 0.7893333333333333};
    var dataset = [
        {
            "label" : "KO",
            "data" : data.KoPercent,
               "color" : "red"
        },
        {
            "label" : "OK",
            "data" : data.OkPercent,
            "color" : "blue"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round(series.percent)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.96328, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)  ", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9540833333333333, 500, 1500, "Post Status Requests"], "isController": false}, {"data": [0.9868, 500, 1500, "Search Request By Request Id"], "isController": false}, {"data": [0.9682666666666667, 500, 1500, "Process Archive Requests"], "isController": false}, {"data": [0.984, 500, 1500, "Cancel Requests"], "isController": false}, {"data": [0.9874, 500, 1500, "Find Fulfillment History Requests"], "isController": false}, {"data": [0.9543666666666667, 500, 1500, "Process transactional inline data requests"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 75000, 592, 0.7893333333333333, 383.0, 494.0, 1208.0, 20.818141872583535, 24.350236191361194, 12, 22820], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "90th pct", "95th pct", "99th pct", "Throughput", "KB/sec", "Min", "Max"], "items": [{"data": ["Post Status Requests", 30000, 592, 1.9733333333333334, 374.0, 479.0, 984.8799999999756, 8.327259060474221, 10.335862797546845, 47, 16466], "isController": false}, {"data": ["Search Request By Request Id", 2500, 0, 0.0, 299.0, 402.84999999999945, 870.0, 0.7652278037258023, 0.2339110089038846, 12, 1100], "isController": false}, {"data": ["Process Archive Requests", 15000, 0, 0.0, 402.0, 510.9499999999989, 1947.7899999999954, 4.167101897309275, 5.144822829933071, 108, 22820], "isController": false}, {"data": ["Cancel Requests", 7500, 0, 0.0, 258.0, 345.0, 3423.3899999999867, 2.0836701933479245, 2.5679607265674615, 60, 17817], "isController": false}, {"data": ["Find Fulfillment History Requests", 5000, 0, 0.0, 162.0, 226.94999999999982, 4387.349999999986, 1.4996294415649893, 1.2081916902083494, 38, 6240], "isController": false}, {"data": ["Process transactional inline data requests", 15000, 0, 0.0, 462.0, 586.9499999999989, 1941.8599999999751, 4.167181776636278, 4.982140913078145, 121, 16626], "isController": false}]}, function(index, item){
        switch(index){
            case 3:
                item = item.toFixed(2) + '%';
                break;
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["No Nodes Matched \/acknowledgeMsg\/acknowledge\/validationResults\/transactionLevelAck\/transaction\/transactionStatus\/text()='Accepted'", 593, 100.16891891891892, 0.7906666666666666], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);
});
