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
