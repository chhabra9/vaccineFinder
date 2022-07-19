//jshint esversion:6
let state=false;
let url="http://localhost:3000/getChatData";
$("#send").on("click",()=>{
    let message=$("#message").val();
    $("#message").val("");
    $("#loadingGif").before("<div class='chat self'><p class='chat-message'>"+message+"</p></div>");
    $("#loadingGif").css("display","inline-block");
    fetch(url,{
        method:'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
                "message":message
        })
    }).then(res=>res.json())
    .then(response=>{
        $("#loadingGif").css("display","none");
        $('#loadingGif').before("<div class='chat friend'><div class='user-photo'><img src='/img/ana.JPG'></div><p class='chat-message'>"+response.returnVal+"</p></div>");
         console.log(response);
    });
});
$("#roboButton").on("click",()=>{
    if(state===false){
        $("#roboButton").css({"right":"15px","bottom":"10px"});
        $(".chatBot").css("display","inline-block");
        state=true;
    }
    else{
        $("#roboButton").css({"right":"80px","bottom":"30px"});
        $(".chatBot").css("display","none");
        state=false;
    }

});