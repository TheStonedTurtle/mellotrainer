-- DO NOT TOUCHY, CONTACT Michael G/TheStonedTurtle if anything is broken.
-- DO NOT TOUCHY, CONTACT Michael G/TheStonedTurtle if anything is broken.
-- DO NOT TOUCHY, CONTACT Michael G/TheStonedTurtle if anything is broken.
-- DO NOT TOUCHY, CONTACT Michael G/TheStonedTurtle if anything is broken.
-- DO NOT TOUCHY, CONTACT Michael G/TheStonedTurtle if anything is broken.


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
end)


-- Remove User on playerDropped.
AddEventHandler('playerDropped', function()
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
	for playerIndex,obj in pairs(Users) do
		TriggerClientEvent('mellotrainer:updateTime', playerIndex, hour, minutes, seconds)
	end
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
	for playerIndex,obj in pairs(Users) do
		TriggerClientEvent('mellotrainer:updateWeather', playerIndex, weatherState, persistToggle)
	end
end)


RegisterServerEvent('mellotrainer:adminBlackout')
AddEventHandler('mellotrainer:adminBlackout', function(from, toggle)
	for playerIndex,obj in pairs(Users) do
		TriggerClientEvent('mellotrainer:updateBlackout', playerIndex, toggle)
	end
end)




RegisterServerEvent('mellotrainer:adminWind')
AddEventHandler('mellotrainer:adminWind', function(from, state, heading)
	for playerIndex,obj in pairs(Users) do
		TriggerClientEvent('mellotrainer:updateWind', playerIndex, state, heading)
	end
end)