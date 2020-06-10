google.charts.load('current', {'packages':['corechart', 'bar', 'table', 'line', 'geochart'], 'mapsApiKey': 'AIzaSyBvMes4G9nnuE_4-4v37cc_UdSXKbTL6ns'});
google.charts.setOnLoadCallback(drawAllSheets);

/* ---------------------------------- Select Excel Tabs and Query Needed Columns --------------------------- */
function drawAllSheets() {
    drawSheetName('SpendingSummary', 'SELECT A,B,C,D', spendingSummaryResponseHandler);
    drawSheetName('SpendingSummary', 'SELECT A,C,E', spendingSummaryOtherVsMilitaryResponseHandler);
    drawSheetName('CountryGDPInMillions', 'SELECT B,J,N,O', averageHealthcareAndGDPResponseHandler);
    drawSheetName('HealthcareSpendingInMillions', 'SELECT Q,R,S,T,U,V,W,X,Y,Z,AA,AB,AC', spendingSummaryHealthcareResponseHandler);
    drawSheetName('HealthcareSpending_PerPerson', 'SELECT A,I,M,N', averageSpendingPerPersonHealthcareResponseHandler);
    drawSheetName('HealthcareSpending_PerPerson', 'SELECT P,Q,R,S,T,U,V,W,X,Y,Z,AA,AB', spendingSummaryPerPersonHealthcareResponseHandler);
    drawSheetName('HealthcareSpendingInMillions', 'SELECT A,AE,AF,AG,AH,AI', spendingHealthcareGrowthResponseHandler);
    drawSheetName('CountryGDPInMillions', 'SELECT B,J,S,T', averageEducationAndGDPResponseHandler);
    drawSheetName('EducationSpendingPercentByGDP', 'SELECT I,J,K,L,M,N,O,P,Q,R,S,T,U', spendingEducationPercentResponseHandler);
    drawSheetName('EducationSpending_PerPerson', 'SELECT A,G', spendingEducationPerPersonResponseHandler);
    drawSheetName('EducationSpendingInMillions', 'SELECT A,K,L,M,N', spendingEducationGrowthResponseHandler);
    drawSheetName('CountryGDPInMillions', 'SELECT B,J,W,X', averageMilitaryAndGDPResponseHandler);
    drawSheetName('MilitarySpendingInMillions', 'SELECT N,O,P,Q,R,S,T,U,V,W,X,Y,Z', spendingSummaryMilitaryResponseHandler);
    drawSheetName('MilitarySpending_PerPerson', 'SELECT A,J,K', spendingMilitaryPerPersonResponseHandler);
} //drawAllSheets

/* ----------------------------------------------- Function to Get Data ----------------------------------- */
function drawSheetName(sheetName, query, responseHandler) {
    var queryString = encodeURIComponent(query);
    var query = new google.visualization.Query(
        'https://docs.google.com/spreadsheets/d/1x2u8sHBYsv2f1CVA_L_BIq_f2wikiOgTh7kjj5RAJes/gviz/tq?sheet=' 
                + sheetName + '&headers=1&tq=' + queryString); //Query
    query.send(responseHandler);
} //drawSheetName

/* ------------------------------------------- Overview Tab Visualizations -------------------------------- */
function spendingSummaryResponseHandler(response) {
    var options = {
        'title':'Average Country Spending',
        legend: { position: 'top' },
        vAxis: {title: 'Millions ($USD)'},
        hAxis: {title: 'Country'},
        animation: {
          duration: 1000,
          easing: 'out'
        }
      };
  
      var chart = new google.visualization.ColumnChart(
          document.getElementById('spending_summary_div'));
      var categories = ['Healthcare', 'Military', 'Education'];
      var data = response.getDataTable();

      var formatter = new google.visualization.NumberFormat({fractionDigits: 0, prefix: '$'});
      formatter.format(data, 1); //apply formatter to the second column
      formatter.format(data, 2); //apply formatter to the third column
      formatter.format(data, 3); //apply formatter to the fourth column

      var view = data.clone();
      var refreshButton = document.getElementById('b1');
      var removeButton = document.getElementById('b2');

      function drawChart(data) {
        // Disabling the buttons while the chart is drawing.
        refreshButton.disabled = true;
        removeButton.disabled = true;
        google.visualization.events.addListener(chart, 'ready',
            function() {
              // Enabling only relevant buttons.
              refreshButton.disabled = (data.getNumberOfColumns() - 1) >= categories.length;
              removeButton.disabled = (data.getNumberOfColumns() - 1) < 2;
            });

        chart.draw(data, options);
      }

      function reload() {
        view = data.clone();
        drawChart(data);
      }
  
      refreshButton.onclick = function() {
        //re-draw chart with original data
        reload();
      }

      removeButton.onclick = function() {
        //Drop a column of the data then re-draw (will not work when 1 column is left)
        view.removeColumn(view.getNumberOfColumns() - 1);
        drawChart(view);
      }

      drawChart(data);
} //spendingSummaryResponseHandler

function spendingSummaryOtherVsMilitaryResponseHandler(response) {
    var data = response.getDataTable();
    data.sort({column: 1, desc:true});

    var formatter = new google.visualization.NumberFormat({fractionDigits: 0, prefix: '$'});
    formatter.format(data, 1); //apply formatter to the second column
    formatter.format(data, 2); //apply formatter to the third column

    var options= {
        'title':'Education and Health Vs. Military spending ',
        legend: { position: 'top' },
        isStacked: 'percent',
        height: 300,
        vAxis: {
          title: 'Country',
          minValue: 0,
          ticks: [0, .3, .6, .9, 1]
        },
        hAxis: {title: 'Overall Spending in Millions ($USD)'}
      };

    var chart = new google.visualization.BarChart(document.getElementById("spending_summary_othersMil_div"));
    chart.draw(data, options);

} //spendingSummaryOtherVsMilitaryResponseHandler

/* ------------------------------------------- Healthcare Tab Visualizations -------------------------------- */
function averageHealthcareAndGDPResponseHandler(response) {
  var data = response.getDataTable();
  data.sort({column: 2, desc:true});  //sort by Healthcare spending

  var formatter = new google.visualization.NumberFormat({fractionDigits: 0, prefix: '$'});
  formatter.format(data, 1); //apply formatter to the second column
  formatter.format(data, 2); //apply formatter to the third column

  var table = new google.visualization.Table(document.getElementById('average_healthcare_vs_gdp_div'));

  var options= {
    height: '70%',
    width: '50%',
    showRowNumber: false
  };

  table.draw(data, options);
}  //averageHealthcareAndGDPResponseHandler

function spendingSummaryHealthcareResponseHandler(response) {

  var options = {
    'title':'Overall Healthcare Spending (2012-2018)',
    legend: { position: 'right' },
    vAxis: {title: 'Millions ($USD)'},
    hAxis: {title: 'Year', format: '#'},
    animation: {
      duration: 1000,
      easing: 'out'
    }
  };

  var chart = new google.visualization.LineChart(document.getElementById('healthcare_spending_summary_div'));
  var countries = ['Australia', 'Brazil', 'China', 'France', 'Germany', 'India', 'Japan', 'Russia', 'Saudi Arabia', 'South Korea', 'UK', 'US'];
  var data = response.getDataTable();

  var formatter = new google.visualization.NumberFormat({fractionDigits: 0, prefix: '$'});
  formatter.format(data, 1); //apply formatter to the second column
  formatter.format(data, 2); //apply formatter to the third column
  formatter.format(data, 3); //apply formatter to the fourth column
  formatter.format(data, 4);
  formatter.format(data, 5);
  formatter.format(data, 6);
  formatter.format(data, 7);

  var view = data.clone();
  var refreshButton = document.getElementById('b3');
  var removeButton = document.getElementById('b4');

  function drawChart(data) {
    // Disabling the buttons while the chart is drawing.
    refreshButton.disabled = true;
    removeButton.disabled = true;
    google.visualization.events.addListener(chart, 'ready',
        function() {
          // Enabling only relevant buttons.
          refreshButton.disabled = (data.getNumberOfColumns() - 1) >= countries.length;
          removeButton.disabled = (data.getNumberOfColumns() - 1) < 2;
        });

    chart.draw(data, options);
  }

  function reload() {
    view = data.clone();
    drawChart(data);
  }

  refreshButton.onclick = function() {
    //re-draw chart with original data
    reload();
  }

  removeButton.onclick = function() {
    //Drop a column of the data then re-draw (will not work when 1 column is left)
    view.removeColumn(view.getNumberOfColumns() - 1);
    drawChart(view);
  }

  drawChart(data);


} //spendingSummaryHealthcareResponseHandler

function averageSpendingPerPersonHealthcareResponseHandler(response) {
  var data = response.getDataTable();
  data.sort({column: 1, desc:true});  //sort by Healthcare spending

  var formatter = new google.visualization.NumberFormat({fractionDigits: 2, prefix: '$'});
  formatter.format(data, 1); //apply formatter to the second column
  formatter.format(data, 2); //apply formatter to the third column

  var table = new google.visualization.Table(document.getElementById('average_healthcare_per_person_div'));

  var options= {
    height: '70%',
    width: '50%',
    showRowNumber: false
  };

  table.draw(data, options);

} //averageSpendingPerPersonHealthcareResponseHandler

function spendingSummaryPerPersonHealthcareResponseHandler(response) {

  var options = {
    title: 'Healthcare Spending Per Person (2012-2018)',
    legend: { position: 'right' },
    hAxis: {title: 'Year',  titleTextStyle: {color: '#333'}, format: '#'},
    vAxis: {minValue: 0},
    isStacked: 'percent',
    animation: {
      duration: 1000,
      easing: 'out'
    }
  };

  var chart = new google.visualization.AreaChart(document.getElementById('summary_healthcare_per_person_div'));
  var countries = ['Australia', 'France', 'Germany', 'Saudi Arabia', 'Brazil', 'Japan', 'South Korea', 'Russia', 'UK', 'China', 'India', 'US'];
  var data = response.getDataTable();

  var view = data.clone();
  var refreshButton = document.getElementById('b5');
  var removeButton = document.getElementById('b6');

  function drawChart(data) {
    // Disabling the buttons while the chart is drawing.
    refreshButton.disabled = true;
    removeButton.disabled = true;
    google.visualization.events.addListener(chart, 'ready',
        function() {
          // Enabling only relevant buttons.
          refreshButton.disabled = (data.getNumberOfColumns() - 1) >= countries.length;
          removeButton.disabled = (data.getNumberOfColumns() - 1) < 2;
        });

    chart.draw(data, options);
  }

  function reload() {
    view = data.clone();
    drawChart(data);
  }

  refreshButton.onclick = function() {
    //re-draw chart with original data
    reload();
  }

  removeButton.onclick = function() {
    //Drop a column of the data then re-draw (will not work when 1 column is left)
    view.removeColumn(view.getNumberOfColumns() - 1);
    drawChart(view);
  }

  drawChart(data);

} //spendingSummaryPerPersonHealthcareResponseHandler

function spendingHealthcareGrowthResponseHandler(response) {
  var data = response.getDataTable();
  
  var options = {
    title : 'Growth of Healthcare Spending by Country',
    bar: {groupWidth: "40%"},
    vAxis: {title: 'Change Percentage', format: "#.#%"},
    hAxis: {title: 'Country'}
  };

  var chart = new google.visualization.ColumnChart(document.getElementById('Healthcare_Spending_Growth_div'));
  chart.draw(data, options);

} //spendingHealthcareGrowthResponseHandler

/* ------------------------------------------- Education Tab Visualizations -------------------------------- */
function averageEducationAndGDPResponseHandler(response) {
  var data = response.getDataTable();
  data.sort({column: 2, desc:true});  //sort by Education spending

  var formatter = new google.visualization.NumberFormat({fractionDigits: 0, prefix: '$'});
  formatter.format(data, 1); //apply formatter to the second column
  formatter.format(data, 2); //apply formatter to the third column

  var table = new google.visualization.Table(document.getElementById('average_education_vs_gdp_div'));

  var options= {
    height: '70%',
    width: '50%',
    showRowNumber: false
  };

  table.draw(data, options);
} //averageEducationAndGDPResponseHandler

function spendingEducationPercentResponseHandler(response) {
  
  var options = {
    title:'Education Spending',
    vAxis: {title: 'Percentage', format: "#.#%"},
    hAxis: {title: 'Year', format: '#'},
    animation: {
      duration: 1000,
      easing: 'out'
    }
  };
  
  var categories = ['Australia', 'Brazil', 'China', 'France',	'Germany', 'India', 'Japan', 
                    'Russia', 'Saudi Arabia',	'South Korea',	'UK',	'US'];
  
  var data = response.getDataTable();
  var chart = new google.charts.Line(document.getElementById("Education_Spending_Percent_div"));
  
  var view = data.clone();
  var refreshButton = document.getElementById('refreshEdu1');
  var removeButton = document.getElementById('removeEdu1');

  function drawChart(data) {
    // Disabling the buttons while the chart is drawing.
    refreshButton.disabled = true;
    removeButton.disabled = true;
    google.visualization.events.addListener(chart, 'ready',
        function() {
          // Enabling only relevant buttons.
          refreshButton.disabled = (data.getNumberOfColumns() - 1) >= categories.length;
          removeButton.disabled = (data.getNumberOfColumns() - 1) < 12;
        });

    chart.draw(data, google.charts.Line.convertOptions(options));
  }

  function reload() {
    view = data.clone();
    drawChart(data);
  }

  refreshButton.onclick = function() {
    //re-draw chart with original data
    reload();
  }

  removeButton.onclick = function() {
    //Drop a column of the data then re-draw (will not work when 1 column is left)
    view.removeColumn(9);
    drawChart(view);
  }

  drawChart(data);

} //spendingEducationPercentResponseHandler

function spendingEducationPerPersonResponseHandler(response) {
  var data = response.getDataTable();

  var formatter = new google.visualization.NumberFormat({fractionDigits: 0, prefix: '$'});
  formatter.format(data, 1); //apply formatter to the second column

  var options = {
      colorAxis: {colors: ['#660000','#DC143C','#FF0000','#FF4500','#FF8C00','#FFD700','#00CED1','#00BFFF','#1E90FF','#004C99']}};

  var chart = new google.visualization.GeoChart(document.getElementById('Education_Spending_Per_Person_div'));

  chart.draw(data, options);

} //spendingEducationPerPersonResponseHandler

function spendingEducationGrowthResponseHandler(response) {
  var data = response.getDataTable();
  
  var options = {
    title : 'Growth of Education Spending by Country',
    bar: {groupWidth: "40%"},
    vAxis: {title: 'Change Percentage', format: "#.#%"},
    hAxis: {title: 'Country'}
  };

  var chart = new google.visualization.ColumnChart(document.getElementById('Education_Spending_Growth_div'));
  chart.draw(data, options);


} //spendingEducationGrowthResponseHandler

/* ------------------------------------------- Military Tab Visualizations -------------------------------- */
function averageMilitaryAndGDPResponseHandler(response) {
  var data = response.getDataTable();
  data.sort({column: 2, desc:true});  //sort by Military spending

  var formatter = new google.visualization.NumberFormat({fractionDigits: 0, prefix: '$'});
  formatter.format(data, 1); //apply formatter to the second column
  formatter.format(data, 2); //apply formatter to the third column

  var table = new google.visualization.Table(document.getElementById('average_military_vs_gdp_div'));

  var options= {
    height: '70%',
    width: '50%',
    showRowNumber: false
  };

  table.draw(data, options);
} //averageMilitaryAndGDPResponseHandler

function spendingSummaryMilitaryResponseHandler(response) {
  
  var options = {
    'title':'Military Spending',
    legend: { position: 'right' },
    vAxis: {title: 'Millions ($USD)'},
    hAxis: {title: 'Year', format: '#'},
    animation: {
      duration: 1000,
      easing: 'out'
    }
  };

  var chart = new google.visualization.LineChart(document.getElementById('Military_Spending_Percent_div'));
  var countries = ['Australia', 'Brazil', 'China', 'France', 'Germany', 'India', 'Japan', 'Russia', 'Saudi Arabia', 'South Korea', 'UK', 'US'];
  var data = response.getDataTable();

  var formatter = new google.visualization.NumberFormat({fractionDigits: 0, prefix: '$'});
  formatter.format(data, 1); //apply formatter to the second column
  formatter.format(data, 2); //apply formatter to the third column
  formatter.format(data, 3); //apply formatter to the fourth column
  formatter.format(data, 4);
  formatter.format(data, 5);
  formatter.format(data, 6);
  formatter.format(data, 7);
  formatter.format(data, 8);
  formatter.format(data, 9);
  formatter.format(data, 10);
  formatter.format(data, 11);
  formatter.format(data, 12);

  var view = data.clone();
  var refreshButton = document.getElementById('refreshMil1');
  var removeButton = document.getElementById('removeMil1');

  function drawChart(data) {
    // Disabling the buttons while the chart is drawing.
    refreshButton.disabled = true;
    removeButton.disabled = true;
    google.visualization.events.addListener(chart, 'ready',
        function() {
          // Enabling only relevant buttons.
          refreshButton.disabled = (data.getNumberOfColumns() - 1) >= countries.length;
          removeButton.disabled = (data.getNumberOfColumns() - 1) < 2;
        });

    chart.draw(data, options);
  }

  function reload() {
    view = data.clone();
    drawChart(data);
  }

  refreshButton.onclick = function() {
    //re-draw chart with original data
    reload();
  }

  removeButton.onclick = function() {
    //Drop a column of the data then re-draw (will not work when 1 column is left)
    view.removeColumn(view.getNumberOfColumns() - 1);
    drawChart(view);
  }

  drawChart(data);

} //spendingMilitaryPercentResponseHandler

function spendingMilitaryPerPersonResponseHandler(response) {
  var data = response.getDataTable();
  
  var options = {
    title: 'Average Military Spending Per Person',
    hAxis: {title: 'Per Person ($USD)'},
    vAxis: {title: 'Annual Growth'},
    bubble: {textStyle: {fontSize: 11}}      
  };

  var chart = new google.visualization.BubbleChart(document.getElementById('Military_Spending_Per_Person_div'));
  chart.draw(data, options);

} //spendingMilitaryPerPersonResponseHandler
