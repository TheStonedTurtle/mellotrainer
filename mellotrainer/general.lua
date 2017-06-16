-- DO NOT TOUCHY, CONTACT Michael G/TheStonedTurtle if anything is broken.
-- DO NOT TOUCHY, CONTACT Michael G/TheStonedTurtle if anything is broken.
-- DO NOT TOUCHY, CONTACT Michael G/TheStonedTurtle if anything is broken.
-- DO NOT TOUCHY, CONTACT Michael G/TheStonedTurtle if anything is broken.
-- DO NOT TOUCHY, CONTACT Michael G/TheStonedTurtle if anything is broken.



function initServerConfig()
	NetworkSetFriendlyFireOption(true)
end


--[[
   _____   _           _               _     ______                          _     _                       
  / ____| | |         | |             | |   |  ____|                        | |   (_)                      
 | |  __  | |   ___   | |__     __ _  | |   | |__     _   _   _ __     ___  | |_   _    ___    _ __    ___ 
 | | |_ | | |  / _ \  | '_ \   / _` | | |   |  __|   | | | | | '_ \   / __| | __| | |  / _ \  | '_ \  / __|
 | |__| | | | | (_) | | |_) | | (_| | | |   | |      | |_| | | | | | | (__  | |_  | | | (_) | | | | | \__ \
  \_____| |_|  \___/  |_.__/   \__,_| |_|   |_|       \__,_| |_| |_|  \___|  \__| |_|  \___/  |_| |_| |___/
--]]


-- Used to show notifications on the screen.
function drawNotification(text)
	SetNotificationTextEntry("STRING")
	AddTextComponentString(text)
	DrawNotification(false, false)
end


-- String splits by the separator.
function stringsplit(inputstr, sep)
    if sep == nil then
            sep = "%s"
    end
    local t={} ; i=1
    for str in string.gmatch(inputstr, "([^"..sep.."]+)") do
            t[i] = str
            i = i + 1
    end
    return t
end


-- Request Input from the user
function requestInput(exampleText, maxLength)
	DisplayOnscreenKeyboard(1, "FMMC_KEY_TIP8", "", exampleText, "", "", "", maxLength + 1)
	blockinput = true

	while UpdateOnscreenKeyboard() ~= 1 and UpdateOnscreenKeyboard() ~= 2 do
		Wait(1)
	end

	local result = GetOnscreenKeyboardResult()
	blockinput = false

	if result then
		return result
	else
		return false
	end
end


-- Sort a table by values.
function sortByValue(custTable)
  local Keys = {}

  for k,_ in pairs(custTable) do
    Keys[#Keys+1] = _
  end

  table.sort(Keys)
  
  local newObj = {}
  for k,v in ipairs(Keys) do
    for key,value in pairs(custTable) do
      if value == v then
        newObj[key] = value
        break
      end
    end
  end

  return newObj
end






-- Teleport to map blip
function teleportToWaypoint()
	local targetPed = GetPlayerPed(-1)
	local targetVeh = GetVehiclePedIsUsing(targetPed)
	if(IsPedInAnyVehicle(targetPed))then
		targetPed = targetVeh
	end

	if(not IsWaypointActive())then
		drawNotification("No active waypoint.")
		return
	end

	local waypointBlip = GetFirstBlipInfoId(8) -- 8 = Waypoint ID
	local x,y,z = table.unpack(Citizen.InvokeNative(0xFA7C7F0AADF25D09, waypointBlip, Citizen.ResultAsVector())) 

	SetEntityCoordsNoOffset(targetPed, x,y,z, 0, 0, 1)
	drawNotification("Teleported to waypoint.")
end



--[[
  _______                  _                            _____                   _                    _       
 |__   __|                (_)                          / ____|                 | |                  | |      
    | |     _ __    __ _   _   _ __     ___   _ __    | |        ___    _ __   | |_   _ __    ___   | |  ___ 
    | |    | '__|  / _` | | | | '_ \   / _ \ | '__|   | |       / _ \  | '_ \  | __| | '__|  / _ \  | | / __|
    | |    | |    | (_| | | | | | | | |  __/ | |      | |____  | (_) | | | | | | |_  | |    | (_) | | | \__ \
    |_|    |_|     \__,_| |_| |_| |_|  \___| |_|       \_____|  \___/  |_| |_|  \__| |_|     \___/  |_| |___/
--]]

-- should the trainer be shown?
local showtrainer = false


-- Constantly check for trainer movement.
Citizen.CreateThread(function()
	while true do

		Wait(1)

		if IsControlJustReleased(1, 167) and not blockinput then -- f6
			if not showtrainer then
				showtrainer = true
				SendNUIMessage({
					showtrainer = true
				})
			else
				showtrainer = false
				SendNUIMessage({
					hidetrainer = true
				})
			end
		end

		if IsControlJustReleased(1, 170) and not blockinput then
			teleportToWaypoint()
		end

		if showtrainer and not blockinput then

			if (IsControlJustPressed(1, 199) or IsControlJustPressed(1, 200)) then -- ESC
				showtrainer = false
				SendNUIMessage({
					hidetrainer = true
				})				
			end

			if IsControlJustReleased(1, 176) then -- enter
				SendNUIMessage({
					trainerenter = true
				})
			elseif IsControlJustReleased(1, 177) then -- back / right click
				SendNUIMessage({
					trainerback = true
				})
			end

			if IsControlJustReleased(1, 172) then -- up
				SendNUIMessage({
					trainerup = true
				})
			elseif IsControlJustReleased(1, 173) then -- down
				SendNUIMessage({
					trainerdown = true
				})
			end

			if IsControlJustReleased(1, 174) then -- left
				SendNUIMessage({
					trainerleft = true
				})
			elseif IsControlJustReleased(1, 175) then -- right
				SendNUIMessage({
					trainerright = true
				})
			end
		end
	end
end)




--[[
  _   _   _    _   _____      _____           _   _   _                      _          
 | \ | | | |  | | |_   _|    / ____|         | | | | | |                    | |         
 |  \| | | |  | |   | |     | |        __ _  | | | | | |__     __ _    ___  | | __  ___ 
 | . ` | | |  | |   | |     | |       / _` | | | | | | '_ \   / _` |  / __| | |/ / / __|
 | |\  | | |__| |  _| |_    | |____  | (_| | | | | | | |_) | | (_| | | (__  |   <  \__ \
 |_| \_|  \____/  |_____|    \_____|  \__,_| |_| |_| |_.__/   \__,_|  \___| |_|\_\ |___/
--]]


-- Callbacks from the trainer.
RegisterNUICallback("debug", function(data, cb)
	Citizen.Trace(tostring(data))
end)


RegisterNUICallback("playsound", function(data, cb)
	PlaySoundFrontend(-1, data.name, "HUD_FRONTEND_DEFAULT_SOUNDSET",  true)
	cb("ok")
end)


RegisterNUICallback("trainerclose", function(data, cb)
	showtrainer = false
	cb("ok")
end)


initServerConfig()