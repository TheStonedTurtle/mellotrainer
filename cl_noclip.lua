local exitFlag = false;

local noclip_ANIM_A = "amb@world_human_stand_impatient@male@no_sign@base";
local noclip_ANIM_B = "base";

local travelSpeed = 0;

local in_noclip_mode = false;

local help_showing = true;

local curLocation;
local curRotation;
local curHeading;


function degToRad(degs)
	return degs*3.141592653589793 / 180;
end


function exit_noclip_menu_if_showing()
	exitFlag = true;
end

function process_noclip_menu()
	exitFlag = false;

	local loadedAnims = false;

	local playerPed = PlayerPedId()
	local inVehicle = IsPedInAnyVehicle(playerPed, 0)

	if (not inVehicle) then
		_LoadAnimDict(noclip_ANIM_A)
		loadedAnims = true;
	end

	curLocation = GetEntityCoords(playerPed, 0)
	curRotation = GetEntityRotation(playerPed, 0)
	curHeading = GetEntityHeading(playerPed)

	while (true and not exitFlag) do
		Citizen.Wait(0)
		in_noclip_mode = true;

		-- Disable noclip on death
		if ( IsEntityDead(playerPed) ) then
			exitFlag = true;
		end

		-- Handle all noclipping inside the noclip function.
		noclip(inVehicle);
	end

	if (inVehicle) then
		local veh = GetVehiclePedIsUsing(playerPed)
		SetEntityInvincible(veh, false)
	else
		ClearPedTasksImmediately(playerPed)
	end

	SetUserRadioControlEnabled(true)
	SetPlayerInvincible(PlayerId(), false)


	exitFlag = false;
	in_noclip_mode = false;
end

-- Push player through a door
function moveThroughDoor()
	local playerPed = PlayerPedId()

	if ( IsPedInAnyVehicle(playerPed, 0) ) then
		return;
	end

	curLocation = GetEntityCoords(playerPed, 0)
	curHeading = GetEntityHeading(playerPed)

	local forwardPush = 0.6;

	local xVect = forwardPush * math.sin(degToRad(curHeading)) * -1.0
	local yVect = forwardPush * math.cos(degToRad(curHeading))

	SetEntityCoordsNoOffset(playerPed, curLocation.x + xVect, curLocation.y + yVect, curLocation.z, 1, 1, 1)
end


-- No Clip the player arouind the map
function noclip()
	local playerPed = PlayerPedId()

	local rotationSpeed = 2.5
	local forwardPush

	local inVehicle = false

	if(travelSpeed == 0)then
		forwardPush = 0.8 --medium
	elseif(travelSpeed == 1)then
		forwardPush = 1.8 --fast
	elseif(travelSpeed == 2)then
		forwardPush = 3.6 --very fast
	elseif(travelSpeed == 3)then
		forwardPush = 5.4 --extremely fast
	elseif(travelSpeed == 4)then
		forwardPush = 0.05 --very slow
	elseif(travelSpeed == 5)then
		forwardPush = 0.2; --slow
	end

	local xVect = forwardPush * math.sin(degToRad(curHeading)) * -1.0
	local yVect = forwardPush * math.cos(degToRad(curHeading))

	-- Vehicle?
	local target = playerPed;
	if ( IsPedInAnyVehicle(playerPed, true) ) then
		target = GetVehiclePedIsUsing(playerPed)
		inVehicle = true
	end

	local xBoolParam = 1;
	local yBoolParam = 1;
	local zBoolParam = 1;

	SetEntityVelocity(playerPed, 0.0, 0.0, 0.0)
	SetEntityRotation(playerPed, 0, 0, 0, 0, false)

	-- Play animation if on foot.
	if(not inVehicle)then
		TaskPlayAnim(PlayerPedId(), noclip_ANIM_A, noclip_ANIM_B, 8.0, 0.0, -1, 9, 0, 0, 0, 0);
	end

	SetUserRadioControlEnabled(false)
	SetPlayerInvincible(PlayerId(), true)
	SetEntityInvincible(target, true)



	local moveUpKey = ""
	local moveDownKey = ""
	local moveForwardKey = ""
	local moveBackKey = ""
	local rotateLeftKey = ""
	local rotateRightKey = ""




	if ( "" ) then -- Adjust speed at which we will move
		travelSpeed = traveSpeed + 1
		if (travelSpeed > 5) then
			travelSpeed = 0;
		end
	end

	if ( "" ) then -- Toggle Help Display
		help_showing = not help_showing
	end

	if ( moveUpKey ) then
		curLocation.z = curLocation.z + forwardPush / 2;

	elseif (moveDownKey) then
		curLocation.z = curLocation.z - forwardPush / 2;
	end

	if (moveForwardKey) then
		curLocation.x = curLocation.x + xVect
		curLocation.y = curLocation.y + yVect
	elseif (moveBackKey) then
		curLocation.x = curLocation.x + xVect
		curLocation.y = curLocation.y + yVect
	end

	if (rotateLeftKey) then
		curHeading = curHeading + rotationSpeed
	elseif (rotateRightKey) then
		curHeading = curHeading - rotationSpeed
	end

	-- Update player postion.
	SetEntityCoordsNoOffset(target, curLocation.x, curLocation.y, curLocation.z, xBoolParam, yBoolParam, zBoolParam)
	SetEntityHeading(target, curHeading - rotationSpeed)
end


function is_in_noclip_mode()
	return in_noclip_mode
end