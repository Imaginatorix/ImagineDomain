$(document).ready(function() {
    // No reload upon submit
    $("form").submit(function(e) {
        e.preventDefault();
    });

    // Header
    // https://stackoverflow.com/questions/41916200/displaying-navbar-on-multiple-html-pages-using-bootstrap
    // https://stackoverflow.com/questions/11975026/jquery-find-can-i-use-a-callback
    $("header").load("./assets/navbar.html", function() {
        $(".navbar-nav")
            .find("a").each(function() {
                // If same to title, make active
                if ($(this).text() === $("title").text()){
                    $(this).addClass("active");
                }
            });
    });

    // Footer
    $("footer").load("./assets/footer.html");

    $(".content").find("span").each(function(){
        var name_map = {
            "Computer Science": "cs",
            "Mathematics": "math",
            "Statistics": "stat",
            "Biology": "bio",
            "Article": "article",
            "Summary": "summary"
        };

        // Add proper color
        $(this).addClass(`${name_map[$(this).text()]}_color`);
    });

    $(".form-select").change(function(){
        // Show all with the tag, else hide
        $(".blog-list").find(".blog-item").each(function(){
            var matchSubject = false;
            var matchType = false;
            $(this).find("span").each(function(){
                if ($(".form-select#subject-select").val() == "All"){
                    matchSubject = true;
                } else if ($(this).text() == $(".form-select#subject-select").val()){
                    matchSubject = true;
                }

                if ($(".form-select#type-select").val() == "Posts"){
                    matchType = true;
                } else if ($(this).text() == $(".form-select#type-select").val()){
                    matchType = true;
                }
            })

            if (matchType && matchSubject){
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });

    // https://www.tutorialspoint.com/html5/html5_indexeddb.htm
    // https://www.youtube.com/watch?v=yZ26CXny3iI
    const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    // window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
    // window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange
    
    if (!indexedDB && $("title").text() == "Corkboard") {
        alert("Your browser doesn't support a stable version of IndexedDB.")
    }

    var db, len=-1;
    const request = indexedDB.open("postsDB", 1);

    // Update posts
    function updatePosts(){
        $("#postContents").children().remove();

        const store = db.transaction("posts", "readwrite").objectStore("posts");
        const getAllPosts = store.getAll();

        getAllPosts.onsuccess = function(){
            if (len == -1){
                len = getAllPosts.result.length;
            }

            if (len) {
                for (var i=0; i < len; i++) {
                    $("#postContents").append(
                        '<div class="card mb-2 bg-warning bg-gradient col-lg-3 col-md-4 col-6">' +
                            '<div class="card-body text-dark">' +
                                `<p class="card-title large_font">${getAllPosts.result[i].title}</h5>` +
                                `<p class="card-text">${getAllPosts.result[i].message.replace("//n/", "<br>")}</p>` +
                            '</div>' +
                        '</div>'
                    );
                }
            } else {
                $("#postContents").append('<div class="text-center w-100 large_font">No posts were found.</div>');
            }
        }

        getAllPosts.onerror = function(err){
            alert(err);
        }
    }

    request.onsuccess = function(){
        db = request.result;
        updatePosts();
    }

    // Create table
    request.onupgradeneeded = function(event){
        var db = event.target.result;
        const store = db.createObjectStore("posts", { keyPath: "id" });
    }

    // Insert data
    $("#addPost").click(function() {
        var title = $("#post_title").val();
        var message = $("#post_message").val();

        // Check if empty
        if (!(title && message)) {
            alert("Cannot be empty");
            return;
        }

        const store = db.transaction("posts", "readwrite").objectStore("posts");
        const addRequest = store.add({id: len, title: title, message: message});
        
        addRequest.onsuccess = function(){
            len += 1;
            alert("Post added!");
            alert("DB used is based on browser, so as of now, only you can see the posts");
            updatePosts();

            // Blank data
            $("#post_title").val("");
            $("#post_message").val("");
            $("#overlay").css("display", "none");
        }

        addRequest.onerror = function(err){
            alert(err);
        }

    });


    // delete post, currently not available in UI as I commented the button
    $("#deletePosts").click(function() {
        const store = db.transaction("posts", "readwrite").objectStore("posts");
        const clearRequest = store.clear();

        clearRequest.onsuccess = function(){
            updatePosts();
        }
    });

    // Overlay
    $("#toOverlay").click(function() {
        $("#overlay").css("display", "block");
    });

    // Cancel Overlay
    $("#cancelOverlay").click(function() {
        $("#overlay").css("display", "none");
    });
});
