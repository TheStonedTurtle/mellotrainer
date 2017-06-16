/** CONFIG **/
var resourcename = "mellotrainer";  // Resource Name
var maxVisibleItems = 10;           // Max amount of items in 1 menu (before autopaging kicks in)




/** CODE **/

// Page/Option Memory for the trainer.
var pageMemory = [];
var optionMemory = [];


// Variable Declaration.
var counter;
var currentpage;
var container;
var speedContainer;
var speedText;
var content;
var maxamount;

// Holds deatched HTML elements of each menu (each div).
var menus = [];

// Dynamic menus currently loaded.
var menuLoaded = [];


/** Text/html variable templates **/
var pageindicator = "<p id='pageindicator'></p>"
var trainerOption = "<p class='traineroption'></p>"
var drawableText = "Drawable #"
var textureText = "Texture #"


// Actions used in creating Dynamic Menus.
var dynamicActions = {
    "skinmenu" : "changeskin skin",
    "propmenu" : "changeskin props",
    "vehmods" : "vehmodify"
}

var dynamicIDs = {
    "skinmenu" : "playerskinmenuskins",
    "propmenu" : "playerskinmenuprops",
    "vehmods" : "vehiclesmodmenu",
    "onlineplayers" : "onlineplayersmenu"

}


// IDs for containers created by JS
var weaponTintID = "weapontintsmenu"
var onlinePlayersSubID = "onlineplayersoptionmenu"


// Used for dynamicsubs
var variablesToAdd = {
    "wheeltype" : 0,
    "wheelindex": 0
}

// Called as soon as the page is ready.
$(function() {
    // Update container variable for use throughout project.
    container = $("#trainercontainer");

    /** Containers for Speedometer **/
    speedContainer = $("#speedcontainer");
    speedText = $(".speedtext");

    // Initialize the trainer.
    init();
    

    // Listen for messages from lua.
    window.addEventListener("message", function(event) {
        var item = event.data;
        
        // Trainer Navigiation
        if (item.showtrainer) {
            resetTrainer();
            container.show();
            playSound("YES");
        } 

        if (item.hidetrainer) {
            container.hide();
            playSound("NO");
        }
        
        if (item.trainerenter) {
            handleSelectedOption(false);
        }

        if (item.trainerback) {
            trainerBack();
        }
        
        if (item.trainerup) {
            trainerUp();
        } 

        if (item.trainerdown) {
            trainerDown();
        }
        
        if (item.trainerleft) {
            trainerPrevPage();
        } 

        if (item.trainerright) {
            trainerNextPage();
        }


        // Create a menu with JSON Data from the server.
        // This would be the Dynamic Menus.
        if (item.createmenu){
            var newObject = JSON.parse(item.menudata)
            menuLoaded.push(item.menuName)
            createDynamicMenu(newObject,item.name)
        }

        if(item.createonlineplayersmenu){
            var newObject = JSON.parse(item.menudata)
            menuLoaded.push(item.menuName)
            createOnlinePlayersMenu(newObject, item.name)

            // Remove from loaded menu array to always recreate menu
            menuLoaded.splice(menuLoaded.indexOf(item.menuName), 1)
        }


        // Resets the required dynamic menus so they refresh on next request.
        if (item.resetmenus){
            var items = item.resetmenus.split(" ")
            for(var i=0;i < items.length; i++){
                menuLoaded.splice(menuLoaded.indexOf(items[i]), 1)
            }
        }


        // Flip the toggle back if there was an error executing.
        if (item.toggleerror){
            toggleError()
        }

        // If they passed the security check.
        if (item.vehicleaccess || item.adminaccess){
            handleSelectedOption(true);
        }

        // Used to update the wheel categories for vehicles.
        if (item.updateVariables){
            var newObject = JSON.parse(item.data);
            variablesToAdd['wheeltype'] = Number(newObject.wheeltype);
            variablesToAdd['wheelindex'] = Number(newObject.wheelindex);
        }


        // Speedometer options.
        if (item.showspeed) {
            speedContainer.fadeIn()
            speedText.text(item.speed.toString().split(".")[0]);
        } 
        if (item.hidespeed) {
           speedContainer.fadeOut()
        }
    });
});



/***
 *       _____                           ______                          _     _                       
 *      / ____|                         |  ____|                        | |   (_)                      
 *     | |        ___    _ __    ___    | |__     _   _   _ __     ___  | |_   _    ___    _ __    ___ 
 *     | |       / _ \  | '__|  / _ \   |  __|   | | | | | '_ \   / __| | __| | |  / _ \  | '_ \  / __|
 *     | |____  | (_) | | |    |  __/   | |      | |_| | | | | | | (__  | |_  | | | (_) | | | | | \__ \
 *      \_____|  \___/  |_|     \___|   |_|       \__,_| |_| |_|  \___|  \__| |_|  \___/  |_| |_| |___/
 *                                                                                                     
 *                                                                                                     
 */


// Send data to lua for processing.
function sendData(name, data) {
    $.post("http://" + resourcename + "/" + name, JSON.stringify(data), function(datab) {
        if (datab !== "ok"){
            console.log(datab);
        }            
    });
}


// Used to play a specific sound to the player.
function playSound(sound) {
    sendData("playsound", {name: sound});
}


/***
 *      _______                  _                           _    _   _     _   _   _   _     _              
 *     |__   __|                (_)                         | |  | | | |   (_) | | (_) | |   (_)             
 *        | |     _ __    __ _   _   _ __     ___   _ __    | |  | | | |_   _  | |  _  | |_   _    ___   ___ 
 *        | |    | '__|  / _` | | | | '_ \   / _ \ | '__|   | |  | | | __| | | | | | | | __| | |  / _ \ / __|
 *        | |    | |    | (_| | | | | | | | |  __/ | |      | |__| | | |_  | | | | | | | |_  | | |  __/ \__ \
 *        |_|    |_|     \__,_| |_| |_| |_|  \___| |_|       \____/   \__| |_| |_| |_|  \__| |_|  \___| |___/
 *                                                                                                           
 *                                                                                                           
 */


// Adds the menuText class to any option that links to a menu.
function updateMenuClasses(){
    $(".traineroption").each(function(i, obj){
        if( $(this).attr('data-sub') ){
            if(!$(this).hasClass("menuText")){
                $(this).addClass("menuText");
            }
        }
    });
}


// Updates the class of toggle options based on the state of the toggle.
function updateStateClasses(){
    $(".traineroption").each(function(i, obj){
        if( $(this).attr('data-state') ){
            if ($(this).data("state") == "ON") {
                $(this).removeClass("stateOFF");
                if (!$(this).hasClass("stateON")){
                    $(this).addClass("stateON");
                }
            } else {
                $(this).removeClass("stateON");
                if (!$(this).hasClass("stateOFF")){
                    $(this).addClass("stateOFF");
                }
            }
        }
    });
}


// Toggle error, revert state of a toggle to previous value.
function toggleError(){
    var item = $(".traineroption.selected")

    if (item.attr("data-state") == "ON") {
        newstate = false;
        item.attr("data-state", "OFF");
        item.removeClass("stateON");
        item.addClass("stateOFF");
    } else if (item.attr("data-state") == "OFF") {
        item.attr("data-state", "ON");
        item.removeClass("stateOFF");
        item.addClass("stateON");
    }
}


// Reset the trainer by showing the main menu.
function resetTrainer() {
    showMenu(menus["mainmenu"], false);

    // Reset trainer memory.
    pageMemory = [];
    optionMemory = [];
}


// Does page Exist
function pageExists(page) {
    return content.pages[page] != null;
}



/***
 *      _______                  _                           _   _                   _                   _     _                 
 *     |__   __|                (_)                         | \ | |                 (_)                 | |   (_)                
 *        | |     _ __    __ _   _   _ __     ___   _ __    |  \| |   __ _  __   __  _    __ _    __ _  | |_   _    ___    _ __  
 *        | |    | '__|  / _` | | | | '_ \   / _ \ | '__|   | . ` |  / _` | \ \ / / | |  / _` |  / _` | | __| | |  / _ \  | '_ \ 
 *        | |    | |    | (_| | | | | | | | |  __/ | |      | |\  | | (_| |  \ V /  | | | (_| | | (_| | | |_  | | | (_) | | | | |
 *        |_|    |_|     \__,_| |_| |_| |_|  \___| |_|      |_| \_|  \__,_|   \_/   |_|  \__, |  \__,_|  \__| |_|  \___/  |_| |_|
 *                                                                                        __/ |                                  
 *                                                                                       |___/                                   
 */



// Move Up
function trainerUp() {
    $(".traineroption").eq(counter).removeClass("selected")
    
    if (counter > 0) {
        counter -= 1;
    } else {
        counter = maxamount;
    }

    $(".traineroption").eq(counter).addClass("selected")

    checkHoverAction($(".traineroption").eq(counter))    

    playSound("NAV_UP_DOWN");
}


// Move Down
function trainerDown() {
    $(".traineroption").eq(counter).removeClass("selected")
    
    if (counter < maxamount) {
        counter += 1;
    } else {
        counter = 0;
    }
    
    $(".traineroption").eq(counter).addClass("selected")

    checkHoverAction($(".traineroption").eq(counter))    
    
    playSound("NAV_UP_DOWN");
}


// Previous Page
function trainerPrevPage() {
    var newpage;
    if (pageExists(currentpage - 1)) {
        newpage = currentpage - 1;
    } else {
        newpage = content.maxpages;
    }
    
    showPage(newpage);
    playSound("NAV_UP_DOWN");
}


// Next Page
function trainerNextPage() {
    var newpage;
    if (pageExists(currentpage + 1)) {
        newpage = currentpage + 1;
    } else {
        newpage = 0;
    }
    
    showPage(newpage);
    playSound("NAV_UP_DOWN");
}


// Back Menu
function trainerBack() {
	//sendData("debug","backmenu")
    // If at the "mainmenu" div then we will hide the trainer.
    if (content.menu == menus["mainmenu"].menu) {
        container.hide();
        sendData("trainerclose", {})
    } else {
        showBackMenu(menus[content.menu.attr("data-parent")]);
    }
    
    playSound("BACK");
}


// Checks for hover functionality, used when changing elements.
function checkHoverAction(element){
    if (element.data('hover')){
        var data = element.data("hover").split(" ");
        sendData(data[0], {action: data[1], data: data})
    }
}



// Select Option
function handleSelectedOption(requireSkip) {
    var item = $(".traineroption").eq(counter);

    // Change Menus
     if (item.data("sub")) {
        var targetID = item.data("sub")

        // Does this sub-directory require any permissions?
        if(item.data("require") && !requireSkip){
            var requireString = "require"+item.data("require")
            sendData(requireString, {})
            playSound("SELECT");
            return
        }

        // Grab variable from database if the sub is dynamic
        if(item.data("dynamicsub")){
            targetID = targetID + variablesToAdd[item.data("dynamicsub")]
        }

        var submenu = menus[targetID];

        // Request data from server if the target is dynamic
        if(submenu.menu.attr("data-dynamicmenu")){
        	//sendData("debug","dynamic menu")
        	var text = submenu.menu.attr("data-dynamicmenucallback")
            if(menuLoaded.indexOf(text) === -1){
                sendData(text)
                playSound("SELECT")
                return
            }
        }

        // Share information with submenu.
        if(item.data("share")){
            var shareinfo = item.data("share")
            var shareID = item.data("shareid")
            //sendData("debug","shareinfo: "+shareinfo+" shareID:" + shareID)
            submenu.menu.attr("data-sharedinfo",shareinfo)
            submenu.menu.attr("data-parent",shareID)
            //sendData("debug",submenu.menu.attr("data-parent"))
            menus[targetID] = submenu
        }

        showMenu(submenu, false)

    } else if (item.data("action")) {

        var newstate = true;
        if (item.data("state")) {
            // Toggle Check.
            // .attr() because .data() gives original values
            if (item.attr("data-state") == "ON") {
                newstate = false;
                item.attr("data-state", "OFF");
                item.removeClass("stateON");
                item.addClass("stateOFF");
            } else if (item.attr("data-state") == "OFF") {
                item.attr("data-state", "ON");
                item.removeClass("stateOFF");
                item.addClass("stateON");
            }
        }


        
        var data = item.data("action").split(" ");
        if(item.parent().attr("data-sharedinfo")){
            data = (item.data("action") + " "+ item.parent().attr("data-sharedinfo"))
            data = data.split(" ");
            //sendData("debug",data.join(" "))
        }

        sendData(data[0], {action: data[1], newstate: newstate, data: data});
        //sendData("debug",data.join(" "))
    }
    playSound("SELECT");
}





// used to show a menu (adds back to container)
function showMenu(menu, prevent) {
    // Add the current page/option to memory.
    if(prevent !== true){
        pageMemory.push(currentpage)
        optionMemory.push(counter)
    }

    // Show the new menu, page 0 option 0.
    if (content != null) {
        content.menu.detach();
    }
    
    content = menu;
    container.append(content.menu);

    showPage(0);
}


// Used to show a specific page of the current menu.
function showPage(page) {
    if (currentpage != null) {
        content.menu.children().detach();
    }
    
    currentpage = page;
    
    for (var i = 0; i < content.pages[currentpage].length; ++i) {
        content.menu.append(content.pages[currentpage][i]);
    }
    
    //content.menu.append(pageindicator);
    
    if (content.maxpages > 0) {
        $("#pageindicator").text("Page " + (currentpage + 1) + " / " + (content.maxpages + 1));
    } else {
        $("#pageindicator").text("")
    }
    
    resetSelected();
}


// Reset the selector to top of page.
function resetSelected() {
    $(".traineroption").each(function(i, obj) {
        $(this).removeClass("selected")
    });
    
    counter = 0;
    maxamount = $(".traineroption").length - 1;
    $(".traineroption").eq(0).addClass('selected')


    checkHoverAction($(".traineroption").eq(counter))    
}


// Used to show previous menu page, with memory
function showBackMenu(menu) {
    var newPage = pageMemory[pageMemory.length - 1] || 0
    var newOption = optionMemory[optionMemory.length - 1] || 0


    // Remove the options from memory
    pageMemory.pop()
    optionMemory.pop()

    if (content != null) {
        content.menu.detach();
    }
    
    content = menu;
    container.append(content.menu);
    
    showPageOption(newPage, newOption);

}


// select specific option of the page.
function selectOption(opt) {
    $(".traineroption").each(function(i, obj) {
        $(this).removeClass("selected")
    });
    
    counter = opt;
    maxamount = $(".traineroption").length - 1;
    $(".traineroption").eq(opt).addClass('selected')


    //checkHoverAction($(".traineroption").eq(opt))    
}



// Used to show a Page & its Option. (calls selectOption)
function showPageOption(page,option) {
    if (currentpage != null) {
        content.menu.children().detach();
    }
    
    currentpage = page;
    
    for (var i = 0; i < content.pages[currentpage].length; ++i) {
        content.menu.append(content.pages[currentpage][i]);
    }

    selectOption(option)
    
    //content.menu.append(pageindicator);
    
    if (content.maxpages > 0) {
        $("#pageindicator").text("Page " + (currentpage + 1) + " / " + (content.maxpages + 1));
    } else {
        $("#pageindicator").text("")
    }
}




/***
 *      __  __                             _____                         _     _                 
 *     |  \/  |                           / ____|                       | |   (_)                
 *     | \  / |   ___   _ __    _   _    | |       _ __    ___    __ _  | |_   _    ___    _ __  
 *     | |\/| |  / _ \ | '_ \  | | | |   | |      | '__|  / _ \  / _` | | __| | |  / _ \  | '_ \ 
 *     | |  | | |  __/ | | | | | |_| |   | |____  | |    |  __/ | (_| | | |_  | | | (_) | | | | |
 *     |_|  |_|  \___| |_| |_|  \__,_|    \_____| |_|     \___|  \__,_|  \__| |_|  \___/  |_| |_|
 *                                                                                               
 *                                                                                               
 */

// Find any divs and create a menu page out of them.
function refreshMenus(){
    updateMenuClasses();
    updateStateClasses();
    convertToMenu();
}



function convertToMenu(){
    $("div").each(function(i, obj) {
        // Skip Container elements.
        if ($(this).attr("data-container") == undefined){

            // Create the current menu page.
            var data = {};
            data.menu = $(this).detach();
            data.pages = [];

            // Move all child elements to the pages array.
            $(this).children().each(function(i, obj) {
                // send true state if it exists
                if ($(this).data("state") == "ON") {
                    var statedata = $(this).data("action").split(" ");
                    sendData(statedata[0], {action: statedata[1], newstate: true});
                }
                
                var page = Math.floor(i / maxVisibleItems);
                if (data.pages[page] == null) {
                    data.pages[page] = [];
                }
                
                data.pages[page].push($(this).detach());
                data.maxpages = page;
            });
            
            // Add data to the menu.
            menus[$(this).attr("id")] = data;

            // Needed for recreating Vehicles Weehl Mod HTML
            if($(this).attr("id") == vehicleWheelModID && vehicleModFlag == false){
                vehicleWheelModMenuData = data
                vehicleModFlag = true
            }
        }
    });
}



function createOnlinePlayersMenu(object, name){
    var containerDiv
    var targetID = dynamicIDs[name]
    var objectArray = object[name]

    if($("#"+targetID).html() == undefined){
        containerDiv = menus[targetID].menu.html("").detach()
    } else {
        containerDiv = $("#"+targetID).html("").detach()
    }	

    if(objectArray.length == 0){
        var newEle = $(trainerOption)
        newEle.text("No Online Players")

    	containerDiv.append(newEle)
    }

    for (var i = 0; i < objectArray.length; i++) {
    	var curObj = objectArray[i]

        var newEle = $(trainerOption)
        newEle.attr("data-sub",onlinePlayersSubID)
        newEle.attr("data-share",curObj['spawnName'])
        newEle.attr("data-shareid",targetID)
        newEle.text(curObj['menuName'])

        containerDiv.append(newEle)
    }
    container.append(containerDiv);

    // Add all new menus to the menus object.
    refreshMenus(targetID)

    // Show the requested menu.
    showMenu(menus[targetID], false)

}


// Used to sub menus from JSON.
function createNewMenu(object, newID, oldID, oldSpawnName, oldMenuName, action){
    var newDiv = $("<div></div>")
    newDiv.attr("id",newID)
    newDiv.attr("data-parent",oldID)

    var objectArray = object['options']

    //sendData("debug","creating new menu: "+newID)


    // Add options before the main options

    // Weapon
    if(object["weapon"] == true){
        // Create the option to spawn/remove the weapon.
        var newEle = $(trainerOption)
        newEle.attr("data-action",action + " spawn " +oldSpawnName)
        newEle.attr("data-state","OFF")
        newEle.attr("data-hover",action + " holdweapon " + oldSpawnName)
        newEle.text(oldMenuName)

        newDiv.append(newEle)


    	//sendData("debug","creating weapon menu")


        if(object["ammo"] == true){
            // Add Clip
            var clipEle = $(trainerOption)
            clipEle.text("Add Clip")
            clipEle.attr("data-action","weapon ammo " + oldSpawnName + " add")
            newDiv.append(clipEle)
            // Max Ammo
            var maxEle = $(trainerOption)
            maxEle.text("Max Ammo")
            maxEle.attr("data-action","weapon ammo " + oldSpawnName + " max")
            newDiv.append(maxEle)
        }
        
        // All other option for weapons are weapon modifications.
        action = action + " mod"
    }

    // Add all options to the menu.
    for (var index = 0; index < objectArray.length; index++) {
        var curObject = objectArray[index]

        var optEle = $(trainerOption)
        optEle.attr("data-action",action+" "+oldSpawnName+" "+curObject['spawnName'])
        optEle.text(curObject['menuName'])
        // Figure if this is a toggle?

        //Add to container div
        newDiv.append(optEle)
    }

    // Add options after the main options

    if(object["weapon"] == true){
        // Check for tintable weapons menu to be added.
        if(tintable_weapons.indexOf(oldSpawnName) > -1){
            var newEle = $(trainerOption)
            newEle.attr("data-sub",weaponTintID)
            newEle.attr("data-share",oldSpawnName)
            newEle.attr("data-shareid",newID)
            newEle.text("Weapon Tints")

            newDiv.append(newEle)  
        }
    }

    container.append(newDiv)
}


// Weapon Tint Management.
var weapon_tints = ["Normal","Green","Gold","Pink","Army","LSPD","Orange","Platinum"];
var tintable_weapons = ["WEAPON_STINGER", "WEAPON_MARKSMANPISTOL", "WEAPON_COMBATPDW", "WEAPON_PISTOL", "WEAPON_COMBATPISTOL", "WEAPON_APPISTOL", "WEAPON_PISTOL50", "WEAPON_SNSPISTOL", "WEAPON_HEAVYPISTOL", "WEAPON_VINTAGEPISTOL", "WEAPON_STUNGUN", "WEAPON_FLAREGUN", "WEAPON_MICROSMG", "WEAPON_SMG", "WEAPON_ASSAULTSMG", "WEAPON_MG", "WEAPON_COMBATMG", "WEAPON_GUSENBERG", "WEAPON_ASSAULTRIFLE", "WEAPON_CARBINERIFLE", "WEAPON_ADVANCEDRIFLE", "WEAPON_SPECIALCARBINE", "WEAPON_BULLPUPRIFLE", "WEAPON_PUMPSHOTGUN", "WEAPON_SAWNOFFSHOTGUN", "WEAPON_BULLPUPSHOTGUN", "WEAPON_ASSAULTSHOTGUN", "WEAPON_MUSKET", "WEAPON_HEAVYSHOTGUN", "WEAPON_SNIPERRIFLE", "WEAPON_HEAVYSNIPER", "WEAPON_MARKSMANRIFLE", "WEAPON_GRENADELAUNCHER", "WEAPON_RPG", "WEAPON_MINIGUN", "WEAPON_FIREWORK", "WEAPON_RAILGUN", "WEAPON_HOMINGLAUNCHER", "WEAPON_MACHINEPISTOL", "WEAPON_DBSHOTGUN", "WEAPON_COMPACTRIFLE", "WEAPON_MINISMG", "WEAPON_AUTOSHOTGUN", "WEAPON_COMPACTLAUNCHER" ];
function createWeaponTintsMenu(){
    var newMenu = $("<div></div>")
    newMenu.attr("id",weaponTintID)
    for (var i = 0; i < weapon_tints.length; i++) {
        var newEle = $(trainerOption)
        newEle.text(weapon_tints[i])
        newEle.attr("data-action","weapon tint "+i)

        newMenu.append(newEle)
    }

    container.append(newMenu);
}


// Create static menus
function createStaticMenus(){
    $("div").each(function(i,obj){
        if( $(this).attr("data-staticmenu")){
            // Grab data from JSON.
            var requestKey = $(this).attr("data-staticmenu")
            var requestedObj = requestObjects[requestKey] || modObjects[requestKey];

            var requestedAction = requestAction[requestKey] || dynamicActions["vehmods"];

            var objectLength = requestedObj.length

            //sendData("debug","Creating Static Menu... "+requestKey)

            for(var index=0; index < objectLength; index++){
                var curObj = requestedObj[index]



                var newEle = $(trainerOption)
                newEle.text( (curObj['menuName'] || curObj['name']) )
                

                if(curObj.subOptions !== undefined){
                	var oldID = $(this).attr("id")
                    var newID = oldID + curObj.menuName.toLowerCase().replace(" ","");
                    newEle.attr("data-sub",newID)

                    var subOptions = curObj.subOptions
                    // createNewMenu(subObject,newID,oldID,oldSpawnName)
                    // Custom Options handled in createNewMenu
                    

                    //sendData("debug","Creating suboptions for: "+curObj.spawnName)
                    createNewMenu(subOptions,newID,oldID,curObj.spawnName,curObj.menuName, requestedAction)

                    //createNewMenu(subOption Data, newID, oldID, oldSpawnName, oldMenuName, action)
                    //sendData("debug","request Key" + requestKey)



                } else {
                    newEle.attr("data-action",requestedAction+" "+(curObj.spawnName || (curObj.modtype+" "+curObj.mod)) )
                }

                $(this).append(newEle)                
            }
        }
    });
}


// Hold the Data for the Vehicles Mod Menu so we can Recreate it when necessary.
var vehicleWheelModMenuData = {}
var vehicleWheelModID = "vehiclesmodmenu" // Find better way or retreiving this?
var vehicleModFlag = false

// Recreate Vehicle Wheel Mod Menu
function recreateVehicleWheelModMenuHTML(){
    sendData("debug","recreating mod menu.")
    // Remove the menu if it exists since we are re-creating based off original template.
    showMenu(menus[vehicleWheelModID])
    $("#"+vehicleWheelModID).html("").remove()

    // Readd menu to page.
    var menu = jQuery.extend(true, {}, vehicleWheelModMenuData.menu)
    var pages = jQuery.extend(true, [], vehicleWheelModMenuData.pages)
    for (var i = 0; i < pages.length; i++) {
        for (var index = 0; index < pages[i].length; index++) {
            menu.append(pages[i][index])
        }
    }
    container.append(menu)
}




// Create the Trainer.
function init() {
    // Create all Necessary Static Menus before splitting the HTML into "Menus"
    createWeaponTintsMenu();
    //sendData("debug","Weapon Tint Menu Created.");
    createStaticMenus();
    //sendData("Static Menus Created.");


    // Add the Menu and State Classes to all necessary elements.
    updateMenuClasses();
    //sendData("debug","Menu Classes Added");
    updateStateClasses();
    //sendData("debug","Toggle States Updated");


    //TODO: Request the user preferences before going through all toggle options and applying the true toggles.


    // Find all elements that should be turned into menus.
    convertToMenu()
    //sendData("debug", "Converted to menus.")
}



// used to show a menu (adds back to container)
function showMenuOnly(menu) {
    // Show the new menu, page 0 option 0.
    if (content != null) {
        content.menu.detach();
    }
    
    content = menu;
    sendData("debug","show menu only:" + Object.keys(menu).join(" "))
    //container.append(content.menu)

    if (currentpage != null) {
        content.menu.children().detach();
    } 
    sendData("debug","show menu only:" + content.pages)
    currentpage = 0;
    for (var i = 0; i < content.pages[currentpage].length; ++i) {
        content.menu.append(content.pages[currentpage][i]);
    }

    sendData("debug","show menu only3")
    container.append(content.menu);
}



// Create a Dynamic Menu
function createDynamicMenu(object,name){
	//sendData("debug","Creating Dynamic Menu.")
    var idName = dynamicIDs[name]
    var choiceDiv

    if(name == "vehmods"){
        recreateVehicleWheelModMenuHTML()
        choiceDiv = $("#"+idName).detach()
    } else {
        if($("#"+idName).html() == undefined){
            choiceDiv = menus[idName].menu.detach()
        } else {
	        choiceDiv = $("#"+idName).html("").detach()
	    }
    }

    var objectOrderedKeys = Object.keys(object).sort()
    if(objectOrderedKeys.length == 0 && (name !== "vehmods") ){
        var newEle = $(trainerOption).text("Nothing to Modify.")
        choiceDiv.append(newEle)
    }

    for (var curIndex = 0; curIndex < objectOrderedKeys.length; curIndex++){
        var key = objectOrderedKeys[curIndex]
        var newID = idName + key.toLowerCase()

        // Create the option to select the Feature (with numbers).
        var newEle = $(trainerOption)
        newEle.attr("data-sub", newID)
        newEle.text(key + " (" + object[key].length.toString() + ")")


        if(name == "vehmods"){
            choiceDiv.prepend(newEle)
        } else {
            choiceDiv.append(newEle)
        }


        // Create the div that contains all the options.
        var containerDiv = $("<div></div>")
        containerDiv.attr("id", newID)
        containerDiv.attr("data-parent",idName)

        var defaultAction = dynamicActions[name] + " "

        if(name == "propmenu"){
            // Add reset option for props
            var resetOption = $(trainerOption)
            resetOption.attr("data-hover","clearpropid " + key)
            resetOption.text("Nothing")

            containerDiv.append(resetOption)            
        }

        for (var i = 0; i < object[key].length; i++) {
            
            var currentObject = object[key][i]
            var textureCount = parseInt((currentObject['textureCount'] || 0)) 
            var textureID = currentObject['id']


            // Create the option to select the texture container div.
            var choiceEle = $(trainerOption)

            if(name == "propmenu" || name == "skinmenu"){
                var Action = defaultAction + key + " " + textureID + " 0"
                choiceEle.attr("data-hover", Action)
                choiceEle.text(drawableText + textureID + " (" + textureCount + ")")
            } else if(name == "vehmods"){
                var Action = defaultAction + currentObject.modtype + " " + currentObject.mod
                choiceEle.text(currentObject.name)
                choiceEle.attr("data-action", Action)
            }
            

            if(textureCount > 1){
                choiceEle.attr("data-sub", newID + i.toString())
            }
            // Append the drawable option to its container div.
            containerDiv.append(choiceEle)


            // Only add texture options if more than 1 texture
            if(textureCount > 1){

                // Create the texture container div.
                var textureDivID = newID + i.toString()
                var textureDiv = $("<div></div>")
                textureDiv.attr('id', textureDivID)
                textureDiv.attr("data-parent",newID)

                for(var d = 0; d < textureCount; d++){
                    var textureChoice = $(trainerOption)
                    var curAction = defaultAction + key + " " + currentObject['id'] + " " + d.toString()
                    textureChoice.text(textureText + d.toString())
                    textureChoice.attr("data-hover",curAction)

                    textureDiv.append(textureChoice)
                }

                // Append the textureDiv to the container.
                container.append(textureDiv)
            }

        }

        container.append(containerDiv);
    }
 

    container.append(choiceDiv);

    // Add all new menus to the menus object.
    refreshMenus(idName)

    // Show the requested menu.
    showMenu(menus[idName], false)
	//sendData("debug","Created Menu")
}









/***
 *       _____   _______              _______   _____    _____          _    _____    ____    _   _   
 *      / ____| |__   __|     /\     |__   __| |_   _|  / ____|        | |  / ____|  / __ \  | \ | |  
 *     | (___      | |       /  \       | |      | |   | |             | | | (___   | |  | | |  \| |  
 *      \___ \     | |      / /\ \      | |      | |   | |         _   | |  \___ \  | |  | | | . ` |  
 *      ____) |    | |     / ____ \     | |     _| |_  | |____    | |__| |  ____) | | |__| | | |\  |  
 *     |_____/     |_|    /_/    \_\    |_|    |_____|  \_____|    \____/  |_____/   \____/  |_| \_|  
 *                                                                                                    
 *                                                                                                    
 */

// All Static JSON should have a menuName and a spawnName attribute.


// Ped Spawning Lists.
var playerList = [{'menuName' : "Michael",'spawnName' : "player_zero"},{'menuName' : "Franklin", 'spawnName' : "player_one"},{'menuName' : "Trevor", 'spawnName' : "player_two"}, {'menuName': "MP Male", 'spawnName': "mp_m_freemode_01"}, {'menuName': "MP Female", 'spawnName': "mp_f_freemode_01"}]
var AnimalList = [{'menuName': "Boar", 'spawnName' : "a_c_boar"},{'menuName': "Cat", 'spawnName' : "a_c_cat_01"},{'menuName': "Chimp", 'spawnName' : "a_c_chimp"},{'menuName': "Chop-BROKEN", 'spawnName' : "a_c_chop"},{'menuName': "Cormorant", 'spawnName' : "a_c_cormorant"},{'menuName': "Cow", 'spawnName' : "a_c_cow"},{'menuName': "Coyote", 'spawnName' : "a_c_coyote"},{'menuName': "Crow", 'spawnName' : "a_c_crow"},{'menuName': "Deer", 'spawnName' : "a_c_deer"},{'menuName': "Dolphin", 'spawnName' : "a_c_dolphin"},{'menuName': "Fish", 'spawnName' : "a_c_fish"},{'menuName': "Hawk", 'spawnName' : "a_c_chickenhawk"},{'menuName': "Hen", 'spawnName' : "a_c_hen"},{'menuName': "Humpback", 'spawnName' : "a_c_humpback"},{'menuName': "Husky-BROKEN", 'spawnName' : "a_c_husky"},{'menuName': "Mtlion-BROKEN", 'spawnName' : "a_c_mtlion"},{'menuName': "Pig", 'spawnName' : "a_c_pig"},{'menuName': "Pigeon", 'spawnName' : "a_c_pigeon"},{'menuName': "Rat", 'spawnName' : "a_c_rat"},{'menuName': "Retriever-BROKEN", 'spawnName' : "a_c_retriever"},{'menuName': "Rhesus", 'spawnName' : "a_c_rhesus"},{'menuName': "Seagull", 'spawnName' : "a_c_seagull"},{'menuName': "Sharkhammer", 'spawnName' : "a_c_sharkhammer"},{'menuName': "Sharktiger-BROKEN", 'spawnName' : "a_c_sharktiger"},{'menuName': "Shepherd-BROKEN", 'spawnName' : "a_c_shepherd"},{'menuName': "Whale", 'spawnName' : "a_c_killerwhale"}]
var NPCList = [{'menuName': "Abigail", 'spawnName' : "ig_abigail"},{'menuName': "Abigail Mathers", 'spawnName' : "csb_abigail"},{'menuName': "Abner", 'spawnName' : "u_m_y_abner"},{'menuName': "African American Male", 'spawnName' : "a_m_m_afriamer_01"},{'menuName': "Airhostess", 'spawnName' : "s_f_y_airhostess_01"},{'menuName': "Airworker", 'spawnName' : "s_m_y_airworker"},{'menuName': "Aldinapoli", 'spawnName' : "u_m_m_aldinapoli"},{'menuName': "Alien", 'spawnName' : "s_m_m_movalien_01"},{'menuName': "Altruist Cult Old Male", 'spawnName' : "a_m_o_acult_01"},{'menuName': "Altruist Cult Old Male 2", 'spawnName' : "a_m_o_acult_02"},{'menuName': "Altruist Cult Young Male", 'spawnName' : "a_m_y_acult_01"},{'menuName': "Altruist Cult Young Male 2", 'spawnName' : "a_m_y_acult_02"},{'menuName': "Altruist cult Mid-Age Male", 'spawnName' : "a_m_m_acult_01"},{'menuName': "Amandatownley", 'spawnName' : "ig_amandatownley"},{'menuName': "Amandatownley-BROKEN", 'spawnName' : "cs_amandatownley"},{'menuName': "Ammucity", 'spawnName' : "s_m_y_ammucity_01"},{'menuName': "Ammucountry", 'spawnName' : "s_m_m_ammucountry"},{'menuName': "Andreas", 'spawnName' : "ig_andreas"},{'menuName': "Andreas-BROKEN", 'spawnName' : "cs_andreas"},{'menuName': "Anita Mendoza", 'spawnName' : "csb_anita"},{'menuName': "Anton Beaudelaire", 'spawnName' : "csb_anton"},{'menuName': "Antonb", 'spawnName' : "u_m_y_antonb"},{'menuName': "Armboss", 'spawnName' : "g_m_m_armboss_01"},{'menuName': "Armgoon", 'spawnName' : "g_m_m_armgoon_01"},{'menuName': "Armgoon", 'spawnName' : "g_m_y_armgoon_02"},{'menuName': "Armlieut", 'spawnName' : "g_m_m_armlieut_01"},{'menuName': "Armoured", 'spawnName' : "mp_s_m_armoured_01"},{'menuName': "Armoured", 'spawnName' : "s_m_m_armoured_01"},{'menuName': "Armoured", 'spawnName' : "s_m_m_armoured_02"},{'menuName': "Armymech", 'spawnName' : "s_m_y_armymech_01"},{'menuName': "Ashley", 'spawnName' : "ig_ashley"},{'menuName': "Ashley-BROKEN", 'spawnName' : "cs_ashley"},{'menuName': "Autopsy", 'spawnName' : "s_m_y_autopsy_01"},{'menuName': "Autoshop", 'spawnName' : "s_m_m_autoshop_01"},{'menuName': "Autoshop", 'spawnName' : "s_m_m_autoshop_02"},{'menuName': "Azteca", 'spawnName' : "g_m_y_azteca_01"},{'menuName': "Babyd", 'spawnName' : "u_m_y_babyd"},{'menuName': "Ballaeast", 'spawnName' : "g_m_y_ballaeast_01"},{'menuName': "Ballaorig", 'spawnName' : "g_m_y_ballaorig_01"},{'menuName': "Ballas", 'spawnName' : "g_f_y_ballas_01"},{'menuName': "Ballas OG", 'spawnName' : "csb_ballasog"},{'menuName': "Ballasog", 'spawnName' : "ig_ballasog"},{'menuName': "Ballasout", 'spawnName' : "g_m_y_ballasout_01"},{'menuName': "Bankman", 'spawnName' : "ig_bankman"},{'menuName': "Bankman", 'spawnName' : "u_m_m_bankman"},{'menuName': "Bankman-BROKEN", 'spawnName' : "cs_bankman"},{'menuName': "Barman", 'spawnName' : "s_m_y_barman_01"},{'menuName': "Barry", 'spawnName' : "ig_barry"},{'menuName': "Barry-BROKEN", 'spawnName' : "cs_barry"},{'menuName': "Barry_P", 'spawnName' : "ig_barry_p"},{'menuName': "Barry_P-BROKEN", 'spawnName' : "cs_barry_p"},{'menuName': "Bartender", 'spawnName' : "s_f_y_bartender_01"},{'menuName': "Baygor", 'spawnName' : "u_m_y_baygor"},{'menuName': "Baywatch", 'spawnName' : "s_f_y_baywatch_01"},{'menuName': "Baywatch", 'spawnName' : "s_m_y_baywatch_01"},{'menuName': "Beach Female", 'spawnName' : "a_f_m_beach_01"},{'menuName': "Beach Male", 'spawnName' : "a_m_m_beach_01"},{'menuName': "Beach Male 2", 'spawnName' : "a_m_m_beach_02"},{'menuName': "Beach Muscle Male", 'spawnName' : "a_m_y_musclbeac_01"},{'menuName': "Beach Muscle Male 2", 'spawnName' : "a_m_y_musclbeac_02"},{'menuName': "Beach Old Male", 'spawnName' : "a_m_o_beach_01"},{'menuName': "Beach Tramp Female", 'spawnName' : "a_f_m_trampbeac_01"},{'menuName': "Beach Tramp Male", 'spawnName' : "a_m_m_trampbeac_01"},{'menuName': "Beach Young Female", 'spawnName' : "a_f_y_beach_01"},{'menuName': "Beach Young Male", 'spawnName' : "a_m_y_beach_01"},{'menuName': "Beach Young Male 2", 'spawnName' : "a_m_y_beach_02"},{'menuName': "Beach Young Male 3", 'spawnName' : "a_m_y_beach_03"},{'menuName': "Bestmen", 'spawnName' : "ig_bestmen"},{'menuName': "Beverly", 'spawnName' : "ig_beverly"},{'menuName': "Beverly Hills Female", 'spawnName' : "a_f_m_bevhills_01"},{'menuName': "Beverly Hills Female 2", 'spawnName' : "a_f_m_bevhills_02"},{'menuName': "Beverly Hills Male", 'spawnName' : "a_m_m_bevhills_01"},{'menuName': "Beverly Hills Male 2", 'spawnName' : "a_m_m_bevhills_02"},{'menuName': "Beverly Hills Young Female", 'spawnName' : "a_f_y_bevhills_01"},{'menuName': "Beverly Hills Young Female 2", 'spawnName' : "a_f_y_bevhills_02"},{'menuName': "Beverly Hills Young Female 3", 'spawnName' : "a_f_y_bevhills_03"},{'menuName': "Beverly Hills Young Female 4", 'spawnName' : "a_f_y_bevhills_04"},{'menuName': "Beverly Hills Young Male", 'spawnName' : "a_m_y_bevhills_01"},{'menuName': "Beverly Hills Young Male 2", 'spawnName' : "a_m_y_bevhills_02"},{'menuName': "Beverly-BROKEN", 'spawnName' : "cs_beverly"},{'menuName': "Beverly_P", 'spawnName' : "ig_beverly_p"},{'menuName': "Beverly_P-BROKEN", 'spawnName' : "cs_beverly_p"},{'menuName': "Bikehire", 'spawnName' : "u_m_m_bikehire_01"},{'menuName': "Bikerchic", 'spawnName' : "u_f_y_bikerchic"},{'menuName': "Black Street Male", 'spawnName' : "a_m_y_stbla_01"},{'menuName': "Black Street Male 2", 'spawnName' : "a_m_y_stbla_02"},{'menuName': "Blackops", 'spawnName' : "s_m_y_blackops_01"},{'menuName': "Blackops", 'spawnName' : "s_m_y_blackops_02"},{'menuName': "Bodybuilder Female", 'spawnName' : "a_f_m_bodybuild_01"},{'menuName': "Bouncer", 'spawnName' : "s_m_m_bouncer_01"},{'menuName': "Brad", 'spawnName' : "ig_brad"},{'menuName': "Brad-BROKEN", 'spawnName' : "cs_brad"},{'menuName': "Bradcadaver-BROKEN", 'spawnName' : "cs_bradcadaver"},{'menuName': "Breakdancer Male", 'spawnName' : "a_m_y_breakdance_01"},{'menuName': "Bride", 'spawnName' : "ig_bride"},{'menuName': "Bride-BROKEN", 'spawnName' : "csb_bride"},{'menuName': "Burger Drug Worker", 'spawnName' : "csb_burgerdrug"},{'menuName': "Burgerdrug", 'spawnName' : "u_m_y_burgerdrug_01"},{'menuName': "Busboy", 'spawnName' : "s_m_y_busboy_01"},{'menuName': "Business Casual", 'spawnName' : "a_m_y_busicas_01"},{'menuName': "Business Female 2", 'spawnName' : "a_f_m_business_02"},{'menuName': "Business Male", 'spawnName' : "a_m_m_business_01"},{'menuName': "Business Young Female", 'spawnName' : "a_f_y_business_01"},{'menuName': "Business Young Female 2", 'spawnName' : "a_f_y_business_02"},{'menuName': "Business Young Female 3", 'spawnName' : "a_f_y_business_03"},{'menuName': "Business Young Female 4", 'spawnName' : "a_f_y_business_04"},{'menuName': "Business Young Male", 'spawnName' : "a_m_y_business_01"},{'menuName': "Business Young Male 2", 'spawnName' : "a_m_y_business_02"},{'menuName': "Business Young Male 3", 'spawnName' : "a_m_y_business_03"},{'menuName': "Busker", 'spawnName' : "s_m_o_busker_01"},{'menuName': "Car 3 Guy 1", 'spawnName' : "csb_car3guy1"},{'menuName': "Car 3 Guy 2", 'spawnName' : "csb_car3guy2"},{'menuName': "Car3Guy1", 'spawnName' : "ig_car3guy1"},{'menuName': "Car3Guy2", 'spawnName' : "ig_car3guy2"},{'menuName': "Carbuyer-BROKEN", 'spawnName' : "cs_carbuyer"},{'menuName': "Casey", 'spawnName' : "ig_casey"},{'menuName': "Casey-BROKEN", 'spawnName' : "cs_casey"},{'menuName': "Chef", 'spawnName' : "ig_chef"},{'menuName': "Chef", 'spawnName' : "s_m_y_chef_01"},{'menuName': "Chemsec", 'spawnName' : "s_m_m_chemsec_01"},{'menuName': "Chemwork", 'spawnName' : "g_m_m_chemwork_01"},{'menuName': "Chemwork_P", 'spawnName' : "g_m_m_chemwork_01_p"},{'menuName': "Chengsr", 'spawnName' : "ig_chengsr"},{'menuName': "Chengsr-BROKEN", 'spawnName' : "cs_chengsr"},{'menuName': "Chiboss", 'spawnName' : "g_m_m_chiboss_01"},{'menuName': "Chiboss_P", 'spawnName' : "g_m_m_chiboss_01_p"},{'menuName': "Chicold", 'spawnName' : "g_m_m_chicold_01"},{'menuName': "Chicold_P", 'spawnName' : "g_m_m_chicold_01_p"},{'menuName': "Chigoon", 'spawnName' : "g_m_m_chigoon_01"},{'menuName': "Chigoon", 'spawnName' : "g_m_m_chigoon_02"},{'menuName': "Chigoon_P", 'spawnName' : "g_m_m_chigoon_01_p"},{'menuName': "Chinese Goon", 'spawnName' : "csb_chin_goon"},{'menuName': "Chip", 'spawnName' : "u_m_y_chip"},{'menuName': "Chrisformage", 'spawnName' : "ig_chrisformage"},{'menuName': "Chrisformage-BROKEN", 'spawnName' : "cs_chrisformage"},{'menuName': "Ciasec", 'spawnName' : "s_m_m_ciasec_01"},{'menuName': "Claude", 'spawnName' : "mp_m_claude_01"},{'menuName': "Clay", 'spawnName' : "ig_clay"},{'menuName': "Clay-BROKEN", 'spawnName' : "cs_clay"},{'menuName': "Claypain", 'spawnName' : "ig_claypain"},{'menuName': "Cletus", 'spawnName' : "csb_cletus"},{'menuName': "Cletus", 'spawnName' : "ig_cletus"},{'menuName': "Clown", 'spawnName' : "s_m_y_clown_01"},{'menuName': "Cntrybar", 'spawnName' : "s_m_m_cntrybar_01"},{'menuName': "Comjane", 'spawnName' : "u_f_y_comjane"},{'menuName': "Construct", 'spawnName' : "s_m_y_construct_01"},{'menuName': "Construct", 'spawnName' : "s_m_y_construct_02"},{'menuName': "Cooker", 'spawnName' : "csb_chef"},{'menuName': "Cop", 'spawnName' : "csb_cop"},{'menuName': "Cop", 'spawnName' : "s_f_y_cop_01"},{'menuName': "Cop", 'spawnName' : "s_m_y_cop_01"},{'menuName': "Corpse", 'spawnName' : "u_f_m_corpse_01"},{'menuName': "Corpse", 'spawnName' : "u_f_y_corpse_01"},{'menuName': "Corpse", 'spawnName' : "u_f_y_corpse_02"},{'menuName': "Customer", 'spawnName' : "csb_customer"},{'menuName': "Cyclist", 'spawnName' : "u_m_y_cyclist_01"},{'menuName': "Cyclist Male", 'spawnName' : "a_m_y_cyclist_01"},{'menuName': "Cyclist Sport", 'spawnName' : "a_m_y_roadcyc_01"},{'menuName': "Dale", 'spawnName' : "ig_dale"},{'menuName': "Dale-BROKEN", 'spawnName' : "cs_dale"},{'menuName': "Davenorton", 'spawnName' : "ig_davenorton"},{'menuName': "Davenorton-BROKEN", 'spawnName' : "cs_davenorton"},{'menuName': "Deadhooker", 'spawnName' : "mp_f_deadhooker"},{'menuName': "Dealer", 'spawnName' : "s_m_y_dealer_01"},{'menuName': "Debra-BROKEN", 'spawnName' : "cs_debra"},{'menuName': "Denise", 'spawnName' : "ig_denise"},{'menuName': "Denise's Friend", 'spawnName' : "csb_denise_friend"},{'menuName': "Denise-BROKEN", 'spawnName' : "cs_denise"},{'menuName': "Devin", 'spawnName' : "ig_devin"},{'menuName': "Devin-BROKEN", 'spawnName' : "cs_devin"},{'menuName': "Devinsec", 'spawnName' : "s_m_y_devinsec_01"},{'menuName': "Dockwork", 'spawnName' : "s_m_m_dockwork_01"},{'menuName': "Dockwork", 'spawnName' : "s_m_y_dockwork_01"},{'menuName': "Doctor", 'spawnName' : "s_m_m_doctor_01"},{'menuName': "Dom", 'spawnName' : "ig_dom"},{'menuName': "Dom-BROKEN", 'spawnName' : "cs_dom"},{'menuName': "Doorman", 'spawnName' : "s_m_y_doorman_01"},{'menuName': "Downtown Female", 'spawnName' : "a_f_m_downtown_01"},{'menuName': "Downtown Male", 'spawnName' : "a_m_y_downtown_01"},{'menuName': "Dreyfuss", 'spawnName' : "ig_dreyfuss"},{'menuName': "Dreyfuss-BROKEN", 'spawnName' : "cs_dreyfuss"},{'menuName': "Drfriedlander", 'spawnName' : "ig_drfriedlander"},{'menuName': "Drfriedlander-BROKEN", 'spawnName' : "cs_drfriedlander"},{'menuName': "Dwservice", 'spawnName' : "s_m_y_dwservice_01"},{'menuName': "Dwservice", 'spawnName' : "s_m_y_dwservice_02"},{'menuName': "East SA Male", 'spawnName' : "a_m_m_eastsa_01"},{'menuName': "East SA Male", 'spawnName' : "a_m_m_eastsa_02"},{'menuName': "East SA Young Female", 'spawnName' : "a_f_y_eastsa_01"},{'menuName': "East SA Young Female 2", 'spawnName' : "a_f_y_eastsa_02"},{'menuName': "East SA Young Female 3", 'spawnName' : "a_f_y_eastsa_03"},{'menuName': "East SA Young Male", 'spawnName' : "a_m_y_eastsa_01"},{'menuName': "East SA Young Male", 'spawnName' : "a_m_y_eastsa_02"},{'menuName': "Eastsa SA Female", 'spawnName' : "a_f_m_eastsa_01"},{'menuName': "Eastsa SA Female 2", 'spawnName' : "a_f_m_eastsa_02"},{'menuName': "Epsilon Female", 'spawnName' : "a_f_y_epsilon_01"},{'menuName': "Epsilon Male", 'spawnName' : "a_m_y_epsilon_01"},{'menuName': "Epsilon Male 2", 'spawnName' : "a_m_y_epsilon_02"},{'menuName': "Exarmy", 'spawnName' : "mp_m_exarmy_01"},{'menuName': "Fabien", 'spawnName' : "ig_fabien"},{'menuName': "Fabien-BROKEN", 'spawnName' : "cs_fabien"},{'menuName': "Factory", 'spawnName' : "s_f_y_factory_01"},{'menuName': "Factory", 'spawnName' : "s_m_y_factory_01"},{'menuName': "Famca", 'spawnName' : "g_m_y_famca_01"},{'menuName': "Famdd", 'spawnName' : "mp_m_famdd_01"},{'menuName': "Famdnf", 'spawnName' : "g_m_y_famdnf_01"},{'menuName': "Famfor", 'spawnName' : "g_m_y_famfor_01"},{'menuName': "Families", 'spawnName' : "g_f_y_families_01"},{'menuName': "Families Gang Member", 'spawnName' : "csb_ramp_gang"},{'menuName': "Farmer", 'spawnName' : "a_m_m_farmer_01"},{'menuName': "Fat Black Female", 'spawnName' : "a_f_m_fatbla_01"},{'menuName': "Fat Cult Female", 'spawnName' : "a_f_m_fatcult_01"},{'menuName': "Fat Latino Male", 'spawnName' : "a_m_m_fatlatin_01"},{'menuName': "Fat white Female", 'spawnName' : "a_f_m_fatwhite_01"},{'menuName': "Fbisuit", 'spawnName' : "ig_fbisuit_01"},{'menuName': "Fbisuit-BROKEN", 'spawnName' : "cs_fbisuit_01"},{'menuName': "Fembarber", 'spawnName' : "s_f_m_fembarber"},{'menuName': "Fibarchitect", 'spawnName' : "u_m_m_fibarchitect"},{'menuName': "Fibmugger", 'spawnName' : "u_m_y_fibmugger_01"},{'menuName': "Fiboffice", 'spawnName' : "s_m_m_fiboffice_01"},{'menuName': "Fiboffice", 'spawnName' : "s_m_m_fiboffice_02"},{'menuName': "Fibsec", 'spawnName' : "mp_m_fibsec_01"},{'menuName': "Filmdirector", 'spawnName' : "u_m_m_filmdirector"},{'menuName': "Finguru", 'spawnName' : "u_m_o_finguru_01"},{'menuName': "Fireman", 'spawnName' : "s_m_y_fireman_01"},{'menuName': "Fitness Female", 'spawnName' : "a_f_y_fitness_01"},{'menuName': "Fitness Female 2", 'spawnName' : "a_f_y_fitness_02"},{'menuName': "Floyd", 'spawnName' : "ig_floyd"},{'menuName': "Floyd-BROKEN", 'spawnName' : "cs_floyd"},{'menuName': "Fos Rep", 'spawnName' : "csb_fos_rep"},{'menuName': "Gaffer", 'spawnName' : "s_m_m_gaffer_01"},{'menuName': "Gang", 'spawnName' : "ig_ramp_gang"},{'menuName': "Garbage", 'spawnName' : "s_m_y_garbage"},{'menuName': "Gardener", 'spawnName' : "s_m_m_gardener_01"},{'menuName': "Gay Male", 'spawnName' : "a_m_y_gay_01"},{'menuName': "Gay Male 2", 'spawnName' : "a_m_y_gay_02"},{'menuName': "General Fat Male", 'spawnName' : "a_m_m_genfat_01"},{'menuName': "General Fat Male 2", 'spawnName' : "a_m_m_genfat_02"},{'menuName': "General Hot Young Female", 'spawnName' : "a_f_y_genhot_01"},{'menuName': "General Street Old Female", 'spawnName' : "a_f_o_genstreet_01"},{'menuName': "General Street Old Male", 'spawnName' : "a_m_o_genstreet_01"},{'menuName': "General Street Young Male", 'spawnName' : "a_m_y_genstreet_01"},{'menuName': "General Street Young Male 2", 'spawnName' : "a_m_y_genstreet_02"},{'menuName': "Gentransport", 'spawnName' : "s_m_m_gentransport"},{'menuName': "Gerald", 'spawnName' : "csb_g"},{'menuName': "Glenstank", 'spawnName' : "u_m_m_glenstank_01"},{'menuName': "Golfer Male", 'spawnName' : "a_m_m_golfer_01"},{'menuName': "Golfer Young Female", 'spawnName' : "a_f_y_golfer_01"},{'menuName': "Golfer Young Male", 'spawnName' : "a_m_y_golfer_01"},{'menuName': "Griff", 'spawnName' : "u_m_m_griff_01"},{'menuName': "Grip", 'spawnName' : "s_m_y_grip_01"},{'menuName': "Groom", 'spawnName' : "ig_groom"},{'menuName': "Groom-BROKEN", 'spawnName' : "csb_groom"},{'menuName': "Grove Street Dealer", 'spawnName' : "csb_grove_str_dlr"},{'menuName': "Guadalope-BROKEN", 'spawnName' : "cs_guadalope"},{'menuName': "Guido", 'spawnName' : "u_m_y_guido_01"},{'menuName': "Gunvend", 'spawnName' : "u_m_y_gunvend_01"},{'menuName': "Gurk-BROKEN", 'spawnName' : "cs_gurk"},{'menuName': "Hairdress", 'spawnName' : "s_m_m_hairdress_01"},{'menuName': "Hao", 'spawnName' : "csb_hao"},{'menuName': "Hao", 'spawnName' : "ig_hao"},{'menuName': "Hasidic Jew Male", 'spawnName' : "a_m_m_hasjew_01"},{'menuName': "Hasidic Jew Young Male", 'spawnName' : "a_m_y_hasjew_01"},{'menuName': "Hc_Driver", 'spawnName' : "hc_driver"},{'menuName': "Hc_Gunman", 'spawnName' : "hc_gunman"},{'menuName': "Hc_Hacker", 'spawnName' : "hc_hacker"},{'menuName': "Hic", 'spawnName' : "ig_ramp_hic"},{'menuName': "Hick", 'spawnName' : "csb_ramp_hic"},{'menuName': "Highsec", 'spawnName' : "s_m_m_highsec_01"},{'menuName': "Highsec", 'spawnName' : "s_m_m_highsec_02"},{'menuName': "Hiker Female", 'spawnName' : "a_f_y_hiker_01"},{'menuName': "Hiker Male", 'spawnName' : "a_m_y_hiker_01"},{'menuName': "Hillbilly Male", 'spawnName' : "a_m_m_hillbilly_01"},{'menuName': "Hillbilly Male 2", 'spawnName' : "a_m_m_hillbilly_02"},{'menuName': "Hippie", 'spawnName' : "u_m_y_hippie_01"},{'menuName': "Hippie Female", 'spawnName' : "a_f_y_hippie_01"},{'menuName': "Hippie Male", 'spawnName' : "a_m_y_hippy_01"},{'menuName': "Hipster", 'spawnName' : "csb_ramp_hipster"},{'menuName': "Hipster", 'spawnName' : "ig_ramp_hipster"},{'menuName': "Hipster Female", 'spawnName' : "a_f_y_hipster_01"},{'menuName': "Hipster Female 2", 'spawnName' : "a_f_y_hipster_02"},{'menuName': "Hipster Female 3", 'spawnName' : "a_f_y_hipster_03"},{'menuName': "Hipster Female 4", 'spawnName' : "a_f_y_hipster_04"},{'menuName': "Hipster Male", 'spawnName' : "a_m_y_hipster_01"},{'menuName': "Hipster Male 2", 'spawnName' : "a_m_y_hipster_02"},{'menuName': "Hipster Male 3", 'spawnName' : "a_m_y_hipster_03"},{'menuName': "Hooker", 'spawnName' : "s_f_y_hooker_01"},{'menuName': "Hooker", 'spawnName' : "s_f_y_hooker_02"},{'menuName': "Hooker", 'spawnName' : "s_f_y_hooker_03"},{'menuName': "Hotposh", 'spawnName' : "u_f_y_hotposh_01"},{'menuName': "Hugh Welsh", 'spawnName' : "csb_hugh"},{'menuName': "Hunter", 'spawnName' : "ig_hunter"},{'menuName': "Hunter-BROKEN", 'spawnName' : "cs_hunter"},{'menuName': "Hwaycop", 'spawnName' : "s_m_y_hwaycop_01"},{'menuName': "Imporage", 'spawnName' : "u_m_y_imporage"},{'menuName': "Imran Shinowa", 'spawnName' : "csb_imran"},{'menuName': "Indian Male", 'spawnName' : "a_m_m_indian_01"},{'menuName': "Indian Old Female", 'spawnName' : "a_f_o_indian_01"},{'menuName': "Indian Young Female", 'spawnName' : "a_f_y_indian_01"},{'menuName': "Indian Young Male", 'spawnName' : "a_m_y_indian_01"},{'menuName': "Janet", 'spawnName' : "ig_janet"},{'menuName': "Janet-BROKEN", 'spawnName' : "cs_janet"},{'menuName': "Janitor", 'spawnName' : "csb_janitor"},{'menuName': "Janitor", 'spawnName' : "s_m_m_janitor"},{'menuName': "Jay_Norris", 'spawnName' : "ig_jay_norris"},{'menuName': "Jesus", 'spawnName' : "u_m_m_jesus_01"},{'menuName': "Jetskier", 'spawnName' : "a_m_y_jetski_01"},{'menuName': "Jewelass", 'spawnName' : "ig_jewelass"},{'menuName': "Jewelass", 'spawnName' : "u_f_y_jewelass_01"},{'menuName': "Jewelass-BROKEN", 'spawnName' : "cs_jewelass"},{'menuName': "Jewelsec", 'spawnName' : "u_m_m_jewelsec_01"},{'menuName': "Jewelthief", 'spawnName' : "u_m_m_jewelthief"},{'menuName': "Jimmyboston", 'spawnName' : "ig_jimmyboston"},{'menuName': "Jimmyboston-BROKEN", 'spawnName' : "cs_jimmyboston"},{'menuName': "Jimmydisanto", 'spawnName' : "ig_jimmydisanto"},{'menuName': "Jimmydisanto-BROKEN", 'spawnName' : "cs_jimmydisanto"},{'menuName': "Joeminuteman", 'spawnName' : "ig_joeminuteman"},{'menuName': "Joeminuteman-BROKEN", 'spawnName' : "cs_joeminuteman"},{'menuName': "Jogger Female", 'spawnName' : "a_f_y_runner_01"},{'menuName': "Jogger Male", 'spawnName' : "a_m_y_runner_01"},{'menuName': "Jogger Male 2", 'spawnName' : "a_m_y_runner_02"},{'menuName': "Johnnyklebitz", 'spawnName' : "ig_johnnyklebitz"},{'menuName': "Johnnyklebitz-BROKEN", 'spawnName' : "cs_johnnyklebitz"},{'menuName': "Josef", 'spawnName' : "ig_josef"},{'menuName': "Josef-BROKEN", 'spawnName' : "cs_josef"},{'menuName': "Josh", 'spawnName' : "ig_josh"},{'menuName': "Josh-BROKEN", 'spawnName' : "cs_josh"},{'menuName': "Juggalo Female", 'spawnName' : "a_f_y_juggalo_01"},{'menuName': "Juggalo Male", 'spawnName' : "a_m_y_juggalo_01"},{'menuName': "Justin", 'spawnName' : "u_m_y_justin"},{'menuName': "Kerrymcintosh", 'spawnName' : "ig_kerrymcintosh"},{'menuName': "Korboss", 'spawnName' : "g_m_m_korboss_01"},{'menuName': "Korean", 'spawnName' : "g_m_y_korean_01"},{'menuName': "Korean", 'spawnName' : "g_m_y_korean_02"},{'menuName': "Korean Female", 'spawnName' : "a_f_m_ktown_01"},{'menuName': "Korean Female 2", 'spawnName' : "a_f_m_ktown_02"},{'menuName': "Korean Male", 'spawnName' : "a_m_m_ktown_01"},{'menuName': "Korean Old Female", 'spawnName' : "a_f_o_ktown_01"},{'menuName': "Korean Old Male", 'spawnName' : "a_m_o_ktown_01"},{'menuName': "Korean Young Male 3", 'spawnName' : "a_m_y_ktown_01"},{'menuName': "Korean Young Male 4", 'spawnName' : "a_m_y_ktown_02"},{'menuName': "Korlieut", 'spawnName' : "g_m_y_korlieut_01"},{'menuName': "Lamardavis", 'spawnName' : "ig_lamardavis"},{'menuName': "Lamardavis-BROKEN", 'spawnName' : "cs_lamardavis"},{'menuName': "Lathandy", 'spawnName' : "s_m_m_lathandy_01"},{'menuName': "Latino Street Male 2", 'spawnName' : "a_m_m_stlat_02"},{'menuName': "Latino Street Young Male", 'spawnName' : "a_m_y_stlat_01"},{'menuName': "Latino Young Male", 'spawnName' : "a_m_y_latino_01"},{'menuName': "Lazlow", 'spawnName' : "ig_lazlow"},{'menuName': "Lazlow-BROKEN", 'spawnName' : "cs_lazlow"},{'menuName': "Lestercrest", 'spawnName' : "ig_lestercrest"},{'menuName': "Lestercrest-BROKEN", 'spawnName' : "cs_lestercrest"},{'menuName': "Lifeinvad", 'spawnName' : "ig_lifeinvad_01"},{'menuName': "Lifeinvad", 'spawnName' : "ig_lifeinvad_02"},{'menuName': "Lifeinvad", 'spawnName' : "s_m_m_lifeinvad_01"},{'menuName': "Lifeinvad-BROKEN", 'spawnName' : "cs_lifeinvad_01"},{'menuName': "Linecook", 'spawnName' : "s_m_m_linecook"},{'menuName': "Lost", 'spawnName' : "g_f_y_lost_01"},{'menuName': "Lost", 'spawnName' : "g_m_y_lost_01"},{'menuName': "Lost", 'spawnName' : "g_m_y_lost_02"},{'menuName': "Lost", 'spawnName' : "g_m_y_lost_03"},{'menuName': "Lsmetro", 'spawnName' : "s_m_m_lsmetro_01"},{'menuName': "Magenta", 'spawnName' : "ig_magenta"},{'menuName': "Magenta-BROKEN", 'spawnName' : "cs_magenta"},{'menuName': "Maid", 'spawnName' : "s_f_m_maid_01"},{'menuName': "Malibu Male", 'spawnName' : "a_m_m_malibu_01"},{'menuName': "Mani", 'spawnName' : "u_m_y_mani"},{'menuName': "Manuel", 'spawnName' : "ig_manuel"},{'menuName': "Manuel-BROKEN", 'spawnName' : "cs_manuel"},{'menuName': "Mariachi", 'spawnName' : "s_m_m_mariachi_01"},{'menuName': "Marine", 'spawnName' : "csb_ramp_marine"},{'menuName': "Marine", 'spawnName' : "s_m_m_marine_01"},{'menuName': "Marine", 'spawnName' : "s_m_m_marine_02"},{'menuName': "Marine", 'spawnName' : "s_m_y_marine_01"},{'menuName': "Marine", 'spawnName' : "s_m_y_marine_02"},{'menuName': "Marine", 'spawnName' : "s_m_y_marine_03"},{'menuName': "Markfost", 'spawnName' : "u_m_m_markfost"},{'menuName': "Marnie", 'spawnName' : "ig_marnie"},{'menuName': "Marnie-BROKEN", 'spawnName' : "cs_marnie"},{'menuName': "Marston", 'spawnName' : "mp_m_marston_01"},{'menuName': "Martinmadrazo-BROKEN", 'spawnName' : "cs_martinmadrazo"},{'menuName': "Maryan-BROKEN", 'spawnName' : "cs_maryann"},{'menuName': "Maryann", 'spawnName' : "ig_maryann"},{'menuName': "Maude", 'spawnName' : "csb_maude"},{'menuName': "Maude", 'spawnName' : "ig_maude"},{'menuName': "Merryweather Merc", 'spawnName' : "csb_mweather"},{'menuName': "Meth Addict", 'spawnName' : "a_m_y_methhead_01"},{'menuName': "Mex", 'spawnName' : "ig_ramp_mex"},{'menuName': "Mexboss", 'spawnName' : "g_m_m_mexboss_01"},{'menuName': "Mexboss", 'spawnName' : "g_m_m_mexboss_02"},{'menuName': "Mexgang", 'spawnName' : "g_m_y_mexgang_01"},{'menuName': "Mexgoon", 'spawnName' : "g_m_y_mexgoon_01"},{'menuName': "Mexgoon", 'spawnName' : "g_m_y_mexgoon_02"},{'menuName': "Mexgoon", 'spawnName' : "g_m_y_mexgoon_03"},{'menuName': "Mexgoon_P", 'spawnName' : "g_m_y_mexgoon_03_p"},{'menuName': "Mexican", 'spawnName' : "csb_ramp_mex"},{'menuName': "Mexican Rural", 'spawnName' : "a_m_m_mexcntry_01"},{'menuName': "Mexican Thug", 'spawnName' : "a_m_y_mexthug_01"},{'menuName': "Mexican labourer", 'spawnName' : "a_m_m_mexlabor_01"},{'menuName': "Michelle", 'spawnName' : "ig_michelle"},{'menuName': "Michelle-BROKEN", 'spawnName' : "cs_michelle"},{'menuName': "Migrant", 'spawnName' : "s_f_y_migrant_01"},{'menuName': "Migrant", 'spawnName' : "s_m_m_migrant_01"},{'menuName': "Militarybum", 'spawnName' : "u_m_y_militarybum"},{'menuName': "Milton", 'spawnName' : "ig_milton"},{'menuName': "Milton-BROKEN", 'spawnName' : "cs_milton"},{'menuName': "Mime", 'spawnName' : "s_m_y_mime"},{'menuName': "Miranda", 'spawnName' : "u_f_m_miranda"},{'menuName': "Mistress", 'spawnName' : "u_f_y_mistress"},{'menuName': "Misty", 'spawnName' : "mp_f_misty_01"},{'menuName': "Molly", 'spawnName' : "ig_molly"},{'menuName': "Molly-BROKEN", 'spawnName' : "cs_molly"},{'menuName': "Motorcross Biker", 'spawnName' : "a_m_y_motox_01"},{'menuName': "Motorcross Biker 2x", 'spawnName' : "a_m_y_motox_02"},{'menuName': "Mountainbiker", 'spawnName' : "a_m_y_dhill_01"},{'menuName': "Moviestar", 'spawnName' : "u_f_o_moviestar"},{'menuName': "Movprem", 'spawnName' : "s_f_y_movprem_01"},{'menuName': "Movprem", 'spawnName' : "s_m_m_movprem_01"},{'menuName': "Movpremf-BROKEN", 'spawnName' : "cs_movpremf_01"},{'menuName': "Movpremmale-BROKEN", 'spawnName' : "cs_movpremmale"},{'menuName': "Movspace", 'spawnName' : "s_m_m_movspace_01"},{'menuName': "Mp_Headtargets", 'spawnName' : "mp_headtargets"},{'menuName': "Mrk", 'spawnName' : "ig_mrk"},{'menuName': "Mrk-BROKEN", 'spawnName' : "cs_mrk"},{'menuName': "Mrs_Thornhill", 'spawnName' : "ig_mrs_thornhill"},{'menuName': "Mrs_Thornhill-BROKEN", 'spawnName' : "cs_mrs_thornhill"},{'menuName': "Mrsphillips", 'spawnName' : "ig_mrsphillips"},{'menuName': "Mrsphillips-BROKEN", 'spawnName' : "cs_mrsphillips"},{'menuName': "Natalia", 'spawnName' : "ig_natalia"},{'menuName': "Natalia-BROKEN", 'spawnName' : "cs_natalia"},{'menuName': "Nervousron", 'spawnName' : "ig_nervousron"},{'menuName': "Nervousron-BROKEN", 'spawnName' : "cs_nervousron"},{'menuName': "Nigel", 'spawnName' : "ig_nigel"},{'menuName': "Nigel-BROKEN", 'spawnName' : "cs_nigel"},{'menuName': "Niko", 'spawnName' : "mp_m_niko_01"},{'menuName': "OG Boss", 'spawnName' : "a_m_m_og_boss_01"},{'menuName': "Old_Man1A", 'spawnName' : "ig_old_man1a"},{'menuName': "Old_Man1A-BROKEN", 'spawnName' : "cs_old_man1a"},{'menuName': "Old_Man2", 'spawnName' : "ig_old_man2"},{'menuName': "Old_Man2-BROKEN", 'spawnName' : "cs_old_man2"},{'menuName': "Omega", 'spawnName' : "ig_omega"},{'menuName': "Omega-BROKEN", 'spawnName' : "cs_omega"},{'menuName': "Oneil", 'spawnName' : "ig_oneil"},{'menuName': "Orleans", 'spawnName' : "ig_orleans"},{'menuName': "Orleans-BROKEN", 'spawnName' : "cs_orleans"},{'menuName': "Ortega", 'spawnName' : "csb_ortega"},{'menuName': "Ortega", 'spawnName' : "ig_ortega"},{'menuName': "Oscar", 'spawnName' : "csb_oscar"},{'menuName': "Paparazzi", 'spawnName' : "u_m_y_paparazzi"},{'menuName': "Paparazzi Male", 'spawnName' : "a_m_m_paparazzi_01"},{'menuName': "Paper", 'spawnName' : "ig_paper"},{'menuName': "Paper-BROKEN", 'spawnName' : "cs_paper"},{'menuName': "Paper_P-BROKEN", 'spawnName' : "cs_paper_p"},{'menuName': "Paramedic", 'spawnName' : "s_m_m_paramedic_01"},{'menuName': "Party", 'spawnName' : "u_m_y_party_01"},{'menuName': "Partytarget", 'spawnName' : "u_m_m_partytarget"},{'menuName': "Patricia", 'spawnName' : "ig_patricia"},{'menuName': "Patricia-BROKEN", 'spawnName' : "cs_patricia"},{'menuName': "Pestcont", 'spawnName' : "s_m_y_pestcont_01"},{'menuName': "Pilot", 'spawnName' : "s_m_m_pilot_01"},{'menuName': "Pilot", 'spawnName' : "s_m_m_pilot_02"},{'menuName': "Pilot", 'spawnName' : "s_m_y_pilot_01"},{'menuName': "Pogo", 'spawnName' : "u_m_y_pogo_01"},{'menuName': "Pologoon", 'spawnName' : "g_m_y_pologoon_01"},{'menuName': "Pologoon", 'spawnName' : "g_m_y_pologoon_02"},{'menuName': "Pologoon_P", 'spawnName' : "g_m_y_pologoon_01_p"},{'menuName': "Pologoon_P", 'spawnName' : "g_m_y_pologoon_02_p"},{'menuName': "Polynesian", 'spawnName' : "a_m_m_polynesian_01"},{'menuName': "Polynesian Young", 'spawnName' : "a_m_y_polynesian_01"},{'menuName': "Poppymich", 'spawnName' : "u_f_y_poppymich"},{'menuName': "Porn Dude", 'spawnName' : "csb_porndudes"},{'menuName': "Porndudes_P-BROKEN", 'spawnName' : "csb_porndudes_p"},{'menuName': "Postal", 'spawnName' : "s_m_m_postal_01"},{'menuName': "Postal", 'spawnName' : "s_m_m_postal_02"},{'menuName': "Priest", 'spawnName' : "ig_priest"},{'menuName': "Priest-BROKEN", 'spawnName' : "cs_priest"},{'menuName': "Princess", 'spawnName' : "u_f_y_princess"},{'menuName': "Prisguard", 'spawnName' : "s_m_m_prisguard_01"},{'menuName': "Prismuscl", 'spawnName' : "s_m_y_prismuscl_01"},{'menuName': "Prisoner", 'spawnName' : "s_m_y_prisoner_01"},{'menuName': "Prisoner", 'spawnName' : "u_m_y_prisoner_01"},{'menuName': "Prolhost", 'spawnName' : "u_f_o_prolhost_01"},{'menuName': "Prologue Driver", 'spawnName' : "u_m_y_proldriver_01"},{'menuName': "Prologue Driver", 'spawnName' : "csb_prologuedriver"},{'menuName': "Prologue Host Female", 'spawnName' : "a_f_m_prolhost_01"},{'menuName': "Prologue Host Male", 'spawnName' : "a_m_m_prolhost_01"},{'menuName': "Prologue Security", 'spawnName' : "csb_prolsec"},{'menuName': "Prolsec", 'spawnName' : "ig_prolsec_02"},{'menuName': "Prolsec", 'spawnName' : "u_m_m_prolsec_01"},{'menuName': "Prolsec-BROKEN", 'spawnName' : "cs_prolsec_02"},{'menuName': "Promourn", 'spawnName' : "u_f_m_promourn_01"},{'menuName': "Promourn", 'spawnName' : "u_m_m_promourn_01"},{'menuName': "Pros", 'spawnName' : "mp_g_m_pros_01"},{'menuName': "Ranger", 'spawnName' : "s_f_y_ranger_01"},{'menuName': "Ranger", 'spawnName' : "s_m_y_ranger_01"},{'menuName': "Reporter", 'spawnName' : "csb_reporter"},{'menuName': "Republican Space Ranger", 'spawnName' : "u_m_y_rsranger_01"},{'menuName': "Rivalpap", 'spawnName' : "u_m_m_rivalpap"},{'menuName': "Robber", 'spawnName' : "s_m_y_robber_01"},{'menuName': "Rocco Pelosi", 'spawnName' : "csb_roccopelosi"},{'menuName': "Roccopelosi", 'spawnName' : "ig_roccopelosi"},{'menuName': "Rural Meth Addict Female", 'spawnName' : "a_f_y_rurmeth_01"},{'menuName': "Rural meth Addict Male", 'spawnName' : "a_m_m_rurmeth_01"},{'menuName': "Russiandrunk", 'spawnName' : "ig_russiandrunk"},{'menuName': "Russiandrunk-BROKEN", 'spawnName' : "cs_russiandrunk"},{'menuName': "Salton Female", 'spawnName' : "a_f_m_salton_01"},{'menuName': "Salton Male", 'spawnName' : "a_m_m_salton_01"},{'menuName': "Salton Male 2", 'spawnName' : "a_m_m_salton_02"},{'menuName': "Salton Male 3", 'spawnName' : "a_m_m_salton_03"},{'menuName': "Salton Male 4", 'spawnName' : "a_m_m_salton_04"},{'menuName': "Salton Old Female", 'spawnName' : "a_f_o_salton_01"},{'menuName': "Salton Old Male", 'spawnName' : "a_m_o_salton_01"},{'menuName': "Salton Young Male", 'spawnName' : "a_m_y_salton_01"},{'menuName': "Salvaboss", 'spawnName' : "g_m_y_salvaboss_01"},{'menuName': "Salvagoon", 'spawnName' : "g_m_y_salvagoon_01"},{'menuName': "Salvagoon", 'spawnName' : "g_m_y_salvagoon_02"},{'menuName': "Salvagoon", 'spawnName' : "g_m_y_salvagoon_03"},{'menuName': "Salvagoon_P", 'spawnName' : "g_m_y_salvagoon_03_p"},{'menuName': "Scientist", 'spawnName' : "s_m_m_scientist_01"},{'menuName': "Screen_Writer", 'spawnName' : "ig_screen_writer"},{'menuName': "Screenwriter", 'spawnName' : "csb_screen_writer"},{'menuName': "Scrubs", 'spawnName' : "s_f_y_scrubs_01"},{'menuName': "Security", 'spawnName' : "s_m_m_security_01"},{'menuName': "Sheriff", 'spawnName' : "s_f_y_sheriff_01"},{'menuName': "Sheriff", 'spawnName' : "s_m_y_sheriff_01"},{'menuName': "Shop_High", 'spawnName' : "s_f_m_shop_high"},{'menuName': "Shop_Low", 'spawnName' : "s_f_y_shop_low"},{'menuName': "Shop_Mask", 'spawnName' : "s_m_y_shop_mask"},{'menuName': "Shop_Mid", 'spawnName' : "s_f_y_shop_mid"},{'menuName': "Shopkeep", 'spawnName' : "mp_m_shopkeep_01"},{'menuName': "Siemonyetarian", 'spawnName' : "ig_siemonyetarian"},{'menuName': "Siemonyetarian-BROKEN", 'spawnName' : "cs_siemonyetarian"},{'menuName': "Skater Female", 'spawnName' : "a_f_y_skater_01"},{'menuName': "Skater Male", 'spawnName' : "a_m_m_skater_01"},{'menuName': "Skater Young Male", 'spawnName' : "a_m_y_skater_01"},{'menuName': "Skater Young Male 2", 'spawnName' : "a_m_y_skater_02"},{'menuName': "Skid Row Female", 'spawnName' : "a_f_m_skidrow_01"},{'menuName': "Skid Row Male", 'spawnName' : "a_m_m_skidrow_01"},{'menuName': "Snowcop", 'spawnName' : "s_m_m_snowcop_01"},{'menuName': "Solomon", 'spawnName' : "ig_solomon"},{'menuName': "Solomon-BROKEN", 'spawnName' : "cs_solomon"},{'menuName': "South Central Female", 'spawnName' : "a_f_m_soucent_01"},{'menuName': "South Central Female 2", 'spawnName' : "a_f_m_soucent_02"},{'menuName': "South Central Female Dressy", 'spawnName' : "a_f_y_scdressy_01"},{'menuName': "South Central Latino Male", 'spawnName' : "a_m_m_socenlat_01"},{'menuName': "South Central MC Female", 'spawnName' : "a_f_m_soucentmc_01"},{'menuName': "South Central Male", 'spawnName' : "a_m_m_soucent_01"},{'menuName': "South Central Male 2", 'spawnName' : "a_m_m_soucent_02"},{'menuName': "South Central Male 3", 'spawnName' : "a_m_m_soucent_03"},{'menuName': "South Central Male 4", 'spawnName' : "a_m_m_soucent_04"},{'menuName': "South Central Old Female", 'spawnName' : "a_f_o_soucent_01"},{'menuName': "South Central Old Female 2", 'spawnName' : "a_f_o_soucent_02"},{'menuName': "South Central Old Male", 'spawnName' : "a_m_o_soucent_01"},{'menuName': "South Central Old Male 2", 'spawnName' : "a_m_o_soucent_02"},{'menuName': "South Central Old Male 3", 'spawnName' : "a_m_o_soucent_03"},{'menuName': "South Central Young Female", 'spawnName' : "a_f_y_soucent_01"},{'menuName': "South Central Young Female 2", 'spawnName' : "a_f_y_soucent_02"},{'menuName': "South Central Young Female 3", 'spawnName' : "a_f_y_soucent_03"},{'menuName': "South Central Young Male", 'spawnName' : "a_m_y_soucent_01"},{'menuName': "South Central Young Male 2", 'spawnName' : "a_m_y_soucent_02"},{'menuName': "South Central Young Male 3", 'spawnName' : "a_m_y_soucent_03"},{'menuName': "South Central Young Male 4", 'spawnName' : "a_m_y_soucent_04"},{'menuName': "Sports Biker", 'spawnName' : "u_m_y_sbike"},{'menuName': "Spyactor", 'spawnName' : "u_m_m_spyactor"},{'menuName': "Spyactress", 'spawnName' : "u_f_y_spyactress"},{'menuName': "Stag Party Groom", 'spawnName' : "u_m_y_staggrm_01"},{'menuName': "Stevehains", 'spawnName' : "ig_stevehains"},{'menuName': "Stevehains-BROKEN", 'spawnName' : "cs_stevehains"},{'menuName': "Stretch", 'spawnName' : "ig_stretch"},{'menuName': "Stretch-BROKEN", 'spawnName' : "cs_stretch"},{'menuName': "Stripper", 'spawnName' : "csb_stripper_01"},{'menuName': "Stripper", 'spawnName' : "s_f_y_stripper_01"},{'menuName': "Stripper", 'spawnName' : "s_f_y_stripper_02"},{'menuName': "Stripper 2", 'spawnName' : "csb_stripper_02"},{'menuName': "Stripperlite", 'spawnName' : "mp_f_stripperlite"},{'menuName': "Stripperlite", 'spawnName' : "s_f_y_stripperlite"},{'menuName': "Strperf", 'spawnName' : "s_m_m_strperf_01"},{'menuName': "Strpreach", 'spawnName' : "s_m_m_strpreach_01"},{'menuName': "Strpunk", 'spawnName' : "g_m_y_strpunk_01"},{'menuName': "Strpunk", 'spawnName' : "g_m_y_strpunk_02"},{'menuName': "Strvend", 'spawnName' : "s_m_m_strvend_01"},{'menuName': "Strvend", 'spawnName' : "s_m_y_strvend_01"},{'menuName': "Sunbather Male", 'spawnName' : "a_m_y_sunbathe_01"},{'menuName': "Surfer", 'spawnName' : "a_m_y_surfer_01"},{'menuName': "Swat", 'spawnName' : "s_m_y_swat_01"},{'menuName': "Sweatshop", 'spawnName' : "s_f_m_sweatshop_01"},{'menuName': "Sweatshop", 'spawnName' : "s_f_y_sweatshop_01"},{'menuName': "Talina", 'spawnName' : "ig_talina"},{'menuName': "Tanisha", 'spawnName' : "ig_tanisha"},{'menuName': "Tanisha-BROKEN", 'spawnName' : "cs_tanisha"},{'menuName': "Taocheng", 'spawnName' : "ig_taocheng"},{'menuName': "Taocheng-BROKEN", 'spawnName' : "cs_taocheng"},{'menuName': "Taostranslator", 'spawnName' : "ig_taostranslator"},{'menuName': "Taostranslator-BROKEN", 'spawnName' : "cs_taostranslator"},{'menuName': "Taostranslator_P", 'spawnName' : "ig_taostranslator_p"},{'menuName': "Taphillbilly", 'spawnName' : "u_m_o_taphillbilly"},{'menuName': "Tattoo Artist", 'spawnName' : "u_m_y_tattoo_01"},{'menuName': "Tennis Player Female", 'spawnName' : "a_f_y_tennis_01"},{'menuName': "Tennis Player Male", 'spawnName' : "a_m_m_tennis_01"},{'menuName': "Tenniscoach", 'spawnName' : "ig_tenniscoach"},{'menuName': "Tenniscoach-BROKEN", 'spawnName' : "cs_tenniscoach"},{'menuName': "Terry", 'spawnName' : "ig_terry"},{'menuName': "Terry-BROKEN", 'spawnName' : "cs_terry"},{'menuName': "Tom-BROKEN", 'spawnName' : "cs_tom"},{'menuName': "Tomepsilon", 'spawnName' : "ig_tomepsilon"},{'menuName': "Tomepsilon-BROKEN", 'spawnName' : "cs_tomepsilon"},{'menuName': "Tonya", 'spawnName' : "csb_tonya"},{'menuName': "Tonya", 'spawnName' : "ig_tonya"},{'menuName': "Topless", 'spawnName' : "a_f_y_topless_01"},{'menuName': "Tourist Female", 'spawnName' : "a_f_m_tourist_01"},{'menuName': "Tourist Male", 'spawnName' : "a_m_m_tourist_01"},{'menuName': "Tourist Young Female", 'spawnName' : "a_f_y_tourist_01"},{'menuName': "Tourist Young Female 2", 'spawnName' : "a_f_y_tourist_02"},{'menuName': "Tracydisanto", 'spawnName' : "ig_tracydisanto"},{'menuName': "Tracydisanto-BROKEN", 'spawnName' : "cs_tracydisanto"},{'menuName': "Traffic Warden", 'spawnName' : "csb_trafficwarden"},{'menuName': "Trafficwarden", 'spawnName' : "ig_trafficwarden"},{'menuName': "Tramp", 'spawnName' : "u_m_o_tramp_01"},{'menuName': "Tramp Female", 'spawnName' : "a_f_m_tramp_01"},{'menuName': "Tramp Male", 'spawnName' : "a_m_m_tramp_01"},{'menuName': "Tramp Old Male", 'spawnName' : "a_m_o_tramp_01"},{'menuName': "Tranvestite Male", 'spawnName' : "a_m_m_tranvest_01"},{'menuName': "Tranvestite Male 2", 'spawnName' : "a_m_m_tranvest_02"},{'menuName': "Trucker", 'spawnName' : "s_m_m_trucker_01"},{'menuName': "Tylerdix", 'spawnName' : "ig_tylerdix"},{'menuName': "Ups", 'spawnName' : "s_m_m_ups_01"},{'menuName': "Ups", 'spawnName' : "s_m_m_ups_02"},{'menuName': "Uscg", 'spawnName' : "s_m_y_uscg_01"},{'menuName': "Vagos", 'spawnName' : "g_f_y_vagos_01"},{'menuName': "Valet", 'spawnName' : "s_m_y_valet_01"},{'menuName': "Vespucci Beach Male", 'spawnName' : "a_m_y_beachvesp_01"},{'menuName': "Vespucci Beach Male", 'spawnName' : "a_m_y_beachvesp_02"},{'menuName': "Vinewood Douche", 'spawnName' : "a_m_y_vindouche_01"},{'menuName': "Vinewood Female", 'spawnName' : "a_f_y_vinewood_01"},{'menuName': "Vinewood Female 2", 'spawnName' : "a_f_y_vinewood_02"},{'menuName': "Vinewood Female 3", 'spawnName' : "a_f_y_vinewood_03"},{'menuName': "Vinewood Female 4", 'spawnName' : "a_f_y_vinewood_04"},{'menuName': "Vinewood Male", 'spawnName' : "a_m_y_vinewood_01"},{'menuName': "Vinewood Male 2", 'spawnName' : "a_m_y_vinewood_02"},{'menuName': "Vinewood Male 3", 'spawnName' : "a_m_y_vinewood_03"},{'menuName': "Vinewood Male 4", 'spawnName' : "a_m_y_vinewood_04"},{'menuName': "Wade", 'spawnName' : "ig_wade"},{'menuName': "Wade-BROKEN", 'spawnName' : "cs_wade"},{'menuName': "Waiter", 'spawnName' : "s_m_y_waiter_01"},{'menuName': "White Street Male", 'spawnName' : "a_m_y_stwhi_01"},{'menuName': "White Street Male", 'spawnName' : "a_m_y_stwhi_02"},{'menuName': "Willyfist", 'spawnName' : "u_m_m_willyfist"},{'menuName': "Winclean", 'spawnName' : "s_m_y_winclean_01"},{'menuName': "Xmech", 'spawnName' : "s_m_y_xmech_01"},{'menuName': "Xmech", 'spawnName' : "s_m_y_xmech_02"},{'menuName': "Yoga Female", 'spawnName' : "a_f_y_yoga_01"},{'menuName': "Yoga Male", 'spawnName' : "a_m_y_yoga_01"},{'menuName': "Zimbor", 'spawnName' : "ig_zimbor"},{'menuName': "Zimbor-BROKEN", 'spawnName' : "cs_zimbor"},{'menuName': "Zombie", 'spawnName' : "u_m_y_zombie_01"}]


// Vehicle Spawning Database
var vehicle_supercars = [{ 'menuName' : "Annis RE-7B", 'spawnName' : "LE7B" },{ 'menuName' : "Bravado Banshee 900R", 'spawnName' : "BANSHEE2" },{ 'menuName' : "Coil Voltic", 'spawnName' : "VOLTIC" },{ 'menuName' : "Emperor ETR1", 'spawnName' : "SHEAVA" },{ 'menuName' : "Grotti Cheetah", 'spawnName' : "CHEETAH" },{ 'menuName' : "Grotti X80 Proto", 'spawnName' : "PROTOTIPO" },{ 'menuName' : "Grotti Turismo R", 'spawnName' : "TURISMOR" },{ 'menuName' : "Karin Sultan RS", 'spawnName' : "SULTANRS" },{ 'menuName' : "Overflod Entity XF", 'spawnName' : "ENTITYXF" },{ 'menuName' : "Pegassi Infernus", 'spawnName' : "INFERNUS" },{ 'menuName' : "Pegassi Osiris", 'spawnName' : "OSIRIS" },{ 'menuName' : "Pegassi Reaper", 'spawnName' : "REAPER" },{ 'menuName' : "Pegassi Vacca", 'spawnName' : "VACCA" },{ 'menuName' : "Pegassi Zentorno", 'spawnName' : "ZENTORNO" },{ 'menuName' : "Pfister 811", 'spawnName' : "PFISTER811" },{ 'menuName' : "Progen T20", 'spawnName' : "T20" },{ 'menuName' : "Progen Tyrus", 'spawnName' : "TYRUS" },{ 'menuName' : "Truffade Adder", 'spawnName' : "ADDER" },{ 'menuName' : "Vapid Bullet", 'spawnName' : "BULLET" },{ 'menuName' : "Vapid FMJ", 'spawnName' : "FMJ" }]
var vehicle_sports = [{ 'menuName' : "Albany Alpha", 'spawnName' : "ALPHA" },{ 'menuName' : "Annis Elegy RH8", 'spawnName' : "ELEGY2" },{ 'menuName' : "Benefactor Feltzer", 'spawnName' : "FELTZER2" },{ 'menuName' : "Benefactor Schwarzer", 'spawnName' : "SCHWARZER" },{ 'menuName' : "Benefactor Surano", 'spawnName' : "SURANO" },{ 'menuName' : "BF Raptor", 'spawnName' : "RAPTOR" },{ 'menuName' : "Bravado Banshee", 'spawnName' : "BANSHEE" },{ 'menuName' : "Bravado Buffalo", 'spawnName' : "BUFFALO" },{ 'menuName' : "Bravado Buffalo S", 'spawnName' : "BUFFALO2" },{ 'menuName' : "Bravado Buffalo S (Race)", 'spawnName' : "BUFFALO3" },{ 'menuName' : "Bravado Verlierer", 'spawnName' : "VERLIERER2" },{ 'menuName' : "Declasse Drift Tampa", 'spawnName' : "TAMPA2" },{ 'menuName' : "Dewbauchee Massacro", 'spawnName' : "MASSACRO" },{ 'menuName' : "Dewbauchee Massacro (Race)", 'spawnName' : "MASSACRO2" },{ 'menuName' : "Dewbauchee Rapid GT", 'spawnName' : "RAPIDGT" },{ 'menuName' : "Dewbauchee Rapid GT Cabrio", 'spawnName' : "RAPIDGT2" },{ 'menuName' : "Dewbauchee Seven-70", 'spawnName' : "SEVEN70" },{ 'menuName' : "Dinka Blista Compact", 'spawnName' : "BLISTA2" },{ 'menuName' : "Dinka Blista Compact (Race)", 'spawnName' : "BLISTA3" },{ 'menuName' : "Dinka Jester", 'spawnName' : "JESTER" },{ 'menuName' : "Dinka Jester (Race)", 'spawnName' : "JESTER2" },{ 'menuName' : "Grotti Bestia GTS", 'spawnName' : "BESTIAGTS" },{ 'menuName' : "Grotti Carbonizzare", 'spawnName' : "CARBONIZZARE" },{ 'menuName' : "Hijak Khamelion", 'spawnName' : "KHAMELION" },{ 'menuName' : "Invetero Coquette", 'spawnName' : "COQUETTE" },{ 'menuName' : "Karin Futo", 'spawnName' : "FUTO" },{ 'menuName' : "Karin Kuruma", 'spawnName' : "KURUMA" },{ 'menuName' : "Karin Kuruma (Armoured)", 'spawnName' : "KURUMA2" },{ 'menuName' : "Karin Sultan", 'spawnName' : "SULTAN" },{ 'menuName' : "Lampadati Furore GT", 'spawnName' : "FUROREGT" },{ 'menuName' : "Lampadati Tropos Rallye", 'spawnName' : "TROPOS" },{ 'menuName' : "Maibatsu Penumbra", 'spawnName' : "PENUMBRA" },{ 'menuName' : "Obey 9F", 'spawnName' : "NINEF" },{ 'menuName' : "Obey 9F Cabrio", 'spawnName' : "NINEF2" },{ 'menuName' : "Obey Omnis", 'spawnName' : "OMNIS" },{ 'menuName' : "Ocelot Lynx", 'spawnName' : "LYNX" },{ 'menuName' : "Phister Comet", 'spawnName' : "COMET2" },{ 'menuName' : "Schyster Fusilade", 'spawnName' : "FUSILADE" }]
var vehicle_sportsclassics = [{ 'menuName' : "Albany Manana", 'spawnName' : "MANANA" },{ 'menuName' : "Albany Roosevelt 1", 'spawnName' : "BTYPE" },{ 'menuName' : "Albany Roosevelt 2", 'spawnName' : "BTYPE3" },{ 'menuName' : "Benefactor Stirling GT", 'spawnName' : "FELTZER3" },{ 'menuName' : "Declasse Tornado", 'spawnName' : "TORNADO" },{ 'menuName' : "Declasse Tornado (Rusty)", 'spawnName' : "TORNADO2" },{ 'menuName' : "Declasse Tornado Cabrio", 'spawnName' : "TORNADO3" },{ 'menuName' : "Declasse Tornado Cabrio (Rusty)", 'spawnName' : "TORNADO4" },{ 'menuName' : "Declasse Tornado Rat Rod", 'spawnName' : "TORNADO6" },{ 'menuName' : "Dewbauchee JB 700", 'spawnName' : "JB700" },{ 'menuName' : "Grotti Stinger", 'spawnName' : "STINGER" },{ 'menuName' : "Grotti Stinger GT", 'spawnName' : "STINGERGT" },{ 'menuName' : "Invetero Coquette Classic", 'spawnName' : "COQUETTE2" },{ 'menuName' : "Lampadati Casco", 'spawnName' : "CASCO" },{ 'menuName' : "Lampadati Pigalle", 'spawnName' : "PIGALLE" },{ 'menuName' : "Pegassi Monroe", 'spawnName' : "MONROE" },{ 'menuName' : "Truffade Z-Type", 'spawnName' : "ZTYPE" },{ 'menuName' : "Vapid Peyote", 'spawnName' : "PEYOTE" }]
var vehicle_muscle = [{ 'menuName' : "Albany Buccaneer", 'spawnName' : "BUCCANEER" },{ 'menuName' : "Albany Franken Strange", 'spawnName' : "BTYPE2" },{ 'menuName' : "Albany Lurcher", 'spawnName' : "LURCHER" },{ 'menuName' : "Albany Virgo", 'spawnName' : "VIRGO" },{ 'menuName' : "Bravado Gauntlet", 'spawnName' : "GAUNTLET" },{ 'menuName' : "Bravado Gauntlet (Race)", 'spawnName' : "GAUNTLET2" },{ 'menuName' : "Cheval Picador", 'spawnName' : "PICADOR" },{ 'menuName' : "Declasse Mamba", 'spawnName' : "MAMBA" },{ 'menuName' : "Declasse Tampa", 'spawnName' : "TAMPA" },{ 'menuName' : "Declasse Sabre Turbo", 'spawnName' : "SABREGT" },{ 'menuName' : "Declasse Stallion", 'spawnName' : "STALION" },{ 'menuName' : "Declasse Staillion (Race)", 'spawnName' : "STALION2" },{ 'menuName' : "Declasse Vigero", 'spawnName' : "VIGERO" },{ 'menuName' : "Declasse Voodoo", 'spawnName' : "VOODOO2" },{ 'menuName' : "Dundreary Virgo Classic", 'spawnName' : "VIRGO" },{ 'menuName' : "Imponte Duke O' Death", 'spawnName' : "DUKES2" },{ 'menuName' : "Imponte Dukes", 'spawnName' : "DUKES" },{ 'menuName' : "Imponte Nightshade", 'spawnName' : "NIGHTSHADE" },{ 'menuName' : "Imponte Pheonix", 'spawnName' : "PHOENIX" },{ 'menuName' : "Imponte Ruiner", 'spawnName' : "RUINER" },{ 'menuName' : "Invetero Coquette BlackFin", 'spawnName' : "COQUETTE3" },{ 'menuName' : "Vapid Blade", 'spawnName' : "BLADE" },{ 'menuName' : "Vapid Chino", 'spawnName' : "CHINO" },{ 'menuName' : "Vapid Dominator", 'spawnName' : "DOMINATOR" },{ 'menuName' : "Vapid Dominator (Race)", 'spawnName' : "DOMINATOR2" },{ 'menuName' : "Vapid Hotknife", 'spawnName' : "HOTKNIFE" },{ 'menuName' : "Vapid Slamvan", 'spawnName' : "SLAMVAN" },{ 'menuName' : "Vapid Slamvan (Lost MC)", 'spawnName' : "SLAMVAN2" },{ 'menuName' : "Willard Faction", 'spawnName' : "FACTION" }]
var vehicle_lowriders = [{ 'menuName' : "Albany Buccaneer", 'spawnName' : "BUCCANEER" },{ 'menuName' : "Albany Primo", 'spawnName' : "PRIMO" },{ 'menuName' : "Declasse Moonbeam", 'spawnName' : "MOONBEAM" },{ 'menuName' : "Declasse Sabre Turbo", 'spawnName' : "SABREGT" },{ 'menuName' : "Declasse Tornado", 'spawnName' : "TORNADO" },{ 'menuName' : "Declasse Voodoo", 'spawnName' : "VOODOO2" },{ 'menuName' : "Dundreary Virgo Classic", 'spawnName' : "VIRGO3" },{ 'menuName' : "Vapid Chino", 'spawnName' : "CHINO2" },{ 'menuName' : "Vapid Minivan", 'spawnName' : "MINIVAN" },{ 'menuName' : "Vapid Slamvan", 'spawnName' : "SLAMVAN" },{ 'menuName' : "Willard Faction", 'spawnName' : "FACTION2" },{ 'menuName' : "Willard Faction Donk", 'spawnName' : "FACTION3" }]
var vehicle_coupes = [{ 'menuName' : "Dewbauchee Exemplar", 'spawnName' : "EXEMPLAR" },{ 'menuName' : "Enus Cognoscenti Cabrio", 'spawnName' : "COGCABRIO" },{ 'menuName' : "Enus Windsor", 'spawnName' : "WINDSOR" },{ 'menuName' : "Enus Windsor Drop", 'spawnName' : "WINDSOR2" },{ 'menuName' : "Lampadati Felon", 'spawnName' : "FELON" },{ 'menuName' : "Lampadati Felon GT", 'spawnName' : "FELON2" },{ 'menuName' : "Ocelot F620", 'spawnName' : "F620" },{ 'menuName' : "Ocelot Jackal", 'spawnName' : "JACKAL" },{ 'menuName' : "Ubermacht Sentinel", 'spawnName' : "SENTINEL" },{ 'menuName' : "Ubermacht Sentinel XS", 'spawnName' : "SENTINEL2" },{ 'menuName' : "Ubermacht Zion", 'spawnName' : "ORACLE" },{ 'menuName' : "Ubermacht Zion Cabrio", 'spawnName' : "ORACLE2" }]
var vehicle_sedans = [{ 'menuName' : "Albany Emperor", 'spawnName' : "EMPEROR" },{ 'menuName' : "Albany Emperor (Rusty)", 'spawnName' : "EMPEROR2" },{ 'menuName' : "Albany Emperor (Snow)", 'spawnName' : "EMPEROR3" },{ 'menuName' : "Albany Primo", 'spawnName' : "PRIMO" },{ 'menuName' : "Albany Washington", 'spawnName' : "WASHINGTON" },{ 'menuName' : "Benefactor Glendale", 'spawnName' : "GLENDALE" },{ 'menuName' : "Benefactor Schafter", 'spawnName' : "SCHAFTER2" },{ 'menuName' : "Chariot Romero Hearse", 'spawnName' : "ROMERO" },{ 'menuName' : "Cheval Fugitive", 'spawnName' : "FUGITIVE" },{ 'menuName' : "Cheval Surge", 'spawnName' : "SURGE" },{ 'menuName' : "Declasse Asea", 'spawnName' : "ASEA" },{ 'menuName' : "Declasse Asea (snow)", 'spawnName' : "ASEA2" },{ 'menuName' : "Declasse Premier", 'spawnName' : "PREMIER" },{ 'menuName' : "Dundreary Regina", 'spawnName' : "REGINA" },{ 'menuName' : "Dundreary Stretch", 'spawnName' : "STRETCH" },{ 'menuName' : "Enus Super Diamond", 'spawnName' : "SUPERD" },{ 'menuName' : "Karin Asterope", 'spawnName' : "ASTEROPE" },{ 'menuName' : "Karin Intruder", 'spawnName' : "INTRUDER" },{ 'menuName' : "Obey Tailgater", 'spawnName' : "TAILGATER" },{ 'menuName' : "Ubermacht Oracle", 'spawnName' : "ORACLE" },{ 'menuName' : "Ubermacht Oracle Mk2", 'spawnName' : "ORACLE2" },{ 'menuName' : "Vapid Stanier", 'spawnName' : "STANIER" },{ 'menuName' : "Vapid Stanier (Taxi)", 'spawnName' : "TAXI" },{ 'menuName' : "Vulcan Ingot", 'spawnName' : "INGOT" },{ 'menuName' : "Vulcar Warrener", 'spawnName' : "WARRENER" },{ 'menuName' : "Zirconium Stratum", 'spawnName' : "STRATUM" }]
var vehicle_compacts = [{ 'menuName' : "Benefactor Panto", 'spawnName' : "PANTO" },{ 'menuName' : "Bollokan Prairie", 'spawnName' : "PRAIRIE" },{ 'menuName' : "Declasse Rhapsody", 'spawnName' : "RHAPSODY" },{ 'menuName' : "Dinka Blista", 'spawnName' : "BLISTA" },{ 'menuName' : "Grotti Brioso R/A", 'spawnName' : "BRIOSO" },{ 'menuName' : "Karin Dilettante", 'spawnName' : "DILETTANTE" },{ 'menuName' : "Karin Dilettante (FlyUS)", 'spawnName' : "DILETTANTE2" },{ 'menuName' : "Weeny Issi", 'spawnName' : "ISSI2" }]
var vehicle_suvs = [{ 'menuName' : "Albany Cavalcade", 'spawnName' : "CAVALCADE" },{ 'menuName' : "Albany Cavalcade Mk2", 'spawnName' : "CAVALCADE2" },{ 'menuName' : "Benefactor Dubsta", 'spawnName' : "DUBSTA" },{ 'menuName' : "Benefactor Dubsta (Flat Black)", 'spawnName' : "DUBSTA2" },{ 'menuName' : "Benefactor Serrano", 'spawnName' : "SERRANO" },{ 'menuName' : "Bravado Gresley", 'spawnName' : "GRESLEY" },{ 'menuName' : "Canis Mesa", 'spawnName' : "MESA" },{ 'menuName' : "Canis Mesa (Snow)", 'spawnName' : "MESA2" },{ 'menuName' : "Canis Seminole", 'spawnName' : "SEMINOLE" },{ 'menuName' : "Declasse Granger", 'spawnName' : "GRANGER" },{ 'menuName' : "Dundreary Landstalker", 'spawnName' : "LANDSTALKER" },{ 'menuName' : "Emperor Habanero", 'spawnName' : "HABANERO" },{ 'menuName' : "Enus Huntley S", 'spawnName' : "HUNTLEY" },{ 'menuName' : "Fathom FQ 2", 'spawnName' : "FQ2" },{ 'menuName' : "Gallivanter Baller (Large)", 'spawnName' : "BALLER" },{ 'menuName' : "Gallivanter Baller (Small)", 'spawnName' : "BALLER2" },{ 'menuName' : "Karin BeeJay XL", 'spawnName' : "BJXL" },{ 'menuName' : "Mammoth Patriot", 'spawnName' : "PATRIOT" },{ 'menuName' : "Obey Rocoto", 'spawnName' : "ROCOTO" },{ 'menuName' : "Vapid Contender", 'spawnName' : "CONTENDER" },{ 'menuName' : "Vapid Radius", 'spawnName' : "RADI" }]
var vehicle_offroad = [{ 'menuName' : "Benefactor Dubsta 6x6", 'spawnName' : "DUBSTA3" },{ 'menuName' : "BF Bifta", 'spawnName' : "BIFTA" },{ 'menuName' : "BF Injection", 'spawnName' : "BFINJECTION" },{ 'menuName' : "Bravado Dune", 'spawnName' : "DUNE" },{ 'menuName' : "Bravado Duneloader", 'spawnName' : "DLOADER" },{ 'menuName' : "Bravado Space Docker", 'spawnName' : "DUNE2" },{ 'menuName' : "Canis Bodhi", 'spawnName' : "BODHI2" },{ 'menuName' : "Canis Kalahari", 'spawnName' : "KALAHARI" },{ 'menuName' : "Canis Mesa (Off-Road)", 'spawnName' : "MESA3" },{ 'menuName' : "Cheval Marshall", 'spawnName' : "MARSHALL" },{ 'menuName' : "Coil Brawler", 'spawnName' : "BRAWLER" },{ 'menuName' : "Declasse Rancher XL", 'spawnName' : "RANCHERXL" },{ 'menuName' : "Declasse Rancher XL (Snow)", 'spawnName' : "RANCHERXL2" },{ 'menuName' : "Insurgent", 'spawnName' : "INSURGENT" },{ 'menuName' : "Insurgent (Gun Mount)", 'spawnName' : "INSURGENT2" },{ 'menuName' : "Karin Rebel", 'spawnName' : "REBEL" },{ 'menuName' : "Karin Rebel (Rusty)", 'spawnName' : "REBEL2" },{ 'menuName' : "Karin Technical", 'spawnName' : "TECHNICAL" },{ 'menuName' : "Nagasaki Blazer", 'spawnName' : "BLAZER" },{ 'menuName' : "Nagasaki Blazer (Hot Rod)", 'spawnName' : "BLAZER3" },{ 'menuName' : "Nagasaki Blazer (Lifeguard)", 'spawnName' : "BLAZER2" },{ 'menuName' : "Nagasaki Blazer (Street)", 'spawnName' : "BLAZER4" },{ 'menuName' : "Vapid Desert Raid", 'spawnName' : "TROPHYTRUCK2" },{ 'menuName' : "Vapid Guardian", 'spawnName' : "GUARDIAN" },{ 'menuName' : "Vapid Liberator", 'spawnName' : "MONSTER" },{ 'menuName' : "Vapid Sandking", 'spawnName' : "SANDKING2" },{ 'menuName' : "Vapid Sandking XL", 'spawnName' : "SANDKING" },{ 'menuName' : "Vapid Trophy Truck", 'spawnName' : "TROPHYTRUCK" }]
var vehicle_vip = [{ 'menuName' : "Benefactor Schafter V12", 'spawnName' : "SCHAFTER3" },{ 'menuName' : "Benefactor Schafter V12 (Armored)", 'spawnName' : "SCHAFTER5" },{ 'menuName' : "Benefactor Schafter LWB", 'spawnName' : "SCHAFTER4" },{ 'menuName' : "Benefactor Schafter LWB (Armored)", 'spawnName' : "SCHAFTER6" },{ 'menuName' : "Benefactor Turreted Limo", 'spawnName' : "LIMO2" },{ 'menuName' : "Benefactor XLS", 'spawnName' : "XLS" },{ 'menuName' : "Benefactor XLS (Armored)", 'spawnName' : "XLS2" },{ 'menuName' : "Enus Cognoscenti", 'spawnName' : "COGNOSCENTI" },{ 'menuName' : "Enus Cognoscenti (Armored)", 'spawnName' : "COGNOSCENTI2" },{ 'menuName' : "Enus Cognoscenti 55", 'spawnName' : "COG552" },{ 'menuName' : "Enus Cognoscenti 55 (Armored)", 'spawnName' : "COG552" },{ 'menuName' : "Gallivanter Baller LE", 'spawnName' : "BALLER3" },{ 'menuName' : "Gallivanter Baller LE (Armored)", 'spawnName' : "BALLER5" },{ 'menuName' : "Gallivanter Baller LE LWB", 'spawnName' : "BALLER4" },{ 'menuName' : "Gallivanter Baller LE LWB (Armored)", 'spawnName' : "BALLER6" }]
var vehicle_pickups = [{ 'menuName' : "Bravado Bison", 'spawnName' : "BISON" },{ 'menuName' : "Bravado Bison (Backrack)", 'spawnName' : "BISON2" },{ 'menuName' : "Bravado Bison (Construction)", 'spawnName' : "BISON3" },{ 'menuName' : "Bravado Ratloader", 'spawnName' : "RATLOADER2" },{ 'menuName' : "Bravado Ratloader (Rusty)", 'spawnName' : "RATLOADER" },{ 'menuName' : "Vapid Bobcat", 'spawnName' : "BOBCATXL" },{ 'menuName' : "Vapid Sadler", 'spawnName' : "SADLER" },{ 'menuName' : "Vapid Sadler (Snow)", 'spawnName' : "SADLER2" }]
var vehicle_vans = [{ 'menuName' : "BF Surfer", 'spawnName' : "SURFER" },{ 'menuName' : "BF Surfer (Rusty)", 'spawnName' : "SURFER2" },{ 'menuName' : "Bravado Paradise", 'spawnName' : "PARADISE" },{ 'menuName' : "Bravado Rumpo Custom", 'spawnName' : "RUMPO3" },{ 'menuName' : "Bravado Rumpo (Deludamol)", 'spawnName' : "RUMPO2" },{ 'menuName' : "Bravado Rumpo (Weazel News)", 'spawnName' : "RUMPO" },{ 'menuName' : "Bravado Youga", 'spawnName' : "YOUGA" },{ 'menuName' : "Bravado Youga Classic", 'spawnName' : "YOUGA2" },{ 'menuName' : "Brute Camper", 'spawnName' : "CAMPER" },{ 'menuName' : "Brute Pony (Business)", 'spawnName' : "PONY" },{ 'menuName' : "Brute Pony (Cannibus Shop)", 'spawnName' : "PONY2" },{ 'menuName' : "Brute Taco Van", 'spawnName' : "TACO" },{ 'menuName' : "Declasse Burrito", 'spawnName' : "BURRITO3" },{ 'menuName' : "Declasse Burrito (Bug Stars)", 'spawnName' : "BURRITO2" },{ 'menuName' : "Declasse Burrito (Construction)", 'spawnName' : "BURRITO4" },{ 'menuName' : "Declasse Burrito (Gang)", 'spawnName' : "GBURRITO2" },{ 'menuName' : "Declasse Burrito (Graphics)", 'spawnName' : "BURRITO" },{ 'menuName' : "Declasse Burrito (Snow)", 'spawnName' : "BURRITO5" },{ 'menuName' : "Declasse Burrito (The Lost)", 'spawnName' : "GBURRITO" },{ 'menuName' : "Declasse Moonbeam", 'spawnName' : "MOONBEAM" },{ 'menuName' : "Vapid Minivan", 'spawnName' : "MINIVAN" },{ 'menuName' : "Vapid Speedo", 'spawnName' : "SPEEDO" },{ 'menuName' : "Vapid Speedo (Clown)", 'spawnName' : "SPEEDO2" },{ 'menuName' : "Zirconium Journey", 'spawnName' : "JOURNEY" }]
var vehicle_trucks = [{ 'menuName' : "Brute Boxville (Go Postal)", 'spawnName' : "BOXVILLE2" },{ 'menuName' : "Brute Boxville (Humane Labs)", 'spawnName' : "BOXVILLE3" },{ 'menuName' : "Brute Boxville (Post OP)", 'spawnName' : "BOXVILLE4" },{ 'menuName' : "Brute Boxville (Water & Power)", 'spawnName' : "BOXVILLE" },{ 'menuName' : "Brute Stockade", 'spawnName' : "STOCKADE" },{ 'menuName' : "Brute Stockade (Snow)", 'spawnName' : "STOCKADE3" },{ 'menuName' : "Brute Tipper (2 Axle)", 'spawnName' : "TIPTRUCK" },{ 'menuName' : "Brute Tipper (3 Axle)", 'spawnName' : "TIPTRUCK2" },{ 'menuName' : "Cutter", 'spawnName' : "CUTTER" },{ 'menuName' : "Dock Handler", 'spawnName' : "HANDLER" },{ 'menuName' : "Dock Tug", 'spawnName' : "DOCKTUG" },{ 'menuName' : "Dump Truck", 'spawnName' : "DUMP" },{ 'menuName' : "HVY Biff", 'spawnName' : "BIFF" },{ 'menuName' : "Jobuilt Hauler", 'spawnName' : "HAULER" },{ 'menuName' : "Jobuilt Phantom", 'spawnName' : "PHANTOM" },{ 'menuName' : "Jobuilt Rubble", 'spawnName' : "RUBBLE" },{ 'menuName' : "Maibatsu Mule (Graphics 1)", 'spawnName' : "MULE" },{ 'menuName' : "Maibatsu Mule (Graphics 2)", 'spawnName' : "MULE2" },{ 'menuName' : "Maibatsu Mule (Plain)", 'spawnName' : "MULE3" },{ 'menuName' : "Mixer", 'spawnName' : "MIXER" },{ 'menuName' : "Mixer (Support Wheel)", 'spawnName' : "MIXER2" },{ 'menuName' : "MTL Flatbed Truck", 'spawnName' : "FLATBED" },{ 'menuName' : "MTL Packer", 'spawnName' : "PACKER" },{ 'menuName' : "MTL Pounder", 'spawnName' : "POUNDER" },{ 'menuName' : "Vapid Benson", 'spawnName' : "BENSON" },{ 'menuName' : "Vapid Scrap Truck", 'spawnName' : "SCRAP" },{ 'menuName' : "Vapid Tow Truck", 'spawnName' : "TOWTRUCK" },{ 'menuName' : "Vapid Tow Truck (Old)", 'spawnName' : "TOWTRUCK2" }]
var vehicle_service = [{ 'menuName' : "Airtug", 'spawnName' : "AIRTUG" },{ 'menuName' : "Brute Airport Bus", 'spawnName' : "AIRBUS" },{ 'menuName' : "Brute Bus (City Bus)", 'spawnName' : "BUS" },{ 'menuName' : "Brute Rental Shuttle Bus", 'spawnName' : "RENTALBUS" },{ 'menuName' : "Brute Tourbus", 'spawnName' : "TOURBUS" },{ 'menuName' : "Cable Car (Mt. Chilliad)", 'spawnName' : "CABLECAR" },{ 'menuName' : "Dashound Coach Bus", 'spawnName' : "COACH" },{ 'menuName' : "Dozer", 'spawnName' : "BULLDOZER" },{ 'menuName' : "Forklift", 'spawnName' : "FORKLIFT" },{ 'menuName' : "HVY Brickade", 'spawnName' : "BRICKADE" },{ 'menuName' : "Jobuilt Trashmaster", 'spawnName' : "TRASH" },{ 'menuName' : "Jobuilt Trashmaster (Rusty)", 'spawnName' : "TRASH2" },{ 'menuName' : "MTL Dune", 'spawnName' : "DUNE" },{ 'menuName' : "Nagasaki Caddy", 'spawnName' : "CADDY" },{ 'menuName' : "Nagasaki Caddy (Golf)", 'spawnName' : "CADDY2" },{ 'menuName' : "Ripley (Airpot Tug)", 'spawnName' : "RIPLEY" },{ 'menuName' : "Stanley Fieldmaster Tractor", 'spawnName' : "TRACTOR2" },{ 'menuName' : "Stanley Fieldmaster Tractor (Snow)", 'spawnName' : "TRACTOR3" },{ 'menuName' : "Stanley Lawn Mower", 'spawnName' : "MOWER" },{ 'menuName' : "Stanley Tractor (Rusty)", 'spawnName' : "tractor" },{ 'menuName' : "Vapid Pickup Utility", 'spawnName' : "UTILLITRUCK" },{ 'menuName' : "Vapid Plumbing Utility", 'spawnName' : "UTILLITRUCK2" },{ 'menuName' : "Vapid Telephone Utlity", 'spawnName' : "UTILLITRUCK3" }]
var vehicle_trailers = [{ 'menuName' : "Army Flatbed Trailer", 'spawnName' : "ARMYTRAILER" },{ 'menuName' : "Army Flatbed Trailer (with Drill)", 'spawnName' : "ARMYTRAILER2" },{ 'menuName' : "Army Fuel Tanker", 'spawnName' : "ARMYTANKER" },{ 'menuName' : "Boat trailer (small)", 'spawnName' : "BOATTRAILER" },{ 'menuName' : "Boat Trailer (With Boat)", 'spawnName' : "TR3" },{ 'menuName' : "Car Tranport Trailer", 'spawnName' : "TR4" },{ 'menuName' : "Car Tranport Trailer (Empty)", 'spawnName' : "TR2" },{ 'menuName' : "Commercial Trailer (Graphics 1)", 'spawnName' : "TRAILERS2" },{ 'menuName' : "Commercial Trailer (Graphics 2)", 'spawnName' : "TRAILERS3" },{ 'menuName' : "Container Trailer", 'spawnName' : "DOCKTRAILER" },{ 'menuName' : "Fame or Shame Trailer", 'spawnName' : "TVTRAILER" },{ 'menuName' : "Flatbed Trailer", 'spawnName' : "TRFLAT" },{ 'menuName' : "Flatbed Trailer", 'spawnName' : "FREIGHTTRAILER" },{ 'menuName' : "Grain Trailer", 'spawnName' : "GRAINTRAILER" },{ 'menuName' : "Hay Bale Trailer", 'spawnName' : "BALETRAILER" },{ 'menuName' : "Logging Trailer", 'spawnName' : "TRAILERLOGS" },{ 'menuName' : "Meth Lab Trailer", 'spawnName' : "PROPTRAILER" },{ 'menuName' : "Petrol Tanker Trailer (Plain)", 'spawnName' : "TANKER2" },{ 'menuName' : "Petrol Tanker Trailer (Ron)", 'spawnName' : "TANKER" },{ 'menuName' : "Plain Trailer", 'spawnName' : "TRAILERS" },{ 'menuName' : "Rake Trailer", 'spawnName' : "RAKETRAILER" },{ 'menuName' : "Small Trailer", 'spawnName' : "TRAILERSMALL" }]
var vehicle_trains = [{ 'menuName' : "Container Car 1", 'spawnName' : "FREIGHTCONT1" },{ 'menuName' : "Container Car 2", 'spawnName' : "FREIGHTCONT2" },{ 'menuName' : "Flatbed Car", 'spawnName' : "FREIGHTCAR" },{ 'menuName' : "Freight Train Cab", 'spawnName' : "FREIGHT" },{ 'menuName' : "Grain Car", 'spawnName' : "FREIGHTGRAIN" },{ 'menuName' : "Metro Train (Half)", 'spawnName' : "METROTRAIN" },{ 'menuName' : "Oil Tanker Car", 'spawnName' : "TANKERCAR" }]
var vehicle_emergency = [{ 'menuName' : "Albany Police Roadcruiser (Snow)", 'spawnName' : "POLICEOLD2" },{ 'menuName' : "Ambulance", 'spawnName' : "AMBULANCE" },{ 'menuName' : "Army Barracks Truck", 'spawnName' : "BARRACKS" },{ 'menuName' : "Army Truck Cab", 'spawnName' : "BARRACKS2" },{ 'menuName' : "Bravado Buffalo (FIB)", 'spawnName' : "FBI" },{ 'menuName' : "Brute Police Riot Van", 'spawnName' : "RIOT" },{ 'menuName' : "Canis Crusader (Army Mesa)", 'spawnName' : "CRUSADER" },{ 'menuName' : "Declasse Granger (FIB)", 'spawnName' : "FBI2" },{ 'menuName' : "Declasse Lifeguard", 'spawnName' : "LGUARD" },{ 'menuName' : "Declasse Park Ranger", 'spawnName' : "PRANGER" },{ 'menuName' : "Declasse Police Rancher (Snow)", 'spawnName' : "POLICEOLD1" },{ 'menuName' : "Declasse Police Transporter", 'spawnName' : "POLICET" },{ 'menuName' : "Declasse Sheriff SUV", 'spawnName' : "SHERIFF2" },{ 'menuName' : "Firetruck", 'spawnName' : "FIRETRUK" },{ 'menuName' : "Prison Bus", 'spawnName' : "PBUS" },{ 'menuName' : "Rhino Tank", 'spawnName' : "RHINO" },{ 'menuName' : "Vapid Police Buffalo", 'spawnName' : "POLICE2" },{ 'menuName' : "Vapid Police Cruiser", 'spawnName' : "POLICE" },{ 'menuName' : "Vapid Police Interceptor", 'spawnName' : "POLICE3" },{ 'menuName' : "Vapid Sheriff Cruiser", 'spawnName' : "SHERIFF" },{ 'menuName' : "Vapid Unmarked Police Cruiser", 'spawnName' : "POLICE4" },{ 'menuName' : "Western Police Bike", 'spawnName' : "POLICEB" }]
var vehicle_motorcycles = [{ 'menuName' : "Dinka Akuma", 'spawnName' : "AKUMA" },{ 'menuName' : "Dinka Double-T", 'spawnName' : "DOUBLE" },{ 'menuName' : "Dinka Enduro", 'spawnName' : "ENDURO" },{ 'menuName' : "Dinka Thrust", 'spawnName' : "THRUST" },{ 'menuName' : "Dinka Vindicator", 'spawnName' : "VINDICATOR" },{ 'menuName' : "LLC Avarus", 'spawnName' : "AVARUS" },{ 'menuName' : "LLC Hexer", 'spawnName' : "HEXER" },{ 'menuName' : "LLC Innovation", 'spawnName' : "INNOVATION" },{ 'menuName' : "LLC Sanctus", 'spawnName' : "SANCTUS" },{ 'menuName' : "Maibatsu Carbon RS", 'spawnName' : "CARBONRS" },{ 'menuName' : "Maibatsu Chimera", 'spawnName' : "CHIMERA" },{ 'menuName' : "Maibatsu Manchez", 'spawnName' : "MANCHEZ" },{ 'menuName' : "Maibatsu Sanchez", 'spawnName' : "SANCHEZ" },{ 'menuName' : "Maibatsu Sanchez (Graphics)", 'spawnName' : "SANCHEZ2" },{ 'menuName' : "Maibatsu Shotaro", 'spawnName' : "SHOTARO" },{ 'menuName' : "Pegassi Bati", 'spawnName' : "BATI" },{ 'menuName' : "Pegassi Bati(Race)", 'spawnName' : "BATI2" },{ 'menuName' : "Pegassi Esskey", 'spawnName' : "ESSKEY" },{ 'menuName' : "Pegassi Faggio", 'spawnName' : "FAGGIO" },{ 'menuName' : "Pegassi Faggio Mod", 'spawnName' : "FAGGIO3" },{ 'menuName' : "Pegassi Faggio Sport", 'spawnName' : "FAGGIO2" },{ 'menuName' : "Pegassi Ruffian", 'spawnName' : "RUFFIAN" },{ 'menuName' : "Pegassi Vortex", 'spawnName' : "VORTEX" },{ 'menuName' : "Principe Lectro", 'spawnName' : "LECTRO" },{ 'menuName' : "Principe Nemesis", 'spawnName' : "NEMESIS" },{ 'menuName' : "Shitzu Defiler", 'spawnName' : "DEFILER" },{ 'menuName' : "Shitzu Hakuchou", 'spawnName' : "HAKUCHOU" },{ 'menuName' : "Shitzu Hakuchou Drag", 'spawnName' : "HAKUCHOU2" },{ 'menuName' : "Shitzu PCJ 600", 'spawnName' : "PCJ" },{ 'menuName' : "Shitzu Vader", 'spawnName' : "VADER" },{ 'menuName' : "Western Bagger", 'spawnName' : "BAGGER" },{ 'menuName' : "Western Cliffhanger", 'spawnName' : "CLIFFHANGER" },{ 'menuName' : "Western Daemon", 'spawnName' : "DAEMON2" },{ 'menuName' : "Western Daemon Custom", 'spawnName' : "DAEMON" },{ 'menuName' : "Western Gargoyle", 'spawnName' : "GARGOYLE" },{ 'menuName' : "Western Nightblade", 'spawnName' : "NIGHTBLADE" },{ 'menuName' : "Western Rat Bike", 'spawnName' : "RATBIKE" },{ 'menuName' : "Western Sovereign", 'spawnName' : "SOVEREIGN" },{ 'menuName' : "Western Wolfsbane", 'spawnName' : "WOLFSBANE" },{ 'menuName' : "Western Zombie Bobber", 'spawnName' : "ZOMBIEA" },{ 'menuName' : "Western Zombie Chopper", 'spawnName' : "ZOMBIEB" }]
var vehicle_planes = [{ 'menuName' : "Buckingham Cargo Plane (An-225)", 'spawnName' : "CARGOPLANE" },{ 'menuName' : "Buckingham Jet (B747)", 'spawnName' : "JET" },{ 'menuName' : "Buckingham Luxor", 'spawnName' : "LUXOR" },{ 'menuName' : "Buckingham Luxor Deluxe", 'spawnName' : "LUXOR2" },{ 'menuName' : "Buckingham Miljet", 'spawnName' : "MILJET" },{ 'menuName' : "Buckingham Nimbus", 'spawnName' : "NIMBUS" },{ 'menuName' : "Buckingham Shamal", 'spawnName' : "SHAMAL" },{ 'menuName' : "Buckingham Vestra", 'spawnName' : "VESTRA" },{ 'menuName' : "Jobuilt Mammatus", 'spawnName' : "MAMMATUS" },{ 'menuName' : "Jobuilt P-996 Lazer", 'spawnName' : "LAZER" },{ 'menuName' : "Jobuilt Velum (4 Seater)", 'spawnName' : "VELUM" },{ 'menuName' : "Jobuilt Velum (5 Seater)", 'spawnName' : "VELUM2" },{ 'menuName' : "Mammoth Dodo", 'spawnName' : "DODO" },{ 'menuName' : "Mammoth Hydra", 'spawnName' : "HYDRA" },{ 'menuName' : "Mammoth Titan", 'spawnName' : "TITAN" },{ 'menuName' : "Western Besra", 'spawnName' : "BESRA" },{ 'menuName' : "Western Cuban 800", 'spawnName' : "CUBAN800" },{ 'menuName' : "Western Duster", 'spawnName' : "DUSTER" },{ 'menuName' : "Western Mallard Stunt Plane", 'spawnName' : "STUNT" }]
var vehicle_helicopters = [{ 'menuName' : "Blimp (Atomic)", 'spawnName' : "BLIMP" },{ 'menuName' : "Blimp (Xero Gas)", 'spawnName' : "BLIMP2" },{ 'menuName' : "Buckingham Savage", 'spawnName' : "SAVAGE" },{ 'menuName' : "Buckingham SuperVolito", 'spawnName' : "SUPERVOLITO" },{ 'menuName' : "Buckingham SuperVolito Carbon", 'spawnName' : "SUPERVOLITO2" },{ 'menuName' : "Buckingham Swift", 'spawnName' : "SWIFT" },{ 'menuName' : "Buckingham Swift Deluxe", 'spawnName' : "SWIFT2" },{ 'menuName' : "Buckingham Valkyrie", 'spawnName' : "VALKYRIE" },{ 'menuName' : "Buckingham Volatus", 'spawnName' : "VOLATUS" },{ 'menuName' : "HVT Skylift", 'spawnName' : "SKYLIFT" },{ 'menuName' : "Maibatsu Frogger", 'spawnName' : "FROGGER" },{ 'menuName' : "Maibatsu Frogger (TPE/FIB)", 'spawnName' : "FROGGER2" },{ 'menuName' : "Nagasaki Buzzard (Unarmed)", 'spawnName' : "BUZZARD" },{ 'menuName' : "Nagasaki Buzzard (Attack Chopper)", 'spawnName' : "BUZZARD2" },{ 'menuName' : "Western Annihilator", 'spawnName' : "ANNIHILATOR" },{ 'menuName' : "Western Cargobob (Desert Camo)", 'spawnName' : "CARGOBOB" },{ 'menuName' : "Western Cargobob (Jetsam)", 'spawnName' : "CARGOBOB2" },{ 'menuName' : "Western Cargobob (TPE)", 'spawnName' : "CARGOBOB3" },{ 'menuName' : "Western Mavrick", 'spawnName' : "MAVERICK" },{ 'menuName' : "Western Mavrick (Police)", 'spawnName' : "POLMAV" }]
var vehicle_boats = [{ 'menuName' : "Buckingham Tug", 'spawnName' : "TUG" },{ 'menuName' : "Dinka Marquis", 'spawnName' : "MARQUIS" },{ 'menuName' : "Lampadati Toro", 'spawnName' : "TORO" },{ 'menuName' : "Nagasaki Dinghy (2 Seater)", 'spawnName' : "DINGHY2" },{ 'menuName' : "Nagasaki Dinghy (4 Seater Black)", 'spawnName' : "DINGHY3" },{ 'menuName' : "Nagasaki Dinghy (4 Seater Red)", 'spawnName' : "DINGHY" },{ 'menuName' : "Pegassi Speeder", 'spawnName' : "SPEEDER" },{ 'menuName' : "Shitzu Jetmax", 'spawnName' : "SUNTRAP" },{ 'menuName' : "Shitzu Predator (Police)", 'spawnName' : "PREDATOR" },{ 'menuName' : "Shitzu Squalo", 'spawnName' : "SQUALO" },{ 'menuName' : "Shitzu Suntrap", 'spawnName' : "SUNTRAP" },{ 'menuName' : "Shitzu Tropic", 'spawnName' : "TROPIC" },{ 'menuName' : "Speedophile Seashark", 'spawnName' : "SEASHARK" },{ 'menuName' : "Speedophile Seashark (Lifeguard)", 'spawnName' : "SEASHARK2" },{ 'menuName' : "Submersible", 'spawnName' : "SUBMERSIBLE" },{ 'menuName' : "Submersible (Kraken)", 'spawnName' : "SUBMERSIBLE2" }]
var vehicle_bicycles = [{ 'menuName' : "BMX", 'spawnName' : "BMX" },{ 'menuName' : "Cruiser", 'spawnName' : "CRUISER" },{ 'menuName' : "Endurex Race", 'spawnName' : "TRIBIKE2" },{ 'menuName' : "Fixter", 'spawnName' : "FIXTER" },{ 'menuName' : "Scorcher", 'spawnName' : "SCORCHER" },{ 'menuName' : "Tri-Cycles Race", 'spawnName' : "TRIBIKE3" },{ 'menuName' : "Whippet Race", 'spawnName' : "TRIBIKE" }]


// Weapon Spawning Database.
var weaponDB = {"Melee":[{"menuName":"Knife","spawnName":"WEAPON_KNIFE","subOptions":{"ammo":false,"weapon":true,"options":[]}},{"menuName":"Brass Knuckles","spawnName":"WEAPON_KNUCKLE","subOptions":{"ammo":false,"weapon":true,"options":[{"menuName":"Default","spawnName":"COMPONENT_KNUCKLE_VARMOD_BASE"},{"menuName":"Pimp","spawnName":"COMPONENT_KNUCKLE_VARMOD_PIMP"},{"menuName":"Ballas","spawnName":"COMPONENT_KNUCKLE_VARMOD_BALLAS"},{"menuName":"Dollars","spawnName":"COMPONENT_KNUCKLE_VARMOD_DOLLAR"},{"menuName":"Diamond","spawnName":"COMPONENT_KNUCKLE_VARMOD_DIAMOND"},{"menuName":"Hate","spawnName":"COMPONENT_KNUCKLE_VARMOD_HATE"},{"menuName":"Love","spawnName":"COMPONENT_KNUCKLE_VARMOD_LOVE"},{"menuName":"Player","spawnName":"COMPONENT_KNUCKLE_VARMOD_PLAYER"},{"menuName":"King","spawnName":"COMPONENT_KNUCKLE_VARMOD_KING"},{"menuName":"Vagos","spawnName":"COMPONENT_KNUCKLE_VARMOD_VAGOS"}]}},{"menuName":"Nightstick","spawnName":"WEAPON_NIGHTSTICK","subOptions":{"ammo":false,"weapon":true,"options":[]}},{"menuName":"Hammer","spawnName":"WEAPON_HAMMER","subOptions":{"ammo":false,"weapon":true,"options":[]}},{"menuName":"Baseball Bat","spawnName":"WEAPON_BAT","subOptions":{"ammo":false,"weapon":true,"options":[]}},{"menuName":"Golf Club","spawnName":"WEAPON_GOLFCLUB","subOptions":{"ammo":false,"weapon":true,"options":[]}},{"menuName":"Crowbar","spawnName":"WEAPON_CROWBAR","subOptions":{"ammo":false,"weapon":true,"options":[]}},{"menuName":"Bottle","spawnName":"WEAPON_BOTTLE","subOptions":{"ammo":false,"weapon":true,"options":[]}},{"menuName":"Antique Dagger","spawnName":"WEAPON_DAGGER","subOptions":{"ammo":false,"weapon":true,"options":[]}},{"menuName":"Hatchet","spawnName":"WEAPON_HATCHET","subOptions":{"ammo":false,"weapon":true,"options":[]}},{"menuName":"Machete","spawnName":"WEAPON_MACHETE","subOptions":{"ammo":false,"weapon":true,"options":[]}},{"menuName":"Flashlight","spawnName":"WEAPON_FLASHLIGHT","subOptions":{"ammo":false,"weapon":true,"options":[]}},{"menuName":"Switchblade","spawnName":"WEAPON_SWITCHBLADE","subOptions":{"ammo":false,"weapon":true,"options":[{"menuName":"Variation 1","spawnName":"COMPONENT_SWITCHBLADE_VARMOD_VAR1"},{"menuName":"Variation 2","spawnName":"COMPONENT_SWITCHBLADE_VARMOD_VAR2"}]}}],"Handguns":[{"menuName":"Pistol","spawnName":"WEAPON_PISTOL","subOptions":{"ammo":true,"weapon":true,"options":[{"menuName":"Extended Magazine","spawnName":"COMPONENT_PISTOL_CLIP_02"},{"menuName":"Suppressor","spawnName":"COMPONENT_AT_PI_SUPP_02"},{"menuName":"Flashlight","spawnName":"COMPONENT_AT_PI_FLSH"},{"menuName":"Yusuf Amir Luxury Finish","spawnName":"COMPONENT_PISTOL_VARMOD_LUXE"}]}},{"menuName":"Combat Pistol","spawnName":"WEAPON_COMBATPISTOL","subOptions":{"ammo":true,"weapon":true,"options":[{"menuName":"Extended Magazine","spawnName":"COMPONENT_COMBATPISTOL_CLIP_02"},{"menuName":"Suppressor","spawnName":"COMPONENT_AT_PI_SUPP"},{"menuName":"Flashlight","spawnName":"COMPONENT_AT_PI_FLSH"},{"menuName":"Yusuf Amir Luxury Finish","spawnName":"COMPONENT_COMBATPISTOL_VARMOD_LOWRIDER"}]}},{"menuName":"AP Pistol","spawnName":"WEAPON_APPISTOL","subOptions":{"ammo":true,"weapon":true,"options":[{"menuName":"Extended Magazine","spawnName":"COMPONENT_APPISTOL_CLIP_02"},{"menuName":"Suppressor","spawnName":"COMPONENT_AT_PI_SUPP"},{"menuName":"Flashlight","spawnName":"COMPONENT_AT_PI_FLSH"},{"menuName":"Gilded Gun Metal Finish","spawnName":"COMPONENT_APPISTOL_VARMOD_LUXE"}]}},{"menuName":"Pistol .50","spawnName":"WEAPON_PISTOL50","subOptions":{"ammo":true,"weapon":true,"options":[{"menuName":"Extended Magazine","spawnName":"COMPONENT_PISTOL50_CLIP_02"},{"menuName":"Suppressor","spawnName":"COMPONENT_AT_AR_SUPP_02"},{"menuName":"Flashlight","spawnName":"COMPONENT_AT_PI_FLSH"},{"menuName":"Platinum Pearl Deluxe Finish","spawnName":"COMPONENT_PISTOL50_VARMOD_LUXE"}]}},{"menuName":"SNS Pistol","spawnName":"WEAPON_SNSPISTOL","subOptions":{"ammo":true,"weapon":true,"options":[{"menuName":"COMPONENT_SNSPISTOL_CLIP_02","spawnName":"Extended Magazine"},{"menuName":"COMPONENT_SNSPISTOL_VARMOD_LOWRIDER","spawnName":"Etched Wood Grip Finish"}]}},{"menuName":"Heavy Pistol","spawnName":"WEAPON_HEAVYPISTOL","subOptions":{"ammo":true,"weapon":true,"options":[{"menuName":"Extended Magazine","spawnName":"COMPONENT_HEAVYPISTOL_CLIP_02"},{"menuName":"Suppressor","spawnName":"COMPONENT_AT_PI_FLSH"},{"menuName":"Flashlight","spawnName":"COMPONENT_AT_PI_SUPP"},{"menuName":"Etched Wood Grip Finish","spawnName":"COMPONENT_HEAVYPISTOL_VARMOD_LUXE"}]}},{"menuName":"Vintage Pistol","spawnName":"WEAPON_VINTAGEPISTOL","subOptions":{"ammo":true,"weapon":true,"options":[{"menuName":"Extended Magazine","spawnName":"COMPONENT_VINTAGEPISTOL_CLIP_02"},{"menuName":"Suppressor","spawnName":"COMPONENT_AT_PI_SUPP"}]}},{"menuName":"Stungun","spawnName":"WEAPON_STUNGUN","subOptions":{"ammo":true,"weapon":true,"options":[]}},{"menuName":"Flaregun","spawnName":"WEAPON_FLAREGUN","subOptions":{"ammo":true,"weapon":true,"options":[]}},{"menuName":"Marksman Pistol","spawnName":"WEAPON_MARKSMANPISTOL","subOptions":{"ammo":true,"weapon":true,"options":[{"menuName":"Variation 1","spawnName":"COMPONENT_REVOLVER_VARMOD_BOSS"},{"menuName":"Variation 2","spawnName":"COMPONENT_REVOLVER_VARMOD_GOON"}]}},{"menuName":"Heavy Revolver","spawnName":"WEAPON_REVOLVER","subOptions":{"ammo":true,"weapon":true,"options":[]}}],"Submachine":[{"menuName":"Micro SMG","spawnName":"WEAPON_MICROSMG","subOptions":{"ammo":true,"weapon":true,"options":[{"menuName":"Extended Magazine","spawnName":"COMPONENT_MICROSMG_CLIP_02"},{"menuName":"Scope","spawnName":"COMPONENT_AT_SCOPE_MACRO"},{"menuName":"Suppressor","spawnName":"COMPONENT_AT_AR_SUPP_02"},{"menuName":"Flashlight","spawnName":"COMPONENT_AT_PI_FLSH"},{"menuName":"Yusuf Amir Luxury Finish","spawnName":"COMPONENT_MICROSMG_VARMOD_LUXE"}]}},{"menuName":"SMG","spawnName":"WEAPON_SMG","subOptions":{"ammo":true,"weapon":true,"options":[{"menuName":"Extended Magazine","spawnName":"COMPONENT_SMG_CLIP_02"},{"menuName":"Drum Magazine","spawnName":"COMPONENT_SMG_CLIP_03"},{"menuName":"Scope","spawnName":"COMPONENT_AT_SCOPE_MACRO_02"},{"menuName":"Suppressor","spawnName":"COMPONENT_AT_PI_SUPP"},{"menuName":"Flashlight","spawnName":"COMPONENT_AT_AR_FLSH"},{"menuName":"Yusuf Amir Luxury Finish","spawnName":"COMPONENT_SMG_VARMOD_LUXE"}]}},{"menuName":"Assault SMG","spawnName":"WEAPON_ASSAULTSMG","subOptions":{"ammo":true,"weapon":true,"options":[{"menuName":"Extended Magazine","spawnName":"COMPONENT_ASSAULTSMG_CLIP_02"},{"menuName":"Scope","spawnName":"COMPONENT_AT_SCOPE_MACRO"},{"menuName":"Suppressor","spawnName":"COMPONENT_AT_AR_SUPP_02"},{"menuName":"Flashlight","spawnName":"COMPONENT_AT_AR_FLSH"},{"menuName":"Yusuf Amir Luxury Finish","spawnName":"COMPONENT_ASSAULTSMG_VARMOD_LOWRIDER"}]}},{"menuName":"MG","spawnName":"WEAPON_MG","subOptions":{"ammo":true,"weapon":true,"options":[{"menuName":"Extended Magazine","spawnName":"COMPONENT_MG_CLIP_02"},{"menuName":"Scope","spawnName":"COMPONENT_AT_SCOPE_SMALL_02"}]}},{"menuName":"Combat MG","spawnName":"WEAPON_COMBATMG","subOptions":{"ammo":true,"weapon":true,"options":[{"menuName":"Extended Magazine","spawnName":"COMPONENT_COMBATMG_CLIP_02"},{"menuName":"Scope","spawnName":"COMPONENT_AT_SCOPE_MEDIUM"},{"menuName":"Grip","spawnName":"COMPONENT_AT_AR_AFGRIP"}]}},{"menuName":"Combat PDW","spawnName":"WEAPON_COMBATPDW","subOptions":{"ammo":true,"weapon":true,"options":[{"menuName":"Extended Magazine","spawnName":"COMPONENT_COMBATPDW_CLIP_02"},{"menuName":"Drum Magazine","spawnName":"COMPONENT_COMBATPDW_CLIP_03"},{"menuName":"Flashlight","spawnName":"COMPONENT_AT_AR_FLSH"},{"menuName":"Scope","spawnName":"COMPONENT_AT_SCOPE_SMALL"},{"menuName":"Grip","spawnName":"COMPONENT_AT_AR_AFGRIP"}]}},{"menuName":"Gusenberg Sweeper","spawnName":"WEAPON_GUSENBERG","subOptions":{"ammo":true,"weapon":true,"options":[{"menuName":"Extended Magazine","spawnName":"COMPONENT_GUSENBERG_CLIP_02"}]}},{"menuName":"Machine Pistol","spawnName":"WEAPON_MACHINEPISTOL","subOptions":{"ammo":true,"weapon":true,"options":[{"menuName":"Extended Magazine","spawnName":"COMPONENT_MACHINEPISTOL_CLIP_02"},{"menuName":"Drum Magazine","spawnName":"COMPONENT_MACHINEPISTOL_CLIP_03"},{"menuName":"Suppressor","spawnName":"COMPONENT_AT_PI_SUPP"}]}}],"Assault":[{"menuName":"Assault Rifle","spawnName":"WEAPON_ASSAULTRIFLE","subOptions":{"ammo":true,"weapon":true,"options":[{"menuName":"Extended Magazine","spawnName":"COMPONENT_ASSAULTRIFLE_CLIP_02"},{"menuName":"Drum Magazine","spawnName":"COMPONENT_ASSAULTRIFLE_CLIP_03"},{"menuName":"Scope","spawnName":"COMPONENT_AT_SCOPE_MACRO"},{"menuName":"Suppressor","spawnName":"COMPONENT_AT_AR_SUPP_02"},{"menuName":"Grip","spawnName":"COMPONENT_AT_AR_AFGRIP"},{"menuName":"Flashlight","spawnName":"COMPONENT_AT_AR_FLSH"},{"menuName":"Yusuf Amir Luxury Finish","spawnName":"COMPONENT_ASSAULTRIFLE_VARMOD_LUXE"}]}},{"menuName":"Carbine Rifle","spawnName":"WEAPON_CARBINERIFLE","subOptions":{"ammo":true,"weapon":true,"options":[{"menuName":"Extended Magazine","spawnName":"COMPONENT_CARBINERIFLE_CLIP_02"},{"menuName":"Box Magazine","spawnName":"COMPONENT_CARBINERIFLE_CLIP_03"},{"menuName":"Scope","spawnName":"COMPONENT_AT_SCOPE_MEDIUM"},{"menuName":"Suppressor","spawnName":"COMPONENT_AT_AR_SUPP"},{"menuName":"Grip","spawnName":"COMPONENT_AT_AR_AFGRIP"},{"menuName":"Flashlight","spawnName":"COMPONENT_AT_AR_FLSH"},{"menuName":"Rail Cover","spawnName":"COMPONENT_AT_RAILCOVER_01"},{"menuName":"Yusuf Amir Luxury Finish","spawnName":"COMPONENT_CARBINERIFLE_VARMOD_LUXE"}]}},{"menuName":"Advanced Rifle","spawnName":"WEAPON_ADVANCEDRIFLE","subOptions":{"ammo":true,"weapon":true,"options":[{"menuName":"Extended Magazine","spawnName":"COMPONENT_ADVANCEDRIFLE_CLIP_02"},{"menuName":"Scope","spawnName":"COMPONENT_AT_SCOPE_SMALL"},{"menuName":"Suppressor","spawnName":"COMPONENT_AT_AR_SUPP"},{"menuName":"Flashlight","spawnName":"COMPONENT_AT_AR_FLSH"},{"menuName":"Gilded Gun Metal Finish","spawnName":"COMPONENT_ADVANCEDRIFLE_VARMOD_LUXE"}]}},{"menuName":"Special Carbine","spawnName":"WEAPON_SPECIALCARBINE","subOptions":{"ammo":true,"weapon":true,"options":[{"menuName":"Extended Magazine","spawnName":"COMPONENT_SPECIALCARBINE_CLIP_02"},{"menuName":"Beta C-Magazine","spawnName":"COMPONENT_SPECIALCARBINE_CLIP_03"},{"menuName":"Flashlight","spawnName":"COMPONENT_AT_AR_FLSH"},{"menuName":"Scope","spawnName":"COMPONENT_AT_SCOPE_MEDIUM"},{"menuName":"Suppressor","spawnName":"COMPONENT_AT_AR_SUPP_02"},{"menuName":"Grip","spawnName":"COMPONENT_AT_AR_AFGRIP"}]}},{"menuName":"Bullpup Rifle","spawnName":"WEAPON_BULLPUPRIFLE","subOptions":{"ammo":true,"weapon":true,"options":[{"menuName":"Flashlight","spawnName":"COMPONENT_AT_AR_FLSH"},{"menuName":"Suppressor","spawnName":"COMPONENT_AT_AR_SUPP_02"},{"menuName":"Grip","spawnName":"COMPONENT_AT_AR_AFGRIP"}]}},{"menuName":"Compact Rifle","spawnName":"WEAPON_COMPACTRIFLE","subOptions":{"ammo":true,"weapon":true,"options":[{"menuName":"Extended Magazine","spawnName":"COMPONENT_COMPACTRIFLE_CLIP_02"},{"menuName":"Drum Magazine","spawnName":"COMPONENT_COMPACTRIFLE_CLIP_03"}]}}],"Shotguns":[{"menuName":"Pump Shotgun","spawnName":"WEAPON_PUMPSHOTGUN","subOptions":{"ammo":true,"weapon":true,"options":[{"menuName":"Suppressor","spawnName":"COMPONENT_AT_SR_SUPP"},{"menuName":"Flashlight","spawnName":"COMPONENT_AT_AR_FLSH"},{"menuName":"Yusuf Amir Luxury Finish","spawnName":"COMPONENT_PUMPSHOTGUN_VARMOD_LOWRIDER"}]}},{"menuName":"Sawnoff Shotgun","spawnName":"WEAPON_SAWNOFFSHOTGUN","subOptions":{"ammo":true,"weapon":true,"options":[{"menuName":"Gilded Gun Metal Finish","spawnName":"COMPONENT_SAWNOFFSHOTGUN_VARMOD_LUXE"}]}},{"menuName":"Bullpup Shotgun","spawnName":"WEAPON_BULLPUPSHOTGUN","subOptions":{"ammo":true,"weapon":true,"options":[{"menuName":"Extended Magazine","spawnName":"COMPONENT_BULLPUPRIFLE_CLIP_02"},{"menuName":"Flashlight","spawnName":"COMPONENT_AT_AR_FLSH"},{"menuName":"Scope","spawnName":"COMPONENT_AT_SCOPE_SMALL"},{"menuName":"Suppressor","spawnName":"COMPONENT_AT_AR_SUPP"},{"menuName":"Grip","spawnName":"COMPONENT_AT_AR_AFGRIP"},{"menuName":"Gilded Gun Metal Finish","spawnName":"COMPONENT_BULLPUPRIFLE_VARMOD_LOW"}]}},{"menuName":"Assault Shotgun","spawnName":"WEAPON_ASSAULTSHOTGUN","subOptions":{"ammo":true,"weapon":true,"options":[{"menuName":"Extended Magazine","spawnName":"COMPONENT_ASSAULTSHOTGUN_CLIP_02"},{"menuName":"Suppressor","spawnName":"COMPONENT_AT_AR_SUPP"},{"menuName":"Grip","spawnName":"COMPONENT_AT_AR_AFGRIP"},{"menuName":"Flashlight","spawnName":"COMPONENT_AT_AR_FLSH"}]}},{"menuName":"Musket","spawnName":"WEAPON_MUSKET","subOptions":{"ammo":true,"weapon":true,"options":[]}},{"menuName":"Heavy Shotgun","spawnName":"WEAPON_HEAVYSHOTGUN","subOptions":{"ammo":true,"weapon":true,"options":[{"menuName":"Extended Magazine","spawnName":"COMPONENT_HEAVYSHOTGUN_CLIP_02"},{"menuName":"Flashlight","spawnName":"COMPONENT_AT_AR_FLSH"},{"menuName":"Suppressor","spawnName":"COMPONENT_AT_AR_SUPP_02"},{"menuName":"Grip","spawnName":"COMPONENT_AT_AR_AFGRIP"}]}},{"menuName":"Double Barrel Shotgun","spawnName":"WEAPON_DBSHOTGUN","subOptions":{"ammo":true,"weapon":true,"options":[]}}],"Snipers":[{"menuName":"Sniper Rifle","spawnName":"WEAPON_SNIPERRIFLE","subOptions":{"ammo":true,"weapon":true,"options":[{"menuName":"Advanced Scope","spawnName":"COMPONENT_AT_SCOPE_MAX"},{"menuName":"Suppressor","spawnName":"COMPONENT_AT_AR_SUPP_02"},{"menuName":"Etched Wood Grip Finish","spawnName":"COMPONENT_SNIPERRIFLE_VARMOD_LUXE"}]}},{"menuName":"Heavy Sniper","spawnName":"WEAPON_HEAVYSNIPER","subOptions":{"ammo":true,"weapon":true,"options":[{"menuName":"Normal Scope","spawnName":"COMPONENT_AT_SCOPE_LARGE"}]}},{"menuName":"Marksman Rifle","spawnName":"WEAPON_MARKSMANRIFLE","subOptions":{"ammo":true,"weapon":true,"options":[{"menuName":"Extended Magazine","spawnName":"COMPONENT_MARKSMANRIFLE_CLIP_02"},{"menuName":"Flashlight","spawnName":"COMPONENT_AT_AR_FLSH"},{"menuName":"Suppressor","spawnName":"COMPONENT_AT_AR_SUPP"},{"menuName":"Grip","spawnName":"COMPONENT_AT_AR_AFGRIP"},{"menuName":"Yusuf Amir Luxury Finish","spawnName":"COMPONENT_MARKSMANRIFLE_VARMOD_LUXE"}]}}],"Heavy":[{"menuName":"Grenade Launcher","spawnName":"WEAPON_GRENADELAUNCHER","subOptions":{"ammo":true,"weapon":true,"options":[{"menuName":"Scope","spawnName":"COMPONENT_AT_SCOPE_SMALL"},{"menuName":"Flashlight","spawnName":"COMPONENT_AT_AR_FLSH"},{"menuName":"Grip","spawnName":"COMPONENT_AT_AR_AFGRIP"}]}},{"menuName":"Grenade Launcher (Smoke)","spawnName":"WEAPON_GRENADELAUNCHER_SMOKE","subOptions":{"ammo":true,"weapon":true,"options":[{"menuName":"Scope","spawnName":"COMPONENT_AT_SCOPE_SMALL"},{"menuName":"Flashlight","spawnName":"COMPONENT_AT_AR_FLSH"},{"menuName":"Grip","spawnName":"COMPONENT_AT_AR_AFGRIP"}]}},{"menuName":"RPG","spawnName":"WEAPON_RPG","subOptions":{"ammo":true,"weapon":true,"options":[]}},{"menuName":"Stinger","spawnName":"WEAPON_STINGER","subOptions":{"ammo":true,"weapon":true,"options":[]}},{"menuName":"Minigun","spawnName":"WEAPON_MINIGUN","subOptions":{"ammo":true,"weapon":true,"options":[]}},{"menuName":"Firework Launcher","spawnName":"WEAPON_FIREWORK","subOptions":{"ammo":true,"weapon":true,"options":[]}},{"menuName":"Railgun","spawnName":"WEAPON_RAILGUN","subOptions":{"ammo":true,"weapon":true,"options":[]}},{"menuName":"Homing Launcher","spawnName":"WEAPON_HOMINGLAUNCHER","subOptions":{"ammo":true,"weapon":true,"options":[]}}],"Thrown":[{"menuName":"Grenade","spawnName":"WEAPON_GRENADE","subOptions":{"ammo":true,"weapon":true,"options":[]}},{"menuName":"Sticky Bomb","spawnName":"WEAPON_STICKYBOMB","subOptions":{"ammo":true,"weapon":true,"options":[]}},{"menuName":"Proximity Mine","spawnName":"WEAPON_PROXMINE","subOptions":{"ammo":true,"weapon":true,"options":[]}},{"menuName":"Tear Gas","spawnName":"WEAPON_BZGAS","subOptions":{"ammo":true,"weapon":true,"options":[]}},{"menuName":"Smoke Grenade","spawnName":"WEAPON_SMOKEGRENADE","subOptions":{"ammo":true,"weapon":true,"options":[]}},{"menuName":"Molotov","spawnName":"WEAPON_MOLOTOV","subOptions":{"ammo":true,"weapon":true,"options":[]}},{"menuName":"Fire Extinguisher","spawnName":"WEAPON_FIREEXTINGUISHER","subOptions":{"ammo":true,"weapon":true,"options":[]}},{"menuName":"Jerry Can","spawnName":"WEAPON_PETROLCAN","subOptions":{"ammo":true,"weapon":true,"options":[]}},{"menuName":"Snowball","spawnName":"WEAPON_SNOWBALL","subOptions":{"ammo":true,"weapon":true,"options":[]}},{"menuName":"Flare","spawnName":"WEAPON_FLARE","subOptions":{"ammo":true,"weapon":true,"options":[]}},{"menuName":"Baseball","spawnName":"WEAPON_BALL","subOptions":{"ammo":true,"weapon":true,"options":[]}}]}


// Vehicle Paint Options.
var vehicleColors = {
    "primarymetallic":[{'menuName':"Black", 'spawnName':0},{'menuName':"Carbon Black", 'spawnName':147},{'menuName':"Hraphite", 'spawnName':1},{'menuName':"Anhracite Black", 'spawnName':11},{'menuName':"Black Steel", 'spawnName':2},{'menuName':"Dark Steel", 'spawnName':3},{'menuName':"Silver", 'spawnName':4},{'menuName':"Bluish Silver", 'spawnName':5},{'menuName':"Rolled Steel", 'spawnName':6},{'menuName':"Shadow Silver", 'spawnName':7},{'menuName':"Stone Silver", 'spawnName':8},{'menuName':"Midnight Silver", 'spawnName':9},{'menuName':"Cast Iron Silver", 'spawnName':10},{'menuName':"Red", 'spawnName':27},{'menuName':"Torino Red", 'spawnName':28},{'menuName':"Formula Red", 'spawnName':29},{'menuName':"Lava Red", 'spawnName':150},{'menuName':"Blaze Red", 'spawnName':30},{'menuName':"Grace Red", 'spawnName':31},{'menuName':"Garnet Red", 'spawnName':32},{'menuName':"Sunset Red", 'spawnName':33},{'menuName':"Cabernet Red", 'spawnName':34},{'menuName':"Wine Red", 'spawnName':143},{'menuName':"Candy Red", 'spawnName':35},{'menuName':"Hot Pink", 'spawnName':135},{'menuName':"Pfsiter Pink", 'spawnName':137},{'menuName':"Salmon Pink", 'spawnName':136},{'menuName':"Sunrise Orange", 'spawnName':36},{'menuName':"Orange", 'spawnName':38},{'menuName':"Bright Orange", 'spawnName':138},{'menuName':"Gold", 'spawnName':99},{'menuName':"Bronze", 'spawnName':90},{'menuName':"Yellow", 'spawnName':88},{'menuName':"Race Yellow", 'spawnName':89},{'menuName':"Dew Yellow", 'spawnName':91},{'menuName':"Dark Green", 'spawnName':49},{'menuName':"Racing Green", 'spawnName':50},{'menuName':"Sea Green", 'spawnName':51},{'menuName':"Olive Green", 'spawnName':52},{'menuName':"Bright Green", 'spawnName':53},{'menuName':"Gasoline Green", 'spawnName':54},{'menuName':"Lime Green", 'spawnName':92},{'menuName':"Midnight Blue", 'spawnName':141},{'menuName':"Galaxy Blue", 'spawnName':61},{'menuName':"Dark Blue", 'spawnName':62},{'menuName':"Saxon Blue", 'spawnName':63},{'menuName':"Blue", 'spawnName':64},{'menuName':"Mariner Blue", 'spawnName':65},{'menuName':"Harbor Blue", 'spawnName':66},{'menuName':"Diamond Blue", 'spawnName':67},{'menuName':"Surf Blue", 'spawnName':68},{'menuName':"Nautical Blue", 'spawnName':69},{'menuName':"Racing Blue", 'spawnName':73},{'menuName':"Ultra Blue", 'spawnName':70},{'menuName':"Light Blue", 'spawnName':74},{'menuName':"Chocolate Brown", 'spawnName':96},{'menuName':"Bison Brown", 'spawnName':101},{'menuName':"Creeen Brown", 'spawnName':95},{'menuName':"Feltzer Brown", 'spawnName':94},{'menuName':"Maple Brown", 'spawnName':97},{'menuName':"Beechwood Brown", 'spawnName':103},{'menuName':"Sienna Brown", 'spawnName':104},{'menuName':"Saddle Brown", 'spawnName':98},{'menuName':"Moss Brown", 'spawnName':100},{'menuName':"Woodbeech Brown", 'spawnName':102},{'menuName':"Straw Brown", 'spawnName':99},{'menuName':"Sandy Brown", 'spawnName':105},{'menuName':"Bleached Brown", 'spawnName':106},{'menuName':"Schafter Purple", 'spawnName':71},{'menuName':"Spinnaker Purple", 'spawnName':72},{'menuName':"Midnight Purple", 'spawnName':142},{'menuName':"Bright Purple", 'spawnName':145},{'menuName':"Cream", 'spawnName':107},{'menuName':"Ice White", 'spawnName':111},{'menuName':"Frost White", 'spawnName':112}],
    "secondarymetallic":[{'menuName':"Black", 'spawnName':0},{'menuName':"Carbon Black", 'spawnName':147},{'menuName':"Hraphite", 'spawnName':1},{'menuName':"Anhracite Black", 'spawnName':11},{'menuName':"Black Steel", 'spawnName':2},{'menuName':"Dark Steel", 'spawnName':3},{'menuName':"Silver", 'spawnName':4},{'menuName':"Bluish Silver", 'spawnName':5},{'menuName':"Rolled Steel", 'spawnName':6},{'menuName':"Shadow Silver", 'spawnName':7},{'menuName':"Stone Silver", 'spawnName':8},{'menuName':"Midnight Silver", 'spawnName':9},{'menuName':"Cast Iron Silver", 'spawnName':10},{'menuName':"Red", 'spawnName':27},{'menuName':"Torino Red", 'spawnName':28},{'menuName':"Formula Red", 'spawnName':29},{'menuName':"Lava Red", 'spawnName':150},{'menuName':"Blaze Red", 'spawnName':30},{'menuName':"Grace Red", 'spawnName':31},{'menuName':"Garnet Red", 'spawnName':32},{'menuName':"Sunset Red", 'spawnName':33},{'menuName':"Cabernet Red", 'spawnName':34},{'menuName':"Wine Red", 'spawnName':143},{'menuName':"Candy Red", 'spawnName':35},{'menuName':"Hot Pink", 'spawnName':135},{'menuName':"Pfsiter Pink", 'spawnName':137},{'menuName':"Salmon Pink", 'spawnName':136},{'menuName':"Sunrise Orange", 'spawnName':36},{'menuName':"Orange", 'spawnName':38},{'menuName':"Bright Orange", 'spawnName':138},{'menuName':"Gold", 'spawnName':99},{'menuName':"Bronze", 'spawnName':90},{'menuName':"Yellow", 'spawnName':88},{'menuName':"Race Yellow", 'spawnName':89},{'menuName':"Dew Yellow", 'spawnName':91},{'menuName':"Dark Green", 'spawnName':49},{'menuName':"Racing Green", 'spawnName':50},{'menuName':"Sea Green", 'spawnName':51},{'menuName':"Olive Green", 'spawnName':52},{'menuName':"Bright Green", 'spawnName':53},{'menuName':"Gasoline Green", 'spawnName':54},{'menuName':"Lime Green", 'spawnName':92},{'menuName':"Midnight Blue", 'spawnName':141},{'menuName':"Galaxy Blue", 'spawnName':61},{'menuName':"Dark Blue", 'spawnName':62},{'menuName':"Saxon Blue", 'spawnName':63},{'menuName':"Blue", 'spawnName':64},{'menuName':"Mariner Blue", 'spawnName':65},{'menuName':"Harbor Blue", 'spawnName':66},{'menuName':"Diamond Blue", 'spawnName':67},{'menuName':"Surf Blue", 'spawnName':68},{'menuName':"Nautical Blue", 'spawnName':69},{'menuName':"Racing Blue", 'spawnName':73},{'menuName':"Ultra Blue", 'spawnName':70},{'menuName':"Light Blue", 'spawnName':74},{'menuName':"Chocolate Brown", 'spawnName':96},{'menuName':"Bison Brown", 'spawnName':101},{'menuName':"Creeen Brown", 'spawnName':95},{'menuName':"Feltzer Brown", 'spawnName':94},{'menuName':"Maple Brown", 'spawnName':97},{'menuName':"Beechwood Brown", 'spawnName':103},{'menuName':"Sienna Brown", 'spawnName':104},{'menuName':"Saddle Brown", 'spawnName':98},{'menuName':"Moss Brown", 'spawnName':100},{'menuName':"Woodbeech Brown", 'spawnName':102},{'menuName':"Straw Brown", 'spawnName':99},{'menuName':"Sandy Brown", 'spawnName':105},{'menuName':"Bleached Brown", 'spawnName':106},{'menuName':"Schafter Purple", 'spawnName':71},{'menuName':"Spinnaker Purple", 'spawnName':72},{'menuName':"Midnight Purple", 'spawnName':142},{'menuName':"Bright Purple", 'spawnName':145},{'menuName':"Cream", 'spawnName':107},{'menuName':"Ice White", 'spawnName':111},{'menuName':"Frost White", 'spawnName':112}],
    "primarymatte":[{'menuName':"Black", 'spawnName':12},{'menuName':"Gray", 'spawnName':13},{'menuName':"Light Gray", 'spawnName':14},{'menuName':"Ice White", 'spawnName':131},{'menuName':"Blue", 'spawnName':83},{'menuName':"Dark Blue", 'spawnName':82},{'menuName':"Midnight Blue", 'spawnName':84},{'menuName':"Midnight Purple", 'spawnName':149},{'menuName':"Schafter Purple", 'spawnName':148},{'menuName':"Red", 'spawnName':39},{'menuName':"Dark Red", 'spawnName':40},{'menuName':"Orange", 'spawnName':41},{'menuName':"Yellow", 'spawnName':42},{'menuName':"Lime Green", 'spawnName':55},{'menuName':"Green", 'spawnName':128},{'menuName':"Frost Green", 'spawnName':151},{'menuName':"Foliage Green", 'spawnName':155},{'menuName':"Olive Darb", 'spawnName':152},{'menuName':"Dark Earth", 'spawnName':153},{'menuName':"Desert Tan", 'spawnName':154}],
    "secondarymatte":[{'menuName':"Black", 'spawnName':12},{'menuName':"Gray", 'spawnName':13},{'menuName':"Light Gray", 'spawnName':14},{'menuName':"Ice White", 'spawnName':131},{'menuName':"Blue", 'spawnName':83},{'menuName':"Dark Blue", 'spawnName':82},{'menuName':"Midnight Blue", 'spawnName':84},{'menuName':"Midnight Purple", 'spawnName':149},{'menuName':"Schafter Purple", 'spawnName':148},{'menuName':"Red", 'spawnName':39},{'menuName':"Dark Red", 'spawnName':40},{'menuName':"Orange", 'spawnName':41},{'menuName':"Yellow", 'spawnName':42},{'menuName':"Lime Green", 'spawnName':55},{'menuName':"Green", 'spawnName':128},{'menuName':"Frost Green", 'spawnName':151},{'menuName':"Foliage Green", 'spawnName':155},{'menuName':"Olive Darb", 'spawnName':152},{'menuName':"Dark Earth", 'spawnName':153},{'menuName':"Desert Tan", 'spawnName':154}],
    "primarymetal":[{'menuName':"Brushed Steel",'spawnName':117},{'menuName':"Brushed Black Steel",'spawnName':118},{'menuName':"Brushed Aluminum",'spawnName':119},{'menuName':"Pure Gold",'spawnName':158},{'menuName':"Brushed Gold",'spawnName':159}],
    "secondarymetal":[{'menuName':"Brushed Steel",'spawnName':117},{'menuName':"Brushed Black Steel",'spawnName':118},{'menuName':"Brushed Aluminum",'spawnName':119},{'menuName':"Pure Gold",'spawnName':158},{'menuName':"Brushed Gold",'spawnName':159}],
    "primaryclassic":[{'menuName':"Black", 'spawnName':0},{'menuName':"Carbon Black", 'spawnName':147},{'menuName':"Hraphite", 'spawnName':1},{'menuName':"Anhracite Black", 'spawnName':11},{'menuName':"Black Steel", 'spawnName':2},{'menuName':"Dark Steel", 'spawnName':3},{'menuName':"Silver", 'spawnName':4},{'menuName':"Bluish Silver", 'spawnName':5},{'menuName':"Rolled Steel", 'spawnName':6},{'menuName':"Shadow Silver", 'spawnName':7},{'menuName':"Stone Silver", 'spawnName':8},{'menuName':"Midnight Silver", 'spawnName':9},{'menuName':"Cast Iron Silver", 'spawnName':10},{'menuName':"Red", 'spawnName':27},{'menuName':"Torino Red", 'spawnName':28},{'menuName':"Formula Red", 'spawnName':29},{'menuName':"Lava Red", 'spawnName':150},{'menuName':"Blaze Red", 'spawnName':30},{'menuName':"Grace Red", 'spawnName':31},{'menuName':"Garnet Red", 'spawnName':32},{'menuName':"Sunset Red", 'spawnName':33},{'menuName':"Cabernet Red", 'spawnName':34},{'menuName':"Wine Red", 'spawnName':143},{'menuName':"Candy Red", 'spawnName':35},{'menuName':"Hot Pink", 'spawnName':135},{'menuName':"Pfsiter Pink", 'spawnName':137},{'menuName':"Salmon Pink", 'spawnName':136},{'menuName':"Sunrise Orange", 'spawnName':36},{'menuName':"Orange", 'spawnName':38},{'menuName':"Bright Orange", 'spawnName':138},{'menuName':"Gold", 'spawnName':99},{'menuName':"Bronze", 'spawnName':90},{'menuName':"Yellow", 'spawnName':88},{'menuName':"Race Yellow", 'spawnName':89},{'menuName':"Dew Yellow", 'spawnName':91},{'menuName':"Dark Green", 'spawnName':49},{'menuName':"Racing Green", 'spawnName':50},{'menuName':"Sea Green", 'spawnName':51},{'menuName':"Olive Green", 'spawnName':52},{'menuName':"Bright Green", 'spawnName':53},{'menuName':"Gasoline Green", 'spawnName':54},{'menuName':"Lime Green", 'spawnName':92},{'menuName':"Midnight Blue", 'spawnName':141},{'menuName':"Galaxy Blue", 'spawnName':61},{'menuName':"Dark Blue", 'spawnName':62},{'menuName':"Saxon Blue", 'spawnName':63},{'menuName':"Blue", 'spawnName':64},{'menuName':"Mariner Blue", 'spawnName':65},{'menuName':"Harbor Blue", 'spawnName':66},{'menuName':"Diamond Blue", 'spawnName':67},{'menuName':"Surf Blue", 'spawnName':68},{'menuName':"Nautical Blue", 'spawnName':69},{'menuName':"Racing Blue", 'spawnName':73},{'menuName':"Ultra Blue", 'spawnName':70},{'menuName':"Light Blue", 'spawnName':74},{'menuName':"Chocolate Brown", 'spawnName':96},{'menuName':"Bison Brown", 'spawnName':101},{'menuName':"Creeen Brown", 'spawnName':95},{'menuName':"Feltzer Brown", 'spawnName':94},{'menuName':"Maple Brown", 'spawnName':97},{'menuName':"Beechwood Brown", 'spawnName':103},{'menuName':"Sienna Brown", 'spawnName':104},{'menuName':"Saddle Brown", 'spawnName':98},{'menuName':"Moss Brown", 'spawnName':100},{'menuName':"Woodbeech Brown", 'spawnName':102},{'menuName':"Straw Brown", 'spawnName':99},{'menuName':"Sandy Brown", 'spawnName':105},{'menuName':"Bleached Brown", 'spawnName':106},{'menuName':"Schafter Purple", 'spawnName':71},{'menuName':"Spinnaker Purple", 'spawnName':72},{'menuName':"Midnight Purple", 'spawnName':142},{'menuName':"Bright Purple", 'spawnName':145},{'menuName':"Cream", 'spawnName':107},{'menuName':"Ice White", 'spawnName':111},{'menuName':"Frost White", 'spawnName':112}],
    "secondaryclassic":[{'menuName':"Black", 'spawnName':0},{'menuName':"Carbon Black", 'spawnName':147},{'menuName':"Hraphite", 'spawnName':1},{'menuName':"Anhracite Black", 'spawnName':11},{'menuName':"Black Steel", 'spawnName':2},{'menuName':"Dark Steel", 'spawnName':3},{'menuName':"Silver", 'spawnName':4},{'menuName':"Bluish Silver", 'spawnName':5},{'menuName':"Rolled Steel", 'spawnName':6},{'menuName':"Shadow Silver", 'spawnName':7},{'menuName':"Stone Silver", 'spawnName':8},{'menuName':"Midnight Silver", 'spawnName':9},{'menuName':"Cast Iron Silver", 'spawnName':10},{'menuName':"Red", 'spawnName':27},{'menuName':"Torino Red", 'spawnName':28},{'menuName':"Formula Red", 'spawnName':29},{'menuName':"Lava Red", 'spawnName':150},{'menuName':"Blaze Red", 'spawnName':30},{'menuName':"Grace Red", 'spawnName':31},{'menuName':"Garnet Red", 'spawnName':32},{'menuName':"Sunset Red", 'spawnName':33},{'menuName':"Cabernet Red", 'spawnName':34},{'menuName':"Wine Red", 'spawnName':143},{'menuName':"Candy Red", 'spawnName':35},{'menuName':"Hot Pink", 'spawnName':135},{'menuName':"Pfsiter Pink", 'spawnName':137},{'menuName':"Salmon Pink", 'spawnName':136},{'menuName':"Sunrise Orange", 'spawnName':36},{'menuName':"Orange", 'spawnName':38},{'menuName':"Bright Orange", 'spawnName':138},{'menuName':"Gold", 'spawnName':99},{'menuName':"Bronze", 'spawnName':90},{'menuName':"Yellow", 'spawnName':88},{'menuName':"Race Yellow", 'spawnName':89},{'menuName':"Dew Yellow", 'spawnName':91},{'menuName':"Dark Green", 'spawnName':49},{'menuName':"Racing Green", 'spawnName':50},{'menuName':"Sea Green", 'spawnName':51},{'menuName':"Olive Green", 'spawnName':52},{'menuName':"Bright Green", 'spawnName':53},{'menuName':"Gasoline Green", 'spawnName':54},{'menuName':"Lime Green", 'spawnName':92},{'menuName':"Midnight Blue", 'spawnName':141},{'menuName':"Galaxy Blue", 'spawnName':61},{'menuName':"Dark Blue", 'spawnName':62},{'menuName':"Saxon Blue", 'spawnName':63},{'menuName':"Blue", 'spawnName':64},{'menuName':"Mariner Blue", 'spawnName':65},{'menuName':"Harbor Blue", 'spawnName':66},{'menuName':"Diamond Blue", 'spawnName':67},{'menuName':"Surf Blue", 'spawnName':68},{'menuName':"Nautical Blue", 'spawnName':69},{'menuName':"Racing Blue", 'spawnName':73},{'menuName':"Ultra Blue", 'spawnName':70},{'menuName':"Light Blue", 'spawnName':74},{'menuName':"Chocolate Brown", 'spawnName':96},{'menuName':"Bison Brown", 'spawnName':101},{'menuName':"Creeen Brown", 'spawnName':95},{'menuName':"Feltzer Brown", 'spawnName':94},{'menuName':"Maple Brown", 'spawnName':97},{'menuName':"Beechwood Brown", 'spawnName':103},{'menuName':"Sienna Brown", 'spawnName':104},{'menuName':"Saddle Brown", 'spawnName':98},{'menuName':"Moss Brown", 'spawnName':100},{'menuName':"Woodbeech Brown", 'spawnName':102},{'menuName':"Straw Brown", 'spawnName':99},{'menuName':"Sandy Brown", 'spawnName':105},{'menuName':"Bleached Brown", 'spawnName':106},{'menuName':"Schafter Purple", 'spawnName':71},{'menuName':"Spinnaker Purple", 'spawnName':72},{'menuName':"Midnight Purple", 'spawnName':142},{'menuName':"Bright Purple", 'spawnName':145},{'menuName':"Cream", 'spawnName':107},{'menuName':"Ice White", 'spawnName':111},{'menuName':"Frost White", 'spawnName':112}],
    "primarychrome":[{'menuName':"Chrome", 'spawnName':120}],
    "secondarychrome":[{'menuName':"Chrome", 'spawnName':120}],
    "wheelcolors" : [{'menuName':"Black", 'spawnName':0},{'menuName':"Carbon Black", 'spawnName':147},{'menuName':"Hraphite", 'spawnName':1},{'menuName':"Anhracite Black", 'spawnName':11},{'menuName':"Black Steel", 'spawnName':2},{'menuName':"Dark Steel", 'spawnName':3},{'menuName':"Silver", 'spawnName':4},{'menuName':"Bluish Silver", 'spawnName':5},{'menuName':"Rolled Steel", 'spawnName':6},{'menuName':"Shadow Silver", 'spawnName':7},{'menuName':"Stone Silver", 'spawnName':8},{'menuName':"Midnight Silver", 'spawnName':9},{'menuName':"Cast Iron Silver", 'spawnName':10},{'menuName':"Red", 'spawnName':27},{'menuName':"Torino Red", 'spawnName':28},{'menuName':"Formula Red", 'spawnName':29},{'menuName':"Lava Red", 'spawnName':150},{'menuName':"Blaze Red", 'spawnName':30},{'menuName':"Grace Red", 'spawnName':31},{'menuName':"Garnet Red", 'spawnName':32},{'menuName':"Sunset Red", 'spawnName':33},{'menuName':"Cabernet Red", 'spawnName':34},{'menuName':"Wine Red", 'spawnName':143},{'menuName':"Candy Red", 'spawnName':35},{'menuName':"Hot Pink", 'spawnName':135},{'menuName':"Pfsiter Pink", 'spawnName':137},{'menuName':"Salmon Pink", 'spawnName':136},{'menuName':"Sunrise Orange", 'spawnName':36},{'menuName':"Orange", 'spawnName':38},{'menuName':"Bright Orange", 'spawnName':138},{'menuName':"Gold", 'spawnName':99},{'menuName':"Bronze", 'spawnName':90},{'menuName':"Yellow", 'spawnName':88},{'menuName':"Race Yellow", 'spawnName':89},{'menuName':"Dew Yellow", 'spawnName':91},{'menuName':"Dark Green", 'spawnName':49},{'menuName':"Racing Green", 'spawnName':50},{'menuName':"Sea Green", 'spawnName':51},{'menuName':"Olive Green", 'spawnName':52},{'menuName':"Bright Green", 'spawnName':53},{'menuName':"Gasoline Green", 'spawnName':54},{'menuName':"Lime Green", 'spawnName':92},{'menuName':"Midnight Blue", 'spawnName':141},{'menuName':"Galaxy Blue", 'spawnName':61},{'menuName':"Dark Blue", 'spawnName':62},{'menuName':"Saxon Blue", 'spawnName':63},{'menuName':"Blue", 'spawnName':64},{'menuName':"Mariner Blue", 'spawnName':65},{'menuName':"Harbor Blue", 'spawnName':66},{'menuName':"Diamond Blue", 'spawnName':67},{'menuName':"Surf Blue", 'spawnName':68},{'menuName':"Nautical Blue", 'spawnName':69},{'menuName':"Racing Blue", 'spawnName':73},{'menuName':"Ultra Blue", 'spawnName':70},{'menuName':"Light Blue", 'spawnName':74},{'menuName':"Chocolate Brown", 'spawnName':96},{'menuName':"Bison Brown", 'spawnName':101},{'menuName':"Creeen Brown", 'spawnName':95},{'menuName':"Feltzer Brown", 'spawnName':94},{'menuName':"Maple Brown", 'spawnName':97},{'menuName':"Beechwood Brown", 'spawnName':103},{'menuName':"Sienna Brown", 'spawnName':104},{'menuName':"Saddle Brown", 'spawnName':98},{'menuName':"Moss Brown", 'spawnName':100},{'menuName':"Woodbeech Brown", 'spawnName':102},{'menuName':"Straw Brown", 'spawnName':99},{'menuName':"Sandy Brown", 'spawnName':105},{'menuName':"Bleached Brown", 'spawnName':106},{'menuName':"Schafter Purple", 'spawnName':71},{'menuName':"Spinnaker Purple", 'spawnName':72},{'menuName':"Midnight Purple", 'spawnName':142},{'menuName':"Bright Purple", 'spawnName':145},{'menuName':"Cream", 'spawnName':107},{'menuName':"Ice White", 'spawnName':111},{'menuName':"Frost White", 'spawnName':112}]
}

// Vehicle RGB colors
var rgbcolors = {
    "smoke": [{"menuName":"Default", "spawnName": "18 17 16"},{"menuName":"Black", "spawnName": "8 8 8"},{"menuName":"Graphite", "spawnName": "15 15 15"},{"menuName":"Anthracite Black", "spawnName": "18 17 16"},{"menuName":"Black Steel", "spawnName": "28 30 33"},{"menuName":"Dark Silver", "spawnName": "41 44 46"},{"menuName":"Silver", "spawnName": "90 94 102"},{"menuName":"Blue Silver", "spawnName": "119 124 135"},{"menuName":"Rolled Steel", "spawnName": "81 84 89"},{"menuName":"Shadow Silver", "spawnName": "50 59 71"},{"menuName":"Stone Silver", "spawnName": "51 51 51"},{"menuName":"Midnight Silver", "spawnName": "31 34 38"},{"menuName":"Cast Iron Silver", "spawnName": "35 41 46"},{"menuName":"Red", "spawnName": "105 0 0"},{"menuName":"Torino Red", "spawnName": "138 11 0"},{"menuName":"Formula Red", "spawnName": "107 0 0"},{"menuName":"Lava Red", "spawnName": "107 11 0"},{"menuName":"Blaze Red", "spawnName": "97 16 9"},{"menuName":"Grace Red", "spawnName": "74 10 10"},{"menuName":"Garnet Red", "spawnName": "71 14 14"},{"menuName":"Sunset Red", "spawnName": "56 12 0"},{"menuName":"Cabernet Red", "spawnName": "38 3 11"},{"menuName":"Wine Red", "spawnName": "8 0 0"},{"menuName":"Candy Red", "spawnName": "99 0 18"},{"menuName":"Hot Pink", "spawnName": "176 18 89"},{"menuName":"Pink", "spawnName": "143 47 85"},{"menuName":"Salmon Pink", "spawnName": "246 151 153"},{"menuName":"Sunrise Orange", "spawnName": "128 40 0"},{"menuName":"Bright Orange", "spawnName": "194 102 16"},{"menuName":"Gold", "spawnName": "94 83 67"},{"menuName":"Bronze", "spawnName": "74 52 27"},{"menuName":"Yellow", "spawnName": "245 137 15"},{"menuName":"Flur Yellow", "spawnName": "162 168 39"},{"menuName":"Dark Green", "spawnName": "0 18 7"},{"menuName":"Sea Green", "spawnName": "0 33 30"},{"menuName":"Olive Green", "spawnName": "31 38 30"},{"menuName":"Bright Green", "spawnName": "0 56 5"},{"menuName":"Petrol Green", "spawnName": "11 65 69"},{"menuName":"Lime Green", "spawnName": "86 143 0"},{"menuName":"Midnight Blue", "spawnName": "0 1 8"},{"menuName":"Galaxy Blue", "spawnName": "0 13 20"},{"menuName":"Dark Blue", "spawnName": "0 16 41"},{"menuName":"Saxon Blue", "spawnName": "28 47 79"},{"menuName":"Blue", "spawnName": "0 27 87"},{"menuName":"Mariner Blue", "spawnName": "59 78 120"},{"menuName":"Harbor Blue", "spawnName": "39 45 59"},{"menuName":"Diamond Blue", "spawnName": "149 178 219"},{"menuName":"Surf Blue", "spawnName": "62 98 122"},{"menuName":"Nautical Blue", "spawnName": "28 49 64"},{"menuName":"Racing Blue", "spawnName": "14 49 109"},{"menuName":"Light Blue", "spawnName": "57 90 131"},{"menuName":"Bison Brown", "spawnName": "34 25 24"},{"menuName":"Creek Brown", "spawnName": "38 33 23"},{"menuName":"Umber Brown", "spawnName": "41 27 6"},{"menuName":"Maple Brown", "spawnName": "51 33 17"},{"menuName":"Beechwood Brown", "spawnName": "36 19 9"},{"menuName":"Sienna Brown", "spawnName": "59 23 0"},{"menuName":"Saddle Brown", "spawnName": "61 48 35"},{"menuName":"Moss Brown", "spawnName": "55 56 43"},{"menuName":"Woodbeech Brown", "spawnName": "87 80 54"},{"menuName":"Straw Brown", "spawnName": "94 83 67"},{"menuName":"Sandy Brown", "spawnName": "110 98 70"},{"menuName":"Bleeched Brown", "spawnName": "153 141 115"},{"menuName":"Purple", "spawnName": "26 24 46"},{"menuName":"Spin Purple", "spawnName": "22 22 41"},{"menuName":"Might Purple", "spawnName": "5 0 8"},{"menuName":"Bright Purple", "spawnName": "50 6 66"},{"menuName":"Cream", "spawnName": "207 192 165"},{"menuName":"Frost White", "spawnName": "179 185 201"}],
    "neon" : [{"menuName":"White", "spawnName": "222 222 255"},{"menuName":"Cream", "spawnName": "207 192 165"},{"menuName":"Red", "spawnName": "255 1 1"},{"menuName":"Lava Red", "spawnName": "105 0 0"},{"menuName":"Grace Red", "spawnName": "74 10 10"},{"menuName":"Garnet Red", "spawnName": "71 14 14"},{"menuName":"Wine Red", "spawnName": "8 0 0"},{"menuName":"Pony Pink", "spawnName": "255 50 100"},{"menuName":"Fluorescent Pink", "spawnName": "255 5 190"},{"menuName":"Light Pink", "spawnName": "38 3 11"},{"menuName":"Hot Pink", "spawnName": "99 0 18"},{"menuName":"Pink", "spawnName": "176 18 89"},{"menuName":"Salmon Pink", "spawnName": "143 47 85"},{"menuName":"Orange", "spawnName": "138 11 0"},{"menuName":"Light Orange", "spawnName": "107 11 0"},{"menuName":"Gold", "spawnName": "255 62 0"},{"menuName":"Light Gold", "spawnName": "194 102 16"},{"menuName":"Golden Shower", "spawnName": "255 150 5"},{"menuName":"Bronze", "spawnName": "74 52 27"},{"menuName":"Yellow", "spawnName": "245 137 15"},{"menuName":"Flur Yellow", "spawnName": "162 168 39"},{"menuName":"Flurorescent Yellow", "spawnName": "255 255 0"},{"menuName":"Mint Green", "spawnName": "0 255 140"},{"menuName":"Fluorescent Green", "spawnName": "94 255 1"},{"menuName":"Dark Green", "spawnName": "0 18 7"},{"menuName":"Sea Green", "spawnName": "0 33 30"},{"menuName":"Bright Green", "spawnName": "0 56 5"},{"menuName":"Petrol Green", "spawnName": "11 65 69"},{"menuName":"Electric Blue", "spawnName": "3 83 255"},{"menuName":"Midnight Blue", "spawnName": "0 1 8"},{"menuName":"Galaxy Blue", "spawnName": "0 13 20"},{"menuName":"Dark Blue", "spawnName": "0 16 41"},{"menuName":"Blue", "spawnName": "0 27 87"},{"menuName":"Racing Blue", "spawnName": "14 49 109"},{"menuName":"Purple", "spawnName": "35 1 255"},{"menuName":"Spin Purple", "spawnName": "26 24 46"},{"menuName":"Might Purple", "spawnName": "5 0 8"},{"menuName":"Bright Purple", "spawnName": "50 6 66"},{"menuName":"Blacklight", "spawnName": "15 3 255"}]
};



// Static Request Objects
var requestObjects = {
    "player_skins_characters" : playerList,
    "player_skins_animals" : AnimalList,
    "player_skins_npcs" : NPCList,
    "vehicle_cars_supercars" : vehicle_supercars,
    "vehicle_cars_sports" : vehicle_sports,
    "vehicle_cars_sportsclassics" : vehicle_sportsclassics,
    "vehicle_cars_muscle" : vehicle_muscle,
    "vehicle_cars_lowriders" : vehicle_lowriders,
    "vehicle_cars_coupes" : vehicle_coupes,
    "vehicle_cars_sedans" : vehicle_sedans,
    "vehicle_cars_compacts" : vehicle_compacts,
    "vehicle_cars_suvs" : vehicle_suvs,
    "vehicle_cars_offroad" : vehicle_offroad,
    "vehicle_cars_vip" : vehicle_vip,
    "vehicle_industrial_pickups" : vehicle_pickups,
    "vehicle_industrial_vans" : vehicle_vans,
    "vehicle_industrial_trucks" : vehicle_trucks,
    "vehicle_industrial_service" : vehicle_service,
    "vehicle_industrial_trailers" : vehicle_trailers,
    "vehicle_industrial_trains" : vehicle_trains,
    "vehicle_emergency" : vehicle_emergency,
    "vehicle_motorcycles" : vehicle_motorcycles,
    "vehicle_planes" : vehicle_planes,
    "vehicle_helicopters" : vehicle_helicopters,
    "vehicle_boats" : vehicle_boats,
    "vehicle_bicycles" : vehicle_bicycles,

    "weapon_melee" : weaponDB['Melee'],
    "weapon_handguns" : weaponDB['Handguns'],
    "weapon_submachine" : weaponDB['Submachine'],
    "weapon_assault" : weaponDB['Assault'],
    "weapon_shotgun" : weaponDB['Shotguns'],
    "weapon_snipers" : weaponDB['Snipers'],
    "weapon_heavy" : weaponDB['Heavy'],
    "weapon_thrown" : weaponDB['Thrown'],


    "vehicle_mod_paint_primary_normal": vehicleColors["primaryclassic"],
    "vehicle_mod_paint_secondary_normal": vehicleColors["secondaryclassic"],
    "vehicle_mod_paint_both_normal": vehicleColors["secondaryclassic"],
    "vehicle_mod_paint_primary_metal": vehicleColors["primarymetal"],
    "vehicle_mod_paint_secondary_metal": vehicleColors["secondarymetal"],
    "vehicle_mod_paint_both_metal": vehicleColors["secondarymetal"],
    "vehicle_mod_paint_primary_matte": vehicleColors["primarymatte"],
    "vehicle_mod_paint_secondary_matte": vehicleColors["secondarymatte"],
    "vehicle_mod_paint_both_matte": vehicleColors["secondarymatte"],
    "vehicle_mod_paint_primary_metallic": vehicleColors["primarymetallic"],
    "vehicle_mod_paint_secondary_metallic": vehicleColors["secondarymetallic"],
    "vehicle_mod_paint_both_metallic": vehicleColors["secondarymetallic"],
    "vehicle_mod_paint_primary_chrome": vehicleColors["primarychrome"],
    "vehicle_mod_paint_secondary_chrome": vehicleColors["secondarychrome"],
    "vehicle_mod_paint_both_chrome": vehicleColors["secondarychrome"],

    "vehicle_mod_paint_pearl_topcoat": vehicleColors["primaryclassic"],
    "vehicle_mod_paint_wheels": vehicleColors["wheelcolors"],

    "vehicle_mod_neon_colors": rgbcolors["neon"],
    "vehicle_mod_smoke_colors": rgbcolors["smoke"]
}



// Static Request Actions
var requestAction = {
    "player_skins_characters" : "playerskin",
    "player_skins_animals" :  "playerskin",
    "player_skins_npcs" :  "playerskin",
    "vehicle_cars_supercars" : "vehspawn",
    "vehicle_cars_sports" :  "vehspawn",
    "vehicle_cars_sportsclassics" :  "vehspawn",
    "vehicle_cars_muscle" :  "vehspawn",
    "vehicle_cars_lowriders" :  "vehspawn",
    "vehicle_cars_coupes" :  "vehspawn",
    "vehicle_cars_sedans" :  "vehspawn",
    "vehicle_cars_compacts" :  "vehspawn",
    "vehicle_cars_suvs" :  "vehspawn",
    "vehicle_cars_offroad" :  "vehspawn",
    "vehicle_cars_vip" :  "vehspawn",
    "vehicle_industrial_pickups" :  "vehspawn",
    "vehicle_industrial_vans" :  "vehspawn",
    "vehicle_industrial_trucks" :  "vehspawn",
    "vehicle_industrial_service" :  "vehspawn",
    "vehicle_industrial_trailers" :  "vehspawn",
    "vehicle_industrial_trains" :  "vehspawn",
    "vehicle_emergency" :  "vehspawn",
    "vehicle_motorcycles" :  "vehspawn",
    "vehicle_planes" :  "vehspawn",
    "vehicle_helicopters" :  "vehspawn",
    "vehicle_boats" :  "vehspawn",
    "vehicle_bicycles" :  "vehspawn",
    "weapon_melee" : "weapon",
    "weapon_handguns" : "weapon",
    "weapon_submachine" : "weapon",
    "weapon_assault" : "weapon",
    "weapon_shotgun" : "weapon",
    "weapon_snipers" : "weapon",
    "weapon_heavy" : "weapon",
    "weapon_thrown" : "weapon",


    "vehicle_mod_paint_primary_normal": "vehmod paint",
    "vehicle_mod_paint_secondary_normal": "vehmod paint2",
    "vehicle_mod_paint_both_normal": "vehmod paint3",
    "vehicle_mod_paint_primary_metal": "vehmod paint",
    "vehicle_mod_paint_secondary_metal": "vehmod paint2",
    "vehicle_mod_paint_both_metal": "vehmod paint3",
    "vehicle_mod_paint_primary_matte": "vehmod paint",
    "vehicle_mod_paint_secondary_matte": "vehmod paint2",
    "vehicle_mod_paint_both_matte": "vehmod paint3",
    "vehicle_mod_paint_primary_metallic": "vehmod paint",
    "vehicle_mod_paint_secondary_metallic": "vehmod paint2",
    "vehicle_mod_paint_both_metallic": "vehmod paint3",
    "vehicle_mod_paint_primary_chrome": "vehmod paint",
    "vehicle_mod_paint_secondary_chrome": "vehmod paint2",
    "vehicle_mod_paint_both_chrome": "vehmod paint3",
    "vehicle_mod_paint_pearl_topcoat": "vehmod paintpearl",
    "vehicle_mod_paint_wheels": "vehmod paintwheels",

    "vehicle_mod_neon_colors" : "vehmod lightcolor",
    "vehicle_mod_smoke_colors" : "vehmod smokecolor"

}





// Vehicle Modification Objects.
var vehicle_mods = {
    "vehiclehorns" : [{'name':"Stock Horn",'modtype':14, 'mod':-1},{'name':"Truck Horn",'modtype':14, 'mod':0},{'name':"Police Horn",'modtype':14, 'mod':1},{'name':"Clown Horn",'modtype':14, 'mod':2},{'name':"Musical Horn 1",'modtype':14, 'mod':3},{'name':"Musical Horn 2",'modtype':14, 'mod':4},{'name':"Musical Horn 3",'modtype':14, 'mod':5},{'name':"Musical Horn 4",'modtype':14, 'mod':6},{'name':"Musical Horn 5",'modtype':14, 'mod':7},{'name':"Sadtrombone Horn",'modtype':14, 'mod':8},{'name':"Calssical Horn 1",'modtype':14, 'mod':9},{'name':"Calssical Horn 2",'modtype':14, 'mod':10},{'name':"Calssical Horn 3",'modtype':14, 'mod':11},{'name':"Calssical Horn 4",'modtype':14, 'mod':12},{'name':"Calssical Horn 5",'modtype':14, 'mod':13},{'name':"Calssical Horn 6",'modtype':14, 'mod':14},{'name':"Calssical Horn 7",'modtype':14, 'mod':15},{'name':"Scaledo Horn",'modtype':14, 'mod':16},{'name':"Scalere Horn",'modtype':14, 'mod':17},{'name':"Scalemi Horn",'modtype':14, 'mod':18},{'name':"Scalefa Horn",'modtype':14, 'mod':19},{'name':"Scalesol Horn",'modtype':14, 'mod':20},{'name':"Scalela Horn",'modtype':14, 'mod':21},{'name':"Scaleti Horn",'modtype':14, 'mod':22},{'name':"Scaledo Horn High",'modtype':14, 'mod':23},{'name':"Jazz Horn 1",'modtype':14, 'mod':25},{'name':"Jazz Horn 2",'modtype':14, 'mod':26},{'name':"Jazz Horn 3",'modtype':14, 'mod':27},{'name':"Jazzloop Horn",'modtype':14, 'mod':28},{'name':"Starspangban Horn 1",'modtype':14, 'mod':29},{'name':"Starspangban Horn 2",'modtype':14, 'mod':30},{'name':"Starspangban Horn 3",'modtype':14, 'mod':31},{'name':"Starspangban Horn 4",'modtype':14, 'mod':32},{'name':"Classicalloop Horn 1",'modtype':14, 'mod':33},{'name':"Classical Horn 8",'modtype':14, 'mod':34},{'name':"Classicalloop Horn 2",'modtype':14, 'mod':35}],
    "wheel_sport": [{'name' : "Stock", 'modtype' : 23, 'mod' : -1},{'name' : "Inferno", 'modtype' : 23, 'mod' : 0},{'name' : "Deepfive", 'modtype' : 23, 'mod' : 1},{'name' : "Lozspeed", 'modtype' : 23, 'mod' : 2},{'name' : "Diamondcut", 'modtype' : 23, 'mod' : 3},{'name' : "Chrono", 'modtype' : 23, 'mod' : 4},{'name' : "Feroccirr", 'modtype' : 23, 'mod' : 5},{'name' : "Fiftynine", 'modtype' : 23, 'mod' : 6},{'name' : "Mercie", 'modtype' : 23, 'mod' : 7},{'name' : "Syntheticz", 'modtype' : 23, 'mod' : 8},{'name' : "Organictyped", 'modtype' : 23, 'mod' : 9},{'name' : "Endov1", 'modtype' : 23, 'mod' : 10},{'name' : "Duper7", 'modtype' : 23, 'mod' : 11},{'name' : "Uzer", 'modtype' : 23, 'mod' : 12},{'name' : "Groundride", 'modtype' : 23, 'mod' : 13},{'name' : "Spacer", 'modtype' : 23, 'mod' : 14},{'name' : "Venum", 'modtype' : 23, 'mod' : 15},{'name' : "Cosmo", 'modtype' : 23, 'mod' : 16},{'name' : "Dashvip", 'modtype' : 23, 'mod' : 17},{'name' : "Icekid", 'modtype' : 23, 'mod' : 18},{'name' : "Ruffeld", 'modtype' : 23, 'mod' : 19},{'name' : "Wangenmaster", 'modtype' : 23, 'mod' : 20},{'name' : "Superfive", 'modtype' : 23, 'mod' : 21},{'name' : "Endov2", 'modtype' : 23, 'mod' : 22},{'name' : "Slitsix", 'modtype' : 23, 'mod' : 23}],
    "wheel_suv": [{'name' : "Stock", 'modtype' : 23, 'mod' : -1},{'name' : "Vip", 'modtype' : 23, 'mod' : 0},{'name' : "Benefactor", 'modtype' : 23, 'mod' : 1},{'name' : "Cosmo", 'modtype' : 23, 'mod' : 2},{'name' : "Bippu", 'modtype' : 23, 'mod' : 3},{'name' : "Royalsix", 'modtype' : 23, 'mod' : 4},{'name' : "Fagorme", 'modtype' : 23, 'mod' : 5},{'name' : "Deluxe", 'modtype' : 23, 'mod' : 6},{'name' : "Icedout", 'modtype' : 23, 'mod' : 7},{'name' : "Cognscenti", 'modtype' : 23, 'mod' : 8},{'name' : "Lozspeedten", 'modtype' : 23, 'mod' : 9},{'name' : "Supernova", 'modtype' : 23, 'mod' : 10},{'name' : "Obeyrs", 'modtype' : 23, 'mod' : 11},{'name' : "Lozspeedballer", 'modtype' : 23, 'mod' : 12},{'name' : "Extra vaganzo", 'modtype' : 23, 'mod' : 13},{'name' : "Splitsix", 'modtype' : 23, 'mod' : 14},{'name' : "Empowered", 'modtype' : 23, 'mod' : 15},{'name' : "Sunrise", 'modtype' : 23, 'mod' : 16},{'name' : "Dashvip", 'modtype' : 23, 'mod' : 17},{'name' : "Cutter", 'modtype' : 23, 'mod' : 18}],
    "wheel_offroad": [{'name' : "Stock", 'modtype' : 23, 'mod' : -1},{'name' : "Raider", 'modtype' : 23, 'mod' : 0},{'name' : "Mudslinger", 'modtype' : 23, 'mod' : 1},{'name' : "Nevis", 'modtype' : 23, 'mod' : 2},{'name' : "Cairngorm", 'modtype' : 23, 'mod' : 3},{'name' : "Amazon", 'modtype' : 23, 'mod' : 4},{'name' : "Challenger", 'modtype' : 23, 'mod' : 5},{'name' : "Dunebasher", 'modtype' : 23, 'mod' : 6},{'name' : "Fivestar", 'modtype' : 23, 'mod' : 7},{'name' : "Rockcrawler", 'modtype' : 23, 'mod' : 8},{'name' : "Milspecsteelie", 'modtype' : 23, 'mod' : 9}],
    "wheel_tuner": [{'name' : "Stock", 'modtype' : 23, 'mod' : -1},{'name' : "Cosmo", 'modtype' : 23, 'mod' : 0},{'name' : "Supermesh", 'modtype' : 23, 'mod' : 1},{'name' : "Outsider", 'modtype' : 23, 'mod' : 2},{'name' : "Rollas", 'modtype' : 23, 'mod' : 3},{'name' : "Driffmeister", 'modtype' : 23, 'mod' : 4},{'name' : "Slicer", 'modtype' : 23, 'mod' : 5},{'name' : "Elquatro", 'modtype' : 23, 'mod' : 6},{'name' : "Dubbed", 'modtype' : 23, 'mod' : 7},{'name' : "Fivestar", 'modtype' : 23, 'mod' : 8},{'name' : "Slideways", 'modtype' : 23, 'mod' : 9},{'name' : "Apex", 'modtype' : 23, 'mod' : 10},{'name' : "Stancedeg", 'modtype' : 23, 'mod' : 11},{'name' : "Countersteer", 'modtype' : 23, 'mod' : 12},{'name' : "Endov1", 'modtype' : 23, 'mod' : 13},{'name' : "Endov2dish", 'modtype' : 23, 'mod' : 14},{'name' : "Guppez", 'modtype' : 23, 'mod' : 15},{'name' : "Chokadori", 'modtype' : 23, 'mod' : 16},{'name' : "Chicane", 'modtype' : 23, 'mod' : 17},{'name' : "Saisoku", 'modtype' : 23, 'mod' : 18},{'name' : "Dishedeight", 'modtype' : 23, 'mod' : 19},{'name' : "Fujiwara", 'modtype' : 23, 'mod' : 20},{'name' : "Zokusha", 'modtype' : 23, 'mod' : 21},{'name' : "Battlevill", 'modtype' : 23, 'mod' : 22},{'name' : "Rallymaster", 'modtype' : 23, 'mod' : 23}],
    "wheel_highend": [{'name' : "Stock", 'modtype' : 23, 'mod' : -1},{'name' : "Shadow", 'modtype' : 23, 'mod' : 0},{'name' : "Hyper", 'modtype' : 23, 'mod' : 1},{'name' : "Blade", 'modtype' : 23, 'mod' : 2},{'name' : "Diamond", 'modtype' : 23, 'mod' : 3},{'name' : "Supagee", 'modtype' : 23, 'mod' : 4},{'name' : "Chromaticz", 'modtype' : 23, 'mod' : 5},{'name' : "Merciechlip", 'modtype' : 23, 'mod' : 6},{'name' : "Obeyrs", 'modtype' : 23, 'mod' : 7},{'name' : "Gtchrome", 'modtype' : 23, 'mod' : 8},{'name' : "Cheetahr", 'modtype' : 23, 'mod' : 9},{'name' : "Solar", 'modtype' : 23, 'mod' : 10},{'name' : "Splitten", 'modtype' : 23, 'mod' : 11},{'name' : "Dashvip", 'modtype' : 23, 'mod' : 12},{'name' : "Lozspeedten", 'modtype' : 23, 'mod' : 13},{'name' : "Carboninferno", 'modtype' : 23, 'mod' : 14},{'name' : "Carbonshadow", 'modtype' : 23, 'mod' : 15},{'name' : "Carbonz", 'modtype' : 23, 'mod' : 16},{'name' : "Carbonsolar", 'modtype' : 23, 'mod' : 17},{'name' : "Carboncheetahr", 'modtype' : 23, 'mod' : 18},{'name' : "Carbonsracer", 'modtype' : 23, 'mod' : 19}],
    "wheel_lowrider": [{'name' : "Stock", 'modtype' : 23, 'mod' : -1},{'name' : "Flare", 'modtype' : 23, 'mod' : 0},{'name' : "Wired", 'modtype' : 23, 'mod' : 1},{'name' : "Triplegolds", 'modtype' : 23, 'mod' : 2},{'name' : "Bigworm", 'modtype' : 23, 'mod' : 3},{'name' : "Sevenfives", 'modtype' : 23, 'mod' : 4},{'name' : "Splitsix", 'modtype' : 23, 'mod' : 5},{'name' : "Freshmesh", 'modtype' : 23, 'mod' : 6},{'name' : "Leadsled", 'modtype' : 23, 'mod' : 7},{'name' : "Turbine", 'modtype' : 23, 'mod' : 8},{'name' : "Superfin", 'modtype' : 23, 'mod' : 9},{'name' : "Classicrod", 'modtype' : 23, 'mod' : 10},{'name' : "Dollar", 'modtype' : 23, 'mod' : 11},{'name' : "Dukes", 'modtype' : 23, 'mod' : 12},{'name' : "Lowfive", 'modtype' : 23, 'mod' : 13},{'name' : "Gooch", 'modtype' : 23, 'mod' : 14}],
    "wheel_muscle": [{'name' : "Stock", 'modtype' : 23, 'mod' : -1},{'name' : "Classicfive", 'modtype' : 23, 'mod' : 0},{'name' : "Dukes", 'modtype' : 23, 'mod' : 1},{'name' : "Musclefreak", 'modtype' : 23, 'mod' : 2},{'name' : "Kracka", 'modtype' : 23, 'mod' : 3},{'name' : "Azrea", 'modtype' : 23, 'mod' : 4},{'name' : "Mecha", 'modtype' : 23, 'mod' : 5},{'name' : "Blacktop", 'modtype' : 23, 'mod' : 6},{'name' : "Dragspl", 'modtype' : 23, 'mod' : 7},{'name' : "Revolver", 'modtype' : 23, 'mod' : 8},{'name' : "Classicrod", 'modtype' : 23, 'mod' : 9},{'name' : "Spooner", 'modtype' : 23, 'mod' : 10},{'name' : "Fivestar", 'modtype' : 23, 'mod' : 11},{'name' : "Oldschool", 'modtype' : 23, 'mod' : 12},{'name' : "Eljefe", 'modtype' : 23, 'mod' : 13},{'name' : "Dodman", 'modtype' : 23, 'mod' : 14},{'name' : "Sixgun", 'modtype' : 23, 'mod' : 15},{'name' : "Mercenary", 'modtype' : 23, 'mod' : 16}],
    "wheel_front": [{'name' : "Stock", 'modtype' : 23, 'mod' : -1},{'name' : "Speedway", 'modtype' : 23, 'mod' : 0},{'name' : "Streetspecial", 'modtype' : 23, 'mod' : 1},{'name' : "Racer", 'modtype' : 23, 'mod' : 2},{'name' : "Trackstar", 'modtype' : 23, 'mod' : 3},{'name' : "Overlord", 'modtype' : 23, 'mod' : 4},{'name' : "Trident", 'modtype' : 23, 'mod' : 5},{'name' : "Triplethreat", 'modtype' : 23, 'mod' : 6},{'name' : "Stilleto", 'modtype' : 23, 'mod' : 7},{'name' : "Wires", 'modtype' : 23, 'mod' : 8},{'name' : "Bobber", 'modtype' : 23, 'mod' : 9},{'name' : "Solidus", 'modtype' : 23, 'mod' : 10},{'name' : "Iceshield", 'modtype' : 23, 'mod' : 11},{'name' : "Loops", 'modtype' : 23, 'mod' : 12}],
    "wheel_back": [{'name' : "Stock", 'modtype' : 24, 'mod' : -1},{'name' : "Speedway", 'modtype' : 24, 'mod' : 0},{'name' : "Streetspecial", 'modtype' : 24, 'mod' : 1},{'name' : "Racer", 'modtype' : 24, 'mod' : 2},{'name' : "Trackstar", 'modtype' : 24, 'mod' : 3},{'name' : "Overlord", 'modtype' : 24, 'mod' : 4},{'name' : "Trident", 'modtype' : 24, 'mod' : 5},{'name' : "Triplethreat", 'modtype' : 24, 'mod' : 6},{'name' : "Stilleto", 'modtype' : 24, 'mod' : 7},{'name' : "Wires", 'modtype' : 24, 'mod' : 8},{'name' : "Bobber", 'modtype' : 24, 'mod' : 9},{'name' : "Solidus", 'modtype' : 24, 'mod' : 10},{'name' : "Iceshield", 'modtype' : 24, 'mod' : 11},{'name' : "Loops", 'modtype' : 24, 'mod' : 12}],
    "wheel_benny": [{'name': "Stock",'modtype': 24, 'mod': -1},{'name': "OG Hunnets",'modtype': 24, 'mod': 0},{'name': "OG Hunnets (Chrome Lip)",'modtype': 24, 'mod': 1}]
}


// Modifications that use name,modtype,mod instead of menuName and spawnName.
var modObjects = {
    "vehicle_mod_horn" : vehicle_mods['vehiclehorns'],
    "vehicle_wheel_0": vehicle_mods['wheel_sport'],
    "vehicle_wheel_1": vehicle_mods['wheel_muscle'],
    "vehicle_wheel_2": vehicle_mods['wheel_lowrider'],
    "vehicle_wheel_3": vehicle_mods['wheel_suv'],
    "vehicle_wheel_4": vehicle_mods['wheel_offroad'],
    "vehicle_wheel_5": vehicle_mods['wheel_tuner'],
    "vehicle_wheel_7": vehicle_mods['wheel_highend'],
    "vehicle_wheel_8": vehicle_mods['wheel_benny'],
    "vehicle_wheel_front": vehicle_mods['wheel_front'],
    "vehicle_wheel_back": vehicle_mods['wheel_back']
}