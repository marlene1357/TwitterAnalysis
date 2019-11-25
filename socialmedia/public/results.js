$(function () {
    var before = $("#before");
    var after = $("#after");
    var hashtags = $("#hashtags");
    var dateOfInterest = $(".dateOfInterest")

    $.get("/api/before", function (data) {
        before.text(data);
    })

    $.get("/api/after", function (data) {
        after.text(data);
    })

    var maximum = 100;
    $.get("/api/hashtags", function (data) {
        hashtags.text(data);
        maximum = maximum * data.length;
    })

    $.get("/api/dateofinterest", function (data) {
        dateOfInterest.text(data);
    })

    var beforeDetailed = $("#beforeDetailed");
    var afterDetailed = $("#afterDetailed");

    $.get("/api/beforeDetailed", function (data) {
        var detailed = JSON.parse(data);
        detailed.forEach(function (t) {
            var b = $("<div class='col-sm box-shadow'></div>");
            b.text("id: " + t._id + " date: " + t._date + " text: " + t._text + " sentiment score: " + t._score);
            beforeDetailed.append(b);
        })
    })

    $.get("/api/afterDetailed", function (data) {
        var detailed = JSON.parse(data);
        detailed.forEach(function (t) {
            var a = $("<div class='col-sm box-shadow'></div>");
            a.text("id: " + t._id + " date: " + t._date + " text: " + t._text + " sentiment score: " + t._score);
            afterDetailed.append(a);
        })
    })

    var test123 = $("#test123")
    $.get("api/beforebarplotdata", function (data) {
        var beforeBarplotData = data;

        $.get("/api/afterbarplotdata", function (data2) {

            drawChart(JSON.parse(beforeBarplotData), JSON.parse(data2));
        });
    });

    let afterBarplotData = [0, 0, 0];

    function drawChart(beforeData, afterData) {

        var ctx = document.getElementById('myChart').getContext('2d');
        var chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'horizontalBar',

            // The data for our dataset
            data: {
                labels: ['negative', 'neutral', 'positive'],
                datasets: [{
                        label: 'before date of interest',
                        backgroundColor: 'rgb(255, 99, 132)',
                        borderColor: 'rgb(255, 99, 132)',
                        data: beforeData
                    },
                    {
                        label: 'after date of interest',
                        backgroundColor: 'rgb(0,191,255)',
                        borderColor: 'rgb(0,191,255)',
                        data: afterData
                    }
                ]
            },

            // Configuration options go here
            options: {
                scales: {
                    xAxes: [{
                        display: true,
                        ticks: {
                            suggestedMin: 0,    // minimum will be 0, unless there is a lower value.
                            max: maximum
                        }
                    }]
                }
            }
        })
    }
})