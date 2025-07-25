$(function(){

    //adjust non-responsive elements.

    initHomePage();

    /* Attach close button handler */
    $("#container").on("click",".close-button", function(event){
        initHomePage();
    });
    
    /* Service Worker */
    if ('serviceWorker' in navigator) {
       navigator.serviceWorker.register('service-worker.js');
    }
});

var routeList = [
    "hydroponics","butterfly-garden","hortpark","species-conservation",
    "turtle","coral","mangrove","abc","eco-link","percentage",
    "incineration-1","incineration-2","incineration-3","recycle",
    "catchment-water","imported-water","newater","desalinated",
    "marina-lifestyle","marina-flood-control"
]

const initHomePage = () => {
    clearPage();

    var r = new Array(), j = -1;    
    r[++j] = "<div class='header-label green-label'>Look for marker to scan</div>";
    r[++j] = "<video class='video-input' id='videoInput'></video>";
    
    var obj = $(r.join(""));
    $("#container").append(obj)

    /* Start scanning. */
    startScan();
}

var streaming = false;

const startScan = () => {
    var video = $("#videoInput").get(0);
    var canvas_base = $("#canvas").get(0);
    video.width = 480;
    video.height = 640;
    navigator.mediaDevices.getUserMedia({ video: {facingMode: { ideal: 'environment' }}, audio: false })
        .then(function(stream) {
            video.addEventListener("loadedmetadata", function(event){
                canvas_base.width = video.videoWidth;
                canvas_base.height = video.videoHeight;
                $("#canvas").height(72/(canvas_base.width/canvas_base.height));
            });
            video.srcObject = stream;
            video.play();
            
            function processVideo() {
                console.log("Scanning...");
                try {
                    $("#canvas").height(72/(canvas_base.width/canvas_base.height));
                    if (!streaming) {
                        video.src = "";
                        video.srcObject = null;
                        video.pause();
                        return;
                    }
                    var canvas = $("#canvas").get(0);
                    canvas.getContext("2d").drawImage(video, 0, 0, canvas_base.width, canvas_base.height);
                    canvas.toBlob((blob) => sendServer(blob).always(function(){
                        /* Proceed to scan next frame upon return from server. */
                        setTimeout(processVideo, 500);
                    }), 'image/jpeg', 0.90);
                } catch (err) {
                    console.error(err);
                }
            }
            streaming = true;
            setTimeout(processVideo, 200);
        })
        .catch(function(err) {
            alert("An error occurred! " + err);
        });
}

function sendServer(blob){
    var formData = new FormData();
    formData.append('file', blob, "scan.jpg");
    return $.ajax({
        type: "POST",
        cache: false,
        async: false,
        contentType: false,
        processData: false,
        data: formData,
        enctype: 'multipart/form-data',
        url: $("[name='scan_routes_uri']").val(),
        dataType: 'json'
    }).done(function (data) {
        if (data.success == 1 && data.data.match == 1) {
            showRoute(data.data.route, data.data.image)
        }
    });
}

const showRoute = (route, image) => {
    clearPage();
    streaming = false;
    $("#container").append("<img src='assets/images/Close-Button.png' class='close-button' />")
    
    /* Show square image return from server and correct marker. No pointer. */
    $("#container").append("<div class='preview_marker'><img src='assets/images/markers-preview/" + route + ".jpg'/>Answer</div>")
    $("#container").append("<div class='captured_marker'><img src='data:image/jpeg;base64," + image + "'/>Captured</div>")

    $.get("views/" + route + ".html", function(data){
        $("#container").append(data);
    });
}

const clearPage = () => {
    $("#container").empty();
}

function getImage(src){
    return new Promise((resolve, reject) => {
        let random_id = (Math.random() + 1).toString(36).substring(2);
        let img = new Image();
            img.id = random_id;
            img.width = 400;
            img.style.opacity = 0;
            img.onload = () => resolve(random_id);
            img.onerror = reject;
        $("body").append(img);
            img.src = src;
    })
}