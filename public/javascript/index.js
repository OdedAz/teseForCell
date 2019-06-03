var api;
var db = openDatabase('mydb', '1.0', 'Test', 2 * 1024 * 1024);
var baseUrl = 'https://api.datamuse.com/words?ml=';
var columns_names = 'word, score, tags';
var columns_array = ['word','score','tags'];
var table_names = ["AFFILIATE", "MARKETING", "INFLUENCER"];
var columns_declaration = "word unique, score, tags";


jQuery(document).ready(function () {
  //function that get the data from url and runs function addDataToTable(data, table_name)
  function loadData(table_name) {
    $.get("https://api.datamuse.com/words?ml=" + table_name, function (data) { addDataToTable(data, table_name); }, "json");
  }
//function creat all tables in db reqursive with callback function
  function createTablesInDatabase(index, callback) {
    if (index >= table_names.length) {
      console.log('finished going through tables');
      callback();
    }
    else {
      db.transaction(function (tx) {
        createTableSQLStatement = 'CREATE TABLE IF NOT EXISTS ' + table_names[index] + ' (' + columns_declaration + ')';
        console.log(createTableSQLStatement);
        tx.executeSql(createTableSQLStatement);
        index++;
        createTablesInDatabase(index, callback);
      });
    }
  }
// function get data and table name and insert data to the table
  function addDataToTable(result, table_name) {
    $.each(result, function (key, data) {
      db.transaction(function (tx) {
        var values = `"${data.word}","${data.score}","${data.tags}"`;
        var sql = "INSERT INTO " + table_name + " (" + columns_names + ") VALUES (" + values + ")";

        tx.executeSql(sql);
        console.log(sql);
      });
    })
  }

  $('#buttonFetch').click(function () {
    createTablesInDatabase(0, function () {
      $.each(table_names, function (key, value) { loadData(value); });
    });
  });
  $('#buttonShow').click(function () {
    for (i in table_names){
      fetchDataForTable(table_names[i]);
    }
  });
  //function get data and creates html tables on the page
  function insertDataToHTMLTables(data) {
    var len = data.rows.length;
    var doc = document;
    var fragment = doc.createDocumentFragment(data);
    var table_records = doc.createElement("h2");
    table_records.className="table-header";
    table_records.innerHTML="Total records: " + len; 
    fragment.appendChild(table_records);
    var tr_header = doc.createElement("tr");
      var th_word = doc.createElement("th");
      var th_score = doc.createElement("th");
      var th_tags = doc.createElement("th");
      console.log(columns_names);
      th_word.innerHTML = columns_array[0];
      th_score.innerHTML = columns_array[1];
      th_tags.innerHTML = columns_array[2];
      tr_header.appendChild(th_word);
      tr_header.appendChild(th_score);
      tr_header.appendChild(th_tags);
      tr_header.className = "table-header-row";
      fragment.appendChild(tr_header);
    for (i = 0; i < len; i++) {
      var tr = doc.createElement("tr");
      var td_word = doc.createElement("td");
      var td_score = doc.createElement("td");
      var td_tags = doc.createElement("td");
      td_word.innerHTML = data.rows[i].word;
      td_score.innerHTML = data.rows[i].score;
      td_tags.innerHTML = data.rows[i].tags;
      tr.appendChild(td_word);
      tr.appendChild(td_score);
      tr.appendChild(td_tags);
      fragment.appendChild(tr);
    }
    var table = doc.createElement("table");
    table.className="table";
    table.appendChild(fragment);
    doc.getElementById("table-content").appendChild(table);
  }
  //function get table name and fetch the data from local storage∂
  function fetchDataForTable(table_name) {
    db.transaction(function (tx) {
      tx.executeSql('SELECT * FROM ' + table_name, [], function (tx, data) {
      insertDataToHTMLTables(data);
      }, null);
    });
  }
});