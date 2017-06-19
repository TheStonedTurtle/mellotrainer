--[[Vehicle Options
featureCloseInstantly = false;
featureSpeedometer = false;

featureVehicleDespawnable = nil;
featureSpawnInsideCar = nil;
featureDeleteLastVehicle = nil;
]]

local function _SetEntityAsNoLongerNeeded(entity)
	Citizen.InvokeNative(0xB736A491E64A32CF,Citizen.PointerValueIntInitialized(entity))
end

local lastVehicle

local function SpawnVehicle(model, x, y, z, heading, ped)
	-- Just in case they are in a vehicle which this trainer didn't spawn.
	if not lastVehicle and GetVehiclePedIsIn(ped, false) then
		lastVehicle = GetVehiclePedIsIn(ped, false)
	end

	if IsModelValid(model) then
		RequestModel(model)
		while not HasModelLoaded(model) do
			Wait(1)
		end

		local veh = CreateVehicle(model, x, y, z + 1, heading, true, true)


		if featureSpawnInsideCar then
			SetPedIntoVehicle(ped, veh, -1)
		end

		if featureDeleteLastVehicle then
			_SetEntityAsNoLongerNeeded(veh)
			-- Remove the last vehicle.
			if (lastVehicle) then
				if(GetVehicleNumberOfPassengers(lastVehicle) ~= 0 or IsVehicleSeatFree(lastVehicle, -1) == false) then
					drawNotification("~r~Last Vehicle could not be deleted.")
				else
					SetEntityAsMissionEntity(lastVehicle, true, true)
					DeleteVehicle(lastVehicle)
				end
			end
		end

		drawNotification("~g~Vehicle spawned!")
		lastVehicle = veh
		resetVehOptions()
	else
		drawNotification("~r~Invalid Model!")
	end
end



RegisterNUICallback("vehspawnoptions", function(data,cb)
	local text = "~r~OFF"
	if(data.newstate) then
		text = "~g~ON"
	end
	if data.action == "despawn" then
		featureDeleteLastVehicle = data.newstate
		drawNotification("Delete Previous Vehicle: "..tostring(text))

	elseif data.action == "insidecar" then
		featureSpawnInsideCar = data.newstate
		drawNotification("Spawn Into Vehicle: "..tostring(text))
	end

	if(cb)then cb("ok") end
end)



RegisterNUICallback("vehspawn", function(data, cb)
	local playerPed = GetPlayerPed(-1)
	local x, y, z = table.unpack(GetOffsetFromEntityInWorldCoords(playerPed, 0.0, 7.5, 0.0))
	local heading = GetEntityHeading(playerPed)

	if data.action == "input" then
		local result = requestInput("", 60)

		if result then
			SpawnVehicle(GetHashKey(string.upper(result)), x, y, z, heading, playerPed)
		end
		return
	end

	local playerVeh = GetVehiclePedIsIn(playerPed, true)
	local vehhash = GetHashKey(data.action)

	SpawnVehicle(vehhash, x, y, z, heading, playerPed)

	if(cb)then cb("ok") end
end)

RegisterNUICallback("vehcolor", function(data, cb)
	local playerPed = GetPlayerPed(-1)
	local playerVeh = GetVehiclePedIsIn(playerPed, false)
	local color = stringsplit(data.action, ",")
	local r = tonumber(color[1])
	local g = tonumber(color[2])
	local b = tonumber(color[3])

	if not playerVeh then
		drawNotification("~r~Not in a vehicle!")
		return
	end

	SetVehicleCustomPrimaryColour(playerVeh, r, g, b)
	SetVehicleCustomSecondaryColour(playerVeh, r, g, b)
	drawNotification("~g~Repainted vehicle!")

	if(cb)then cb("ok") end
end)



-- Only show menu if they are in a vehicle.
RegisterNUICallback("requirevehicle", function(data, cb)
	local playerPed = GetPlayerPed(-1)
	local playerVeh = GetVehiclePedIsIn(playerPed, false)


	-- Not in a vehicle
	if playerVeh <= 0 then
		drawNotification("~r~Not in a vehicle")
	else
		local vehClass = GetVehicleClass(playerVeh)
		if (vehClass == 14 or vehClass == 21) then
			-- Boat or Trains shouldn't pass the vehicleModification
			drawNotification("~r~This vehicle doesn't support modifications.")
		else
			local data = createVariableData()
			SetVehicleModKit(playerVeh, 0)
			SendNUIMessage({vehicleaccess = true, updateVariables = true, data = data})
		end
	end	
end)




function resetVehOptions()
	bulletWheels = false
	xeonLightToggle = false
	customTires = false
	tireSmoke = false

	windows = {false, false, false, false}
	neons = {false, false, false, false}
end


local windows = {false, false, false,false}
local neons = {false, false, false, false}

local xeonLightToggle = false
local bulletWheels = false
local customTires = false
local tireSmoke = false


RegisterNUICallback("veh", function(data, cb)
	local playerPed = GetPlayerPed(-1)
	local playerVeh = GetVehiclePedIsIn(playerPed, false)
	local action = data.action
	local text,text2

	if(data.newstate) then
		text = "~g~ON"
		text2 = "~r~OFF"
	else
		text = "~r~OFF"
		text2 = "~g~ON"
	end


	if action == "toggleinstantly" then
		featureCloseInstantly = data.newstate
		drawNotification("Open Doors Instantly: "..text)
		return
	elseif action == "speedometer" then
		featureSpeedometer = data.newstate
		drawNotification("Speedometer: "..text)
		return
	end



	-- Rest of these request them to be in a vehicle.
	if playerVeh <= 0 then
		drawNotification("~r~Not in a vehicle!")
		return
	end

	if action == "set" then
		SetVehicleOnGroundProperly(playerVeh)

	elseif action == "fixset"then
		SetVehicleOnGroundProperly(playerVeh)
		SetVehicleFixed(playerVeh)
		SetVehicleDirtLevel(playerVeh, 0.0)
		drawNotification("~g~Vehicle repaired & set properly.")

	elseif action == "fix" then
		SetVehicleFixed(playerVeh)
		drawNotification("~g~Vehicle repaired.")


	elseif action == "dirty" then
		SetVehicleDirtLevel(playerVeh, 15.0)
		drawNotification("~g~Vehicle dirtied.")


	elseif action == "clean" then
		SetVehicleDirtLevel(playerVeh, 0.0)
		drawNotification("~g~Vehicle cleaned.")


	elseif action == "toggledoor" then
		local doorInt = tonumber(data.data[3])

		if GetVehicleDoorAngleRatio(playerVeh, doorInt) == 0 then
			SetVehicleDoorOpen(playerVeh, doorInt, false, featureCloseInstantly)
		else
			SetVehicleDoorShut(playerVeh, doorInt, featureCloseInstantly)
		end


	elseif action == "closeall" then
			SetVehicleDoorsShut(playerVeh, featureCloseInstantly)


	elseif action == "openall" then
		for i=0, 6, 1 do
			SetVehicleDoorOpen(playerVeh, i, false, featureCloseInstantly)
		end

	elseif action == "rollwindows" then
		local truecount = 0
		for i=1,4,1 do
			if windows[i] then
				truecount = truecount + 1
			end
		end

		if truecount > 2 then
			for i=1,4,1 do
				RollUpWindow(playerVeh, i-1)
				windows[i] = false
			end
		else
			RollDownWindows(playerVeh)
			for i=1,4,1 do
				windows[i] = true
			end
		end

	elseif action == "rollwindow" then
		local windowInt = tonumber(data.data[3])

		if(windows[windowInt + 1]) then
			RollUpWindow(playerVeh, windowInt)
		else
			RollDownWindow(playerVeh, windowInt)
		end

		windows[windowInt + 1] = not windows[windowInt + 1]

	elseif action == "fixwindow" then	
		local windowInt = tonumber(data.data[3])
		FixVehicleWindow(playerVeh, windowInt)

	elseif action == "fixwindows" then
		for i=0,3,1 do
			FixVehicleWindow(playerVeh, i)
		end

	end

	if(cb)then cb("ok") end
end)


RegisterNUICallback("vehmod", function(data, cb)
	local playerPed = GetPlayerPed(-1)
	local playerVeh = GetVehiclePedIsIn(playerPed, false)
	local action = data.action
	local text,text2

	if(data.newstate) then
		text = "~g~ON"
		text2 = "~r~OFF"
	else
		text = "~r~OFF"
		text2 = "~g~ON"
	end


	-- Rest of these request them to be in a vehicle.
	if playerVeh <= 0 then
		drawNotification("~r~Not in a vehicle!")
		SendNUIMessage({toggleerror = true})
		return
	end

	SetVehicleModKit(playerVeh, 0)


	-- Toggle Options
	if action == "bulletwheels" then
		bulletWheels = not data.newstate	
		SetVehicleTyresCanBurst(playerVeh, bulletWheels)

		drawNotification("Bulletproof Tires: "..text)

	elseif action == "xenonlights" then
		xeonLightToggle = data.newstate	
		ToggleVehicleMod(playerVeh, 22, xeonLightToggle)


		drawNotification("Xenon headlights: "..text)

	elseif action == "customtires" then
		customTires = data.newstate
		SetVehicleMod(playerVeh, 23, GetVehicleMod(playerVeh, 23), customTires)
		if ( (customTires and not GetVehicleModVariation(playerVeh, 23)) or (not customTires and GetVehicleModVariation(playerVeh, 23)) ) then
			SendNUIMessage({toggleerror = true})
		end

		drawNotification("Custom Tires: "..text)

	elseif action == "turbomode" then
		ToggleVehicleMod(playerVeh, 18, data.newstate)

		drawNotification("Turbo Mode: "..text)




	-- Window Tint
	elseif action == "windowtint" then
		local windowTintID = tonumber(data.data[3])
		SetVehicleWindowTint(playerVeh, windowTintID)


	-- Plate Modifications
	elseif action == "plate" then
		local plateID = tonumber(data.data[3])
		SetVehicleNumberPlateTextIndex(playerVeh, plateID)
	elseif action == "platetext" then
		local result = requestInput(GetVehicleNumberPlateText(playerVeh), 8)
		if result then
			SetVehicleNumberPlateText(playerVeh, result)
		end



	-- Tire Smoke=
	elseif action == "smokecolor" then
		local color1 = tonumber(data.data[3])
		local color2 = tonumber(data.data[4])
		local color3 = tonumber(data.data[5])


		ToggleVehicleMod(playerVeh, 20, true)
		SetVehicleTyreSmokeColor(playerVeh, color1, color2, color3)

	-- Neon underglow
	elseif action == "neonlights" then
		local ID = tonumber(data.data[3])
		SetVehicleNeonLightEnabled(playerVeh, ID, data.newstate)


	elseif action == "lightcolor" then
		local color1 = tonumber(data.data[3])
		local color2 = tonumber(data.data[4])
		local color3 = tonumber(data.data[5])

		SetVehicleNeonLightsColour(playerVeh, color1, color2, color3)

	-- Vehicle Paint Options.
	elseif action == "paint" then
		local cur = GetVehicleColours(playerVeh)
		local paintColor = tonumber(data.data[3])

		SetVehicleColours(playerVeh, paintColor, cur2)

	elseif action == "paint2" then
		local cur1,cur2 = GetVehicleColours(playerVeh)
		local paintColor = tonumber(data.data[3])

		SetVehicleColours(playerVeh, cur1, paintColor)

	elseif action == "paint3" then
		local paintColor = tonumber(data.data[3])

		SetVehicleColours(playerVeh, paintColor, paintColor)

	elseif action == "paintpearl" then
		local cur1,cur2 = GetVehicleExtraColours(playerVeh)
		local paintColor = tonumber(data.data[3])

		SetVehicleExtraColours(playerVeh, paintColor, cur2)


	elseif action == "paintwheels" then
		local cur1,cur2 = GetVehicleExtraColours(playerVeh)
		local paintColor = tonumber(data.data[3])

		SetVehicleExtraColours(playerVeh, cur1, paintColor)

	elseif action == "changewheeltype" then
		local newtype = tonumber(data.data[3])
		SetVehicleWheelType(playerVeh, newtype)
		SetVehicleMod(playerVeh, 23, 0, customTires)

		drawNotification("~g~Tire Category Changed")
		local data = createVariableData()
		SendNUIMessage({updateVariables = true, data = data})
	end
end)



RegisterNUICallback("vehmodify", function(data, cb)
	local playerPed = GetPlayerPed(-1)
	local playerVeh = GetVehiclePedIsIn(playerPed, false)


	-- Not in a vehicle, menu shouldn't display.
	if playerVeh <= 0 then
		drawNotification("~r~Not in a vehicle!")
		SendNUIMessage({toggleerror = true})
		return
	end

	SetVehicleModKit(playerVeh, 0)

	if(data.data[2] == "extra")then
		local extraID = tonumber(data.data[3])
		local newstate = data.newstate
		SetVehicleExtra(playerVeh, extraID, not newstate)
		drawNotification("Extra toggled.")
	end

	local modID = tonumber(data.data[2])
	if (data.data[3] == "clear") then
		RemoveVehicleMod(playerVeh, modID)
		if(modID == 48)then
			SetVehicleLivery(playerVeh, 0)
		end
		return
	end
	local modIndex = tonumber(data.data[3])

	if(modID == 48)then
		SetVehicleLivery(playerVeh, modIndex)
	end
	SetVehicleMod(playerVeh, modID, modIndex, customTires)
	drawNotification("Mod Applied.")
end)


local vehicleMods = {
	["Spoilers"] =  0,
	["Front Bumper"] =  1,
	["Rear Bumper"] =  2,
	["Side Skirt"] =  3,
	["Exhuast"] =  4,
	["Frame"] =  5,
	["Grille"] =  6,
	["Hood"] =  7,
	["Fender"] =  8,
	["Right Fender"] =  9,
	["Roof"] =  10,
	["Vanity Plates"] =  25,
	["Trim"] =  27,
	["Ornaments"] =  28,
	["Dashboard"] =  29,
	["Dial"] =  30,
	["Door Speaker"] =  31,
	["Seats"] =  32,
	["Steering Wheel"] =  33,
	["Shifter Leavers"] =  34,
	["Plaques"] =  35,
	["Speakers"] =  36,
	["Trunk"] =  37,
	["Hydrulics"] =  38,
	["Engine Block"] =  39,
	["Air Filter"] =  40,
	["Struts"] =  41,
	["Arch Cover"] =  42,
	["Aerials"] =  43,
	["Trim 2"] =  44,
	["Tank"] =  45,
	["Windows"] =  46,
	["Livery"] =  48,
	["Extras"] = "extra"
}


RegisterNUICallback("vehmods", function(data, cb)
	local validOptions = {}
	local optCount = 0

	for keyName,value in pairs(vehicleMods) do
		local validCOmponents
		if (value == "extra") then
			validComponents = checkValidVehicleExtras()
		else
			validComponents = checkValidVehicleMods(value)
		end

		if #validComponents > 0 then

			validOptions[keyName] = validComponents
			optCount = optCount + 1
		end
	end

	if (optCount > 0) then
		local customJSON = json.encode(validOptions,{indent = true})

		Citizen.Trace(customJSON);
		SendNUIMessage({
			createmenu = true,
			name = "vehmods",
			menudata = customJSON
		})
	else
		SendNUIMessage({
			createmenu = true,
			name = "vehmods",
			menudata = "{}"
			})
	end
	if(cb)then cb("ok") end
end)


function createVariableData()
	local playerPed = GetPlayerPed(-1)
	local playerVeh = GetVehiclePedIsIn(playerPed, false)

	local wheelModID = 23
	if (playerVeh == 13) then
		wheelModID = 24
	end

	local data = json.encode({wheeltype=tostring(GetVehicleWheelType(playerVeh)),wheelindex=tostring(GetVehicleMod(playerVeh, wheelModID))}, {indent = true})
	Citizen.Trace(data)

	return data
end


function checkValidVehicleExtras()
	local playerPed = GetPlayerPed(-1)
	local playerVeh = GetVehiclePedIsIn(playerPed, false)
	local valid = {}

	-- Get Extra Toggle Options
	for i=0,50,1 do
		if(DoesExtraExist(playerVeh, i))then
			local realModName = "Extra #"..tostring(i)
			local text = "OFF"
			if(IsVehicleExtraTurnedOn(playerVeh, i))then
				text = "ON"
				--Citizen.Trace(tostring(i).." is ON")
			end
			valid[i] = {name=realModName, modtype="extra",mod=i,state=text}
		end
	end

	return valid
end


function checkValidVehicleMods(modID)
	local playerPed = GetPlayerPed(-1)
	local playerVeh = GetVehiclePedIsIn(playerPed, false)
	local valid = {}
	local modCount = GetNumVehicleMods(playerVeh,modID)



	-- Handle Liveries if they don't exist in modCount
	if (modID == 48 and modCount == 0) then
		--Citizen.Trace("Adding Non-mod Liveries")
		modCount = GetVehicleLiveryCount(playerVeh)
		for i=1, modCount, 1 do
			local realIndex = i - 1
			local modName = GetLiveryName(playerVeh, realIndex)
			local realModName = GetLabelText(modName)
			Citizen.Trace("modname:realModName "..tostring(modName)..":"..tostring(realModName))
			valid[i] = {name=realModName, modtype=modID,mod=realIndex}
		end

		return valid
	end

	for i = 1, modCount, 1 do
		local realIndex = i - 1
		local modName = GetModTextLabel(playerVeh, modID, realIndex)
		local realModName = GetLabelText(modName)
		valid[i] = { name=realModName, modtype=modID,mod=realIndex }
	end


	-- Insert Stock Option for modifications
	if(modCount > 0)then
		table.insert(valid, 1, {name="Stock", modtype=modID,mod="clear"})
	end

	return valid
end




local torqueMultiplier = 1
local powerMultiplier = 1
local lowerForce = 0

local lowerForces = {
	[0] = 0.00,
	[1] = -0.018,
	[2] = -0.03,
	[3] = -0.05,
	[4] = -0.08,
	[5] = -0.11,
	[6] = -0.15
}

RegisterNUICallback("vehopts", function(data, cb)
	local playerPed = GetPlayerPed(-1)
	local playerVeh = GetVehiclePedIsIn(playerPed, false)
	local action = data.action
	local state = data.newstate

	local text,text2
	if(data.newstate) then
		text = "~g~ON"
		text2 = "~r~OFF"
	else
		text = "~r~OFF"
		text2 = "~g~ON"
	end	


	-- No Drag Out
	if(action == "nodrag")then
		featureNoDragOut = state;
		featureNoDragOutUpdated = true;
		drawNotification("No Drag: "..text)

	-- No Fall Off
	elseif(action == "nofall")then
		featureNoFallOff = state;
		featureNoFallOffUpdated = true;
		drawNotification("No Fall: "..text)

	-- No Helmet
	elseif(action == "nohelmet")then
		featureNoHelmet = state;
		drawNotification("No Helmet: "..text)
	end


	if(not IsPedInAnyVehicle(playerPed, false))then
		drawNotification("Not in a vehicle.")
		return
	end

	local playerVeh = GetVehiclePedIsUsing(PlayerPedId())
	if(not(playerPed == (GetPedInVehicleSeat(playerVeh,-1))))then
		drawNotification("Not owner of vehicle.")
		return
	end



	-- Drift Mode
	if(action == "driftmode")then
		if(not(IsThisModelACar(GetEntityModel(playerVeh))))then
			drawNotification("Vehicle must be a car")
			return
		end

		featureDriftMode = state
		SetVehicleReduceGrip(playerVeh, featureDriftMode)
		drawNotification("Drift Mode: "..text)

	-- Power Options
	elseif(action == "powerboost")then
		powerMultiplier = tonumber(data.data[3])
		SetVehicleEnginePowerMultiplier(playerVeh, powerMultiplier)

		drawNotification("Power Boost Multiplier: "..tostring(powerMultiplier))

	-- Torque Options
	elseif(action == "torqueboost")then
		torqueMultiplier = tonumber(data.data[3])
		SetVehicleEngineTorqueMultiplier(playerVeh, torqueMultiplier)

		drawNotification("Torque Multiplier: "..tostring(torqueMultiplier))

	-- Lowering Level
	elseif(action == "lowering")then
		if(not(IsThisModelACar(GetEntityModel(playerVeh))))then
			drawNotification("Vehicle must be a car")
			return
		end

		lowerForce = tonumber(data.data[3])
		ApplyForceToEntity(playerVeh, true, 0.0, 0.0, lowerForces[lowerForce], 0.0, 0.0, 0.0, true, true, true, true, false, true);

	--
	elseif(action == "cosdamage")then
		featureVehCosDamage = state
		SetVehicleCanBeVisiblyDamage(playerVeh, not featureVehCosDamage)
		SetVehicleStrong(playerVeh, featureVehCosDamage)
		SetVehicleDoorBreakable(playerVeh, 0, not featureVehCosDamage)
		SetVehicleDoorBreakable(playerVeh, 1, not featureVehCosDamage)
		SetVehicleDoorBreakable(playerVeh, 2, not featureVehCosDamage)
		SetVehicleDoorBreakable(playerVeh, 3, not featureVehCosDamage)
		SetVehicleDoorBreakable(playerVeh, 4, not featureVehCosDamage)
		SetVehicleDoorBreakable(playerVeh, 5, not featureVehCosDamage)
		SetVehicleDoorBreakable(playerVeh, 6, not featureVehCosDamage)

		drawNotification("No Cosmetic Damage: "..text)
	--
	elseif(action == "mechdamage")then
		featureVehMechDamage = state
		SetVehicleEngineCanDegrade(playerVeh, not featureVehMechDamage)
		SetVehicleCanBreak(playerVeh, not featureVehMechDamage)
		SetVehicleWheelsCanBreak(playerVeh, not featureVehMechDamage)
		SetDisableVehiclePetrolTankDamage(playerVeh, featureVehMechDamage)
		drawNotification("No Mechanical Damage: "..text)
	--
	elseif(action == "invincible")then
		featureVehInvincible = state
		SetEntityInvincible(playerVeh, featureVehInvincible)
		drawNotification("Vehicle Indestructable: "..text)
	end



	if(cb)then cb("ok") end
end)




-- Vehicle Options Thread
Citizen.CreateThread(function()
	while true do
		Wait(10)
		local playerPed = GetPlayerPed(-1)
		local playerVeh = GetVehiclePedIsUsing(playerPed)


		-- No Drag Out
		if(featureNoDragOutUpdated)then
			SetPedCanBeDraggedOut(playerPed, featureNoDragOut)	
			featureNoDragOutUpdated = false
		end


		-- No FallL Off
		if(featureNoFallOffUpdated)then
			SetPedCanBeKnockedOffVehicle(playerPed, featureNoFallOff)
			featureNoFallOffUpdated = false
		end


		-- No Helmet
		if(featureNoHelmet)then
			SetPedHelmet(playerPed, featureNoHelmet)
			RemovePedHelmet(playerPed, true)
		end

	end
end)








-- Speedometer Thread
Citizen.CreateThread(function()
	local hudtoggle = false
	while true do
		Wait(1)
		if (featureSpeedometer) then
			local playerPed = GetPlayerPed(-1)
			local playerVeh = GetVehiclePedIsIn(playerPed, false)

			if(playerVeh > 0) then
				hudToggle = true
				local carSpeed = GetEntitySpeed(playerVeh)

				-- KM/H = carSpeed * 3.6
				-- MPH = carSpeed * 2.236936
				local speed = carSpeed * 2.236936

				SendNUIMessage({
					showspeed = true,
					speed = speed
				})
			else
				-- Only hide the hud once.
				if hudToggle then
					SendNUIMessage({hidespeed = true})
					hudToggle = false
				end
			end
		else
			-- Only hide the hud once.
			if hudToggle then
				SendNUIMessage({hidespeed = true})
				hudToggle = false
			end
		end
	end
end)
