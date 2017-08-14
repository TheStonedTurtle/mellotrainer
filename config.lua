local adminOnlyTrainer = false
local admins = {
	"steam:110000106e1eac6",   -- Add all steam hexs heres.
	"steam:110000103920a31",   -- MUST FOLLOW EXAMPLE FORMAT
	"ip:0.0.0.0",              -- IP possible but not recommended
}


--local pvpEnabled = true
--local maxPlayers = 32



-- DO NOT TOUCHY, CONTACT Michael G/TheStonedTurtle if anything is broken.
-- DO NOT TOUCHY, CONTACT Michael G/TheStonedTurtle if anything is broken.
-- DO NOT TOUCHY, CONTACT Michael G/TheStonedTurtle if anything is broken.
-- DO NOT TOUCHY, CONTACT Michael G/TheStonedTurtle if anything is broken.
-- DO NOT TOUCHY, CONTACT Michael G/TheStonedTurtle if anything is broken.


Config = {}
Config.settings = {
	--pvpEnabled = pvpEnabled,
	--maxPlayers = maxPlayers,

	adminOnlyTrainer = adminOnlyTrainer,
	admins = admins
}


-- Get Setting from Config.settings
RegisterServerEvent("mellotrainer:getConfigSetting")
AddEventHandler("mellotrainer:getConfigSetting",function(stringname)
	local value = Config.settings[stringname]
	TriggerClientEvent("mellotrainer:receiveConfigSetting", source, stringname, value)
end)





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



local Users = {}
-- Called whenever someone loads into the server. Users created in variables.lua
RegisterServerEvent('mellotrainer:firstJoinProper')
AddEventHandler('mellotrainer:firstJoinProper', function(id)
	local identifiers = GetPlayerIdentifiers(source)
	for i = 1, #identifiers do
		if(Users[source] == nil)then
			Users[source] = GetPlayerName(source) -- Update to user object?
		end
	end

	TriggerClientEvent('mellotrainer:playerJoined', -1, id)
	TriggerClientEvent("mellotrainer:receiveConfigSetting", source, "adminOnlyTrainer", Config.settings.adminOnlyTrainer)
end)


-- Remove User on playerDropped.
AddEventHandler('playerDropped', function()
	if(Users[source])then
		TriggerClientEvent('mellotrainer:playerLeft', -1, Users[source])
		Users[source] = nil
	end
end)







-- Admin Managment
local adminList = Config.settings.admins


-- Is identifier in admin list?
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



-- Is user an admin? Select trainer option
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


-- Is user an admin?
RegisterServerEvent("mellotrainer:getAdminStatus")
AddEventHandler("mellotrainer:getAdminStatus",function()
	local identifiers = GetPlayerIdentifiers(source)
	local found = false
	for i=1,#identifiers,1 do
		if(isAdmin(identifiers[i]))then
			found = true
			break
		end
	end
	TriggerClientEvent("mellotrainer:adminStatusReceived",source,found)
end)

