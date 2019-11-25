var hashtags = [];

// document ready function
$(function () {
    var analyseButton = $("#analyseButton");
    var addButton = $("#addButton");
    var tagInput = $("#hashtags");
    var date123 = $("#dateOfInterest");

    tagInput.focus();
    tagInput.select();
    var hashtagList = $("#hashtagList");
    var analyseButton = $("#analyseButton");

    addButton.click(function () {
        addHashtag(tagInput.val().toLowerCase());
        // clear tag input
        tagInput.val("");
        renderHashtags();
    });

    tagInput.keypress(function (e) {
        if (e.which == 13) {
            addHashtag(tagInput.val().toLowerCase());
            // clear tag input
            tagInput.val("");
            renderHashtags();
            return false;    //<---- Add this line
        }
    })

    function renderHashtags() {
        hashtagList.empty();
        hashtags.forEach(function (tag) {
            var li = $("<li></li>");
            //li.text(tag);
            var a = $("<a class='listelem'></a>");
            a.text("#"+tag)
            var x = $("<sup></sup>");
            x.text("x");
            a.append(x);
            li.append(a);
            li.click(function () {
                console.log("Deleting " + tag);
                deleteHashtag(tag);
                renderHashtags();
            });
            hashtagList.append(li);
        })
    }

    analyseButton.click(function () {
        $.post("/api/analyse",
            {
                tags: hashtags,
                dateOfInterest: date123.val()
            }, function (data, status) {
                console.log(status);
                window.location = "/results.html";
            })
    })
});

function addHashtag(hashtag) {
    if (hashtag && !hashtags.includes(hashtag)) {
        hashtags.push(hashtag);
    }
}

function deleteHashtag(hashtag) {
    console.log(hashtag + " deleted.");
    hashtags = hashtags.filter(function (t) {
        return t != hashtag;
    })
}