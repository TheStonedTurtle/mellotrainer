# MelloTrainer
A FiveM(GTA5 Modded Multiplayer) Trainer Made by <a href="https://github.com/TheStonedTurtle">TheStonedTurtle</a>. This is a server-side trainer written in Lua with a NUI written with HTML,CSS, and JS.<br/>
<br/>



<h1>Installation</h1>
<ol>
<li>Drag and drop the <i>mellotrainer</i> folder into the resources folder of your server.</li>
<li>Add <i>- mellotrainer</i> to your citmp-server.yml file under <i>AutoStartResources</i>.</li>
<li>Restart your Server</li>
</ol>

<h1>Controls</h1>
<table>
<tbody>
<tr><th>Key</th><th>Action</th></tr>
<tr><td>F6</td><td>Open/Close the trainer</td></tr>
<tr><td>Arrow Keys</td><td>Move up,down,left, and right respectively.</td></tr>
<tr><td>Enter</td><td>Select the current trainer option</td></tr>
<tr><td>Backspace</td><td>Go back to the previous menu</td></tr>
</tbody>
</table>


<h1>Features</h1>
<ul>
	<li>Online Players Menu with Spectate and Teleport Option</li>
	<li>Player Skin Changing and customization</li>
	<li>Player Toggle Options (God Mode, ETC)</li>
	<li>Vehicle Spawning & Spawning Options</li>
	<li>Vehicle Customization and Modifications</li>
	<li>Weapon Spawning</li>
	<li>Weapon Attachments/Infinite ammo</li>
	<li>General Settings (Hide/Enlarge Map, Player Blips)</li>
	<li>Toggle-able Map Blips</li>
	<li>Admin Menu w/ Working Permissions</li>
</ul>


<h1>Credits:</h1>
<ul>
<li><a href="https://github.com/pongo1231/ScorpionTrainer">Scorpion Trainer</a> for a lot of the basic NUI functionality & structure.</li>
<li><a href="https://github.com/citizenfx/project-lambdamenu">Lambda Menu</a> which I used to convert useful functionality from C++ to Lua.</li>
<li><a href="https://forum.fivem.net/t/release-simple-speedometer/7846">Simple Speedometer</a> for the speedometer used by the trainer. (Black Outline)</li>
</ul>


<h1>Development Information:</h1>
This section is only intended for people with LUA experience and a basic understanding of JSON/HTML Attributes. The below information should be used to help understand what every attribute does and how to add new dynamic menus and option using them.

<h2>Trainer Option Attributes:</h2>

<table>
<tbody>
<tr><th>Attribute</th><th>Explanation</th></tr>
<tr><td>data-action</td><td>The action to callback to lua via a NUICallback. Space delimited values with the first value being the name of the NUICallback.</td></tr>
<tr><td>data-hover</td><td>Exact same as data-action but this triggers when they change to the option instead of selecting the option.</td></tr>
<tr><td>data-state</td><td>Holds a "ON"/"OFF" value for toggle options.</td></tr>
<tr><td>data-toggle</td><td>Global boolean lua variable to sync data-state with.</td></tr>
<tr><td>data-sub</td><td>ID of the new menu to show when selected.</td></tr>
<tr><td>data-share</td><td>Information to share with the sub menu action options.(won't do anything unless data-sub is also specified)</td></tr>
<tr><td>data-shareid</td><td>Updates the submenu ID to this if it exists. Useful for ensuring that a menu that is used my multiple different options will return to the correct place within the trainer.</td></tr>
</tbody>
</table>


<h2>Trainer Div Attributes:</h2>
<table>
<tbody>
<tr><th>Attribute</th><th>Explanation</th></tr>
<tr><td>data-container</td><td>Prevents this div from being turned into a menu by JS.</td></tr>
<tr><td>data-parent</td><td>The ID of the parent element so if they try to go back</td></tr>
<tr><td>data-staticmenu</td><td>A menu that will be created from static JSON by JS. This will require updating JS so it is recommended you use data-dynamicmenu instead.</td></tr>
<tr><td>data-dynamicmenu</td><td>Holds the name of the NUI Callback that will return a JSON object to populate the current menu with (includes sub menus). See JSON format below.</td></tr>
<tr><td>data-sharedinfo</td><td>Usually added by JS from the data-share attribute of the option. This information will be appended to the end of every data-action and data-hover when requested.</td></tr>
</tbody>
</table>



<h2>JSON/Table Format</h2>
{
	"menuName" = String,
	"data" = {
		"action" = String,
		"sub" = String,
		"state" = "ON"/"OFF"
	},
	"submenu" = Array (of similarly formatted objects)
}


<table>
<tbody>
<tr><th>Atribute</th><th>Explanation</th><tr>
<tr>
	<td>menuName</td>
	<td>The text to show in the menu</td>
</tr>
<tr>
	<td>data</td>
	<td>An object containg key value pairs for all data-* attributes to be added to new menu option</td>
</tr>
<tr>
	<td>submenu</td>
	<td>An Array of of objects that are formatted in the exact same way as the current object. Used for creating linked sub menus.</td>
</tr>