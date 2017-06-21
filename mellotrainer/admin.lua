-- DO NOT TOUCHY, CONTACT Michael G/TheStonedTurtle if anything is broken.
-- DO NOT TOUCHY, CONTACT Michael G/TheStonedTurtle if anything is broken.
-- DO NOT TOUCHY, CONTACT Michael G/TheStonedTurtle if anything is broken.
-- DO NOT TOUCHY, CONTACT Michael G/TheStonedTurtle if anything is broken.
-- DO NOT TOUCHY, CONTACT Michael G/TheStonedTurtle if anything is broken.




local me = PlayerId(-1)


--    _______ _                    ____        _   _                 
--   |__   __(_)                  / __ \      | | (_)                
--      | |   _ _ __ ___   ___   | |  | |_ __ | |_ _  ___  _ __  ___ 
--      | |  | | '_ ` _ \ / _ \  | |  | | '_ \| __| |/ _ \| '_ \/ __|
--      | |  | | | | | | |  __/  | |__| | |_) | |_| | (_) | | | \__ \
--      |_|  |_|_| |_| |_|\___|   \____/| .__/ \__|_|\___/|_| |_|___/
--                                      | |                          
--                                      |_|                          

-- Forward one hour
function getForwardTime()
	return {h=GetClockHours() + 1,m= GetClockMinutes(),s=GetClockSeconds()}
end


-- Back one hour
function getReverseTime()
	return {h=GetClockHours() - 1,m= GetClockMinutes(),s=GetClockSeconds()}
end



-- Update time
RegisterNetEvent('mellotrainer:updateTime')
AddEventHandler('mellotrainer:updateTime', function(h,m,s)
	--Citizen.Trace("Time Updated")
	NetworkOverrideClockTime(h,m,s)
end)




RegisterNUICallback("time", function(data, cb)
	local h,m,s
	local action = data.action
	if (action == "input") then
		local request = tonumber(requestInput("", 2))

		if (request == nil) or (request > 24) or (request < 0) then
			drawNotification("~r~You must specify a number from 0-24.")
			return
		else
			h=request
			m=0
			s=0
		end
	elseif(action == "forwards")then
		local time = getForwardTime()
		h=time.h
		m=time.m
		s=time.s
	elseif(action == "backwards")then
		local time = getReverseTime()
		h=time.h
		m=time.m
		s=time.s
	else
		h=tonumber(data.action) or 0
		m=0
		s=0
	end
	TriggerServerEvent("mellotrainer:adminTime", me, h,m,s)
	drawNotification("~g~Time changed to "..tostring(h)..":"..string.format("%02d", tostring(m)))
end)



-- __          __        _   _                  ____        _   _                 
-- \ \        / /       | | | |                / __ \      | | (_)                
--  \ \  /\  / /__  __ _| |_| |__   ___ _ __  | |  | |_ __ | |_ _  ___  _ __  ___ 
--   \ \/  \/ / _ \/ _` | __| '_ \ / _ \ '__| | |  | | '_ \| __| |/ _ \| '_ \/ __|
--    \  /\  /  __/ (_| | |_| | | |  __/ |    | |__| | |_) | |_| | (_) | | | \__ \
--     \/  \/ \___|\__,_|\__|_| |_|\___|_|     \____/| .__/ \__|_|\___/|_| |_|___/
--                                                   | |                          
--                                                   |_|                          



-- Change Weather Type
function changeWeatherType(type, freezeToggle)
	SetOverrideWeather(type)
	if(freezeToggle)then
		ClearWeatherTypePersist()
		SetWeatherTypePersist(type)
	end
end


-- Blackout
RegisterNetEvent('mellotrainer:updateBlackout')
AddEventHandler('mellotrainer:updateBlackout', function(toggle)
	SetBlackout(toggle)
end)


-- Wind
RegisterNetEvent('mellotrainer:updateWind')
AddEventHandler('mellotrainer:updateWind', function(toggle, heading)
	if(toggle) then
		SetWind(1.0)
		SetWindSpeed(11.99);
		SetWindDirection(heading)
	else
		SetWind(0.0)
		SetWindSpeed(0.0);
	end
end)


-- Weather
RegisterNetEvent('mellotrainer:updateWeather')
AddEventHandler('mellotrainer:updateWeather', function(weatherString, toggle)
	SetOverrideWeather(weatherString)
	if(toggle)then
		ClearWeatherTypePersist()
		SetWeatherTypePersist(weatherString)
	end
end)


RegisterNUICallback("weatheroptions", function(data, cb)
	local action = data.action
	local newstate = data.newstate

	-- Notification Toggle Text
	local text = "~r~OFF"
	if(newstate) then
		text = "~g~ON"
	end


	if(action == "wind")then
		featureWeatherWind = newstate
		local heading = GetEntityHeading(PlayerPedId())
		TriggerServerEvent("mellotrainer:adminWind", me, featureWeatherWind, heading)
		drawNotification("Wind "..text)
	elseif(action == "freeze")then
		featureWeatherFreeze = newstate
		drawNotification("Persistent Weather "..text.."~w~, Select weather to apply")
	elseif(action == "blackout")then
		featureBlackout = newstate
		TriggerServerEvent("mellotrainer:adminBlackout", me, featureBlackout)
		drawNotification("Blackout "..text)
	end

end)

RegisterNUICallback("weather", function(data, cb)
	local weather = data.action

	TriggerServerEvent("mellotrainer:adminWeather", me, weather, featureWeatherFreeze)

	drawNotification("Weather changed to ~g~" .. weather .. ".")
	cb("ok")
end)



-- Only show menu if they are an admin
RegisterNUICallback("requireadmin", function(data, cb)
	-- check to be added, currently everyone can access.
	if false then
		drawNotification("~r~You are not an admin!")
	else
		SendNUIMessage({adminaccess = true})
	end	
end)

TriggerServerEvent("mellotrainer:firstJoinProper")