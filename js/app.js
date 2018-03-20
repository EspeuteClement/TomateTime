var strings = 
{
    "rush" : "Work Time",
    "pause" : "Pause Time",
    "break" : "Break Time",
    "notif" : "Tomate Time : "
}

var NotifEnum = Object.freeze({"start_work":1, "pause":2, "break":3,})

var rush_time;
var current_time;
var previous_time;
var break_time;
var pause_time;
var notif;

var chrono_callback = null;

// Seriously js ... ><
Number.prototype.pad = function(size) {
    var s = String(this);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
}

// perform init of all the program variables
function init()
{
    if (Notification.permission !== "denied") {
        Notification.requestPermission();
    }

    rush_time = 25 * 60;
    current_time = 25 * 60;
    previous_time = 0;

    break_time = 20 * 60;
    pause_time = 5 * 60;

    phases = 4;
    current_phase = 0;

    chrono_refresh();
    chrono_refresh_indicators();
}

function chrono_start()
{
    if (chrono_callback == null)
    {
        previous_time = (new Date()).getTime();
        chrono_callback = window.setInterval(chrono_tick, 500);
        chrono_refresh();
    }
}

function chrono_stop()
{
    if (chrono_callback != null)
    {
        clearInterval(chrono_callback);
        chrono_callback = null;
        current_time = rush_time;
        chrono_refresh();
    }
}

function chrono_tick()
{
    var time = (new Date()).getTime();
    var modified = false;
    while (time - previous_time > 1000)
    {
        current_time --;
        previous_time += 1000;
        modified = true;
    }

    // Update dom
    if (modified)
    {
        chrono_refresh();
    }

    if (current_time < 0)
    {
        chrono_next_phase();
    }
}

function chrono_next_phase()
{
    current_phase ++;
    var title = document.getElementsByClassName("chrono-title")[0];
    if (current_phase >= phases * 2)
    {
        current_phase = 0;
    }
    
    // If work phase :
    if (current_phase%2 == 0)
    {
        current_time = rush_time;
        title.innerHTML = strings["rush"];
        chrono_notify(NotifEnum.start_work);
        chrono_stop();
    }
    else if (current_phase%2 == 1)
    {
        if (current_phase == phases * 2 - 1)
        {
            current_time = break_time;
            title.innerHTML = strings["break"];
            chrono_notify(NotifEnum.break);
        }
        else
        {
            current_time = pause_time;
            title.innerHTML = strings["pause"];
            chrono_notify(NotifEnum.pause);
        }
    }
    chrono_refresh();
    chrono_refresh_indicators();
}

function chrono_refresh()
{
    var chrono = document.getElementById("chrono");
    chrono.innerHTML = Math.floor(current_time / 60).pad(2) + ":" + Math.floor(current_time % 60).pad(2)
}

function debug_zero()
{
    current_time = 1;
}

function chrono_notify(type)
{
    if (!("Notification" in window)) {
        alert("This browser does not support desktop notification");
    }

    else if (Notification.permission === "granted") {
            if (notif)
            {
                notif.close();
            }

            if (type == NotifEnum.start_work)
            {
                notif = new Notification(strings["notif"] + "Pause finished",
                {
                    icon: "res/tomato_icon.png",
                    body: "You should restart your timer now",
                    requireInteraction: true,
                });
            }
            else if (type == NotifEnum.pause)
            {
                notif = new Notification(strings["notif"] + "Time to ause",
                {
                    icon: "res/tomato_icon.png",
                    body: "You can take a pause now",
                    requireInteraction: true,
                });
            }


    }
}

function chrono_refresh_indicators()
{
    var p = document.getElementsByClassName("chrono-align")[0];
    p.innerHTML = "";
    for (var i = 0; i < phases; i++) {
        var element = document.createElement("span");
        element.innerHTML = "0"
        if (i*2 <= current_phase)
        {
            element.className = "chrono-mark chrono-mark-done"
        }
        else
        {
            element.className = "chrono-mark"
        }
        p.appendChild(element);
    }

}