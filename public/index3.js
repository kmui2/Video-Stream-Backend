$(document).ready(function () {
    var baloon = $('.logo');
    function runIt() {
        baloon.animate({ opacity: '1' }, 1000);
        baloon.animate({ opacity: '0.1' }, 500, runIt);
    }
    runIt();

    $(".body1").fadeIn();
    $(".body2").hide();
    $(".body3").hide();
    $(".body4").hide();
    $(".body5").hide();
    $(".body6").hide();

    $(".title1").click(function () {
        $(".body2").hide();
        $(".body3").hide();
        $(".body4").hide();
        $(".body5").hide();
        $(".body6").hide();
        $(".body1").fadeIn();
        $("#cimg").show();
    });
    $(".title2").click(function () {
        $(".body1").hide();
        $(".body3").hide();
        $(".body4").hide();
        $(".body5").hide();
        $(".body6").hide();
        $(".body2").fadeIn();
        $("#cimg").hide();
    });
    $(".title3").click(function () {
        $(".body1").hide();
        $(".body2").hide();
        $(".body4").hide();
        $(".body5").hide();
        $(".body6").hide();
        $(".body3").fadeIn();
        $("#cimg").hide();
    });
    $(".title4").click(function () {
        $(".body1").hide();
        $(".body2").hide();
        $(".body3").hide();
        $(".body5").hide();
        $(".body6").hide();
        $(".body4").fadeIn();
        $("#cimg").hide();
    });
    $(".title5").click(function () {
        $(".body1").hide();
        $(".body2").hide();
        $(".body3").hide();
        $(".body6").hide();
        $(".body5").fadeIn();
        $(".body4").hide();
        $("#cimg").hide();
    });


    var now = new Date();
    var hours = now.getHours();
    var msg;
    if (hours < 12) msg = "Good Morning";
    else if (hours < 18) msg = "Good Afternoon";
    else msg = "Good Evening";
    $('#time').text(msg);

    $('#register').submit(()=> {
        let username = $('#register #username').val();
        let password = $('#register #password').val();
        let passwordRepeat = $('#register #password-repeat').val();
        let email = $('#register #email').val();

        if(password != passwordRepeat)
            $('#password-repeat').css('border', '2px solid red');
        $.post('/register', { username, password, email }, (result) => {
            if (!result.success)
                alert('Usesrname already exists');
            else {
                localStorage.setItem('username', username);
                $('.title4').remove();
                $('.title5').remove();
                $('#menu').append(
                    `<li>
						<a href="#video" class="title6">Video</a>
                    </li>`
                );
                $(".body1").hide();
                $(".body2").hide();
                $(".body3").hide();
                $(".body4").hide();
                $(".body5").hide();
                $(".body6").fadeIn();
                $(".title6").click(() => {
                    console.log('click')
                    $(".body1").hide();
                    $(".body2").hide();
                    $(".body3").hide();
                    $(".body6").fadeIn();
                    $(".body5").hide();
                    $(".body4").hide();
                    $("#cimg").hide();
                });
                connectToVideo();
            }
        });
        return false;
    })

    $('#login').submit(()=> {
        let username = $('#login #username-login').val();
        let password = $('#login #password-login').val();

        $.post('/login', { username, password }, (result) => {
            if (!result.success)
                alert('Usesrname or Password is Incorrect');
            else {
                localStorage.setItem('username', username);
                $('.title4').remove();
                $('.title5').remove();
                $('#menu').append(
                    `<li>
						<a href="#video" class="title6">Video</a>
                    </li>`
                );
                $(".body1").hide();
                $(".body2").hide();
                $(".body3").hide();
                $(".body4").hide();
                $(".body5").hide();
                $(".body6").fadeIn();
                $(".title6").click(() => {
                    console.log('click')
                    $(".body1").hide();
                    $(".body2").hide();
                    $(".body3").hide();
                    $(".body6").fadeIn();
                    $(".body5").hide();
                    $(".body4").hide();
                    $("#cimg").hide();
                });
                connectToVideo();
            }
        });
        return false;
    })
    function connectToVideo() {
        console.log('video')
        var socket = io();
        $('#msgForm').submit(function () {
            socket.emit('chat message', $('#m').val());
            $('#m').val('');
            return false;
        });
        socket.on('chat message', function (msg) {
            $('#messages').append($('<li>').text(msg));
        });
        $.get('/video_names', (data) => {
            console.log(data)
            data.names.forEach((name) => {
                $('#name').append('<option>'+name+'</option>');
            });
        });
        $('#videoName').submit(() => {
            $('#videoPlayer').remove();
            let name = $('#name').val();
            console.log(name);
            let videoElement =
            `<video id="videoPlayer" controls style="width:40%;height:500px">
                <source src="/video?name=${name}" type="video/mp4">
            </video>`;
            $('#video').append(videoElement);
            return false;
        })
    }
});


/*$(document).ready(function () {
    var person = prompt("Please enter your name", "");
    if (person != null) {
        $("#nam").append(document.createTextNode(", "+person+"!"));
    }
});*/

$(window).scroll(function () {
    if ($(window).scrollTop() >= 200) {
        $('#header').addClass('fixed');
    }
    else {
        $('#header').removeClass('fixed');
    }
});
