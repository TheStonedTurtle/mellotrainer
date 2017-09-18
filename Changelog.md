<h1>v0.5.5 (09-@@-2017)</h1>
Added new trainer features, new Weapon & Setting Saving, and some general bug fixes/improvments



<h3>Changes</h3>
<ul>
    <li>Fixed Cosmetic Damage toggle showing scratches</li>
    <li>Updated <b>data-require</b> to work with <b>data-action</b>, was previously only working with <b>data-sub</b></li>
    <li>Fixed Skin Changing menu when loading a saved skin</li>
    <li>Fixed Voice Proximity Sync</li>
    <li>Fixed Voice Channel Menu and added Syncing</li>
    <li>Fixed incorrect submenu linking</li>
    <li>JSON Menu Name updates(credits @Matty45)</li>
</ul>

<h3>Additions</h3>
<ul>
	<li>Added Restore Apperance toggle (Default = ON)</li>
	<li>Added Local Setting Saving System (Trainer Toggles)</li>
	<li>Added MK2 Weapons and some of their attachments</li>
    <li>Added Weapon Loadout saving and loading system</li>
    <li>Added custom privledge information to the readme document</li>
</ul>



<h1>v0.5.0 (09-06-2017)</h1>
JSON Updates, JSON Editor, Setting Sync System, New Location Menu, Blip/Overhead System Rewrite, and many other code improvements.

<h3>Changes</h3>
<ul>
    <li>Majority of JSON moved to external files</li>
    <li>Blip & Overhead Name System Rewrite</li>
    <li>Potential fix for vehicles despawning</li>
    <li>Trainer should now show above other NUI elements</li>
    <li>PvP is now enabled by this trainer, will add config setting in future version</li>
    <li>Settings in cl_variables.lua now sync correctly to their default state</li>
    <li>Changed Map Blips to be on by default</li>
    <li>Updated requestInput() to return false if the default text is returned</li>
    <li>Updated vehicle settings being applied/retrieved when getting into a vehicle</li>
    <li>Modified the F3 Teleport to Marker functionality</li>
    <li>Many small bug fixes</li>
</ul>

<h3>Additions</h3>
<ul>
    <li>Added the entire Location Teleport menu, some places may not load correctly</li>
    <li>Added a Player Blip Names toggle, true by default</li>
    <li>Added Admin Kill and Teleport Player To Me Commands</li>
    <li>Custom JSON Loading (Editor: <a href="https://thestonedturtle.github.io/mellotrainer/mellotrainer.html" target="_blank">TheStonedTurtle.github.io</a>)</li>
    <li>Added all Post-Bikers Vehciles and Weapons to the menu (Thanks <a href="https://forum.fivem.net/u/Fenwick" target="_blank">Fenwick</a>)</li>
    <li>Z key will now toggle the minimap big/small. Can be removed by removing the if statement in `cl_settings.lua` under the `-- Toggle minimap on keypress` comment.</li>
</ul>



<h1>v0.4.5 (08-23-2017)</h1>
New Noclip Mode, Admin kick & temp ban, and some bug fixes. 

<h3>Changes</h3>
<ul>
    <li>Changed Control Keys to prevent controller conflictions</li>
    <li>Fixed SNS Pistol Menu issues</li>
    <li>Data saving can now be toggled in the sv_config.lua file</li>
    <li>Restructued all of the files for easier managment</li>
    <li>Fixed Time Forward/Backwards causing crashes</li>
    <li>Changed some menu colours</li>
</ul>

<h3>Additions</h3>
<ul>
    <li>Added a directory check to the data saving system</li>
	<li>Version check, the trainer will now let you know if you are running an outdated version. (Credits to EssentialMode)</li>
	<li>Added Noclip Mode, can be toggled with F2</li>
	<li>Added Admin Only Noclip toggle in sv_config.lua</li>
	<li>Added a Steam Only connection option which kicks any player not using steam. Toggleable in the sv_config.lua file</li>
	<li>Added Kick and Temp Ban to the admin menu</li>
</ul>




<h1>v0.4.0 (08-15-2017)</h1>
New vehicle and skin saving system, a few bug fixes.

<h3>Changes</h3>
<ul>
    <li>Fixed never-ending death messages when using RPDeath</li>
    <li>Fixed being able to open the trainer in the pause menu</li>
    <li>Fixed some vehicle modification names</li>
    <li>Potential fix for god mode not working</li>
    <li>Adjusted order of some NUI tables</li>
</ul>

<h3>Additions</h3>
<ul>
	<li>New data-saving.lua file for local storage, REQUIRES STEAM</li>
	<li>New Local Vehicle and Skin saving system</li>
	<li>New Menu refreshing system</li>
</ul>


<h1>V 0.3.0 (08-09-2017)</h1>

Many updates and code optimizations. New member <a href="https://github.com/WolfKnight98" target="_blank">WolfKnight98</a> added to the team.


<h3>Changes</h3>
<ul>
	<li>Fixed trainer controls</li>
	<li>Updated resource manifest version and native names</li>
	<li>More Player Blip and Overhead Name Optimizations</li>
	<li>Slightly updated Menu Spawn names</li>
	<li>Fixed No Ragdoll Mode</li>
	<li>Fixed Torque and Power Boost</li>
	<li>Fixed Player Join/Leave messages</li>
	<li>Player Death message optimizations</li>
	<li>Updated voice name overlay</li>
	<li>Localized config settings</li>
	<li>Code Restructure and Optimizations</li>
</ul>

<h3>Additions</h3>
<ul>
	<li>New config.lua file for settings</li>
	<li>New util.lua file for utility functions</li>
</ul>


<h1>V 0.2.3 (08-07-2017)</h1>

Minor bug fixes and player blip fixes.


<h3>Changes</h3>
<ul>
	<li>Fixed the player join and leave messages</li>
	<li>Fixed the player blip issues</li>
	<li>Minor CSS update for WolfKnight</li>
</ul>


<h1>V 0.2.2 (08-03-2017)</h1>

FXServer Compatibility & minor fixes.



<h3>Additions</h3>
<ul>
	<li>Added Sting Ray to the Animal Category</li>
</ul>

<h3>Changes</h3>
<ul>
	<li>Fixed the player joined message</li>
	<li>Fixed compatibility issues with FXServer</li>
</ul>





<h1>V 0.2.1 (07-08-2017)</h1>

Added variable in general.lua for admin-only trainer access.


<h3>Additions</h3>
<ul>
	<li>Added a Admin Only trainer toggle</li>
</ul>



<h1>V 0.2.0 (07-08-2017)</h1>

Bug fixes

<h3>Changes</h3>
<ul>
	<li>Fixed vehicle modification menu so it no longer applies a mod when entering the menu</li>
	<li>Fixed the vehicle power boost options</li>
	<li>Fixed the vehicle torque boost options</li>
</ul>



<h1>V 0.1.9 (07-07-2017)</h1>

Fixed an error with online players always being detected as offline.

<h3>Changes</h3>
<ul>
	<li>Fixed online player check, was always returning false</li>
</ul>




<h1>V 0.1.8 (06-30-2017)</h1>

Fixed an error with dynamic menus

<h3>Changes</h3>
<ul>
	<li>Fixed losing pages of current menu when creating dynamic menu.</li>
</ul>



<h1>V 0.1.7 (06-23-2017)</h1>

Implemented the working steam-hex admin list and some bug fixes


<h3>Changes</h3>
<ul>
	<li>Fixed Minor Blip/Overhead text issue for own player</li>
	<li>Fixed the online players menu, was previously not working</li>
	<li>Fixed Notifications to pull correct name.</li>
</ul>


<h3>Additions</h3>
<ul>
	<li>Steam-Hex Admin Functionality</li>
</ul>





<h1>V 0.1.5 (06-23-2017)</h1>

Implemented the functionality behind some trainer options that had todo notes as well as some minor bug fixes


<h3>Changes</h3>
<ul>
	<li>Removed Actions Menu, decided to create a separate animations menu. May be integrated later.</li>
	<li>Fixed Vehicle Modifications Menu for entering vehicles not spawned by menu.</li>
	<li>Denied Access to Vehicle Modifications Menu if Not Driver of Vehicle.</li>
</ul>


<h3>Additions</h3>
<ul>
	<li>Added Player Notification functionality</li>
	<li>Added Death Notification functionality</li>
	<li>Added Voice Options and functionality</li>
	<li>Added Radio Options and functionality</li>
	<li>Added Basic ON/OFF Sychronization for trainer options</li>
</ul>







<h1>V 0.1.0 (06-20-2017)</h1>

This is part 2 of 2 of the Major Update which completely rewrote the menu creation JS and the JSON Format. This is a massive update and is considered unstable as it hasn't been thoroughly tested. All remaining updates should only fix existing trainer options or add in new trainer options.


<h3>Changes</h3>
<ul>
	<li>Completely rewrote the trainer JS file for code simplification.</li>
	<li>Updated JSON format to accompany JS rewrite for code simplification.</li>
	<li>Removed the `data-dynamicmenucallback` attribute and moved the value to `data-dynamicmenu`</li>
	<li>Updated some Key Trainer Functionality to function better</li>
</ul>

<h3>Additions</h3>
<ul>
	<li>Added Weapons Tint Menu</li>
</ul>






<h1>V 0.0.5 (06-19-2017)</h1>

This update includes massive changes to the trainer including new functionality, bug fixes, menu layout rework, and a massive code reworks. This is part 1 of 2 major updates to be pushed prior to V1.0.0 release.

<h3>Changes</h3>
<ul>
	<li>Updated Menu Layout to Match Lambda Menu</li>
	<li>Updated Admin syncing to use `-1` instead of a loop</li>
	<li>Removed all Rainbow Options</li>
	<li>Updated Table Conversion to use native `json` functionality</li>
	<li>Fixed Teleport to Waypoint so it puts you on the highest surface</li>
	<li>Removed Redundant piece of code in Admin.lua</li>
</ul>

<h3>Additions</h3>
<ul>
	<li>Added New Action Menu (Currently Empty)</li>
	<li>Added New Player Toggles</li>
	<li>Added New Vehicle Menus</li>
	<li>Added Notificaitons in some places</li>
</ul>




<h1> V 0.0.2 (06-16-2017)</h1>

Added Vehicle Extra Toggles as well as Fixed Vehicle Livery Options.

<h3>Changes</h3>
<ul>
	<li>Fixed Vehicle Liveries not showing for specific Vehicles</li>
</ul>

<h3>Additions</h3>
<ul>
	<li>Added Vehicle Extra Toggles to Vehicle Modification Menu</li>
</ul>




<h1>V 0.0.1 (06-16-2017)</h1>

Added additional functionality to the trainer and fixed some bugs found by the alpha testing team

<h3>Changes</h3>
<ul>
	<li>Fixed Spectate Feature</li>
	<li>Fixed teleporting into a players vehicle you are already in</li>
	<li>Fixed Normal/Hostile Blip Colors</li>
	<li>Fixed Friendly Fire, always off</li>
	<li>Fixed Automatic Blip Checking</li>
	<li>Fixed Unlimited Stamina</li>
	<li>Fixed Draw Route functionality to updated every 2 seconds</li>
	<li>Fixed Vehicle Modification Menu Issues</li>
	<li>Turned Blip & Names off by default</li>
</ul>

<h3>Additions</h3>
<ul>
	<li>Added Teleport to Waypoint option (Binded to F3)</li>
	<li>Added Error message when attempting to teleport into a full vehicle</li>
	<li>Added Many player toggle options (Keep Wet, No Ragdoll, Night/Thermal Vision, Etc.)</li>
</ul>

<h1>V 0.0.0 (06-06-2017)</h1>
Initial Commit
