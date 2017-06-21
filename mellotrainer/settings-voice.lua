-- DO NOT TOUCHY, CONTACT Michael G/TheStonedTurtle if anything is broken.
-- DO NOT TOUCHY, CONTACT Michael G/TheStonedTurtle if anything is broken.
-- DO NOT TOUCHY, CONTACT Michael G/TheStonedTurtle if anything is broken.
-- DO NOT TOUCHY, CONTACT Michael G/TheStonedTurtle if anything is broken.
-- DO NOT TOUCHY, CONTACT Michael G/TheStonedTurtle if anything is broken.


RegisterNUICallback("voiceopts", function(data, cb)
	local playerPed = GetPlayerPed(-1)
	local action = data.action
	local state = data.newstate
	local request = data.data[3]
	local text,text2

	if(state) then
		text = "~g~ON"
		text2 = "~r~OFF"
	else
		text = "~r~OFF"
		text2 = "~g~ON"
	end

	if(action=="channel")then
		if(request == "0" or request == 0)then
			NetworkClearVoiceChannel()
			drawNotification("Voice Channel reset")
		else
			NetworkSetVoiceChannel(tonumber(request))
			drawNotification("Now In Voice Channel: "..request)
		end
	elseif(action=="distance")then
		local distance = tonumber(request) + 0.00

		NetworkSetTalkerProximity(distance)
		if(distance > 0)then
			drawNotification("Voice Proximity: "..distance.." meters")
		else
			drawNotification("Voice Proximity: All Players")
		end
	elseif(action=="voicetoggle")then
		NetworkSetVoiceActive(state)		
		drawNotification("Voice Chat: "..text)


	elseif(action=="showtoggle")then
		featureShowVoiceChatSpeaker = state
		if(not state)then
			SendNUIMessage({hidevoice=true})
		end
		drawNotification("Voice Speakers Overlay: "..text)

	end

	if(cb)then cb("ok") end
end)


-- Update voice names
Citizen.CreateThread(function()
	local me = PlayerId(-1)
	while true do 
		Wait(250)

		if(featureShowVoiceChatSpeaker)then
			local names = {}

			for i=0, maxPlayers, 1 do
	    		if(NetworkIsPlayerConnected(i)) then
					if(NetworkIsPlayerTalking(i))then
						table.insert(names, GetPlayerName(i))
					end
				end
			end

			if(#names > 0)then
				local results = json.encode(names, {indent=true})	

				SendNUIMessage({
					showvoice = true,
					talkingplayers = results
				})
			else
				SendNUIMessage({
					hidevoice = true
				})
			end
		end

	end
end)