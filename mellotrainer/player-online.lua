-- DO NOT TOUCHY, CONTACT Michael G/TheStonedTurtle if anything is broken.
-- DO NOT TOUCHY, CONTACT Michael G/TheStonedTurtle if anything is broken.
-- DO NOT TOUCHY, CONTACT Michael G/TheStonedTurtle if anything is broken.
-- DO NOT TOUCHY, CONTACT Michael G/TheStonedTurtle if anything is broken.
-- DO NOT TOUCHY, CONTACT Michael G/TheStonedTurtle if anything is broken.

local drawRouteTarget = nil


-- Returns all player names in alphabetical order.
function getOnlinePlayersAndNames()
    local players = {}
    local me = PlayerId(-1)
    for i=0, maxPlayers, 1 do
        if(NetworkIsPlayerConnected(i) and i ~= me) then
            local playerName = GetPlayerName(i)
            local scoreboardID = GetPlayerServerId(i)

            players[scoreboardID] = {['ped'] = GetPlayerPed(i), ['menuName']=playerName,['spawnName'] = scoreboardID, ['id'] = i}
        end
    end
    --players = sortByValues(players) -- Alphabetical Order for players.
    return players
end



-- Spectate target player.
function spectatePlayer(target)
	local playerPed = GetPlayerPed() -- yourself

	if(featureSpectate)then
		if (not IsScreenFadedOut() and not IsScreenFadingOut()) then
			DoScreenFadeOut(1000)
			while (not IsScreenFadedOut()) do
				Wait(0)
			end

			local targetpos = GetEntityCoords(target['ped'], false)

			RequestCollisionAtCoord(targetpos['x'],targetpos['y'],targetpos['z'])
			NetworkSetInSpectatorMode(true, target['ped'])

			if(IsScreenFadedOut()) then
				DoScreenFadeIn(1000)
			end
		end


		drawNotification("Spectating ~b~<C>"..target['menuName'].."</C>.")
	else
		if(not IsScreenFadedOut() and not IsScreenFadingOut()) then
			DoScreenFadeOut(1000)
			while (not IsScreenFadedOut()) do
				Wait(0)
			end

			local targetpos = GetEntityCoords(playerPed, false)

			RequestCollisionAtCoord(targetpos['x'],targetpos['y'],targetpos['z'])
			NetworkSetInSpectatorMode(false, target['ped'])

			if(IsScreenFadedOut()) then
				DoScreenFadeIn(1000)
			end
		end

		drawNotification("Stopped Spectating ~b~<C>"..target['menuName'].."</C>.")
	end
end


-- Draw Route to player on map.


-- TODO: Add check to ensure target is still online/update route.
function drawRoute(target)
	local targetId = tonumber(target['id'])
	if (featureDrawRoute) then

--		if (NetworkIsPlayerConnected(targetId)) then
--			SetWaypointOff()
--			featureDrawRoute = false;
--			drawNotification("Player "..target['menuName'].." has ~r~<C>disconnected</C>.")

		--else
		if (DoesEntityExist(target['ped'])) then

			local drawroute = GetEntityCoords(target['ped'], false)

			SetNewWaypoint(drawroute['x'], drawroute['y'])

			drawNotification("Drawing Live Route To:~n~~b~<C>"..target['menuName'].."</C>.")
		end
	else
		SetWaypointOff()
		drawNotification("Route Removed.")
	end
end

function updateDrawRoute()
	if(not IsWaypointActive())then
		featureDrawRoute = false
		return
	end

	local target = drawRouteTarget
	local targetId = target['id']
	if(featureDrawRoute)then
		if(NetworkIsPlayerConnected(targetId))then
			local drawroute = GetEntityCoords(target['ped'], false)

			SetNewWaypoint(drawroute['x'], drawroute['y'])
		else
			SetWaypointOff()
			featureDrawRoute = false
			drawRouteTarget = nil
			drawNotification("Player "..target['menuName'].." has ~r~<C>disconnected</C>.")
		end
	end
end


-- Teleport to Player
function teleportToPlayer(target)
	local playerPed = GetPlayerPed(-1) -- Yourself

	if(DoesEntityExist(target['ped']))then
		-- Turns off spectator mode just in case.
		NetworkSetInSpectatorMode(false, target['ped'])
		featureSpectate = false
	end


	local targetPed = playerPed
	if(IsPedInAnyVehicle(playerPed, 0))then
		local v = GetVehiclePedIsUsing(playerPed)
		if(GetPedInVehicleSeat(v, -1) == playerPed) then
			targetPed = v
		end
	else
		ClearPedTasksImmediately(playerPed)
	end

	local x,y,z = table.unpack(GetEntityCoords(target['ped']))
	--Citizen.Trace("XYZ: "..tostring(x).." "..tostring(y).." "..tostring(z))
	z = z + 3.0
	RequestCollisionAtCoord(x,y,z)
	SetEntityCoordsNoOffset(targetPed, x,y,z, 0, 0, 1)

	drawNotification("Teleported to ~b~<C>"..target['menuName'].."</C>.")
end




-- Teleport into player Vehicle
function teleportIntoPlayerVehicle(target)
	local playerPed = GetPlayerPed(-1)
	if(not IsPedInAnyVehicle(target['ped'], false))then
		drawNotification("~b~<C>"..target['menuName'].."</C> ~s~is not in any vehicle")
		return
	end

	local targetVeh = GetVehiclePedIsIn(target['ped'], false)

	if(targetVeh == GetVehiclePedIsIn(playerPed))then
		drawNotification("You are already in ".."~b~<C>"..target['menuName'].."'s</C> ~s~vehicle.")
		return
	end

	if(GetVehicleDoorsLockedForPlayer(targetVeh, playerPed))then
		drawNotification("~b~<C>"..target['menuName'].."'s</C> ~s~vehicle is locked.")
		return
	end

	local seatNum = 0 + GetVehicleNumberOfPassengers(targetVeh)
	local passNum = GetVehicleMaxNumberOfPassengers(targetVeh)


	while (seatNum < passNum) do
		if(IsVehicleSeatFree(targetVeh, seatNum))then
			local playerPedID = PlayerPedId()
			ClearPedTasksImmediately(playerPedID)
			SetPedIntoVehicle(playerPed, targetVeh, seatNum)
			NetworkSetInSpectatorMode(false, target['ped'])
			break
		else
			seatNum = seatNum + 1
		end
	end

	if (seatNum >= passNum) then
		drawNotification("~b~<C>"..target['menuName'].."'s</C> ~s~vehicle is full.")
	    return
	end

	drawNotification("Teleported into ~b~<C>"..target['menuName'].."'s</C> ~s~vehicle.")
end


-- Relationship Toggles
function toggleRelationshipBlip(colorID, typeText, target)
	local blip = GetBlipFromEntity(target['ped']);
	SetBlipColour(blip, colorID)
	SetBlipNameToPlayerName(blip, target['menuName'])
	drawNotification("Marked ~b~<C>"..target['menuName'].."</C>~s~ as "..typeText)
end



RegisterNUICallback("otherplayer", function(data, cb)
	local playerPed = GetPlayerPed(-1) -- Yourself
	local targetServerID;             -- Target


	local allPlayers = getOnlinePlayersAndNames() --Active Users

	local action = data.action
	local newstate = data.newstate

	if action == "relationship" then
		targetServerID = tonumber(data.data[4])
	else
		targetServerID = tonumber(data.data[3])
	end

	local target = allPlayers[targetServerID]

	if(target == nil)then
		drawNotification("Player has ~r~<C>disconnected</C>.")
		return
	end

	local text = "~r~OFF"
	if(newstate) then
		text = "~g~ON"
	end


	-- Relationships
	if action == "relationship" then
		local relationshipType = data.data[3]

		-- Friendly
		if(relationshipType == "friendly")then
			toggleRelationshipBlip(3, "Friendly",target)

		--Normal
		elseif(relationshipType == "normal")then
			toggleRelationshipBlip(0, "Normal",target)

		--Hostile
		elseif(relationshipType == "hostile")then
			toggleRelationshipBlip(1, "Hostile",target)
		end

	-- Teleport to the player.
	elseif action == "teleportto" then
		teleportToPlayer(target)

	-- Teleport inside their vehicle
	elseif action == "teleportinside" then
		teleportIntoPlayerVehicle(target)

	--Draw Route to player
	elseif action == "drawroute" then
		featureDrawRoute = newstate
		drawRouteTarget = target
		drawRoute(target)

	-- Spectate player.
	elseif action == "spectate" then
		featureSpectate = newstate
		spectatePlayer(target)
	end

	cb("ok")
end)





-- Convert the tables We create to a JSON string to be converted by trainer.js
local function createJSONString(myTable)
	local JSONString = '{"onlineplayers": ['
	local count = 0

	-- Loop over each player
	for k in pairs(myTable) do
		v = myTable[k]

		local curString = '{"menuName": "'..tostring(v['menuName'])..'", "spawnName": "'..tostring(v['spawnName'])..'"}'

		if count > 0 then
			curString = ","..curString
		end

		count = count + 1
		JSONString = JSONString..curString
	end

	JSONString = JSONString.."]}"	
	return JSONString
end


-- Return all player names to the trainer
RegisterNUICallback("getonlineplayers", function(data,cb)
	--Citizen.Trace("Get Online Players")
	local players = getOnlinePlayersAndNames()
	local playerJSON = createJSONString(players)

	SendNUIMessage({
		createonlineplayersmenu = true,
		name = "onlineplayers",
		menudata = playerJSON
	})	
end)


Citizen.CreateThread(function()
	while true do
		Wait(2000)

		if(featureDrawRoute)then
			updateDrawRoute()
		end
	end
end)