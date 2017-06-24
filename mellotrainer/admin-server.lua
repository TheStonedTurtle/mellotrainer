-- DO NOT TOUCHY, CONTACT Michael G/TheStonedTurtle if anything is broken.
-- DO NOT TOUCHY, CONTACT Michael G/TheStonedTurtle if anything is broken.
-- DO NOT TOUCHY, CONTACT Michael G/TheStonedTurtle if anything is broken.
-- DO NOT TOUCHY, CONTACT Michael G/TheStonedTurtle if anything is broken.
-- DO NOT TOUCHY, CONTACT Michael G/TheStonedTurtle if anything is broken.


local admins = {
	"steam:110000106e1eac6"   -- Add all steam hexs heres
}


function isAdmin(identifier)
	local adminList = {}
	for _,v in pairs(admins) do
		adminList[v] = true
	end
	identifier = string.lower(identifier)
	identifier2 = string.upper(identifier)

	if(adminList[identifier] or adminList[identifier2])then
		return true
	else
		return false
	end
end




RegisterServerEvent("mellotrainer:isAdmin")
AddEventHandler("mellotrainer:isAdmin",function()
	local identifiers = GetPlayerIdentifiers(source)
	local found = false
	for i=1,#identifiers,1 do
		if(isAdmin(identifiers[i]))then
			TriggerClientEvent("mellotrainer:adminstatus",source,true)
			found = true
			break
		end
	end
	if(not found)then
		TriggerClientEvent("mellotrainer:adminstatus",source,false)
	end
end)

local maxPlayers = 32;
local Users = {};
--[[
  _    _                         __  __                                                              _   
 | |  | |                       |  \/  |                                                            | |  
 | |  | |  ___    ___   _ __    | \  / |   __ _   _ __     __ _    __ _   _ __ ___     ___   _ __   | |_ 
 | |  | | / __|  / _ \ | '__|   | |\/| |  / _` | | '_ \   / _` |  / _` | | '_ ` _ \   / _ \ | '_ \  | __|
 | |__| | \__ \ |  __/ | |      | |  | | | (_| | | | | | | (_| | | (_| | | | | | | | |  __/ | | | | | |_ 
  \____/  |___/  \___| |_|      |_|  |_|  \__,_| |_| |_|  \__,_|  \__, | |_| |_| |_|  \___| |_| |_|  \__|
                                                                   __/ |                                 
                                                                  |___/                                  
--]]

-- Called whenever someone loads into the server. Users created in variables.lua

RegisterServerEvent('mellotrainer:firstJoinProper')
AddEventHandler('mellotrainer:firstJoinProper', function()
	local identifiers = GetPlayerIdentifiers(source)
	for i = 1, #identifiers do
		if(Users[source] == nil)then
			Users[source] = true -- Update to user object?
		end
	end


	TriggerClientEvent('mellotrainer:playerJoined', -1, source)
end)


-- Remove User on playerDropped.
AddEventHandler('playerDropped', function()
	TriggerClientEvent('mellotrainer:playerLeft', -1, source)
	if(Users[source])then
		Users[source] = nil
	end
end)




--    _______ _                    ____        _   _                 
--   |__   __(_)                  / __ \      | | (_)                
--      | |   _ _ __ ___   ___   | |  | |_ __ | |_ _  ___  _ __  ___ 
--      | |  | | '_ ` _ \ / _ \  | |  | | '_ \| __| |/ _ \| '_ \/ __|
--      | |  | | | | | | |  __/  | |__| | |_) | |_| | (_) | | | \__ \
--      |_|  |_|_| |_| |_|\___|   \____/| .__/ \__|_|\___/|_| |_|___/
--                                      | |                          
--                                      |_|                          

RegisterServerEvent('mellotrainer:adminTime')
AddEventHandler('mellotrainer:adminTime', function(from, hour, minutes, seconds)
	TriggerClientEvent('mellotrainer:updateTime', -1, hour, minutes, seconds)
end)



-- __          __        _   _                  ____        _   _                 
-- \ \        / /       | | | |                / __ \      | | (_)                
--  \ \  /\  / /__  __ _| |_| |__   ___ _ __  | |  | |_ __ | |_ _  ___  _ __  ___ 
--   \ \/  \/ / _ \/ _` | __| '_ \ / _ \ '__| | |  | | '_ \| __| |/ _ \| '_ \/ __|
--    \  /\  /  __/ (_| | |_| | | |  __/ |    | |__| | |_) | |_| | (_) | | | \__ \
--     \/  \/ \___|\__,_|\__|_| |_|\___|_|     \____/| .__/ \__|_|\___/|_| |_|___/
--                                                   | |                          
--                                                   |_|                          

RegisterServerEvent('mellotrainer:adminWeather')
AddEventHandler('mellotrainer:adminWeather', function(from, weatherState, persistToggle)
	TriggerClientEvent('mellotrainer:updateWeather', -1, weatherState, persistToggle)
end)


RegisterServerEvent('mellotrainer:adminBlackout')
AddEventHandler('mellotrainer:adminBlackout', function(from, toggle)
	TriggerClientEvent('mellotrainer:updateBlackout', -1, toggle)
end)




RegisterServerEvent('mellotrainer:adminWind')
AddEventHandler('mellotrainer:adminWind', function(from, state, heading)
	TriggerClientEvent('mellotrainer:updateWind', -1, state, heading)
end)