--[[--------------------------------------------------------------------------
	*
	* Mello Trainer
	* (C) Michael Goodwin 2017
	* http://github.com/thestonedturtle/mellotrainer/releases
	*
	* This menu used the Scorpion Trainer as a framework to build off of.
	* https://github.com/pongo1231/ScorpionTrainer
	* (C) Emre Cürgül 2017
	* 
	* A lot of useful functionality has been converted from the lambda menu.
	* https://lambda.menu
	* (C) Oui 2017
	*
	* Additional Contributors:
	* WolfKnight (https://forum.fivem.net/u/WolfKnight)
	*
---------------------------------------------------------------------------]]


-- Animation Variables
local loadedAnims = false
local noclip_ANIM_A = "amb@world_human_stand_impatient@male@no_sign@base";
local noclip_ANIM_B = "base";

-- Noclip Variables
local in_noclip_mode = false;
local travelSpeed = 0;
local curLocation;
local curRotation;
local curHeading;

local target



function toggleNoClipMode()
	if(in_noclip_mode)then
		turnNoClipOff()
	else
		turnNoClipOn()
	end
end


function turnNoClipOff()
	local playerPed = PlayerPedId()
	local inVehicle = IsPedInAnyVehicle(playerPed, 0)	

	if( inVehicle ) then
		local veh = GetVehiclePedIsUsing(playerPed)
		SetEntityInvincible(veh, false)
	else
		ClearPedTasksImmediately(playerPed)
	end

	SetUserRadioControlEnabled(true)
	SetPlayerInvincible(PlayerId(), false)
	SetEntityInvincible(target, false)

	in_noclip_mode = false
end


function turnNoClipOn()
	local playerPed = PlayerPedId()
	local inVehicle = IsPedInAnyVehicle(playerPed, 0)	

	if( not inVehicle ) then
		_LoadAnimDict(noclip_ANIM_A)
		loadedAnims = true;
	end

	-- Update starting position for noclip
	local x,y,z = table.unpack(GetEntityCoords(playerPed, 0))
	curLocation = {
		x = x,
		y = y,
		z = z
	}
	curRotation = GetEntityRotation(playerPed, 0)
	curHeading = GetEntityHeading(playerPed)

	in_noclip_mode = true
end


-- Credits to @Oui (Lambda Menu)
function degToRad(degs)
	return degs*3.141592653589793 / 180;
end


-- Credits to @Oui (Lambda Menu). Converted by @TheStonedTurtle
function moveThroughDoor()
	local playerPed = PlayerPedId()

	if ( IsPedInAnyVehicle(playerPed, 0) ) then
		return
	end

	-- Update starting position
	curLocation = GetEntityCoords(playerPed, 0)
	curHeading = GetEntityHeading(playerPed)

	local forwardPush = 0.6

	local xVect = forwardPush * math.sin(degToRad(curHeading)) * -1.0
	local yVect = forwardPush * math.cos(degToRad(curHeading))

	SetEntityCoordsNoOffset(playerPed, curLocation.x + xVect, curLocation.y + yVect, curLocation.z, 1, 1, 1)
end


-- Handles all No Clipping.
Citizen.CreateThread(function()
	local rotationSpeed = 2.5
	local forwardPush = 0.8

	local xBoolParam = 1
	local yBoolParam = 1
	local zBoolParam = 1


	-- Sync Forward Push with Travel Speed
	function updateForwardPush()
		if(travelSpeed == 0)then
			forwardPush = 0.8  --medium
		elseif(travelSpeed == 1)then
			forwardPush = 1.8  --fast
		elseif(travelSpeed == 2)then
			forwardPush = 3.6  --very fast
		elseif(travelSpeed == 3)then
			forwardPush = 5.4  --extremely fast
		elseif(travelSpeed == 4)then
			forwardPush = 0.05 --very slow
		elseif(travelSpeed == 5)then
			forwardPush = 0.2  --slow
		end
	end

	-- Updates the players position
	function handleMovement(xVect,yVect)
		local moveUpKey = 44      -- Q
		local moveDownKey = 38    -- E
		local moveForwardKey = 32 -- W
		local moveBackKey = 33    -- S
		local rotateLeftKey = 34  -- A
		local rotateRightKey = 35 -- D

		if ( IsControlPressed( 1, moveUpKey) or IsDisabledControlPressed( 1, moveUpKey) ) then
			curLocation.z = curLocation.z + forwardPush / 2;
		elseif ( IsControlPressed( 1, moveDownKey) or IsDisabledControlPressed( 1, moveDownKey) ) then
			curLocation.z = curLocation.z - forwardPush / 2;
		end

		if ( IsControlPressed( 1, moveForwardKey) or IsDisabledControlPressed( 1, moveForwardKey) ) then
			curLocation.x = curLocation.x + xVect
			curLocation.y = curLocation.y + yVect
		elseif ( IsControlPressed( 1, moveBackKey) or IsDisabledControlPressed( 1, moveBackKey) ) then
			curLocation.x = curLocation.x - xVect
			curLocation.y = curLocation.y - yVect
		end

		if ( IsControlPressed( 1, rotateLeftKey) or IsDisabledControlPressed( 1, rotateLeftKey) ) then
			curHeading = curHeading + rotationSpeed
		elseif ( IsControlPressed( 1, rotateRightKey) or IsDisabledControlPressed( 1, rotateRightKey) ) then
			curHeading = curHeading - rotationSpeed
		end	
	end

	 while (true) do
	 	Citizen.Wait(0)

	 	if(in_noclip_mode)then
	 		local playerPed = PlayerPedId()

	 		if ( IsEntityDead(playerPed) ) then
				turnNoClipOff()

				-- Ensure we get out of noclip mode
				Citizen.Wait( 100 )
			else
				target = playerPed
				-- Handle Noclip Movement.
				local inVehicle = IsPedInAnyVehicle(playerPed, true)
				if ( inVehicle ) then
					target = GetVehiclePedIsUsing(playerPed)
				end

				SetEntityVelocity(playerPed, 0.0, 0.0, 0.0)
				SetEntityRotation(playerPed, 0, 0, 0, 0, false)

				-- Prevent Conflicts/Damage
				SetUserRadioControlEnabled(false)
				SetPlayerInvincible(PlayerId(), true)		
				SetEntityInvincible(target, true)

				-- Play animation on foot.
				if(not inVehicle)then
					TaskPlayAnim(PlayerPedId(), noclip_ANIM_A, noclip_ANIM_B, 8.0, 0.0, -1, 9, 0, 0, 0, 0);
				end

				updateForwardPush()

				local xVect = forwardPush * math.sin(degToRad(curHeading)) * -1.0
				local yVect = forwardPush * math.cos(degToRad(curHeading))

				handleMovement(xVect,yVect)

				-- Update player postion.
				SetEntityCoordsNoOffset(target, curLocation.x, curLocation.y, curLocation.z, xBoolParam, yBoolParam, zBoolParam)
				SetEntityHeading(target, curHeading - rotationSpeed)

			end
	 	end
	 end
end)